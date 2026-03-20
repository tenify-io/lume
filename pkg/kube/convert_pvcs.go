package kube

import (
	"fmt"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// PVCToPVCInfo converts a Kubernetes PersistentVolumeClaim object to a PVCInfo summary.
func PVCToPVCInfo(pvc *corev1.PersistentVolumeClaim) PVCInfo {
	age := ""
	if !pvc.CreationTimestamp.IsZero() {
		age = FormatDuration(metav1.Now().Sub(pvc.CreationTimestamp.Time))
	}

	return PVCInfo{
		Name:         pvc.Name,
		Namespace:    pvc.Namespace,
		Status:       string(pvc.Status.Phase),
		Volume:       pvc.Spec.VolumeName,
		Capacity:     pvcCapacity(pvc),
		AccessModes:  pvcAccessModes(pvc),
		StorageClass: pvcStorageClass(pvc),
		VolumeMode:   pvcVolumeMode(pvc),
		Age:          age,
	}
}

// pvcCapacity returns the actual allocated capacity from status, falling back to spec requests.
func pvcCapacity(pvc *corev1.PersistentVolumeClaim) string {
	if pvc.Status.Capacity != nil {
		if storage, ok := pvc.Status.Capacity[corev1.ResourceStorage]; ok {
			return storage.String()
		}
	}
	return ""
}

// pvcAccessModes returns abbreviated access modes from status (or spec if status is empty).
func pvcAccessModes(pvc *corev1.PersistentVolumeClaim) string {
	modes := pvc.Status.AccessModes
	if len(modes) == 0 {
		modes = pvc.Spec.AccessModes
	}
	return pvAccessModes(modes)
}

// pvcStorageClass returns the storage class name.
func pvcStorageClass(pvc *corev1.PersistentVolumeClaim) string {
	if pvc.Spec.StorageClassName != nil {
		return *pvc.Spec.StorageClassName
	}
	return ""
}

// pvcVolumeMode returns the volume mode as a string.
func pvcVolumeMode(pvc *corev1.PersistentVolumeClaim) string {
	if pvc.Spec.VolumeMode != nil {
		return string(*pvc.Spec.VolumeMode)
	}
	return ""
}

// pvcDataSource returns a description of the data source (e.g. "Snapshot/my-snap") or empty string.
func pvcDataSource(pvc *corev1.PersistentVolumeClaim) string {
	if pvc.Spec.DataSource != nil {
		return fmt.Sprintf("%s/%s", pvc.Spec.DataSource.Kind, pvc.Spec.DataSource.Name)
	}
	return ""
}

// convertPVC is a ResourceConverter for PersistentVolumeClaim objects.
func convertPVC(obj interface{}) (interface{}, bool) {
	pvc, ok := obj.(*corev1.PersistentVolumeClaim)
	if !ok {
		return nil, false
	}
	return PVCToPVCInfo(pvc), true
}
