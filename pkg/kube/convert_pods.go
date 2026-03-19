package kube

import (
	"fmt"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// PodToPodInfo converts a Kubernetes Pod object to a PodInfo summary.
func PodToPodInfo(pod *corev1.Pod) PodInfo {
	readyCount := 0
	totalCount := len(pod.Spec.Containers)
	var totalRestarts int32
	var containers []ContainerInfo

	for _, cs := range pod.Status.ContainerStatuses {
		totalRestarts += cs.RestartCount
		state := "unknown"
		switch {
		case cs.State.Running != nil:
			state = "running"
		case cs.State.Waiting != nil:
			state = cs.State.Waiting.Reason
		case cs.State.Terminated != nil:
			state = cs.State.Terminated.Reason
		}
		if cs.Ready {
			readyCount++
		}
		containers = append(containers, ContainerInfo{
			Name:  cs.Name,
			Image: cs.Image,
			Ready: cs.Ready,
			State: state,
		})
	}

	age := ""
	if !pod.CreationTimestamp.IsZero() {
		duration := metav1.Now().Sub(pod.CreationTimestamp.Time)
		age = FormatDuration(duration)
	}

	return PodInfo{
		Name:       pod.Name,
		Namespace:  pod.Namespace,
		Status:     string(pod.Status.Phase),
		Ready:      fmt.Sprintf("%d/%d", readyCount, totalCount),
		Restarts:   totalRestarts,
		Age:        age,
		Labels:     pod.Labels,
		NodeName:   pod.Spec.NodeName,
		IP:         pod.Status.PodIP,
		Containers: containers,
	}
}

// convertPod is a ResourceConverter for Pod objects.
func convertPod(obj interface{}) (interface{}, bool) {
	pod, ok := obj.(*corev1.Pod)
	if !ok {
		return nil, false
	}
	return PodToPodInfo(pod), true
}
