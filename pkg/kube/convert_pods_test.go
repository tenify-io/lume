package kube

import (
	"testing"
	"time"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func TestPodToPodInfo_RunningPod(t *testing.T) {
	pod := &corev1.Pod{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "web-abc123",
			Namespace:         "default",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-2 * time.Hour)),
			Labels:            map[string]string{"app": "web"},
		},
		Spec: corev1.PodSpec{
			Containers: []corev1.Container{
				{Name: "nginx"},
				{Name: "sidecar"},
			},
			NodeName: "node-1",
		},
		Status: corev1.PodStatus{
			Phase: corev1.PodRunning,
			PodIP: "10.0.0.5",
			ContainerStatuses: []corev1.ContainerStatus{
				{
					Name:         "nginx",
					Image:        "nginx:1.25",
					Ready:        true,
					RestartCount: 0,
					State:        corev1.ContainerState{Running: &corev1.ContainerStateRunning{}},
				},
				{
					Name:         "sidecar",
					Image:        "envoy:latest",
					Ready:        true,
					RestartCount: 2,
					State:        corev1.ContainerState{Running: &corev1.ContainerStateRunning{}},
				},
			},
		},
	}

	info := PodToPodInfo(pod)

	if info.Name != "web-abc123" {
		t.Errorf("Name = %q, want %q", info.Name, "web-abc123")
	}
	if info.Namespace != "default" {
		t.Errorf("Namespace = %q, want %q", info.Namespace, "default")
	}
	if info.Status != "Running" {
		t.Errorf("Status = %q, want %q", info.Status, "Running")
	}
	if info.Ready != "2/2" {
		t.Errorf("Ready = %q, want %q", info.Ready, "2/2")
	}
	if info.Restarts != 2 {
		t.Errorf("Restarts = %d, want %d", info.Restarts, 2)
	}
	if info.Age != "2h" {
		t.Errorf("Age = %q, want %q", info.Age, "2h")
	}
	if info.NodeName != "node-1" {
		t.Errorf("NodeName = %q, want %q", info.NodeName, "node-1")
	}
	if info.IP != "10.0.0.5" {
		t.Errorf("IP = %q, want %q", info.IP, "10.0.0.5")
	}
	if len(info.Containers) != 2 {
		t.Fatalf("Containers len = %d, want 2", len(info.Containers))
	}
	if info.Containers[0].State != "running" {
		t.Errorf("Container[0].State = %q, want %q", info.Containers[0].State, "running")
	}
}

func TestPodToPodInfo_PendingPod(t *testing.T) {
	pod := &corev1.Pod{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "pending-pod",
			Namespace:         "staging",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-30 * time.Second)),
		},
		Spec: corev1.PodSpec{
			Containers: []corev1.Container{
				{Name: "app"},
			},
		},
		Status: corev1.PodStatus{
			Phase: corev1.PodPending,
			ContainerStatuses: []corev1.ContainerStatus{
				{
					Name:  "app",
					Image: "myapp:v1",
					Ready: false,
					State: corev1.ContainerState{
						Waiting: &corev1.ContainerStateWaiting{Reason: "ContainerCreating"},
					},
				},
			},
		},
	}

	info := PodToPodInfo(pod)

	if info.Status != "Pending" {
		t.Errorf("Status = %q, want %q", info.Status, "Pending")
	}
	if info.Ready != "0/1" {
		t.Errorf("Ready = %q, want %q", info.Ready, "0/1")
	}
	if info.Containers[0].State != "ContainerCreating" {
		t.Errorf("Container State = %q, want %q", info.Containers[0].State, "ContainerCreating")
	}
	if info.Age != "30s" {
		t.Errorf("Age = %q, want %q", info.Age, "30s")
	}
}

func TestPodToPodInfo_FailedPodWithTerminatedContainer(t *testing.T) {
	pod := &corev1.Pod{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "crashed-pod",
			Namespace:         "production",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-3 * 24 * time.Hour)),
		},
		Spec: corev1.PodSpec{
			Containers: []corev1.Container{
				{Name: "worker"},
			},
		},
		Status: corev1.PodStatus{
			Phase: corev1.PodFailed,
			ContainerStatuses: []corev1.ContainerStatus{
				{
					Name:         "worker",
					Image:        "worker:v2",
					Ready:        false,
					RestartCount: 15,
					State: corev1.ContainerState{
						Terminated: &corev1.ContainerStateTerminated{Reason: "OOMKilled"},
					},
				},
			},
		},
	}

	info := PodToPodInfo(pod)

	if info.Status != "Failed" {
		t.Errorf("Status = %q, want %q", info.Status, "Failed")
	}
	if info.Restarts != 15 {
		t.Errorf("Restarts = %d, want %d", info.Restarts, 15)
	}
	if info.Containers[0].State != "OOMKilled" {
		t.Errorf("Container State = %q, want %q", info.Containers[0].State, "OOMKilled")
	}
	if info.Age != "3d" {
		t.Errorf("Age = %q, want %q", info.Age, "3d")
	}
}

func TestPodToPodInfo_NoContainerStatuses(t *testing.T) {
	pod := &corev1.Pod{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "init-pod",
			Namespace: "default",
		},
		Spec: corev1.PodSpec{
			Containers: []corev1.Container{
				{Name: "app"},
			},
		},
		Status: corev1.PodStatus{
			Phase: corev1.PodPending,
		},
	}

	info := PodToPodInfo(pod)

	if info.Ready != "0/1" {
		t.Errorf("Ready = %q, want %q", info.Ready, "0/1")
	}
	if info.Restarts != 0 {
		t.Errorf("Restarts = %d, want %d", info.Restarts, 0)
	}
	if len(info.Containers) != 0 {
		t.Errorf("Containers len = %d, want 0", len(info.Containers))
	}
	if info.Age != "" {
		t.Errorf("Age = %q, want empty", info.Age)
	}
}

func TestPodToPodInfo_Labels(t *testing.T) {
	pod := &corev1.Pod{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "labeled-pod",
			Namespace: "default",
			Labels:    map[string]string{"app": "web", "env": "prod"},
		},
		Spec: corev1.PodSpec{
			Containers: []corev1.Container{{Name: "app"}},
		},
		Status: corev1.PodStatus{Phase: corev1.PodRunning},
	}

	info := PodToPodInfo(pod)

	if len(info.Labels) != 2 {
		t.Fatalf("Labels len = %d, want 2", len(info.Labels))
	}
	if info.Labels["app"] != "web" {
		t.Errorf("Labels[app] = %q, want %q", info.Labels["app"], "web")
	}
	if info.Labels["env"] != "prod" {
		t.Errorf("Labels[env] = %q, want %q", info.Labels["env"], "prod")
	}
}
