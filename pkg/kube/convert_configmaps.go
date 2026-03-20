package kube

import (
	"sort"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// ConfigMapToConfigMapInfo converts a Kubernetes ConfigMap object to a ConfigMapInfo summary.
func ConfigMapToConfigMapInfo(cm *corev1.ConfigMap) ConfigMapInfo {
	age := ""
	if !cm.CreationTimestamp.IsZero() {
		age = FormatDuration(metav1.Now().Sub(cm.CreationTimestamp.Time))
	}

	return ConfigMapInfo{
		Name:      cm.Name,
		Namespace: cm.Namespace,
		DataCount: len(cm.Data) + len(cm.BinaryData),
		Age:       age,
	}
}

// binaryDataKeys extracts sorted BinaryDataKey entries from a ConfigMap.
func binaryDataKeys(binaryData map[string][]byte) []BinaryDataKey {
	if len(binaryData) == 0 {
		return nil
	}

	keys := make([]string, 0, len(binaryData))
	for k := range binaryData {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	result := make([]BinaryDataKey, 0, len(keys))
	for _, k := range keys {
		result = append(result, BinaryDataKey{
			Name: k,
			Size: len(binaryData[k]),
		})
	}
	return result
}

// convertConfigMap is a ResourceConverter for ConfigMap objects.
func convertConfigMap(obj any) (any, bool) {
	cm, ok := obj.(*corev1.ConfigMap)
	if !ok {
		return nil, false
	}
	return ConfigMapToConfigMapInfo(cm), true
}
