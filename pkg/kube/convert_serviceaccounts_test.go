package kube

import (
	"testing"
	"time"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func TestServiceAccountToServiceAccountInfo_Basic(t *testing.T) {
	sa := &corev1.ServiceAccount{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "my-sa",
			Namespace:         "default",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-2 * time.Hour)),
		},
		Secrets: []corev1.ObjectReference{
			{Name: "my-sa-token-abc"},
			{Name: "my-sa-token-def"},
		},
	}

	info := ServiceAccountToServiceAccountInfo(sa)

	if info.Name != "my-sa" {
		t.Errorf("Name = %q, want %q", info.Name, "my-sa")
	}
	if info.Namespace != "default" {
		t.Errorf("Namespace = %q, want %q", info.Namespace, "default")
	}
	if info.Secrets != 2 {
		t.Errorf("Secrets = %d, want 2", info.Secrets)
	}
	if info.Age != "2h" {
		t.Errorf("Age = %q, want %q", info.Age, "2h")
	}
}

func TestServiceAccountToServiceAccountInfo_NoSecrets(t *testing.T) {
	sa := &corev1.ServiceAccount{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "no-secrets-sa",
			Namespace:         "kube-system",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-24 * time.Hour)),
		},
	}

	info := ServiceAccountToServiceAccountInfo(sa)

	if info.Secrets != 0 {
		t.Errorf("Secrets = %d, want 0", info.Secrets)
	}
	if info.Age != "1d" {
		t.Errorf("Age = %q, want %q", info.Age, "1d")
	}
}

func TestServiceAccountToServiceAccountInfo_ZeroTimestamp(t *testing.T) {
	sa := &corev1.ServiceAccount{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "zero-ts-sa",
			Namespace: "default",
		},
	}

	info := ServiceAccountToServiceAccountInfo(sa)

	if info.Age != "" {
		t.Errorf("Age = %q, want empty for zero timestamp", info.Age)
	}
}

func TestConvertServiceAccount(t *testing.T) {
	sa := &corev1.ServiceAccount{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "test-sa",
			Namespace: "default",
		},
		Secrets: []corev1.ObjectReference{
			{Name: "token-secret"},
		},
	}

	result, ok := convertServiceAccount(sa)
	if !ok {
		t.Fatal("convertServiceAccount returned false")
	}
	info, ok := result.(ServiceAccountInfo)
	if !ok {
		t.Fatal("result is not ServiceAccountInfo")
	}
	if info.Name != "test-sa" {
		t.Errorf("Name = %q, want %q", info.Name, "test-sa")
	}
	if info.Secrets != 1 {
		t.Errorf("Secrets = %d, want 1", info.Secrets)
	}
}

func TestConvertServiceAccount_WrongType(t *testing.T) {
	_, ok := convertServiceAccount("not a service account")
	if ok {
		t.Error("expected convertServiceAccount to return false for wrong type")
	}
}
