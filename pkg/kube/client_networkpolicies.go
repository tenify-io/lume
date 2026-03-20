package kube

import (
	"context"
	"fmt"
	"sort"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// GetNetworkPolicies returns network policies, optionally filtered by namespace ("" for all namespaces).
func (c *Client) GetNetworkPolicies(ctx context.Context, namespace string) ([]NetworkPolicyInfo, error) {
	if namespace == "" {
		namespace = metav1.NamespaceAll
	}

	npList, err := c.clientset.NetworkingV1().NetworkPolicies(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list network policies: %w", err)
	}

	var policies []NetworkPolicyInfo
	for i := range npList.Items {
		policies = append(policies, NetworkPolicyToNetworkPolicyInfo(&npList.Items[i]))
	}

	sort.Slice(policies, func(i, j int) bool {
		if policies[i].Namespace != policies[j].Namespace {
			return policies[i].Namespace < policies[j].Namespace
		}
		return policies[i].Name < policies[j].Name
	})

	return policies, nil
}

// GetNetworkPolicyDetail returns detailed information about a single network policy.
func (c *Client) GetNetworkPolicyDetail(ctx context.Context, namespace, name string) (*NetworkPolicyDetail, error) {
	np, err := c.clientset.NetworkingV1().NetworkPolicies(namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get network policy %s/%s: %w", namespace, name, err)
	}

	age := ""
	if !np.CreationTimestamp.IsZero() {
		age = FormatDuration(metav1.Now().Sub(np.CreationTimestamp.Time))
	}

	var policyTypes []string
	for _, pt := range np.Spec.PolicyTypes {
		policyTypes = append(policyTypes, string(pt))
	}

	var ingressRules []NetworkPolicyIngressRule
	for _, rule := range np.Spec.Ingress {
		ingressRules = append(ingressRules, NetworkPolicyIngressRule{
			Ports: convertNetworkPolicyPorts(rule.Ports),
			From:  convertNetworkPolicyPeers(rule.From),
		})
	}

	var egressRules []NetworkPolicyEgressRule
	for _, rule := range np.Spec.Egress {
		egressRules = append(egressRules, NetworkPolicyEgressRule{
			Ports: convertNetworkPolicyPorts(rule.Ports),
			To:    convertNetworkPolicyPeers(rule.To),
		})
	}

	return &NetworkPolicyDetail{
		Name:              np.Name,
		Namespace:         np.Namespace,
		UID:               string(np.UID),
		CreationTimestamp: np.CreationTimestamp.Format("2006-01-02 15:04:05 MST"),
		Labels:            np.Labels,
		Annotations:       FilterAnnotations(np.Annotations),
		PodSelector:       np.Spec.PodSelector.MatchLabels,
		PolicyTypes:       policyTypes,
		IngressRules:      ingressRules,
		EgressRules:       egressRules,
		Age:               age,
	}, nil
}
