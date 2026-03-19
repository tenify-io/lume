package kube

import (
	"context"
	"sync"
	"testing"
	"time"

	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes/fake"
)

// namedEvent pairs a ResourceEvent with the event channel name it was emitted on.
type namedEvent struct {
	channel string
	event   ResourceEvent
}

// collectEvents creates an EventEmitter that records events into a slice.
func collectEvents() (EventEmitter, *[]ResourceEvent, *sync.Mutex) {
	var events []ResourceEvent
	var mu sync.Mutex
	emit := func(_ string, data ...interface{}) {
		if len(data) > 0 {
			if ev, ok := data[0].(ResourceEvent); ok {
				mu.Lock()
				events = append(events, ev)
				mu.Unlock()
			}
		}
	}
	return emit, &events, &mu
}

// collectNamedEvents creates an EventEmitter that records events with their channel name.
func collectNamedEvents() (EventEmitter, *[]namedEvent, *sync.Mutex) {
	var events []namedEvent
	var mu sync.Mutex
	emit := func(name string, data ...interface{}) {
		if len(data) > 0 {
			if ev, ok := data[0].(ResourceEvent); ok {
				mu.Lock()
				events = append(events, namedEvent{channel: name, event: ev})
				mu.Unlock()
			}
		}
	}
	return emit, &events, &mu
}

// waitForNamedEvents waits until at least minCount events with the given channel name are received.
func waitForNamedEvents(t *testing.T, events *[]namedEvent, mu *sync.Mutex, channel string, minCount int) []ResourceEvent {
	t.Helper()
	deadline := time.After(5 * time.Second)
	for {
		select {
		case <-deadline:
			mu.Lock()
			n := 0
			for _, e := range *events {
				if e.channel == channel {
					n++
				}
			}
			mu.Unlock()
			t.Fatalf("timed out waiting for %d %q events, got %d", minCount, channel, n)
			return nil
		default:
			mu.Lock()
			var matched []ResourceEvent
			for _, e := range *events {
				if e.channel == channel {
					matched = append(matched, e.event)
				}
			}
			mu.Unlock()
			if len(matched) >= minCount {
				return matched
			}
			time.Sleep(50 * time.Millisecond)
		}
	}
}

func waitForEvents(t *testing.T, events *[]ResourceEvent, mu *sync.Mutex, minCount int) []ResourceEvent {
	t.Helper()
	deadline := time.After(5 * time.Second)
	for {
		select {
		case <-deadline:
			mu.Lock()
			n := len(*events)
			mu.Unlock()
			t.Fatalf("timed out waiting for %d events, got %d", minCount, n)
			return nil
		default:
			mu.Lock()
			n := len(*events)
			mu.Unlock()
			if n >= minCount {
				mu.Lock()
				result := make([]ResourceEvent, len(*events))
				copy(result, *events)
				mu.Unlock()
				return result
			}
			time.Sleep(50 * time.Millisecond)
		}
	}
}

func TestWatcher_EmitsAddedEventsOnStart(t *testing.T) {
	pod := &corev1.Pod{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "test-pod",
			Namespace: "default",
		},
		Spec: corev1.PodSpec{
			Containers: []corev1.Container{{Name: "app"}},
		},
		Status: corev1.PodStatus{
			Phase: corev1.PodRunning,
		},
	}

	client := fake.NewClientset(pod)
	emit, events, mu := collectNamedEvents()
	w := NewWatcher(client, emit)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	w.Start(ctx, "default")
	defer w.Stop()

	collected := waitForNamedEvents(t, events, mu, "pods:changed", 1)

	found := false
	for _, ev := range collected {
		if ev.Type == "ADDED" {
			info, ok := ev.Data.(PodInfo)
			if ok && info.Name == "test-pod" {
				found = true
				break
			}
		}
	}
	if !found {
		t.Error("expected ADDED event for test-pod")
	}
}

func TestWatcher_EmitsModifiedOnUpdate(t *testing.T) {
	pod := &corev1.Pod{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "update-pod",
			Namespace: "default",
		},
		Spec: corev1.PodSpec{
			Containers: []corev1.Container{{Name: "app"}},
		},
		Status: corev1.PodStatus{
			Phase: corev1.PodPending,
		},
	}

	client := fake.NewClientset(pod)
	emit, events, mu := collectEvents()
	w := NewWatcher(client, emit)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	w.Start(ctx, "default")
	defer w.Stop()

	// Wait for the initial ADDED event
	waitForEvents(t, events, mu, 1)

	// Update the pod status
	pod.Status.Phase = corev1.PodRunning
	_, err := client.CoreV1().Pods("default").UpdateStatus(ctx, pod, metav1.UpdateOptions{})
	if err != nil {
		t.Fatalf("failed to update pod: %v", err)
	}

	// Wait for the MODIFIED event
	collected := waitForEvents(t, events, mu, 2)

	found := false
	for _, ev := range collected {
		if ev.Type == "MODIFIED" {
			info, ok := ev.Data.(PodInfo)
			if ok && info.Name == "update-pod" && info.Status == "Running" {
				found = true
				break
			}
		}
	}
	if !found {
		t.Error("expected MODIFIED event for update-pod with Running status")
	}
}

func TestWatcher_EmitsDeletedOnRemove(t *testing.T) {
	pod := &corev1.Pod{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "delete-pod",
			Namespace: "default",
		},
		Spec: corev1.PodSpec{
			Containers: []corev1.Container{{Name: "app"}},
		},
		Status: corev1.PodStatus{
			Phase: corev1.PodRunning,
		},
	}

	client := fake.NewClientset(pod)
	emit, events, mu := collectEvents()
	w := NewWatcher(client, emit)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	w.Start(ctx, "default")
	defer w.Stop()

	// Wait for the initial ADDED event
	waitForEvents(t, events, mu, 1)

	// Delete the pod
	err := client.CoreV1().Pods("default").Delete(ctx, "delete-pod", metav1.DeleteOptions{})
	if err != nil {
		t.Fatalf("failed to delete pod: %v", err)
	}

	// Wait for the DELETED event
	collected := waitForEvents(t, events, mu, 2)

	found := false
	for _, ev := range collected {
		if ev.Type == "DELETED" {
			info, ok := ev.Data.(PodInfo)
			if ok && info.Name == "delete-pod" {
				found = true
				break
			}
		}
	}
	if !found {
		t.Error("expected DELETED event for delete-pod")
	}
}

func TestWatcher_StopCancelsWatching(t *testing.T) {
	client := fake.NewClientset()
	emit, _, _ := collectEvents()
	w := NewWatcher(client, emit)

	ctx := context.Background()
	w.Start(ctx, "default")
	w.Stop()

	// Should not panic and cancel should be nil after stop
	w.Stop() // double-stop should be safe
}

func TestWatcher_StartRestartsOnNewNamespace(t *testing.T) {
	podA := &corev1.Pod{
		ObjectMeta: metav1.ObjectMeta{Name: "pod-a", Namespace: "ns-a"},
		Spec:       corev1.PodSpec{Containers: []corev1.Container{{Name: "app"}}},
		Status:     corev1.PodStatus{Phase: corev1.PodRunning},
	}
	podB := &corev1.Pod{
		ObjectMeta: metav1.ObjectMeta{Name: "pod-b", Namespace: "ns-b"},
		Spec:       corev1.PodSpec{Containers: []corev1.Container{{Name: "app"}}},
		Status:     corev1.PodStatus{Phase: corev1.PodRunning},
	}

	client := fake.NewClientset(podA, podB)
	emit, events, mu := collectEvents()
	w := NewWatcher(client, emit)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Watch ns-a first
	w.Start(ctx, "ns-a")
	collected := waitForEvents(t, events, mu, 1)

	foundA := false
	for _, ev := range collected {
		info, ok := ev.Data.(PodInfo)
		if ok && info.Name == "pod-a" {
			foundA = true
		}
	}
	if !foundA {
		t.Error("expected event for pod-a in ns-a")
	}

	// Reset events and watch ns-b
	mu.Lock()
	*events = nil
	mu.Unlock()

	w.Start(ctx, "ns-b")
	defer w.Stop()

	collected = waitForEvents(t, events, mu, 1)

	foundB := false
	for _, ev := range collected {
		info, ok := ev.Data.(PodInfo)
		if ok && info.Name == "pod-b" {
			foundB = true
		}
	}
	if !foundB {
		t.Error("expected event for pod-b in ns-b after restarting watcher")
	}
}

func TestWatcher_EmitsNodeAddedEventsOnStart(t *testing.T) {
	node := &corev1.Node{
		ObjectMeta: metav1.ObjectMeta{
			Name:   "test-node",
			Labels: map[string]string{"node-role.kubernetes.io/worker": ""},
		},
		Status: corev1.NodeStatus{
			Conditions: []corev1.NodeCondition{
				{Type: corev1.NodeReady, Status: corev1.ConditionTrue},
			},
			NodeInfo: corev1.NodeSystemInfo{KubeletVersion: "v1.29.0"},
		},
	}

	client := fake.NewClientset(node)
	emit, events, mu := collectNamedEvents()
	w := NewWatcher(client, emit)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	w.Start(ctx, "default")
	defer w.Stop()

	collected := waitForNamedEvents(t, events, mu, "nodes:changed", 1)

	found := false
	for _, ev := range collected {
		if ev.Type == "ADDED" {
			info, ok := ev.Data.(NodeInfo)
			if ok && info.Name == "test-node" && info.Status == "Ready" {
				found = true
				break
			}
		}
	}
	if !found {
		t.Error("expected ADDED event for test-node")
	}
}

func TestWatcher_EmitsNodeModifiedOnUpdate(t *testing.T) {
	node := &corev1.Node{
		ObjectMeta: metav1.ObjectMeta{
			Name: "update-node",
		},
		Status: corev1.NodeStatus{
			Conditions: []corev1.NodeCondition{
				{Type: corev1.NodeReady, Status: corev1.ConditionTrue},
			},
			NodeInfo: corev1.NodeSystemInfo{KubeletVersion: "v1.29.0"},
		},
	}

	client := fake.NewClientset(node)
	emit, events, mu := collectNamedEvents()
	w := NewWatcher(client, emit)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	w.Start(ctx, "default")
	defer w.Stop()

	waitForNamedEvents(t, events, mu, "nodes:changed", 1)

	// Update the node — mark it NotReady
	node.Status.Conditions = []corev1.NodeCondition{
		{Type: corev1.NodeReady, Status: corev1.ConditionFalse},
	}
	_, err := client.CoreV1().Nodes().UpdateStatus(ctx, node, metav1.UpdateOptions{})
	if err != nil {
		t.Fatalf("failed to update node: %v", err)
	}

	collected := waitForNamedEvents(t, events, mu, "nodes:changed", 2)

	found := false
	for _, ev := range collected {
		if ev.Type == "MODIFIED" {
			info, ok := ev.Data.(NodeInfo)
			if ok && info.Name == "update-node" && info.Status == "NotReady" {
				found = true
				break
			}
		}
	}
	if !found {
		t.Error("expected MODIFIED event for update-node with NotReady status")
	}
}

func TestWatcher_EmitsNodeDeletedOnRemove(t *testing.T) {
	node := &corev1.Node{
		ObjectMeta: metav1.ObjectMeta{
			Name: "delete-node",
		},
		Status: corev1.NodeStatus{
			Conditions: []corev1.NodeCondition{
				{Type: corev1.NodeReady, Status: corev1.ConditionTrue},
			},
			NodeInfo: corev1.NodeSystemInfo{KubeletVersion: "v1.29.0"},
		},
	}

	client := fake.NewClientset(node)
	emit, events, mu := collectNamedEvents()
	w := NewWatcher(client, emit)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	w.Start(ctx, "default")
	defer w.Stop()

	waitForNamedEvents(t, events, mu, "nodes:changed", 1)

	err := client.CoreV1().Nodes().Delete(ctx, "delete-node", metav1.DeleteOptions{})
	if err != nil {
		t.Fatalf("failed to delete node: %v", err)
	}

	collected := waitForNamedEvents(t, events, mu, "nodes:changed", 2)

	found := false
	for _, ev := range collected {
		if ev.Type == "DELETED" {
			info, ok := ev.Data.(NodeInfo)
			if ok && info.Name == "delete-node" {
				found = true
				break
			}
		}
	}
	if !found {
		t.Error("expected DELETED event for delete-node")
	}
}

func TestWatcher_EmitsDeploymentAddedEventsOnStart(t *testing.T) {
	replicas := int32(3)
	dep := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "test-deploy",
			Namespace: "default",
		},
		Spec: appsv1.DeploymentSpec{
			Replicas: &replicas,
			Selector: &metav1.LabelSelector{
				MatchLabels: map[string]string{"app": "test"},
			},
			Template: corev1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{Labels: map[string]string{"app": "test"}},
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{{Name: "app", Image: "app:v1"}},
				},
			},
		},
		Status: appsv1.DeploymentStatus{
			ReadyReplicas:     3,
			AvailableReplicas: 3,
			UpdatedReplicas:   3,
		},
	}

	client := fake.NewClientset(dep)
	emit, events, mu := collectNamedEvents()
	w := NewWatcher(client, emit)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	w.Start(ctx, "default")
	defer w.Stop()

	collected := waitForNamedEvents(t, events, mu, "deployments:changed", 1)

	found := false
	for _, ev := range collected {
		if ev.Type == "ADDED" {
			info, ok := ev.Data.(DeploymentInfo)
			if ok && info.Name == "test-deploy" && info.Ready == "3/3" {
				found = true
				break
			}
		}
	}
	if !found {
		t.Error("expected ADDED event for test-deploy")
	}
}

func TestWatcher_EmitsDeploymentModifiedOnUpdate(t *testing.T) {
	replicas := int32(3)
	dep := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "update-deploy",
			Namespace: "default",
		},
		Spec: appsv1.DeploymentSpec{
			Replicas: &replicas,
			Selector: &metav1.LabelSelector{
				MatchLabels: map[string]string{"app": "test"},
			},
			Template: corev1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{Labels: map[string]string{"app": "test"}},
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{{Name: "app", Image: "app:v1"}},
				},
			},
		},
		Status: appsv1.DeploymentStatus{
			ReadyReplicas:     2,
			AvailableReplicas: 2,
			UpdatedReplicas:   2,
		},
	}

	client := fake.NewClientset(dep)
	emit, events, mu := collectNamedEvents()
	w := NewWatcher(client, emit)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	w.Start(ctx, "default")
	defer w.Stop()

	waitForNamedEvents(t, events, mu, "deployments:changed", 1)

	// Update the deployment status
	dep.Status.ReadyReplicas = 3
	dep.Status.AvailableReplicas = 3
	dep.Status.UpdatedReplicas = 3
	_, err := client.AppsV1().Deployments("default").UpdateStatus(ctx, dep, metav1.UpdateOptions{})
	if err != nil {
		t.Fatalf("failed to update deployment: %v", err)
	}

	collected := waitForNamedEvents(t, events, mu, "deployments:changed", 2)

	found := false
	for _, ev := range collected {
		if ev.Type == "MODIFIED" {
			info, ok := ev.Data.(DeploymentInfo)
			if ok && info.Name == "update-deploy" && info.Ready == "3/3" {
				found = true
				break
			}
		}
	}
	if !found {
		t.Error("expected MODIFIED event for update-deploy with 3/3 ready")
	}
}

func TestWatcher_EmitsDeploymentDeletedOnRemove(t *testing.T) {
	replicas := int32(1)
	dep := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "delete-deploy",
			Namespace: "default",
		},
		Spec: appsv1.DeploymentSpec{
			Replicas: &replicas,
			Selector: &metav1.LabelSelector{
				MatchLabels: map[string]string{"app": "test"},
			},
			Template: corev1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{Labels: map[string]string{"app": "test"}},
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{{Name: "app", Image: "app:v1"}},
				},
			},
		},
	}

	client := fake.NewClientset(dep)
	emit, events, mu := collectNamedEvents()
	w := NewWatcher(client, emit)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	w.Start(ctx, "default")
	defer w.Stop()

	waitForNamedEvents(t, events, mu, "deployments:changed", 1)

	err := client.AppsV1().Deployments("default").Delete(ctx, "delete-deploy", metav1.DeleteOptions{})
	if err != nil {
		t.Fatalf("failed to delete deployment: %v", err)
	}

	collected := waitForNamedEvents(t, events, mu, "deployments:changed", 2)

	found := false
	for _, ev := range collected {
		if ev.Type == "DELETED" {
			info, ok := ev.Data.(DeploymentInfo)
			if ok && info.Name == "delete-deploy" {
				found = true
				break
			}
		}
	}
	if !found {
		t.Error("expected DELETED event for delete-deploy")
	}
}
