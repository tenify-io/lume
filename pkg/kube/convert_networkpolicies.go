package kube

import (
	"fmt"
	"sort"
	"strings"

	networkingv1 "k8s.io/api/networking/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// NetworkPolicyToNetworkPolicyInfo converts a Kubernetes NetworkPolicy object to a NetworkPolicyInfo summary.
func NetworkPolicyToNetworkPolicyInfo(np *networkingv1.NetworkPolicy) NetworkPolicyInfo {
	age := ""
	if !np.CreationTimestamp.IsZero() {
		age = FormatDuration(metav1.Now().Sub(np.CreationTimestamp.Time))
	}

	var policyTypes []string
	for _, pt := range np.Spec.PolicyTypes {
		policyTypes = append(policyTypes, string(pt))
	}

	return NetworkPolicyInfo{
		Name:        np.Name,
		Namespace:   np.Namespace,
		PodSelector: formatLabelSelector(np.Spec.PodSelector.MatchLabels),
		PolicyTypes: policyTypes,
		Age:         age,
	}
}

// formatLabelSelector formats selector labels as a sorted comma-separated "key=value" string.
func formatLabelSelector(selector map[string]string) string {
	if len(selector) == 0 {
		return ""
	}

	keys := make([]string, 0, len(selector))
	for k := range selector {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	parts := make([]string, 0, len(keys))
	for _, k := range keys {
		parts = append(parts, fmt.Sprintf("%s=%s", k, selector[k]))
	}
	return strings.Join(parts, ", ")
}

// formatIPBlock formats a NetworkPolicyIPBlock as a human-readable string.
func formatIPBlock(ipBlock *networkingv1.IPBlock) string {
	if ipBlock == nil {
		return ""
	}
	if len(ipBlock.Except) == 0 {
		return ipBlock.CIDR
	}
	return fmt.Sprintf("%s except [%s]", ipBlock.CIDR, strings.Join(ipBlock.Except, ", "))
}

// convertNetworkPolicyPorts converts Kubernetes NetworkPolicyPort slice to app types.
func convertNetworkPolicyPorts(ports []networkingv1.NetworkPolicyPort) []NetworkPolicyPort {
	var result []NetworkPolicyPort
	for _, p := range ports {
		protocol := "TCP"
		if p.Protocol != nil {
			protocol = string(*p.Protocol)
		}
		port := ""
		if p.Port != nil {
			port = p.Port.String()
		}
		result = append(result, NetworkPolicyPort{
			Protocol: protocol,
			Port:     port,
		})
	}
	return result
}

// convertNetworkPolicyPeers converts Kubernetes NetworkPolicyPeer slice to app types.
func convertNetworkPolicyPeers(peers []networkingv1.NetworkPolicyPeer) []NetworkPolicyPeer {
	var result []NetworkPolicyPeer
	for _, p := range peers {
		peer := NetworkPolicyPeer{}
		if p.PodSelector != nil {
			peer.PodSelector = p.PodSelector.MatchLabels
		}
		if p.NamespaceSelector != nil {
			peer.NamespaceSelector = p.NamespaceSelector.MatchLabels
		}
		if p.IPBlock != nil {
			peer.IPBlock = formatIPBlock(p.IPBlock)
		}
		result = append(result, peer)
	}
	return result
}

// convertNetworkPolicy is a ResourceConverter for NetworkPolicy objects.
func convertNetworkPolicy(obj any) (any, bool) {
	np, ok := obj.(*networkingv1.NetworkPolicy)
	if !ok {
		return nil, false
	}
	return NetworkPolicyToNetworkPolicyInfo(np), true
}
