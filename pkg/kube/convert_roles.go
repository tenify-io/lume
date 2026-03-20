package kube

import (
	rbacv1 "k8s.io/api/rbac/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// RoleToRoleInfo converts a Kubernetes Role object to a RoleInfo summary.
func RoleToRoleInfo(role *rbacv1.Role) RoleInfo {
	age := ""
	if !role.CreationTimestamp.IsZero() {
		age = FormatDuration(metav1.Now().Sub(role.CreationTimestamp.Time))
	}

	return RoleInfo{
		Name:      role.Name,
		Namespace: role.Namespace,
		Kind:      "Role",
		Rules:     len(role.Rules),
		Age:       age,
	}
}

// ClusterRoleToRoleInfo converts a Kubernetes ClusterRole object to a RoleInfo summary.
func ClusterRoleToRoleInfo(cr *rbacv1.ClusterRole) RoleInfo {
	age := ""
	if !cr.CreationTimestamp.IsZero() {
		age = FormatDuration(metav1.Now().Sub(cr.CreationTimestamp.Time))
	}

	return RoleInfo{
		Name:  cr.Name,
		Kind:  "ClusterRole",
		Rules: len(cr.Rules),
		Age:   age,
	}
}

// convertPolicyRules converts a slice of rbacv1.PolicyRule to app-specific PolicyRule types.
func convertPolicyRules(rules []rbacv1.PolicyRule) []PolicyRule {
	result := make([]PolicyRule, 0, len(rules))
	for _, r := range rules {
		result = append(result, PolicyRule{
			APIGroups:       copyStringSlice(r.APIGroups),
			Resources:       copyStringSlice(r.Resources),
			Verbs:           copyStringSlice(r.Verbs),
			ResourceNames:   copyStringSlice(r.ResourceNames),
			NonResourceURLs: copyStringSlice(r.NonResourceURLs),
		})
	}
	return result
}

// copyStringSlice returns a copy of the slice, or an empty slice if nil.
func copyStringSlice(s []string) []string {
	if s == nil {
		return []string{}
	}
	out := make([]string, len(s))
	copy(out, s)
	return out
}
