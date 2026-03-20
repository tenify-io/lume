package kube

import (
	"testing"
	"time"

	rbacv1 "k8s.io/api/rbac/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func TestRoleToRoleInfo_Basic(t *testing.T) {
	role := &rbacv1.Role{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "my-role",
			Namespace:         "default",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-2 * time.Hour)),
		},
		Rules: []rbacv1.PolicyRule{
			{
				APIGroups: []string{""},
				Resources: []string{"pods"},
				Verbs:     []string{"get", "list"},
			},
			{
				APIGroups: []string{"apps"},
				Resources: []string{"deployments"},
				Verbs:     []string{"get"},
			},
		},
	}

	info := RoleToRoleInfo(role)

	if info.Name != "my-role" {
		t.Errorf("Name = %q, want %q", info.Name, "my-role")
	}
	if info.Namespace != "default" {
		t.Errorf("Namespace = %q, want %q", info.Namespace, "default")
	}
	if info.Kind != "Role" {
		t.Errorf("Kind = %q, want %q", info.Kind, "Role")
	}
	if info.Rules != 2 {
		t.Errorf("Rules = %d, want 2", info.Rules)
	}
	if info.Age != "2h" {
		t.Errorf("Age = %q, want %q", info.Age, "2h")
	}
}

func TestRoleToRoleInfo_ZeroTimestamp(t *testing.T) {
	role := &rbacv1.Role{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "zero-ts-role",
			Namespace: "default",
		},
	}

	info := RoleToRoleInfo(role)

	if info.Age != "" {
		t.Errorf("Age = %q, want empty for zero timestamp", info.Age)
	}
	if info.Rules != 0 {
		t.Errorf("Rules = %d, want 0", info.Rules)
	}
}

func TestClusterRoleToRoleInfo_Basic(t *testing.T) {
	cr := &rbacv1.ClusterRole{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "cluster-admin",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-24 * time.Hour)),
		},
		Rules: []rbacv1.PolicyRule{
			{
				APIGroups: []string{"*"},
				Resources: []string{"*"},
				Verbs:     []string{"*"},
			},
		},
	}

	info := ClusterRoleToRoleInfo(cr)

	if info.Name != "cluster-admin" {
		t.Errorf("Name = %q, want %q", info.Name, "cluster-admin")
	}
	if info.Namespace != "" {
		t.Errorf("Namespace = %q, want empty", info.Namespace)
	}
	if info.Kind != "ClusterRole" {
		t.Errorf("Kind = %q, want %q", info.Kind, "ClusterRole")
	}
	if info.Rules != 1 {
		t.Errorf("Rules = %d, want 1", info.Rules)
	}
	if info.Age != "1d" {
		t.Errorf("Age = %q, want %q", info.Age, "1d")
	}
}

func TestClusterRoleToRoleInfo_ZeroTimestamp(t *testing.T) {
	cr := &rbacv1.ClusterRole{
		ObjectMeta: metav1.ObjectMeta{
			Name: "zero-ts-cr",
		},
	}

	info := ClusterRoleToRoleInfo(cr)

	if info.Age != "" {
		t.Errorf("Age = %q, want empty for zero timestamp", info.Age)
	}
}

func TestConvertPolicyRules(t *testing.T) {
	rules := []rbacv1.PolicyRule{
		{
			APIGroups:       []string{"", "apps"},
			Resources:       []string{"pods", "deployments"},
			Verbs:           []string{"get", "list", "watch"},
			ResourceNames:   []string{"my-pod"},
			NonResourceURLs: []string{"/healthz"},
		},
		{
			APIGroups: []string{""},
			Resources: []string{"secrets"},
			Verbs:     []string{"get"},
		},
	}

	result := convertPolicyRules(rules)

	if len(result) != 2 {
		t.Fatalf("len(result) = %d, want 2", len(result))
	}

	// First rule
	r0 := result[0]
	if len(r0.APIGroups) != 2 {
		t.Errorf("r0.APIGroups len = %d, want 2", len(r0.APIGroups))
	}
	if len(r0.Resources) != 2 {
		t.Errorf("r0.Resources len = %d, want 2", len(r0.Resources))
	}
	if len(r0.Verbs) != 3 {
		t.Errorf("r0.Verbs len = %d, want 3", len(r0.Verbs))
	}
	if len(r0.ResourceNames) != 1 || r0.ResourceNames[0] != "my-pod" {
		t.Errorf("r0.ResourceNames = %v, want [my-pod]", r0.ResourceNames)
	}
	if len(r0.NonResourceURLs) != 1 || r0.NonResourceURLs[0] != "/healthz" {
		t.Errorf("r0.NonResourceURLs = %v, want [/healthz]", r0.NonResourceURLs)
	}

	// Second rule — nil fields become empty slices
	r1 := result[1]
	if len(r1.ResourceNames) != 0 {
		t.Errorf("r1.ResourceNames = %v, want empty", r1.ResourceNames)
	}
	if len(r1.NonResourceURLs) != 0 {
		t.Errorf("r1.NonResourceURLs = %v, want empty", r1.NonResourceURLs)
	}
}

func TestCopyStringSlice(t *testing.T) {
	// nil input -> empty slice
	result := copyStringSlice(nil)
	if result == nil {
		t.Error("copyStringSlice(nil) returned nil, want empty slice")
	}
	if len(result) != 0 {
		t.Errorf("copyStringSlice(nil) len = %d, want 0", len(result))
	}

	// non-nil input -> copy
	input := []string{"a", "b", "c"}
	result = copyStringSlice(input)
	if len(result) != 3 {
		t.Fatalf("len = %d, want 3", len(result))
	}
	// Mutating input should not affect result
	input[0] = "modified"
	if result[0] != "a" {
		t.Errorf("result[0] = %q, want %q (should be independent copy)", result[0], "a")
	}
}
