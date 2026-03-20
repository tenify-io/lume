package kube

import (
	"testing"
	"time"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func TestNamespaceToNamespaceInfo_Active(t *testing.T) {
	ns := &corev1.Namespace{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "default",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-10 * 24 * time.Hour)),
			Labels: map[string]string{
				"kubernetes.io/metadata.name": "default",
			},
		},
		Status: corev1.NamespaceStatus{
			Phase: corev1.NamespaceActive,
		},
	}

	info := NamespaceToNamespaceInfo(ns)

	if info.Name != "default" {
		t.Errorf("Name = %q, want %q", info.Name, "default")
	}
	if info.Status != "Active" {
		t.Errorf("Status = %q, want %q", info.Status, "Active")
	}
	if info.Age != "10d" {
		t.Errorf("Age = %q, want %q", info.Age, "10d")
	}
	if info.Labels["kubernetes.io/metadata.name"] != "default" {
		t.Errorf("Labels missing expected key")
	}
}

func TestNamespaceToNamespaceInfo_Terminating(t *testing.T) {
	ns := &corev1.Namespace{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "old-namespace",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-30 * 24 * time.Hour)),
		},
		Status: corev1.NamespaceStatus{
			Phase: corev1.NamespaceTerminating,
		},
	}

	info := NamespaceToNamespaceInfo(ns)

	if info.Status != "Terminating" {
		t.Errorf("Status = %q, want %q", info.Status, "Terminating")
	}
	if info.Age != "30d" {
		t.Errorf("Age = %q, want %q", info.Age, "30d")
	}
}

func TestNamespaceToNamespaceInfo_NoTimestamp(t *testing.T) {
	ns := &corev1.Namespace{
		ObjectMeta: metav1.ObjectMeta{
			Name: "no-ts",
		},
		Status: corev1.NamespaceStatus{
			Phase: corev1.NamespaceActive,
		},
	}

	info := NamespaceToNamespaceInfo(ns)

	if info.Age != "" {
		t.Errorf("Age = %q, want empty string", info.Age)
	}
}

func TestNamespaceToNamespaceInfo_NilLabels(t *testing.T) {
	ns := &corev1.Namespace{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "no-labels",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-1 * time.Hour)),
		},
		Status: corev1.NamespaceStatus{
			Phase: corev1.NamespaceActive,
		},
	}

	info := NamespaceToNamespaceInfo(ns)

	if info.Name != "no-labels" {
		t.Errorf("Name = %q, want %q", info.Name, "no-labels")
	}
	if info.Labels != nil {
		t.Errorf("Labels = %v, want nil", info.Labels)
	}
}
