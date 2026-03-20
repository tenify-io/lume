package kube

import (
	"fmt"

	rbacv1 "k8s.io/api/rbac/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// RoleBindingToRoleBindingInfo converts a Kubernetes RoleBinding object to a RoleBindingInfo summary.
func RoleBindingToRoleBindingInfo(rb *rbacv1.RoleBinding) RoleBindingInfo {
	age := ""
	if !rb.CreationTimestamp.IsZero() {
		age = FormatDuration(metav1.Now().Sub(rb.CreationTimestamp.Time))
	}

	return RoleBindingInfo{
		Name:      rb.Name,
		Namespace: rb.Namespace,
		Kind:      "RoleBinding",
		RoleRef:   fmt.Sprintf("%s/%s", rb.RoleRef.Kind, rb.RoleRef.Name),
		Subjects:  len(rb.Subjects),
		Age:       age,
	}
}

// ClusterRoleBindingToRoleBindingInfo converts a Kubernetes ClusterRoleBinding object to a RoleBindingInfo summary.
func ClusterRoleBindingToRoleBindingInfo(crb *rbacv1.ClusterRoleBinding) RoleBindingInfo {
	age := ""
	if !crb.CreationTimestamp.IsZero() {
		age = FormatDuration(metav1.Now().Sub(crb.CreationTimestamp.Time))
	}

	return RoleBindingInfo{
		Name:     crb.Name,
		Kind:     "ClusterRoleBinding",
		RoleRef:  fmt.Sprintf("%s/%s", crb.RoleRef.Kind, crb.RoleRef.Name),
		Subjects: len(crb.Subjects),
		Age:      age,
	}
}

// convertSubjects converts a slice of rbacv1.Subject to app-specific SubjectInfo types.
func convertSubjects(subjects []rbacv1.Subject) []SubjectInfo {
	result := make([]SubjectInfo, 0, len(subjects))
	for _, s := range subjects {
		result = append(result, SubjectInfo{
			Kind:      s.Kind,
			Name:      s.Name,
			Namespace: s.Namespace,
			APIGroup:  s.APIGroup,
		})
	}
	return result
}
