package kube

import (
	"testing"
	"time"

	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func TestReplicaSetToReplicaSetInfo_FullyReady(t *testing.T) {
	rs := &appsv1.ReplicaSet{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "nginx-abc123",
			Namespace:         "default",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-2 * time.Hour)),
			OwnerReferences: []metav1.OwnerReference{
				{Kind: "Deployment", Name: "nginx"},
			},
		},
		Spec: appsv1.ReplicaSetSpec{
			Replicas: ptrInt32(3),
			Template: corev1.PodTemplateSpec{
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{
						{Image: "nginx:1.25"},
						{Image: "sidecar:v1"},
					},
				},
			},
		},
		Status: appsv1.ReplicaSetStatus{
			Replicas:      3,
			ReadyReplicas: 3,
		},
	}

	info := ReplicaSetToReplicaSetInfo(rs)

	if info.Name != "nginx-abc123" {
		t.Errorf("Name = %q, want %q", info.Name, "nginx-abc123")
	}
	if info.Namespace != "default" {
		t.Errorf("Namespace = %q, want %q", info.Namespace, "default")
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
	if info.Age != "2h" {
		t.Errorf("Age = %q, want %q", info.Age, "2h")
	}
	if info.Owner != "nginx" {
		t.Errorf("Owner = %q, want %q", info.Owner, "nginx")
	}
	if len(info.Images) != 2 {
		t.Fatalf("Images len = %d, want 2", len(info.Images))
	}
	if info.Images[0] != "nginx:1.25" {
		t.Errorf("Images[0] = %q, want %q", info.Images[0], "nginx:1.25")
	}
}

func TestReplicaSetToReplicaSetInfo_NoOwner(t *testing.T) {
	rs := &appsv1.ReplicaSet{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "standalone-rs",
			Namespace:         "default",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-30 * 24 * time.Hour)),
		},
		Spec: appsv1.ReplicaSetSpec{
			Replicas: ptrInt32(2),
			Template: corev1.PodTemplateSpec{
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{
						{Image: "app:v1"},
					},
				},
			},
		},
		Status: appsv1.ReplicaSetStatus{
			Replicas:      2,
			ReadyReplicas: 1,
		},
	}

	info := ReplicaSetToReplicaSetInfo(rs)

	if info.Owner != "" {
		t.Errorf("Owner = %q, want empty", info.Owner)
	}
	if info.Desired != 2 {
		t.Errorf("Desired = %d, want 2", info.Desired)
	}
	if info.Ready != 1 {
		t.Errorf("Ready = %d, want 1", info.Ready)
	}
	if info.Age != "30d" {
		t.Errorf("Age = %q, want %q", info.Age, "30d")
	}
}

func TestReplicaSetToReplicaSetInfo_NilReplicas(t *testing.T) {
	rs := &appsv1.ReplicaSet{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "nil-replicas",
			Namespace: "default",
		},
		Spec: appsv1.ReplicaSetSpec{
			Template: corev1.PodTemplateSpec{
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{
						{Image: "app:v1"},
					},
				},
			},
		},
		Status: appsv1.ReplicaSetStatus{
			Replicas:      1,
			ReadyReplicas: 1,
		},
	}

	info := ReplicaSetToReplicaSetInfo(rs)

	if info.Desired != 1 {
		t.Errorf("Desired = %d, want 1 (default when nil)", info.Desired)
	}
}

func TestReplicaSetToReplicaSetInfo_ZeroTimestamp(t *testing.T) {
	rs := &appsv1.ReplicaSet{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "no-timestamp",
			Namespace: "default",
		},
		Spec: appsv1.ReplicaSetSpec{
			Replicas: ptrInt32(1),
			Template: corev1.PodTemplateSpec{
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{
						{Image: "app:v1"},
					},
				},
			},
		},
	}

	info := ReplicaSetToReplicaSetInfo(rs)

	if info.Age != "" {
		t.Errorf("Age = %q, want empty for zero timestamp", info.Age)
	}
}

func TestConvertReplicaSet(t *testing.T) {
	rs := &appsv1.ReplicaSet{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "test-rs",
			Namespace: "default",
		},
		Spec: appsv1.ReplicaSetSpec{
			Replicas: ptrInt32(1),
			Template: corev1.PodTemplateSpec{
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{
						{Image: "app:v1"},
					},
				},
			},
		},
	}

	result, ok := convertReplicaSet(rs)
	if !ok {
		t.Fatal("convertReplicaSet returned false")
	}
	info, ok := result.(ReplicaSetInfo)
	if !ok {
		t.Fatal("result is not ReplicaSetInfo")
	}
	if info.Name != "test-rs" {
		t.Errorf("Name = %q, want %q", info.Name, "test-rs")
	}
}

func TestConvertReplicaSet_WrongType(t *testing.T) {
	_, ok := convertReplicaSet("not a replicaset")
	if ok {
		t.Error("expected convertReplicaSet to return false for wrong type")
	}
}

func TestDerefInt32(t *testing.T) {
	if v := derefInt32(ptrInt32(5)); v != 5 {
		t.Errorf("derefInt32(&5) = %d, want 5", v)
	}
	if v := derefInt32(nil); v != 1 {
		t.Errorf("derefInt32(nil) = %d, want 1", v)
	}
}
