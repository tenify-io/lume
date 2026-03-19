package kube

import (
	"testing"
	"time"

	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func TestDaemonSetToDaemonSetInfo_FullyReady(t *testing.T) {
	ds := &appsv1.DaemonSet{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "node-exporter",
			Namespace:         "monitoring",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-2 * time.Hour)),
		},
		Spec: appsv1.DaemonSetSpec{
			Template: corev1.PodTemplateSpec{
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{
						{Image: "prom/node-exporter:latest"},
						{Image: "sidecar:v1"},
					},
					NodeSelector: map[string]string{
						"kubernetes.io/os": "linux",
					},
				},
			},
		},
		Status: appsv1.DaemonSetStatus{
			DesiredNumberScheduled: 3,
			CurrentNumberScheduled: 3,
			NumberReady:            3,
			UpdatedNumberScheduled: 3,
			NumberAvailable:        3,
		},
	}

	info := DaemonSetToDaemonSetInfo(ds)

	if info.Name != "node-exporter" {
		t.Errorf("Name = %q, want %q", info.Name, "node-exporter")
	}
	if info.Namespace != "monitoring" {
		t.Errorf("Namespace = %q, want %q", info.Namespace, "monitoring")
	}
	if info.Desired != 3 {
		t.Errorf("Desired = %d, want 3", info.Desired)
	}
	if info.Current != 3 {
		t.Errorf("Current = %d, want 3", info.Current)
	}
	if info.Ready != 3 {
		t.Errorf("Ready = %d, want 3", info.Ready)
	}
	if info.UpToDate != 3 {
		t.Errorf("UpToDate = %d, want 3", info.UpToDate)
	}
	if info.Available != 3 {
		t.Errorf("Available = %d, want 3", info.Available)
	}
	if info.Age != "2h" {
		t.Errorf("Age = %q, want %q", info.Age, "2h")
	}
	if info.NodeSelector != "kubernetes.io/os=linux" {
		t.Errorf("NodeSelector = %q, want %q", info.NodeSelector, "kubernetes.io/os=linux")
	}
	if len(info.Images) != 2 {
		t.Fatalf("Images len = %d, want 2", len(info.Images))
	}
	if info.Images[0] != "prom/node-exporter:latest" {
		t.Errorf("Images[0] = %q, want %q", info.Images[0], "prom/node-exporter:latest")
	}
	if info.Images[1] != "sidecar:v1" {
		t.Errorf("Images[1] = %q, want %q", info.Images[1], "sidecar:v1")
	}
}

func TestDaemonSetToDaemonSetInfo_PartialReady(t *testing.T) {
	ds := &appsv1.DaemonSet{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "filebeat",
			Namespace:         "logging",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-30 * 24 * time.Hour)),
		},
		Spec: appsv1.DaemonSetSpec{
			Template: corev1.PodTemplateSpec{
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{
						{Image: "docker.elastic.co/beats/filebeat:8.0"},
					},
				},
			},
		},
		Status: appsv1.DaemonSetStatus{
			DesiredNumberScheduled: 5,
			CurrentNumberScheduled: 5,
			NumberReady:            2,
			UpdatedNumberScheduled: 3,
			NumberAvailable:        2,
		},
	}

	info := DaemonSetToDaemonSetInfo(ds)

	if info.Ready != 2 {
		t.Errorf("Ready = %d, want 2", info.Ready)
	}
	if info.Desired != 5 {
		t.Errorf("Desired = %d, want 5", info.Desired)
	}
	if info.Age != "30d" {
		t.Errorf("Age = %q, want %q", info.Age, "30d")
	}
}

func TestDaemonSetToDaemonSetInfo_ZeroTimestamp(t *testing.T) {
	ds := &appsv1.DaemonSet{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "no-timestamp",
			Namespace: "default",
		},
		Spec: appsv1.DaemonSetSpec{
			Template: corev1.PodTemplateSpec{
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{
						{Image: "app:v1"},
					},
				},
			},
		},
	}

	info := DaemonSetToDaemonSetInfo(ds)

	if info.Age != "" {
		t.Errorf("Age = %q, want empty for zero timestamp", info.Age)
	}
}

func TestDaemonSetToDaemonSetInfo_NoNodeSelector(t *testing.T) {
	ds := &appsv1.DaemonSet{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "no-selector",
			Namespace: "default",
		},
		Spec: appsv1.DaemonSetSpec{
			Template: corev1.PodTemplateSpec{
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{
						{Image: "app:v1"},
					},
				},
			},
		},
	}

	info := DaemonSetToDaemonSetInfo(ds)

	if info.NodeSelector != "" {
		t.Errorf("NodeSelector = %q, want empty", info.NodeSelector)
	}
}

func TestConvertDaemonSet(t *testing.T) {
	ds := &appsv1.DaemonSet{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "test-ds",
			Namespace: "default",
		},
		Spec: appsv1.DaemonSetSpec{
			Template: corev1.PodTemplateSpec{
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{
						{Image: "app:v1"},
					},
				},
			},
		},
	}

	result, ok := convertDaemonSet(ds)
	if !ok {
		t.Fatal("convertDaemonSet returned false")
	}
	info, ok := result.(DaemonSetInfo)
	if !ok {
		t.Fatal("result is not DaemonSetInfo")
	}
	if info.Name != "test-ds" {
		t.Errorf("Name = %q, want %q", info.Name, "test-ds")
	}
}

func TestConvertDaemonSet_WrongType(t *testing.T) {
	_, ok := convertDaemonSet("not a daemonset")
	if ok {
		t.Error("expected convertDaemonSet to return false for wrong type")
	}
}

func TestFormatNodeSelector(t *testing.T) {
	tests := []struct {
		name     string
		sel      map[string]string
		expected string
	}{
		{"nil", nil, ""},
		{"empty", map[string]string{}, ""},
		{"single", map[string]string{"os": "linux"}, "os=linux"},
		{"sorted", map[string]string{"b": "2", "a": "1"}, "a=1,b=2"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := formatNodeSelector(tt.sel)
			if result != tt.expected {
				t.Errorf("formatNodeSelector(%v) = %q, want %q", tt.sel, result, tt.expected)
			}
		})
	}
}
