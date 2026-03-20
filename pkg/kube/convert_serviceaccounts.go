package kube

import (
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// ServiceAccountToServiceAccountInfo converts a Kubernetes ServiceAccount object to a ServiceAccountInfo summary.
func ServiceAccountToServiceAccountInfo(sa *corev1.ServiceAccount) ServiceAccountInfo {
	age := ""
	if !sa.CreationTimestamp.IsZero() {
		age = FormatDuration(metav1.Now().Sub(sa.CreationTimestamp.Time))
	}

	return ServiceAccountInfo{
		Name:      sa.Name,
		Namespace: sa.Namespace,
		Secrets:   len(sa.Secrets),
		Age:       age,
	}
}

// convertServiceAccount is a ResourceConverter for ServiceAccount objects.
func convertServiceAccount(obj any) (any, bool) {
	sa, ok := obj.(*corev1.ServiceAccount)
	if !ok {
		return nil, false
	}
	return ServiceAccountToServiceAccountInfo(sa), true
}
