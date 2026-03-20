package kube

import (
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// SecretToSecretInfo converts a Kubernetes Secret object to a SecretInfo summary.
func SecretToSecretInfo(s *corev1.Secret) SecretInfo {
	age := ""
	if !s.CreationTimestamp.IsZero() {
		age = FormatDuration(metav1.Now().Sub(s.CreationTimestamp.Time))
	}

	return SecretInfo{
		Name:      s.Name,
		Namespace: s.Namespace,
		Type:      string(s.Type),
		DataCount: len(s.Data),
		Age:       age,
	}
}

// convertSecret is a ResourceConverter for Secret objects.
func convertSecret(obj any) (any, bool) {
	s, ok := obj.(*corev1.Secret)
	if !ok {
		return nil, false
	}
	return SecretToSecretInfo(s), true
}
