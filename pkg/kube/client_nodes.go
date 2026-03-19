package kube

import (
	"context"
	"fmt"
	"sort"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/fields"
)

// GetNodes returns all nodes in the cluster.
func (c *Client) GetNodes(ctx context.Context) ([]NodeInfo, error) {
	nodeList, err := c.clientset.CoreV1().Nodes().List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list nodes: %w", err)
	}

	var nodes []NodeInfo
	for i := range nodeList.Items {
		nodes = append(nodes, NodeToNodeInfo(&nodeList.Items[i]))
	}

	sort.Slice(nodes, func(i, j int) bool {
		return nodes[i].Name < nodes[j].Name
	})

	return nodes, nil
}

// GetNodeDetail returns detailed information about a single node.
func (c *Client) GetNodeDetail(ctx context.Context, name string) (*NodeDetail, error) {
	node, err := c.clientset.CoreV1().Nodes().Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get node %s: %w", name, err)
	}

	age := ""
	if !node.CreationTimestamp.IsZero() {
		age = FormatDuration(metav1.Now().Sub(node.CreationTimestamp.Time))
	}

	var addresses []NodeAddress
	for _, addr := range node.Status.Addresses {
		addresses = append(addresses, NodeAddress{
			Type:    string(addr.Type),
			Address: addr.Address,
		})
	}

	var conditions []NodeCondition
	for _, c := range node.Status.Conditions {
		transition := ""
		if !c.LastTransitionTime.IsZero() {
			transition = c.LastTransitionTime.Format("2006-01-02 15:04:05 MST")
		}
		conditions = append(conditions, NodeCondition{
			Type:               string(c.Type),
			Status:             string(c.Status),
			LastTransitionTime: transition,
			Reason:             c.Reason,
			Message:            c.Message,
		})
	}

	extractResources := func(rl corev1.ResourceList) NodeResources {
		res := NodeResources{}
		if cpu, ok := rl[corev1.ResourceCPU]; ok {
			res.CPU = cpu.String()
		}
		if mem, ok := rl[corev1.ResourceMemory]; ok {
			res.Memory = mem.String()
		}
		if pods, ok := rl[corev1.ResourcePods]; ok {
			res.Pods = pods.String()
		}
		if storage, ok := rl[corev1.ResourceEphemeralStorage]; ok {
			res.EphemeralStorage = storage.String()
		}
		return res
	}

	var taints []NodeTaint
	for _, t := range node.Spec.Taints {
		taints = append(taints, NodeTaint{
			Key:    t.Key,
			Value:  t.Value,
			Effect: string(t.Effect),
		})
	}

	var images []NodeImage
	for _, img := range node.Status.Images {
		images = append(images, NodeImage{
			Names:     img.Names,
			SizeBytes: img.SizeBytes,
		})
	}

	ni := node.Status.NodeInfo

	return &NodeDetail{
		Name:              node.Name,
		UID:               string(node.UID),
		CreationTimestamp: node.CreationTimestamp.Format("2006-01-02 15:04:05 MST"),
		Labels:            node.Labels,
		Annotations:       node.Annotations,
		Status:            nodeStatus(node),
		Roles:             nodeRoles(node),
		Age:               age,
		Addresses:         addresses,
		Conditions:        conditions,
		Capacity:          extractResources(node.Status.Capacity),
		Allocatable:       extractResources(node.Status.Allocatable),
		SystemInfo: NodeSystemInfo{
			MachineID:               ni.MachineID,
			KernelVersion:           ni.KernelVersion,
			OSImage:                 ni.OSImage,
			ContainerRuntimeVersion: ni.ContainerRuntimeVersion,
			KubeletVersion:          ni.KubeletVersion,
			OperatingSystem:         ni.OperatingSystem,
			Architecture:            ni.Architecture,
		},
		Taints:  taints,
		PodCIDR: node.Spec.PodCIDR,
		Images:  images,
	}, nil
}

// GetNodeEvents returns events related to a specific node.
func (c *Client) GetNodeEvents(ctx context.Context, name string) ([]EventInfo, error) {
	fieldSelector := fields.AndSelectors(
		fields.OneTermEqualSelector("involvedObject.name", name),
		fields.OneTermEqualSelector("involvedObject.kind", "Node"),
	).String()

	eventList, err := c.clientset.CoreV1().Events("").List(ctx, metav1.ListOptions{
		FieldSelector: fieldSelector,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to list events for node %s: %w", name, err)
	}

	var events []EventInfo
	for _, e := range eventList.Items {
		firstSeen := ""
		if !e.FirstTimestamp.IsZero() {
			firstSeen = e.FirstTimestamp.Format("2006-01-02 15:04:05 MST")
		}
		lastSeen := ""
		age := ""
		if !e.LastTimestamp.IsZero() {
			lastSeen = e.LastTimestamp.Format("2006-01-02 15:04:05 MST")
			age = FormatDuration(metav1.Now().Sub(e.LastTimestamp.Time))
		}

		source := e.Source.Component
		if e.Source.Host != "" {
			source += "/" + e.Source.Host
		}

		events = append(events, EventInfo{
			Type:           e.Type,
			Reason:         e.Reason,
			Message:        e.Message,
			Source:         source,
			Count:          e.Count,
			FirstTimestamp: firstSeen,
			LastTimestamp:  lastSeen,
			Age:            age,
		})
	}

	sort.Slice(events, func(i, j int) bool {
		return events[i].LastTimestamp > events[j].LastTimestamp
	})

	return events, nil
}
