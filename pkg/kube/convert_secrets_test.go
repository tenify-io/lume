package kube

import (
	"testing"
	"time"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func TestSecretToSecretInfo_Basic(t *testing.T) {
	s := &corev1.Secret{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "my-secret",
			Namespace:         "default",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-2 * time.Hour)),
		},
		Type: corev1.SecretTypeOpaque,
		Data: map[string][]byte{
			"username": []byte("admin"),
			"password": []byte("s3cret"),
		},
	}

	info := SecretToSecretInfo(s)

	if info.Name != "my-secret" {
		t.Errorf("Name = %q, want %q", info.Name, "my-secret")
	}
	if info.Namespace != "default" {
		t.Errorf("Namespace = %q, want %q", info.Namespace, "default")
	}
	if info.Type != "Opaque" {
		t.Errorf("Type = %q, want %q", info.Type, "Opaque")
	}
	if info.DataCount != 2 {
		t.Errorf("DataCount = %d, want 2", info.DataCount)
	}
	if info.Age != "2h" {
		t.Errorf("Age = %q, want %q", info.Age, "2h")
	}
}

func TestSecretToSecretInfo_TLSType(t *testing.T) {
	s := &corev1.Secret{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "tls-cert",
			Namespace:         "production",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-24 * time.Hour)),
		},
		Type: corev1.SecretTypeTLS,
		Data: map[string][]byte{
			"tls.crt": []byte("cert-data"),
			"tls.key": []byte("key-data"),
		},
	}

	info := SecretToSecretInfo(s)

	if info.Type != "kubernetes.io/tls" {
		t.Errorf("Type = %q, want %q", info.Type, "kubernetes.io/tls")
	}
	if info.DataCount != 2 {
		t.Errorf("DataCount = %d, want 2", info.DataCount)
	}
}

func TestSecretToSecretInfo_Empty(t *testing.T) {
	s := &corev1.Secret{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "empty-secret",
			Namespace: "default",
		},
		Type: corev1.SecretTypeOpaque,
	}

	info := SecretToSecretInfo(s)

	if info.DataCount != 0 {
		t.Errorf("DataCount = %d, want 0", info.DataCount)
	}
	if info.Age != "" {
		t.Errorf("Age = %q, want empty for zero timestamp", info.Age)
	}
}

func TestSecretToSecretInfo_ZeroTimestamp(t *testing.T) {
	s := &corev1.Secret{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "no-timestamp",
			Namespace: "default",
		},
		Type: corev1.SecretTypeOpaque,
		Data: map[string][]byte{
			"key": []byte("value"),
		},
	}

	info := SecretToSecretInfo(s)

	if info.Age != "" {
		t.Errorf("Age = %q, want empty for zero timestamp", info.Age)
	}
	if info.DataCount != 1 {
		t.Errorf("DataCount = %d, want 1", info.DataCount)
	}
}

func TestConvertSecret(t *testing.T) {
	s := &corev1.Secret{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "test-secret",
			Namespace: "default",
		},
		Type: corev1.SecretTypeOpaque,
		Data: map[string][]byte{
			"token": []byte("abc123"),
		},
	}

	result, ok := convertSecret(s)
	if !ok {
		t.Fatal("convertSecret returned false")
	}
	info, ok := result.(SecretInfo)
	if !ok {
		t.Fatal("result is not SecretInfo")
	}
	if info.Name != "test-secret" {
		t.Errorf("Name = %q, want %q", info.Name, "test-secret")
	}
	if info.DataCount != 1 {
		t.Errorf("DataCount = %d, want 1", info.DataCount)
	}
}

func TestConvertSecret_WrongType(t *testing.T) {
	_, ok := convertSecret("not a secret")
	if ok {
		t.Error("expected convertSecret to return false for wrong type")
	}
}
