package kube

import (
	"testing"
	"time"

	corev1 "k8s.io/api/core/v1"
	storagev1 "k8s.io/api/storage/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func TestStorageClassToInfo_DefaultClass(t *testing.T) {
	reclaimPolicy := corev1.PersistentVolumeReclaimDelete
	bindingMode := storagev1.VolumeBindingWaitForFirstConsumer
	allowExpansion := true

	sc := &storagev1.StorageClass{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "gp3",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-5 * 24 * time.Hour)),
			Annotations: map[string]string{
				"storageclass.kubernetes.io/is-default-class": "true",
			},
		},
		Provisioner:          "ebs.csi.aws.com",
		ReclaimPolicy:        &reclaimPolicy,
		VolumeBindingMode:    &bindingMode,
		AllowVolumeExpansion: &allowExpansion,
	}

	info := StorageClassToStorageClassInfo(sc)

	if info.Name != "gp3" {
		t.Errorf("Name = %q, want %q", info.Name, "gp3")
	}
	if info.Provisioner != "ebs.csi.aws.com" {
		t.Errorf("Provisioner = %q, want %q", info.Provisioner, "ebs.csi.aws.com")
	}
	if info.ReclaimPolicy != "Delete" {
		t.Errorf("ReclaimPolicy = %q, want %q", info.ReclaimPolicy, "Delete")
	}
	if info.VolumeBindingMode != "WaitForFirstConsumer" {
		t.Errorf("VolumeBindingMode = %q, want %q", info.VolumeBindingMode, "WaitForFirstConsumer")
	}
	if !info.AllowVolumeExpansion {
		t.Error("AllowVolumeExpansion = false, want true")
	}
	if !info.IsDefault {
		t.Error("IsDefault = false, want true")
	}
	if info.Age != "5d" {
		t.Errorf("Age = %q, want %q", info.Age, "5d")
	}
}

func TestStorageClassToInfo_NonDefault(t *testing.T) {
	reclaimPolicy := corev1.PersistentVolumeReclaimRetain
	bindingMode := storagev1.VolumeBindingImmediate

	sc := &storagev1.StorageClass{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "standard",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-2 * time.Hour)),
		},
		Provisioner:       "kubernetes.io/gce-pd",
		ReclaimPolicy:     &reclaimPolicy,
		VolumeBindingMode: &bindingMode,
	}

	info := StorageClassToStorageClassInfo(sc)

	if info.IsDefault {
		t.Error("IsDefault = true, want false")
	}
	if info.ReclaimPolicy != "Retain" {
		t.Errorf("ReclaimPolicy = %q, want %q", info.ReclaimPolicy, "Retain")
	}
	if info.VolumeBindingMode != "Immediate" {
		t.Errorf("VolumeBindingMode = %q, want %q", info.VolumeBindingMode, "Immediate")
	}
	if info.AllowVolumeExpansion {
		t.Error("AllowVolumeExpansion = true, want false")
	}
	if info.Age != "2h" {
		t.Errorf("Age = %q, want %q", info.Age, "2h")
	}
}

func TestStorageClassToInfo_NilPointers(t *testing.T) {
	sc := &storagev1.StorageClass{
		ObjectMeta: metav1.ObjectMeta{
			Name: "minimal",
		},
		Provisioner: "example.com/provisioner",
	}

	info := StorageClassToStorageClassInfo(sc)

	if info.ReclaimPolicy != "" {
		t.Errorf("ReclaimPolicy = %q, want empty", info.ReclaimPolicy)
	}
	if info.VolumeBindingMode != "" {
		t.Errorf("VolumeBindingMode = %q, want empty", info.VolumeBindingMode)
	}
	if info.AllowVolumeExpansion {
		t.Error("AllowVolumeExpansion = true, want false")
	}
	if info.Age != "" {
		t.Errorf("Age = %q, want empty", info.Age)
	}
}

func TestScAllowedTopologies(t *testing.T) {
	tests := []struct {
		name string
		sc   *storagev1.StorageClass
		want []string
	}{
		{
			name: "empty",
			sc:   &storagev1.StorageClass{},
			want: nil,
		},
		{
			name: "single topology",
			sc: &storagev1.StorageClass{
				AllowedTopologies: []corev1.TopologySelectorTerm{
					{
						MatchLabelExpressions: []corev1.TopologySelectorLabelRequirement{
							{
								Key:    "topology.kubernetes.io/zone",
								Values: []string{"us-east-1a", "us-east-1b"},
							},
						},
					},
				},
			},
			want: []string{"topology.kubernetes.io/zone in [us-east-1a, us-east-1b]"},
		},
		{
			name: "multiple expressions",
			sc: &storagev1.StorageClass{
				AllowedTopologies: []corev1.TopologySelectorTerm{
					{
						MatchLabelExpressions: []corev1.TopologySelectorLabelRequirement{
							{
								Key:    "topology.kubernetes.io/zone",
								Values: []string{"us-east-1a"},
							},
							{
								Key:    "topology.kubernetes.io/region",
								Values: []string{"us-east-1"},
							},
						},
					},
				},
			},
			want: []string{
				"topology.kubernetes.io/zone in [us-east-1a]",
				"topology.kubernetes.io/region in [us-east-1]",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := scAllowedTopologies(tt.sc)
			if len(got) != len(tt.want) {
				t.Fatalf("scAllowedTopologies() len = %d, want %d", len(got), len(tt.want))
			}
			for i, g := range got {
				if g != tt.want[i] {
					t.Errorf("scAllowedTopologies()[%d] = %q, want %q", i, g, tt.want[i])
				}
			}
		})
	}
}

func TestScIsDefault(t *testing.T) {
	tests := []struct {
		name        string
		annotations map[string]string
		want        bool
	}{
		{"true annotation", map[string]string{"storageclass.kubernetes.io/is-default-class": "true"}, true},
		{"false annotation", map[string]string{"storageclass.kubernetes.io/is-default-class": "false"}, false},
		{"missing annotation", nil, false},
		{"empty annotation", map[string]string{}, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			sc := &storagev1.StorageClass{
				ObjectMeta: metav1.ObjectMeta{
					Annotations: tt.annotations,
				},
			}
			got := scIsDefault(sc)
			if got != tt.want {
				t.Errorf("scIsDefault() = %v, want %v", got, tt.want)
			}
		})
	}
}
