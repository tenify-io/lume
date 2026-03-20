package kube

import (
	"testing"
	"time"

	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func TestPVToPVInfo_BoundVolume(t *testing.T) {
	volMode := corev1.PersistentVolumeFilesystem
	pv := &corev1.PersistentVolume{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "pv-data-01",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-5 * 24 * time.Hour)),
		},
		Spec: corev1.PersistentVolumeSpec{
			Capacity: corev1.ResourceList{
				corev1.ResourceStorage: resource.MustParse("10Gi"),
			},
			AccessModes: []corev1.PersistentVolumeAccessMode{
				corev1.ReadWriteOnce,
			},
			PersistentVolumeReclaimPolicy: corev1.PersistentVolumeReclaimRetain,
			StorageClassName:              "standard",
			VolumeMode:                    &volMode,
			ClaimRef: &corev1.ObjectReference{
				Namespace: "default",
				Name:      "data-claim",
			},
		},
		Status: corev1.PersistentVolumeStatus{
			Phase: corev1.VolumeBound,
		},
	}

	info := PVToPVInfo(pv)

	if info.Name != "pv-data-01" {
		t.Errorf("Name = %q, want %q", info.Name, "pv-data-01")
	}
	if info.Capacity != "10Gi" {
		t.Errorf("Capacity = %q, want %q", info.Capacity, "10Gi")
	}
	if info.AccessModes != "RWO" {
		t.Errorf("AccessModes = %q, want %q", info.AccessModes, "RWO")
	}
	if info.ReclaimPolicy != "Retain" {
		t.Errorf("ReclaimPolicy = %q, want %q", info.ReclaimPolicy, "Retain")
	}
	if info.Status != "Bound" {
		t.Errorf("Status = %q, want %q", info.Status, "Bound")
	}
	if info.Claim != "default/data-claim" {
		t.Errorf("Claim = %q, want %q", info.Claim, "default/data-claim")
	}
	if info.StorageClass != "standard" {
		t.Errorf("StorageClass = %q, want %q", info.StorageClass, "standard")
	}
	if info.VolumeMode != "Filesystem" {
		t.Errorf("VolumeMode = %q, want %q", info.VolumeMode, "Filesystem")
	}
	if info.Age != "5d" {
		t.Errorf("Age = %q, want %q", info.Age, "5d")
	}
}

func TestPVToPVInfo_AvailableVolume(t *testing.T) {
	pv := &corev1.PersistentVolume{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "pv-available",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-2 * time.Hour)),
		},
		Spec: corev1.PersistentVolumeSpec{
			Capacity: corev1.ResourceList{
				corev1.ResourceStorage: resource.MustParse("5Gi"),
			},
			AccessModes: []corev1.PersistentVolumeAccessMode{
				corev1.ReadWriteMany,
			},
			PersistentVolumeReclaimPolicy: corev1.PersistentVolumeReclaimDelete,
			StorageClassName:              "fast",
		},
		Status: corev1.PersistentVolumeStatus{
			Phase: corev1.VolumeAvailable,
		},
	}

	info := PVToPVInfo(pv)

	if info.Status != "Available" {
		t.Errorf("Status = %q, want %q", info.Status, "Available")
	}
	if info.Claim != "" {
		t.Errorf("Claim = %q, want empty", info.Claim)
	}
	if info.AccessModes != "RWX" {
		t.Errorf("AccessModes = %q, want %q", info.AccessModes, "RWX")
	}
	if info.ReclaimPolicy != "Delete" {
		t.Errorf("ReclaimPolicy = %q, want %q", info.ReclaimPolicy, "Delete")
	}
	if info.Age != "2h" {
		t.Errorf("Age = %q, want %q", info.Age, "2h")
	}
}

func TestPVAccessModes(t *testing.T) {
	tests := []struct {
		name  string
		modes []corev1.PersistentVolumeAccessMode
		want  string
	}{
		{"empty", nil, ""},
		{"RWO", []corev1.PersistentVolumeAccessMode{corev1.ReadWriteOnce}, "RWO"},
		{"ROX", []corev1.PersistentVolumeAccessMode{corev1.ReadOnlyMany}, "ROX"},
		{"RWX", []corev1.PersistentVolumeAccessMode{corev1.ReadWriteMany}, "RWX"},
		{"RWOP", []corev1.PersistentVolumeAccessMode{corev1.ReadWriteOncePod}, "RWOP"},
		{"multiple", []corev1.PersistentVolumeAccessMode{
			corev1.ReadWriteOnce,
			corev1.ReadOnlyMany,
		}, "RWO,ROX"},
		{"all three", []corev1.PersistentVolumeAccessMode{
			corev1.ReadWriteOnce,
			corev1.ReadOnlyMany,
			corev1.ReadWriteMany,
		}, "RWO,ROX,RWX"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := pvAccessModes(tt.modes)
			if got != tt.want {
				t.Errorf("pvAccessModes() = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestPVSource(t *testing.T) {
	tests := []struct {
		name string
		pv   *corev1.PersistentVolume
		want string
	}{
		{
			name: "CSI",
			pv: &corev1.PersistentVolume{
				Spec: corev1.PersistentVolumeSpec{
					PersistentVolumeSource: corev1.PersistentVolumeSource{
						CSI: &corev1.CSIPersistentVolumeSource{
							Driver: "ebs.csi.aws.com",
						},
					},
				},
			},
			want: "CSI (ebs.csi.aws.com)",
		},
		{
			name: "NFS",
			pv: &corev1.PersistentVolume{
				Spec: corev1.PersistentVolumeSpec{
					PersistentVolumeSource: corev1.PersistentVolumeSource{
						NFS: &corev1.NFSVolumeSource{
							Server: "nfs.example.com",
							Path:   "/exports/data",
						},
					},
				},
			},
			want: "NFS (nfs.example.com:/exports/data)",
		},
		{
			name: "HostPath",
			pv: &corev1.PersistentVolume{
				Spec: corev1.PersistentVolumeSpec{
					PersistentVolumeSource: corev1.PersistentVolumeSource{
						HostPath: &corev1.HostPathVolumeSource{
							Path: "/mnt/data",
						},
					},
				},
			},
			want: "HostPath (/mnt/data)",
		},
		{
			name: "Local",
			pv: &corev1.PersistentVolume{
				Spec: corev1.PersistentVolumeSpec{
					PersistentVolumeSource: corev1.PersistentVolumeSource{
						Local: &corev1.LocalVolumeSource{
							Path: "/dev/sda1",
						},
					},
				},
			},
			want: "Local (/dev/sda1)",
		},
		{
			name: "Unknown",
			pv: &corev1.PersistentVolume{
				Spec: corev1.PersistentVolumeSpec{
					PersistentVolumeSource: corev1.PersistentVolumeSource{},
				},
			},
			want: "Unknown",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := pvSource(tt.pv)
			if got != tt.want {
				t.Errorf("pvSource() = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestPVToPVInfo_ZeroTimestamp(t *testing.T) {
	pv := &corev1.PersistentVolume{
		ObjectMeta: metav1.ObjectMeta{
			Name: "no-time",
		},
		Spec: corev1.PersistentVolumeSpec{},
		Status: corev1.PersistentVolumeStatus{
			Phase: corev1.VolumeAvailable,
		},
	}

	info := PVToPVInfo(pv)

	if info.Age != "" {
		t.Errorf("Age = %q, want empty for zero timestamp", info.Age)
	}
}

func TestPVToPVInfo_NoCapacity(t *testing.T) {
	pv := &corev1.PersistentVolume{
		ObjectMeta: metav1.ObjectMeta{
			Name: "no-capacity",
		},
		Spec: corev1.PersistentVolumeSpec{},
		Status: corev1.PersistentVolumeStatus{
			Phase: corev1.VolumeAvailable,
		},
	}

	info := PVToPVInfo(pv)

	if info.Capacity != "" {
		t.Errorf("Capacity = %q, want empty", info.Capacity)
	}
}

func TestPVToPVInfo_NoVolumeMode(t *testing.T) {
	pv := &corev1.PersistentVolume{
		ObjectMeta: metav1.ObjectMeta{
			Name: "no-mode",
		},
		Spec: corev1.PersistentVolumeSpec{},
		Status: corev1.PersistentVolumeStatus{
			Phase: corev1.VolumeAvailable,
		},
	}

	info := PVToPVInfo(pv)

	if info.VolumeMode != "" {
		t.Errorf("VolumeMode = %q, want empty", info.VolumeMode)
	}
}

func TestConvertPV(t *testing.T) {
	pv := &corev1.PersistentVolume{
		ObjectMeta: metav1.ObjectMeta{
			Name: "test-pv",
		},
		Spec: corev1.PersistentVolumeSpec{
			Capacity: corev1.ResourceList{
				corev1.ResourceStorage: resource.MustParse("1Gi"),
			},
			AccessModes: []corev1.PersistentVolumeAccessMode{corev1.ReadWriteOnce},
		},
		Status: corev1.PersistentVolumeStatus{
			Phase: corev1.VolumeBound,
		},
	}

	result, ok := convertPV(pv)
	if !ok {
		t.Fatal("convertPV returned false")
	}
	info, ok := result.(PersistentVolumeInfo)
	if !ok {
		t.Fatal("result is not PersistentVolumeInfo")
	}
	if info.Name != "test-pv" {
		t.Errorf("Name = %q, want %q", info.Name, "test-pv")
	}
}

func TestConvertPV_WrongType(t *testing.T) {
	_, ok := convertPV("not a pv")
	if ok {
		t.Error("expected convertPV to return false for wrong type")
	}
}
