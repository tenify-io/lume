package kube

import (
	"testing"
	"time"

	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/intstr"
)

func int32Ptr(i int32) *int32 { return &i }

func TestDeploymentToDeploymentInfo_FullyAvailable(t *testing.T) {
	dep := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "web-app",
			Namespace:         "default",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-2 * time.Hour)),
		},
		Spec: appsv1.DeploymentSpec{
			Replicas: int32Ptr(3),
			Strategy: appsv1.DeploymentStrategy{
				Type: appsv1.RollingUpdateDeploymentStrategyType,
			},
			Template: corev1.PodTemplateSpec{
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{
						{Image: "nginx:1.25"},
						{Image: "sidecar:latest"},
					},
				},
			},
		},
		Status: appsv1.DeploymentStatus{
			ReadyReplicas:     3,
			UpdatedReplicas:   3,
			AvailableReplicas: 3,
		},
	}

	info := DeploymentToDeploymentInfo(dep)

	if info.Name != "web-app" {
		t.Errorf("Name = %q, want %q", info.Name, "web-app")
	}
	if info.Namespace != "default" {
		t.Errorf("Namespace = %q, want %q", info.Namespace, "default")
	}
	if info.Ready != "3/3" {
		t.Errorf("Ready = %q, want %q", info.Ready, "3/3")
	}
	if info.UpToDate != 3 {
		t.Errorf("UpToDate = %d, want %d", info.UpToDate, 3)
	}
	if info.Available != 3 {
		t.Errorf("Available = %d, want %d", info.Available, 3)
	}
	if info.Age != "2h" {
		t.Errorf("Age = %q, want %q", info.Age, "2h")
	}
	if info.Strategy != "RollingUpdate" {
		t.Errorf("Strategy = %q, want %q", info.Strategy, "RollingUpdate")
	}
	if len(info.Images) != 2 {
		t.Fatalf("Images len = %d, want 2", len(info.Images))
	}
	if info.Images[0] != "nginx:1.25" {
		t.Errorf("Images[0] = %q, want %q", info.Images[0], "nginx:1.25")
	}
	if info.Images[1] != "sidecar:latest" {
		t.Errorf("Images[1] = %q, want %q", info.Images[1], "sidecar:latest")
	}
}

func TestDeploymentToDeploymentInfo_Progressing(t *testing.T) {
	dep := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "api-server",
			Namespace:         "production",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-30 * 24 * time.Hour)),
		},
		Spec: appsv1.DeploymentSpec{
			Replicas: int32Ptr(5),
			Strategy: appsv1.DeploymentStrategy{
				Type: appsv1.RollingUpdateDeploymentStrategyType,
			},
			Template: corev1.PodTemplateSpec{
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{
						{Image: "api:v2"},
					},
				},
			},
		},
		Status: appsv1.DeploymentStatus{
			ReadyReplicas:     3,
			UpdatedReplicas:   2,
			AvailableReplicas: 3,
		},
	}

	info := DeploymentToDeploymentInfo(dep)

	if info.Ready != "3/5" {
		t.Errorf("Ready = %q, want %q", info.Ready, "3/5")
	}
	if info.UpToDate != 2 {
		t.Errorf("UpToDate = %d, want %d", info.UpToDate, 2)
	}
	if info.Available != 3 {
		t.Errorf("Available = %d, want %d", info.Available, 3)
	}
	if info.Age != "30d" {
		t.Errorf("Age = %q, want %q", info.Age, "30d")
	}
}

func TestDeploymentToDeploymentInfo_NilReplicas(t *testing.T) {
	dep := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "default-replicas",
			Namespace: "default",
		},
		Spec: appsv1.DeploymentSpec{
			// Replicas is nil — defaults to 1
			Template: corev1.PodTemplateSpec{
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{
						{Image: "app:v1"},
					},
				},
			},
		},
		Status: appsv1.DeploymentStatus{
			ReadyReplicas: 1,
		},
	}

	info := DeploymentToDeploymentInfo(dep)

	if info.Ready != "1/1" {
		t.Errorf("Ready = %q, want %q", info.Ready, "1/1")
	}
	if info.Age != "" {
		t.Errorf("Age = %q, want empty", info.Age)
	}
}

func TestDeploymentToDeploymentInfo_RecreateStrategy(t *testing.T) {
	dep := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "batch-worker",
			Namespace:         "default",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-5 * time.Minute)),
		},
		Spec: appsv1.DeploymentSpec{
			Replicas: int32Ptr(2),
			Strategy: appsv1.DeploymentStrategy{
				Type: appsv1.RecreateDeploymentStrategyType,
			},
			Template: corev1.PodTemplateSpec{
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{
						{Image: "worker:v3"},
					},
				},
			},
		},
		Status: appsv1.DeploymentStatus{
			ReadyReplicas:     0,
			UpdatedReplicas:   0,
			AvailableReplicas: 0,
		},
	}

	info := DeploymentToDeploymentInfo(dep)

	if info.Strategy != "Recreate" {
		t.Errorf("Strategy = %q, want %q", info.Strategy, "Recreate")
	}
	if info.Ready != "0/2" {
		t.Errorf("Ready = %q, want %q", info.Ready, "0/2")
	}
	if info.Age != "5m" {
		t.Errorf("Age = %q, want %q", info.Age, "5m")
	}
}

func TestConvertDeployment(t *testing.T) {
	dep := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "test-dep",
			Namespace: "default",
		},
		Spec: appsv1.DeploymentSpec{
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

	result, ok := convertDeployment(dep)
	if !ok {
		t.Fatal("convertDeployment returned false")
	}
	info, ok := result.(DeploymentInfo)
	if !ok {
		t.Fatal("result is not DeploymentInfo")
	}
	if info.Name != "test-dep" {
		t.Errorf("Name = %q, want %q", info.Name, "test-dep")
	}
}

func TestConvertDeployment_WrongType(t *testing.T) {
	_, ok := convertDeployment("not a deployment")
	if ok {
		t.Error("expected convertDeployment to return false for wrong type")
	}
}

func TestDeploymentToDeploymentInfo_RollingUpdateParams(t *testing.T) {
	maxSurge := intstr.FromString("25%")
	maxUnavailable := intstr.FromInt32(1)

	dep := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "rolling-dep",
			Namespace:         "default",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-1 * time.Hour)),
		},
		Spec: appsv1.DeploymentSpec{
			Replicas: int32Ptr(4),
			Strategy: appsv1.DeploymentStrategy{
				Type: appsv1.RollingUpdateDeploymentStrategyType,
				RollingUpdate: &appsv1.RollingUpdateDeployment{
					MaxSurge:       &maxSurge,
					MaxUnavailable: &maxUnavailable,
				},
			},
			Template: corev1.PodTemplateSpec{
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{
						{Image: "app:v2"},
					},
				},
			},
		},
		Status: appsv1.DeploymentStatus{
			ReadyReplicas:     4,
			UpdatedReplicas:   4,
			AvailableReplicas: 4,
		},
	}

	info := DeploymentToDeploymentInfo(dep)

	if info.Ready != "4/4" {
		t.Errorf("Ready = %q, want %q", info.Ready, "4/4")
	}
	if info.Strategy != "RollingUpdate" {
		t.Errorf("Strategy = %q, want %q", info.Strategy, "RollingUpdate")
	}
}
