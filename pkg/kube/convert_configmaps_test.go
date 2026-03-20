package kube

import (
	"testing"
	"time"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func TestConfigMapToConfigMapInfo_Basic(t *testing.T) {
	cm := &corev1.ConfigMap{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "app-config",
			Namespace:         "default",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-2 * time.Hour)),
		},
		Data: map[string]string{
			"config.yaml": "key: value",
			"settings":    "debug=true",
		},
	}

	info := ConfigMapToConfigMapInfo(cm)

	if info.Name != "app-config" {
		t.Errorf("Name = %q, want %q", info.Name, "app-config")
	}
	if info.Namespace != "default" {
		t.Errorf("Namespace = %q, want %q", info.Namespace, "default")
	}
	if info.DataCount != 2 {
		t.Errorf("DataCount = %d, want 2", info.DataCount)
	}
	if info.Age != "2h" {
		t.Errorf("Age = %q, want %q", info.Age, "2h")
	}
}

func TestConfigMapToConfigMapInfo_WithBinaryData(t *testing.T) {
	cm := &corev1.ConfigMap{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "mixed-config",
			Namespace:         "production",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-24 * time.Hour)),
		},
		Data: map[string]string{
			"app.conf": "setting=1",
		},
		BinaryData: map[string][]byte{
			"cert.pem": []byte("binary-content"),
			"key.pem":  []byte("secret-key"),
		},
	}

	info := ConfigMapToConfigMapInfo(cm)

	if info.DataCount != 3 {
		t.Errorf("DataCount = %d, want 3 (1 data + 2 binary)", info.DataCount)
	}
}

func TestConfigMapToConfigMapInfo_Empty(t *testing.T) {
	cm := &corev1.ConfigMap{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "empty-config",
			Namespace: "default",
		},
	}

	info := ConfigMapToConfigMapInfo(cm)

	if info.DataCount != 0 {
		t.Errorf("DataCount = %d, want 0", info.DataCount)
	}
	if info.Age != "" {
		t.Errorf("Age = %q, want empty for zero timestamp", info.Age)
	}
}

func TestBinaryDataKeys_Sorted(t *testing.T) {
	binaryData := map[string][]byte{
		"zebra.bin": []byte("zzz"),
		"alpha.bin": []byte("a"),
		"middle":    []byte("mid-content"),
	}

	keys := binaryDataKeys(binaryData)

	if len(keys) != 3 {
		t.Fatalf("length = %d, want 3", len(keys))
	}
	if keys[0].Name != "alpha.bin" {
		t.Errorf("keys[0].Name = %q, want %q", keys[0].Name, "alpha.bin")
	}
	if keys[0].Size != 1 {
		t.Errorf("keys[0].Size = %d, want 1", keys[0].Size)
	}
	if keys[1].Name != "middle" {
		t.Errorf("keys[1].Name = %q, want %q", keys[1].Name, "middle")
	}
	if keys[1].Size != 11 {
		t.Errorf("keys[1].Size = %d, want 11", keys[1].Size)
	}
	if keys[2].Name != "zebra.bin" {
		t.Errorf("keys[2].Name = %q, want %q", keys[2].Name, "zebra.bin")
	}
	if keys[2].Size != 3 {
		t.Errorf("keys[2].Size = %d, want 3", keys[2].Size)
	}
}

func TestBinaryDataKeys_Nil(t *testing.T) {
	keys := binaryDataKeys(nil)
	if keys != nil {
		t.Errorf("expected nil, got %v", keys)
	}
}

func TestBinaryDataKeys_Empty(t *testing.T) {
	keys := binaryDataKeys(map[string][]byte{})
	if keys != nil {
		t.Errorf("expected nil, got %v", keys)
	}
}

func TestConvertConfigMap(t *testing.T) {
	cm := &corev1.ConfigMap{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "test-cm",
			Namespace: "default",
		},
		Data: map[string]string{
			"key": "value",
		},
	}

	result, ok := convertConfigMap(cm)
	if !ok {
		t.Fatal("convertConfigMap returned false")
	}
	info, ok := result.(ConfigMapInfo)
	if !ok {
		t.Fatal("result is not ConfigMapInfo")
	}
	if info.Name != "test-cm" {
		t.Errorf("Name = %q, want %q", info.Name, "test-cm")
	}
	if info.DataCount != 1 {
		t.Errorf("DataCount = %d, want 1", info.DataCount)
	}
}

func TestConvertConfigMap_WrongType(t *testing.T) {
	_, ok := convertConfigMap("not a config map")
	if ok {
		t.Error("expected convertConfigMap to return false for wrong type")
	}
}
