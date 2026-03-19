package kube

import (
	"testing"
	"time"

	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func TestNodeToNodeInfo_ReadyNode(t *testing.T) {
	node := &corev1.Node{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "node-1",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-5 * 24 * time.Hour)),
			Labels: map[string]string{
				"node-role.kubernetes.io/control-plane": "",
				"kubernetes.io/hostname":                "node-1",
			},
		},
		Status: corev1.NodeStatus{
			Conditions: []corev1.NodeCondition{
				{
					Type:   corev1.NodeReady,
					Status: corev1.ConditionTrue,
				},
			},
			Addresses: []corev1.NodeAddress{
				{Type: corev1.NodeInternalIP, Address: "10.0.0.1"},
				{Type: corev1.NodeExternalIP, Address: "203.0.113.1"},
			},
			NodeInfo: corev1.NodeSystemInfo{
				KubeletVersion:          "v1.29.0",
				OSImage:                 "Ubuntu 22.04",
				ContainerRuntimeVersion: "containerd://1.7.0",
			},
			Capacity: corev1.ResourceList{
				corev1.ResourceCPU:    resource.MustParse("4"),
				corev1.ResourceMemory: resource.MustParse("16Gi"),
			},
		},
	}

	info := NodeToNodeInfo(node)

	if info.Name != "node-1" {
		t.Errorf("Name = %q, want %q", info.Name, "node-1")
	}
	if info.Status != "Ready" {
		t.Errorf("Status = %q, want %q", info.Status, "Ready")
	}
	if info.Roles != "control-plane" {
		t.Errorf("Roles = %q, want %q", info.Roles, "control-plane")
	}
	if info.Age != "5d" {
		t.Errorf("Age = %q, want %q", info.Age, "5d")
	}
	if info.KubeletVersion != "v1.29.0" {
		t.Errorf("KubeletVersion = %q, want %q", info.KubeletVersion, "v1.29.0")
	}
	if info.InternalIP != "10.0.0.1" {
		t.Errorf("InternalIP = %q, want %q", info.InternalIP, "10.0.0.1")
	}
	if info.ExternalIP != "203.0.113.1" {
		t.Errorf("ExternalIP = %q, want %q", info.ExternalIP, "203.0.113.1")
	}
	if info.OSImage != "Ubuntu 22.04" {
		t.Errorf("OSImage = %q, want %q", info.OSImage, "Ubuntu 22.04")
	}
	if info.ContainerRuntime != "containerd://1.7.0" {
		t.Errorf("ContainerRuntime = %q, want %q", info.ContainerRuntime, "containerd://1.7.0")
	}
}

func TestNodeToNodeInfo_NotReadyNode(t *testing.T) {
	node := &corev1.Node{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "node-2",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-12 * time.Hour)),
		},
		Status: corev1.NodeStatus{
			Conditions: []corev1.NodeCondition{
				{
					Type:   corev1.NodeReady,
					Status: corev1.ConditionFalse,
				},
			},
			NodeInfo: corev1.NodeSystemInfo{
				KubeletVersion: "v1.28.0",
			},
		},
	}

	info := NodeToNodeInfo(node)

	if info.Status != "NotReady" {
		t.Errorf("Status = %q, want %q", info.Status, "NotReady")
	}
	if info.Roles != "<none>" {
		t.Errorf("Roles = %q, want %q", info.Roles, "<none>")
	}
	if info.Age != "12h" {
		t.Errorf("Age = %q, want %q", info.Age, "12h")
	}
}

func TestNodeToNodeInfo_MultipleRoles(t *testing.T) {
	node := &corev1.Node{
		ObjectMeta: metav1.ObjectMeta{
			Name: "multi-role-node",
			Labels: map[string]string{
				"node-role.kubernetes.io/control-plane": "",
				"node-role.kubernetes.io/worker":        "",
			},
		},
		Status: corev1.NodeStatus{
			Conditions: []corev1.NodeCondition{
				{Type: corev1.NodeReady, Status: corev1.ConditionTrue},
			},
			NodeInfo: corev1.NodeSystemInfo{KubeletVersion: "v1.29.0"},
		},
	}

	info := NodeToNodeInfo(node)

	if info.Roles != "control-plane,worker" {
		t.Errorf("Roles = %q, want %q", info.Roles, "control-plane,worker")
	}
}

func TestNodeToNodeInfo_NoConditions(t *testing.T) {
	node := &corev1.Node{
		ObjectMeta: metav1.ObjectMeta{
			Name: "unknown-node",
		},
		Status: corev1.NodeStatus{
			NodeInfo: corev1.NodeSystemInfo{KubeletVersion: "v1.29.0"},
		},
	}

	info := NodeToNodeInfo(node)

	if info.Status != "Unknown" {
		t.Errorf("Status = %q, want %q", info.Status, "Unknown")
	}
}
