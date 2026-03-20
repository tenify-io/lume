package kube

import (
	"testing"
	"time"

	rbacv1 "k8s.io/api/rbac/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func TestRoleBindingToRoleBindingInfo_Basic(t *testing.T) {
	rb := &rbacv1.RoleBinding{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "my-binding",
			Namespace:         "default",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-2 * time.Hour)),
		},
		RoleRef: rbacv1.RoleRef{
			APIGroup: "rbac.authorization.k8s.io",
			Kind:     "Role",
			Name:     "my-role",
		},
		Subjects: []rbacv1.Subject{
			{Kind: "User", Name: "alice", APIGroup: "rbac.authorization.k8s.io"},
			{Kind: "ServiceAccount", Name: "default", Namespace: "default"},
		},
	}

	info := RoleBindingToRoleBindingInfo(rb)

	if info.Name != "my-binding" {
		t.Errorf("Name = %q, want %q", info.Name, "my-binding")
	}
	if info.Namespace != "default" {
		t.Errorf("Namespace = %q, want %q", info.Namespace, "default")
	}
	if info.Kind != "RoleBinding" {
		t.Errorf("Kind = %q, want %q", info.Kind, "RoleBinding")
	}
	if info.RoleRef != "Role/my-role" {
		t.Errorf("RoleRef = %q, want %q", info.RoleRef, "Role/my-role")
	}
	if info.Subjects != 2 {
		t.Errorf("Subjects = %d, want 2", info.Subjects)
	}
	if info.Age != "2h" {
		t.Errorf("Age = %q, want %q", info.Age, "2h")
	}
}

func TestRoleBindingToRoleBindingInfo_ZeroTimestamp(t *testing.T) {
	rb := &rbacv1.RoleBinding{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "zero-ts-binding",
			Namespace: "default",
		},
		RoleRef: rbacv1.RoleRef{
			Kind: "Role",
			Name: "some-role",
		},
	}

	info := RoleBindingToRoleBindingInfo(rb)

	if info.Age != "" {
		t.Errorf("Age = %q, want empty for zero timestamp", info.Age)
	}
	if info.Subjects != 0 {
		t.Errorf("Subjects = %d, want 0", info.Subjects)
	}
}

func TestClusterRoleBindingToRoleBindingInfo_Basic(t *testing.T) {
	crb := &rbacv1.ClusterRoleBinding{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "cluster-admin-binding",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-24 * time.Hour)),
		},
		RoleRef: rbacv1.RoleRef{
			APIGroup: "rbac.authorization.k8s.io",
			Kind:     "ClusterRole",
			Name:     "cluster-admin",
		},
		Subjects: []rbacv1.Subject{
			{Kind: "Group", Name: "system:masters", APIGroup: "rbac.authorization.k8s.io"},
		},
	}

	info := ClusterRoleBindingToRoleBindingInfo(crb)

	if info.Name != "cluster-admin-binding" {
		t.Errorf("Name = %q, want %q", info.Name, "cluster-admin-binding")
	}
	if info.Namespace != "" {
		t.Errorf("Namespace = %q, want empty", info.Namespace)
	}
	if info.Kind != "ClusterRoleBinding" {
		t.Errorf("Kind = %q, want %q", info.Kind, "ClusterRoleBinding")
	}
	if info.RoleRef != "ClusterRole/cluster-admin" {
		t.Errorf("RoleRef = %q, want %q", info.RoleRef, "ClusterRole/cluster-admin")
	}
	if info.Subjects != 1 {
		t.Errorf("Subjects = %d, want 1", info.Subjects)
	}
	if info.Age != "1d" {
		t.Errorf("Age = %q, want %q", info.Age, "1d")
	}
}

func TestClusterRoleBindingToRoleBindingInfo_ZeroTimestamp(t *testing.T) {
	crb := &rbacv1.ClusterRoleBinding{
		ObjectMeta: metav1.ObjectMeta{
			Name: "zero-ts-crb",
		},
		RoleRef: rbacv1.RoleRef{
			Kind: "ClusterRole",
			Name: "some-role",
		},
	}

	info := ClusterRoleBindingToRoleBindingInfo(crb)

	if info.Age != "" {
		t.Errorf("Age = %q, want empty for zero timestamp", info.Age)
	}
}

func TestConvertSubjects(t *testing.T) {
	subjects := []rbacv1.Subject{
		{
			Kind:      "User",
			Name:      "alice",
			APIGroup:  "rbac.authorization.k8s.io",
			Namespace: "",
		},
		{
			Kind:      "ServiceAccount",
			Name:      "default",
			Namespace: "kube-system",
			APIGroup:  "",
		},
		{
			Kind:     "Group",
			Name:     "system:masters",
			APIGroup: "rbac.authorization.k8s.io",
		},
	}

	result := convertSubjects(subjects)

	if len(result) != 3 {
		t.Fatalf("len(result) = %d, want 3", len(result))
	}

	// First subject
	s0 := result[0]
	if s0.Kind != "User" {
		t.Errorf("s0.Kind = %q, want %q", s0.Kind, "User")
	}
	if s0.Name != "alice" {
		t.Errorf("s0.Name = %q, want %q", s0.Name, "alice")
	}
	if s0.APIGroup != "rbac.authorization.k8s.io" {
		t.Errorf("s0.APIGroup = %q, want %q", s0.APIGroup, "rbac.authorization.k8s.io")
	}

	// Second subject
	s1 := result[1]
	if s1.Kind != "ServiceAccount" {
		t.Errorf("s1.Kind = %q, want %q", s1.Kind, "ServiceAccount")
	}
	if s1.Namespace != "kube-system" {
		t.Errorf("s1.Namespace = %q, want %q", s1.Namespace, "kube-system")
	}

	// Third subject
	s2 := result[2]
	if s2.Kind != "Group" {
		t.Errorf("s2.Kind = %q, want %q", s2.Kind, "Group")
	}
	if s2.Name != "system:masters" {
		t.Errorf("s2.Name = %q, want %q", s2.Name, "system:masters")
	}
}

func TestConvertSubjects_Empty(t *testing.T) {
	result := convertSubjects(nil)

	if result == nil {
		t.Error("convertSubjects(nil) returned nil, want empty slice")
	}
	if len(result) != 0 {
		t.Errorf("len(result) = %d, want 0", len(result))
	}
}
