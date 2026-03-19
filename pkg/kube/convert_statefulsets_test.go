package kube

import (
	"testing"
	"time"

	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func TestStatefulSetToStatefulSetInfo_FullyReady(t *testing.T) {
	ss := &appsv1.StatefulSet{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "mysql-primary",
			Namespace:         "default",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-2 * time.Hour)),
		},
		Spec: appsv1.StatefulSetSpec{
			Replicas:    int32Ptr(3),
			ServiceName: "mysql",
			Template: corev1.PodTemplateSpec{
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{
						{Image: "mysql:8.0"},
						{Image: "sidecar:latest"},
					},
				},
			},
		},
		Status: appsv1.StatefulSetStatus{
			ReadyReplicas: 3,
		},
	}

	info := StatefulSetToStatefulSetInfo(ss)

	if info.Name != "mysql-primary" {
		t.Errorf("Name = %q, want %q", info.Name, "mysql-primary")
	}
	if info.Namespace != "default" {
		t.Errorf("Namespace = %q, want %q", info.Namespace, "default")
	}
	if info.Ready != "3/3" {
		t.Errorf("Ready = %q, want %q", info.Ready, "3/3")
	}
	if info.ServiceName != "mysql" {
		t.Errorf("ServiceName = %q, want %q", info.ServiceName, "mysql")
	}
	if info.Age != "2h" {
		t.Errorf("Age = %q, want %q", info.Age, "2h")
	}
	if len(info.Images) != 2 {
		t.Fatalf("Images len = %d, want 2", len(info.Images))
	}
	if info.Images[0] != "mysql:8.0" {
		t.Errorf("Images[0] = %q, want %q", info.Images[0], "mysql:8.0")
	}
	if info.Images[1] != "sidecar:latest" {
		t.Errorf("Images[1] = %q, want %q", info.Images[1], "sidecar:latest")
	}
}

func TestStatefulSetToStatefulSetInfo_Progressing(t *testing.T) {
	ss := &appsv1.StatefulSet{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "redis-cluster",
			Namespace:         "production",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-30 * 24 * time.Hour)),
		},
		Spec: appsv1.StatefulSetSpec{
			Replicas:    int32Ptr(5),
			ServiceName: "redis",
			Template: corev1.PodTemplateSpec{
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{
						{Image: "redis:7.0"},
					},
				},
			},
		},
		Status: appsv1.StatefulSetStatus{
			ReadyReplicas: 2,
		},
	}

	info := StatefulSetToStatefulSetInfo(ss)

	if info.Ready != "2/5" {
		t.Errorf("Ready = %q, want %q", info.Ready, "2/5")
	}
	if info.Age != "30d" {
		t.Errorf("Age = %q, want %q", info.Age, "30d")
	}
}

func TestStatefulSetToStatefulSetInfo_NilReplicas(t *testing.T) {
	ss := &appsv1.StatefulSet{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "default-replicas",
			Namespace: "default",
		},
		Spec: appsv1.StatefulSetSpec{
			// Replicas is nil — defaults to 1
			Template: corev1.PodTemplateSpec{
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{
						{Image: "app:v1"},
					},
				},
			},
		},
		Status: appsv1.StatefulSetStatus{
			ReadyReplicas: 1,
		},
	}

	info := StatefulSetToStatefulSetInfo(ss)

	if info.Ready != "1/1" {
		t.Errorf("Ready = %q, want %q", info.Ready, "1/1")
	}
	if info.Age != "" {
		t.Errorf("Age = %q, want empty", info.Age)
	}
}

func TestStatefulSetToStatefulSetInfo_ZeroTimestamp(t *testing.T) {
	ss := &appsv1.StatefulSet{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "no-timestamp",
			Namespace: "default",
		},
		Spec: appsv1.StatefulSetSpec{
			Replicas: int32Ptr(1),
			Template: corev1.PodTemplateSpec{
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{
						{Image: "app:v1"},
					},
				},
			},
		},
	}

	info := StatefulSetToStatefulSetInfo(ss)

	if info.Age != "" {
		t.Errorf("Age = %q, want empty for zero timestamp", info.Age)
	}
}

func TestConvertStatefulSet(t *testing.T) {
	ss := &appsv1.StatefulSet{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "test-ss",
			Namespace: "default",
		},
		Spec: appsv1.StatefulSetSpec{
			Replicas: int32Ptr(1),
			Template: corev1.PodTemplateSpec{
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{
						{Image: "app:v1"},
					},
				},
			},
		},
	}

	result, ok := convertStatefulSet(ss)
	if !ok {
		t.Fatal("convertStatefulSet returned false")
	}
	info, ok := result.(StatefulSetInfo)
	if !ok {
		t.Fatal("result is not StatefulSetInfo")
	}
	if info.Name != "test-ss" {
		t.Errorf("Name = %q, want %q", info.Name, "test-ss")
	}
}

func TestConvertStatefulSet_WrongType(t *testing.T) {
	_, ok := convertStatefulSet("not a statefulset")
	if ok {
		t.Error("expected convertStatefulSet to return false for wrong type")
	}
}
