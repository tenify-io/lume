package kube

import (
	"testing"
	"time"

	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func TestPVCToPVCInfo_BoundClaim(t *testing.T) {
	volMode := corev1.PersistentVolumeFilesystem
	storageClass := "gp3"
	pvc := &corev1.PersistentVolumeClaim{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "data-claim",
			Namespace:         "default",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-5 * 24 * time.Hour)),
		},
		Spec: corev1.PersistentVolumeClaimSpec{
			AccessModes: []corev1.PersistentVolumeAccessMode{
				corev1.ReadWriteOnce,
			},
			StorageClassName: &storageClass,
			VolumeMode:       &volMode,
			VolumeName:       "pv-data-01",
		},
		Status: corev1.PersistentVolumeClaimStatus{
			Phase: corev1.ClaimBound,
			Capacity: corev1.ResourceList{
				corev1.ResourceStorage: resource.MustParse("10Gi"),
			},
			AccessModes: []corev1.PersistentVolumeAccessMode{
				corev1.ReadWriteOnce,
			},
		},
	}

	info := PVCToPVCInfo(pvc)

	if info.Name != "data-claim" {
		t.Errorf("Name = %q, want %q", info.Name, "data-claim")
	}
	if info.Namespace != "default" {
		t.Errorf("Namespace = %q, want %q", info.Namespace, "default")
	}
	if info.Status != "Bound" {
		t.Errorf("Status = %q, want %q", info.Status, "Bound")
	}
	if info.Volume != "pv-data-01" {
		t.Errorf("Volume = %q, want %q", info.Volume, "pv-data-01")
	}
	if info.Capacity != "10Gi" {
		t.Errorf("Capacity = %q, want %q", info.Capacity, "10Gi")
	}
	if info.AccessModes != "RWO" {
		t.Errorf("AccessModes = %q, want %q", info.AccessModes, "RWO")
	}
	if info.StorageClass != "gp3" {
		t.Errorf("StorageClass = %q, want %q", info.StorageClass, "gp3")
	}
	if info.VolumeMode != "Filesystem" {
		t.Errorf("VolumeMode = %q, want %q", info.VolumeMode, "Filesystem")
	}
	if info.Age != "5d" {
		t.Errorf("Age = %q, want %q", info.Age, "5d")
	}
}

func TestPVCToPVCInfo_PendingClaim(t *testing.T) {
	storageClass := "standard"
	pvc := &corev1.PersistentVolumeClaim{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "pending-claim",
			Namespace:         "kube-system",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-2 * time.Hour)),
		},
		Spec: corev1.PersistentVolumeClaimSpec{
			AccessModes: []corev1.PersistentVolumeAccessMode{
				corev1.ReadWriteMany,
			},
			StorageClassName: &storageClass,
		},
		Status: corev1.PersistentVolumeClaimStatus{
			Phase: corev1.ClaimPending,
		},
	}

	info := PVCToPVCInfo(pvc)

	if info.Status != "Pending" {
		t.Errorf("Status = %q, want %q", info.Status, "Pending")
	}
	if info.Volume != "" {
		t.Errorf("Volume = %q, want empty", info.Volume)
	}
	if info.Capacity != "" {
		t.Errorf("Capacity = %q, want empty", info.Capacity)
	}
	// Should fall back to spec access modes when status is empty
	if info.AccessModes != "RWX" {
		t.Errorf("AccessModes = %q, want %q", info.AccessModes, "RWX")
	}
	if info.Age != "2h" {
		t.Errorf("Age = %q, want %q", info.Age, "2h")
	}
}

func TestPVCToPVCInfo_ZeroTimestamp(t *testing.T) {
	pvc := &corev1.PersistentVolumeClaim{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "no-time",
			Namespace: "default",
		},
		Spec: corev1.PersistentVolumeClaimSpec{},
		Status: corev1.PersistentVolumeClaimStatus{
			Phase: corev1.ClaimPending,
		},
	}

	info := PVCToPVCInfo(pvc)

	if info.Age != "" {
		t.Errorf("Age = %q, want empty for zero timestamp", info.Age)
	}
}

func TestPVCToPVCInfo_NoStorageClass(t *testing.T) {
	pvc := &corev1.PersistentVolumeClaim{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "no-sc",
			Namespace: "default",
		},
		Spec: corev1.PersistentVolumeClaimSpec{},
		Status: corev1.PersistentVolumeClaimStatus{
			Phase: corev1.ClaimPending,
		},
	}

	info := PVCToPVCInfo(pvc)

	if info.StorageClass != "" {
		t.Errorf("StorageClass = %q, want empty", info.StorageClass)
	}
}

func TestPVCToPVCInfo_NoVolumeMode(t *testing.T) {
	pvc := &corev1.PersistentVolumeClaim{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "no-mode",
			Namespace: "default",
		},
		Spec: corev1.PersistentVolumeClaimSpec{},
		Status: corev1.PersistentVolumeClaimStatus{
			Phase: corev1.ClaimPending,
		},
	}

	info := PVCToPVCInfo(pvc)

	if info.VolumeMode != "" {
		t.Errorf("VolumeMode = %q, want empty", info.VolumeMode)
	}
}

func TestPVCDataSource(t *testing.T) {
	tests := []struct {
		name string
		pvc  *corev1.PersistentVolumeClaim
		want string
	}{
		{
			name: "no data source",
			pvc: &corev1.PersistentVolumeClaim{
				Spec: corev1.PersistentVolumeClaimSpec{},
			},
			want: "",
		},
		{
			name: "snapshot data source",
			pvc: &corev1.PersistentVolumeClaim{
				Spec: corev1.PersistentVolumeClaimSpec{
					DataSource: &corev1.TypedLocalObjectReference{
						Kind: "VolumeSnapshot",
						Name: "my-snapshot",
					},
				},
			},
			want: "VolumeSnapshot/my-snapshot",
		},
		{
			name: "pvc data source",
			pvc: &corev1.PersistentVolumeClaim{
				Spec: corev1.PersistentVolumeClaimSpec{
					DataSource: &corev1.TypedLocalObjectReference{
						Kind: "PersistentVolumeClaim",
						Name: "source-pvc",
					},
				},
			},
			want: "PersistentVolumeClaim/source-pvc",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := pvcDataSource(tt.pvc)
			if got != tt.want {
				t.Errorf("pvcDataSource() = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestConvertPVC(t *testing.T) {
	storageClass := "standard"
	pvc := &corev1.PersistentVolumeClaim{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "test-pvc",
			Namespace: "default",
		},
		Spec: corev1.PersistentVolumeClaimSpec{
			StorageClassName: &storageClass,
			AccessModes:      []corev1.PersistentVolumeAccessMode{corev1.ReadWriteOnce},
		},
		Status: corev1.PersistentVolumeClaimStatus{
			Phase: corev1.ClaimBound,
			Capacity: corev1.ResourceList{
				corev1.ResourceStorage: resource.MustParse("5Gi"),
			},
		},
	}

	result, ok := convertPVC(pvc)
	if !ok {
		t.Fatal("convertPVC returned false")
	}
	info, ok := result.(PVCInfo)
	if !ok {
		t.Fatal("result is not PVCInfo")
	}
	if info.Name != "test-pvc" {
		t.Errorf("Name = %q, want %q", info.Name, "test-pvc")
	}
	if info.Namespace != "default" {
		t.Errorf("Namespace = %q, want %q", info.Namespace, "default")
	}
}

func TestConvertPVC_WrongType(t *testing.T) {
	_, ok := convertPVC("not a pvc")
	if ok {
		t.Error("expected convertPVC to return false for wrong type")
	}
}

func TestPVCAccessModes_FallsBackToSpec(t *testing.T) {
	pvc := &corev1.PersistentVolumeClaim{
		Spec: corev1.PersistentVolumeClaimSpec{
			AccessModes: []corev1.PersistentVolumeAccessMode{
				corev1.ReadWriteOnce,
				corev1.ReadOnlyMany,
			},
		},
		Status: corev1.PersistentVolumeClaimStatus{},
	}

	got := pvcAccessModes(pvc)
	if got != "RWO,ROX" {
		t.Errorf("pvcAccessModes() = %q, want %q", got, "RWO,ROX")
	}
}

func TestPVCAccessModes_PrefersStatus(t *testing.T) {
	pvc := &corev1.PersistentVolumeClaim{
		Spec: corev1.PersistentVolumeClaimSpec{
			AccessModes: []corev1.PersistentVolumeAccessMode{
				corev1.ReadWriteOnce,
				corev1.ReadOnlyMany,
			},
		},
		Status: corev1.PersistentVolumeClaimStatus{
			AccessModes: []corev1.PersistentVolumeAccessMode{
				corev1.ReadWriteOnce,
			},
		},
	}

	got := pvcAccessModes(pvc)
	if got != "RWO" {
		t.Errorf("pvcAccessModes() = %q, want %q", got, "RWO")
	}
}
