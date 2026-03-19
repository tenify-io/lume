package kube

import (
	"sort"
	"strings"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// NodeToNodeInfo converts a Kubernetes Node object to a NodeInfo summary.
func NodeToNodeInfo(node *corev1.Node) NodeInfo {
	age := ""
	if !node.CreationTimestamp.IsZero() {
		duration := metav1.Now().Sub(node.CreationTimestamp.Time)
		age = FormatDuration(duration)
	}

	var internalIP, externalIP string
	for _, addr := range node.Status.Addresses {
		switch addr.Type {
		case corev1.NodeInternalIP:
			internalIP = addr.Address
		case corev1.NodeExternalIP:
			externalIP = addr.Address
		}
	}

	return NodeInfo{
		Name:             node.Name,
		Status:           nodeStatus(node),
		Roles:            nodeRoles(node),
		Age:              age,
		KubeletVersion:   node.Status.NodeInfo.KubeletVersion,
		InternalIP:       internalIP,
		ExternalIP:       externalIP,
		OSImage:          node.Status.NodeInfo.OSImage,
		ContainerRuntime: node.Status.NodeInfo.ContainerRuntimeVersion,
		Labels:           node.Labels,
	}
}

// nodeStatus returns the status of a node based on its conditions.
func nodeStatus(node *corev1.Node) string {
	for _, c := range node.Status.Conditions {
		if c.Type == corev1.NodeReady {
			if c.Status == corev1.ConditionTrue {
				return "Ready"
			}
			return "NotReady"
		}
	}
	return "Unknown"
}

// nodeRoles extracts roles from node labels (node-role.kubernetes.io/<role>).
func nodeRoles(node *corev1.Node) string {
	const prefix = "node-role.kubernetes.io/"
	var roles []string
	for key := range node.Labels {
		if strings.HasPrefix(key, prefix) {
			roles = append(roles, strings.TrimPrefix(key, prefix))
		}
	}
	sort.Strings(roles)
	if len(roles) == 0 {
		return "<none>"
	}
	return strings.Join(roles, ",")
}

// convertNode is a ResourceConverter for Node objects.
func convertNode(obj interface{}) (interface{}, bool) {
	node, ok := obj.(*corev1.Node)
	if !ok {
		return nil, false
	}
	return NodeToNodeInfo(node), true
}
