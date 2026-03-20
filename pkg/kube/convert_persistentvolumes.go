package kube

import (
	"fmt"
	"strings"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// PVToPVInfo converts a Kubernetes PersistentVolume object to a PersistentVolumeInfo summary.
func PVToPVInfo(pv *corev1.PersistentVolume) PersistentVolumeInfo {
	age := ""
	if !pv.CreationTimestamp.IsZero() {
		age = FormatDuration(metav1.Now().Sub(pv.CreationTimestamp.Time))
	}

	return PersistentVolumeInfo{
		Name:          pv.Name,
		Capacity:      pvCapacity(pv),
		AccessModes:   pvAccessModes(pv.Spec.AccessModes),
		ReclaimPolicy: string(pv.Spec.PersistentVolumeReclaimPolicy),
		Status:        string(pv.Status.Phase),
		Claim:         pvClaim(pv),
		StorageClass:  pv.Spec.StorageClassName,
		VolumeMode:    pvVolumeMode(pv),
		Age:           age,
	}
}

// pvCapacity returns the storage capacity as a string.
func pvCapacity(pv *corev1.PersistentVolume) string {
	if pv.Spec.Capacity == nil {
		return ""
	}
	if storage, ok := pv.Spec.Capacity[corev1.ResourceStorage]; ok {
		return storage.String()
	}
	return ""
}

// pvAccessModes converts access modes to abbreviated comma-separated string.
func pvAccessModes(modes []corev1.PersistentVolumeAccessMode) string {
	if len(modes) == 0 {
		return ""
	}
	abbrevs := make([]string, 0, len(modes))
	for _, m := range modes {
		switch m {
		case corev1.ReadWriteOnce:
			abbrevs = append(abbrevs, "RWO")
		case corev1.ReadOnlyMany:
			abbrevs = append(abbrevs, "ROX")
		case corev1.ReadWriteMany:
			abbrevs = append(abbrevs, "RWX")
		case corev1.ReadWriteOncePod:
			abbrevs = append(abbrevs, "RWOP")
		default:
			abbrevs = append(abbrevs, string(m))
		}
	}
	return strings.Join(abbrevs, ",")
}

// pvClaim returns the bound claim as "namespace/name" or empty string.
func pvClaim(pv *corev1.PersistentVolume) string {
	if pv.Spec.ClaimRef == nil {
		return ""
	}
	return pv.Spec.ClaimRef.Namespace + "/" + pv.Spec.ClaimRef.Name
}

// pvVolumeMode returns the volume mode as a string.
func pvVolumeMode(pv *corev1.PersistentVolume) string {
	if pv.Spec.VolumeMode == nil {
		return ""
	}
	return string(*pv.Spec.VolumeMode)
}

// pvSource describes the volume source type and key identifying information.
func pvSource(pv *corev1.PersistentVolume) string {
	src := pv.Spec.PersistentVolumeSource
	switch {
	case src.CSI != nil:
		return fmt.Sprintf("CSI (%s)", src.CSI.Driver)
	case src.NFS != nil:
		return fmt.Sprintf("NFS (%s:%s)", src.NFS.Server, src.NFS.Path)
	case src.HostPath != nil:
		return fmt.Sprintf("HostPath (%s)", src.HostPath.Path)
	case src.GCEPersistentDisk != nil:
		return fmt.Sprintf("GCEPersistentDisk (%s)", src.GCEPersistentDisk.PDName)
	case src.AWSElasticBlockStore != nil:
		return fmt.Sprintf("AWSElasticBlockStore (%s)", src.AWSElasticBlockStore.VolumeID)
	case src.AzureDisk != nil:
		return fmt.Sprintf("AzureDisk (%s)", src.AzureDisk.DiskName)
	case src.AzureFile != nil:
		return fmt.Sprintf("AzureFile (%s/%s)", src.AzureFile.SecretName, src.AzureFile.ShareName)
	case src.ISCSI != nil:
		return fmt.Sprintf("iSCSI (%s:%d)", src.ISCSI.TargetPortal, src.ISCSI.Lun)
	case src.FC != nil:
		return "FC"
	case src.RBD != nil:
		return fmt.Sprintf("RBD (%s)", src.RBD.RBDImage)
	case src.CephFS != nil:
		monitors := strings.Join(src.CephFS.Monitors, ",")
		return fmt.Sprintf("CephFS (%s)", monitors)
	case src.Local != nil:
		return fmt.Sprintf("Local (%s)", src.Local.Path)
	default:
		return "Unknown"
	}
}

// convertPV is a ResourceConverter for PersistentVolume objects.
func convertPV(obj interface{}) (interface{}, bool) {
	pv, ok := obj.(*corev1.PersistentVolume)
	if !ok {
		return nil, false
	}
	return PVToPVInfo(pv), true
}
