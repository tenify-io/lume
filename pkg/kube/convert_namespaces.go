package kube

import (
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// NamespaceToNamespaceInfo converts a Kubernetes Namespace object to a NamespaceInfo summary.
func NamespaceToNamespaceInfo(ns *corev1.Namespace) NamespaceInfo {
	age := ""
	if !ns.CreationTimestamp.IsZero() {
		duration := metav1.Now().Sub(ns.CreationTimestamp.Time)
		age = FormatDuration(duration)
	}

	return NamespaceInfo{
		Name:   ns.Name,
		Status: string(ns.Status.Phase),
		Age:    age,
		Labels: ns.Labels,
	}
}
