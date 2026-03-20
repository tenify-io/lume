package kube

import (
	"fmt"
	"strings"

	storagev1 "k8s.io/api/storage/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// StorageClassToStorageClassInfo converts a Kubernetes StorageClass object to a StorageClassInfo summary.
func StorageClassToStorageClassInfo(sc *storagev1.StorageClass) StorageClassInfo {
	age := ""
	if !sc.CreationTimestamp.IsZero() {
		age = FormatDuration(metav1.Now().Sub(sc.CreationTimestamp.Time))
	}

	return StorageClassInfo{
		Name:                 sc.Name,
		Provisioner:          sc.Provisioner,
		ReclaimPolicy:        scReclaimPolicy(sc),
		VolumeBindingMode:    scVolumeBindingMode(sc),
		AllowVolumeExpansion: scAllowVolumeExpansion(sc),
		Age:                  age,
		IsDefault:            scIsDefault(sc),
	}
}

// scIsDefault checks whether the StorageClass is marked as the default.
func scIsDefault(sc *storagev1.StorageClass) bool {
	return sc.Annotations["storageclass.kubernetes.io/is-default-class"] == "true"
}

// scReclaimPolicy dereferences the optional ReclaimPolicy pointer.
func scReclaimPolicy(sc *storagev1.StorageClass) string {
	if sc.ReclaimPolicy == nil {
		return ""
	}
	return string(*sc.ReclaimPolicy)
}

// scVolumeBindingMode dereferences the optional VolumeBindingMode pointer.
func scVolumeBindingMode(sc *storagev1.StorageClass) string {
	if sc.VolumeBindingMode == nil {
		return ""
	}
	return string(*sc.VolumeBindingMode)
}

// scAllowVolumeExpansion dereferences the optional AllowVolumeExpansion pointer.
func scAllowVolumeExpansion(sc *storagev1.StorageClass) bool {
	if sc.AllowVolumeExpansion == nil {
		return false
	}
	return *sc.AllowVolumeExpansion
}

// scAllowedTopologies flattens the AllowedTopologies into descriptive strings.
func scAllowedTopologies(sc *storagev1.StorageClass) []string {
	if len(sc.AllowedTopologies) == 0 {
		return nil
	}
	var topologies []string
	for _, topo := range sc.AllowedTopologies {
		for _, expr := range topo.MatchLabelExpressions {
			topologies = append(topologies, fmt.Sprintf("%s in [%s]", expr.Key, strings.Join(expr.Values, ", ")))
		}
	}
	return topologies
}
