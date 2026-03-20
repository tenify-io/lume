package kube

import (
	"context"
	"fmt"
	"sort"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// GetPods returns pods, optionally filtered by namespace ("" for all namespaces).
func (c *Client) GetPods(ctx context.Context, namespace string) ([]PodInfo, error) {
	if namespace == "" {
		namespace = metav1.NamespaceAll
	}

	podList, err := c.clientset.CoreV1().Pods(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list pods: %w", err)
	}

	var pods []PodInfo
	for i := range podList.Items {
		pods = append(pods, PodToPodInfo(&podList.Items[i]))
	}

	sort.Slice(pods, func(i, j int) bool {
		if pods[i].Namespace != pods[j].Namespace {
			return pods[i].Namespace < pods[j].Namespace
		}
		return pods[i].Name < pods[j].Name
	})

	return pods, nil
}

// GetPodDetail returns detailed information about a single pod.
func (c *Client) GetPodDetail(ctx context.Context, namespace, name string) (*PodDetail, error) {
	pod, err := c.clientset.CoreV1().Pods(namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get pod %s/%s: %w", namespace, name, err)
	}

	type containerStatus struct {
		ready        bool
		state        string
		stateDetail  string
		restartCount int32
	}

	parseStatuses := func(statuses []corev1.ContainerStatus) map[string]containerStatus {
		m := make(map[string]containerStatus)
		for _, cs := range statuses {
			state := "unknown"
			stateDetail := ""
			switch {
			case cs.State.Running != nil:
				state = "running"
				stateDetail = "Started " + FormatDuration(metav1.Now().Sub(cs.State.Running.StartedAt.Time)) + " ago"
			case cs.State.Waiting != nil:
				state = cs.State.Waiting.Reason
				stateDetail = cs.State.Waiting.Message
			case cs.State.Terminated != nil:
				state = cs.State.Terminated.Reason
				stateDetail = cs.State.Terminated.Message
			}
			m[cs.Name] = containerStatus{cs.Ready, state, stateDetail, cs.RestartCount}
		}
		return m
	}

	buildDetails := func(specs []corev1.Container, statuses map[string]containerStatus) []ContainerDetail {
		var details []ContainerDetail
		for _, spec := range specs {
			var ports []ContainerPort
			for _, p := range spec.Ports {
				ports = append(ports, ContainerPort{
					Name:          p.Name,
					ContainerPort: p.ContainerPort,
					Protocol:      string(p.Protocol),
				})
			}

			res := ContainerResource{}
			if req := spec.Resources.Requests; req != nil {
				if cpu, ok := req["cpu"]; ok {
					res.CPURequest = cpu.String()
				}
				if mem, ok := req["memory"]; ok {
					res.MemoryRequest = mem.String()
				}
			}
			if lim := spec.Resources.Limits; lim != nil {
				if cpu, ok := lim["cpu"]; ok {
					res.CPULimit = cpu.String()
				}
				if mem, ok := lim["memory"]; ok {
					res.MemoryLimit = mem.String()
				}
			}

			var mounts []VolumeMount
			for _, vm := range spec.VolumeMounts {
				mounts = append(mounts, VolumeMount{
					Name:      vm.Name,
					MountPath: vm.MountPath,
					ReadOnly:  vm.ReadOnly,
				})
			}

			s := statuses[spec.Name]
			details = append(details, ContainerDetail{
				Name:         spec.Name,
				Image:        spec.Image,
				Ready:        s.ready,
				State:        s.state,
				StateDetail:  s.stateDetail,
				RestartCount: s.restartCount,
				Ports:        ports,
				Resources:    res,
				VolumeMounts: mounts,
			})
		}
		return details
	}

	containerStatuses := parseStatuses(pod.Status.ContainerStatuses)
	initContainerStatuses := parseStatuses(pod.Status.InitContainerStatuses)

	readyCount := 0
	totalCount := len(pod.Spec.Containers)
	var totalRestarts int32
	for _, cs := range pod.Status.ContainerStatuses {
		if cs.Ready {
			readyCount++
		}
		totalRestarts += cs.RestartCount
	}

	containers := buildDetails(pod.Spec.Containers, containerStatuses)
	initContainers := buildDetails(pod.Spec.InitContainers, initContainerStatuses)

	age := ""
	if !pod.CreationTimestamp.IsZero() {
		age = FormatDuration(metav1.Now().Sub(pod.CreationTimestamp.Time))
	}

	var conditions []PodCondition
	for _, c := range pod.Status.Conditions {
		transition := ""
		if !c.LastTransitionTime.IsZero() {
			transition = c.LastTransitionTime.Format("2006-01-02 15:04:05 MST")
		}
		conditions = append(conditions, PodCondition{
			Type:               string(c.Type),
			Status:             string(c.Status),
			LastTransitionTime: transition,
			Reason:             c.Reason,
			Message:            c.Message,
		})
	}

	startTime := ""
	if pod.Status.StartTime != nil {
		startTime = pod.Status.StartTime.Format("2006-01-02 15:04:05 MST")
	}

	var volumes []Volume
	for _, v := range pod.Spec.Volumes {
		volType := "Unknown"
		source := ""
		switch {
		case v.ConfigMap != nil:
			volType = "ConfigMap"
			source = v.ConfigMap.Name
		case v.Secret != nil:
			volType = "Secret"
			source = v.Secret.SecretName
		case v.PersistentVolumeClaim != nil:
			volType = "PersistentVolumeClaim"
			source = v.PersistentVolumeClaim.ClaimName
		case v.EmptyDir != nil:
			volType = "EmptyDir"
		case v.HostPath != nil:
			volType = "HostPath"
			source = v.HostPath.Path
		case v.Projected != nil:
			volType = "Projected"
		case v.DownwardAPI != nil:
			volType = "DownwardAPI"
		case v.CSI != nil:
			volType = "CSI"
			source = v.CSI.Driver
		case v.NFS != nil:
			volType = "NFS"
			source = v.NFS.Server + ":" + v.NFS.Path
		}
		volumes = append(volumes, Volume{
			Name:   v.Name,
			Type:   volType,
			Source: source,
		})
	}

	return &PodDetail{
		Name:               pod.Name,
		Namespace:          pod.Namespace,
		UID:                string(pod.UID),
		CreationTimestamp:  pod.CreationTimestamp.Format("2006-01-02 15:04:05 MST"),
		Labels:             pod.Labels,
		Annotations:        FilterAnnotations(pod.Annotations),
		Status:             string(pod.Status.Phase),
		Ready:              fmt.Sprintf("%d/%d", readyCount, totalCount),
		Restarts:           totalRestarts,
		Age:                age,
		NodeName:           pod.Spec.NodeName,
		IP:                 pod.Status.PodIP,
		HostIP:             pod.Status.HostIP,
		StartTime:          startTime,
		QOSClass:           string(pod.Status.QOSClass),
		ServiceAccountName: pod.Spec.ServiceAccountName,
		RestartPolicy:      string(pod.Spec.RestartPolicy),
		Conditions:         conditions,
		InitContainers:     initContainers,
		Containers:         containers,
		Volumes:            volumes,
	}, nil
}

// GetPodEvents returns events related to a specific pod.
func (c *Client) GetPodEvents(ctx context.Context, namespace, name string) ([]EventInfo, error) {
	return c.ListEvents(ctx, namespace, name, "Pod")
}
