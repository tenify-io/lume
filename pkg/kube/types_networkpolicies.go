package kube

// NetworkPolicyInfo represents a network policy summary for list views.
type NetworkPolicyInfo struct {
	Name        string   `json:"name"`
	Namespace   string   `json:"namespace"`
	PodSelector string   `json:"podSelector"`
	PolicyTypes []string `json:"policyTypes"`
	Age         string   `json:"age"`
}

// NetworkPolicyPort represents a port in a network policy rule.
type NetworkPolicyPort struct {
	Protocol string `json:"protocol"`
	Port     string `json:"port"`
}

// NetworkPolicyPeer represents a peer in a network policy rule.
type NetworkPolicyPeer struct {
	PodSelector       map[string]string `json:"podSelector"`
	NamespaceSelector map[string]string `json:"namespaceSelector"`
	IPBlock           string            `json:"ipBlock"`
}

// NetworkPolicyIngressRule represents an ingress rule in a network policy.
type NetworkPolicyIngressRule struct {
	Ports []NetworkPolicyPort `json:"ports"`
	From  []NetworkPolicyPeer `json:"from"`
}

// NetworkPolicyEgressRule represents an egress rule in a network policy.
type NetworkPolicyEgressRule struct {
	Ports []NetworkPolicyPort `json:"ports"`
	To    []NetworkPolicyPeer `json:"to"`
}

// NetworkPolicyDetail provides comprehensive information about a single network policy.
type NetworkPolicyDetail struct {
	Name              string                     `json:"name"`
	Namespace         string                     `json:"namespace"`
	UID               string                     `json:"uid"`
	CreationTimestamp string                     `json:"creationTimestamp"`
	Labels            map[string]string          `json:"labels"`
	Annotations       map[string]string          `json:"annotations"`
	PodSelector       map[string]string          `json:"podSelector"`
	PolicyTypes       []string                   `json:"policyTypes"`
	IngressRules      []NetworkPolicyIngressRule `json:"ingressRules"`
	EgressRules       []NetworkPolicyEgressRule  `json:"egressRules"`
	Age               string                     `json:"age"`
}
