package kube

import (
	"testing"
	"time"

	corev1 "k8s.io/api/core/v1"
	networkingv1 "k8s.io/api/networking/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/intstr"
)

func ptrProtocol(p corev1.Protocol) *corev1.Protocol {
	return &p
}

func TestNetworkPolicyToNetworkPolicyInfo_Basic(t *testing.T) {
	np := &networkingv1.NetworkPolicy{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "deny-all",
			Namespace:         "default",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-2 * time.Hour)),
		},
		Spec: networkingv1.NetworkPolicySpec{
			PodSelector: metav1.LabelSelector{
				MatchLabels: map[string]string{"app": "web"},
			},
			PolicyTypes: []networkingv1.PolicyType{
				networkingv1.PolicyTypeIngress,
				networkingv1.PolicyTypeEgress,
			},
		},
	}

	info := NetworkPolicyToNetworkPolicyInfo(np)

	if info.Name != "deny-all" {
		t.Errorf("Name = %q, want %q", info.Name, "deny-all")
	}
	if info.Namespace != "default" {
		t.Errorf("Namespace = %q, want %q", info.Namespace, "default")
	}
	if info.PodSelector != "app=web" {
		t.Errorf("PodSelector = %q, want %q", info.PodSelector, "app=web")
	}
	if len(info.PolicyTypes) != 2 {
		t.Fatalf("PolicyTypes length = %d, want 2", len(info.PolicyTypes))
	}
	if info.PolicyTypes[0] != "Ingress" {
		t.Errorf("PolicyTypes[0] = %q, want %q", info.PolicyTypes[0], "Ingress")
	}
	if info.PolicyTypes[1] != "Egress" {
		t.Errorf("PolicyTypes[1] = %q, want %q", info.PolicyTypes[1], "Egress")
	}
	if info.Age != "2h" {
		t.Errorf("Age = %q, want %q", info.Age, "2h")
	}
}

func TestNetworkPolicyToNetworkPolicyInfo_EmptySelector(t *testing.T) {
	np := &networkingv1.NetworkPolicy{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "allow-all",
			Namespace: "production",
		},
		Spec: networkingv1.NetworkPolicySpec{
			PodSelector: metav1.LabelSelector{},
			PolicyTypes: []networkingv1.PolicyType{
				networkingv1.PolicyTypeIngress,
			},
		},
	}

	info := NetworkPolicyToNetworkPolicyInfo(np)

	if info.PodSelector != "" {
		t.Errorf("PodSelector = %q, want empty", info.PodSelector)
	}
}

func TestNetworkPolicyToNetworkPolicyInfo_MultipleLabels(t *testing.T) {
	np := &networkingv1.NetworkPolicy{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "multi-label",
			Namespace: "default",
		},
		Spec: networkingv1.NetworkPolicySpec{
			PodSelector: metav1.LabelSelector{
				MatchLabels: map[string]string{
					"env":  "prod",
					"app":  "api",
					"tier": "backend",
				},
			},
		},
	}

	info := NetworkPolicyToNetworkPolicyInfo(np)

	// Labels should be sorted alphabetically
	expected := "app=api, env=prod, tier=backend"
	if info.PodSelector != expected {
		t.Errorf("PodSelector = %q, want %q", info.PodSelector, expected)
	}
}

func TestNetworkPolicyToNetworkPolicyInfo_ZeroTimestamp(t *testing.T) {
	np := &networkingv1.NetworkPolicy{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "no-time",
			Namespace: "default",
		},
		Spec: networkingv1.NetworkPolicySpec{
			PodSelector: metav1.LabelSelector{},
		},
	}

	info := NetworkPolicyToNetworkPolicyInfo(np)

	if info.Age != "" {
		t.Errorf("Age = %q, want empty for zero timestamp", info.Age)
	}
}

func TestFormatLabelSelector(t *testing.T) {
	tests := []struct {
		name     string
		selector map[string]string
		want     string
	}{
		{
			"nil selector",
			nil,
			"",
		},
		{
			"empty selector",
			map[string]string{},
			"",
		},
		{
			"single label",
			map[string]string{"app": "web"},
			"app=web",
		},
		{
			"multiple labels sorted",
			map[string]string{"env": "prod", "app": "api", "tier": "backend"},
			"app=api, env=prod, tier=backend",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := formatLabelSelector(tt.selector)
			if got != tt.want {
				t.Errorf("formatLabelSelector() = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestFormatIPBlock(t *testing.T) {
	tests := []struct {
		name    string
		ipBlock *networkingv1.IPBlock
		want    string
	}{
		{
			"nil ipBlock",
			nil,
			"",
		},
		{
			"CIDR only",
			&networkingv1.IPBlock{CIDR: "10.0.0.0/24"},
			"10.0.0.0/24",
		},
		{
			"CIDR with except",
			&networkingv1.IPBlock{
				CIDR:   "10.0.0.0/24",
				Except: []string{"10.0.0.1/32"},
			},
			"10.0.0.0/24 except [10.0.0.1/32]",
		},
		{
			"CIDR with multiple except",
			&networkingv1.IPBlock{
				CIDR:   "0.0.0.0/0",
				Except: []string{"10.0.0.0/8", "172.16.0.0/12"},
			},
			"0.0.0.0/0 except [10.0.0.0/8, 172.16.0.0/12]",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := formatIPBlock(tt.ipBlock)
			if got != tt.want {
				t.Errorf("formatIPBlock() = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestConvertNetworkPolicyPorts(t *testing.T) {
	port80 := intstr.FromInt32(80)
	port443 := intstr.FromInt32(443)
	portHTTP := intstr.FromString("http")

	tests := []struct {
		name  string
		ports []networkingv1.NetworkPolicyPort
		want  []NetworkPolicyPort
	}{
		{
			"nil ports",
			nil,
			nil,
		},
		{
			"single TCP port",
			[]networkingv1.NetworkPolicyPort{
				{Port: &port80},
			},
			[]NetworkPolicyPort{
				{Protocol: "TCP", Port: "80"},
			},
		},
		{
			"explicit UDP protocol",
			[]networkingv1.NetworkPolicyPort{
				{Protocol: ptrProtocol(corev1.ProtocolUDP), Port: &port443},
			},
			[]NetworkPolicyPort{
				{Protocol: "UDP", Port: "443"},
			},
		},
		{
			"named port",
			[]networkingv1.NetworkPolicyPort{
				{Port: &portHTTP},
			},
			[]NetworkPolicyPort{
				{Protocol: "TCP", Port: "http"},
			},
		},
		{
			"port with no port value",
			[]networkingv1.NetworkPolicyPort{
				{Protocol: ptrProtocol(corev1.ProtocolTCP)},
			},
			[]NetworkPolicyPort{
				{Protocol: "TCP", Port: ""},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := convertNetworkPolicyPorts(tt.ports)
			if len(got) != len(tt.want) {
				t.Fatalf("length = %d, want %d", len(got), len(tt.want))
			}
			for i := range got {
				if got[i].Protocol != tt.want[i].Protocol {
					t.Errorf("[%d].Protocol = %q, want %q", i, got[i].Protocol, tt.want[i].Protocol)
				}
				if got[i].Port != tt.want[i].Port {
					t.Errorf("[%d].Port = %q, want %q", i, got[i].Port, tt.want[i].Port)
				}
			}
		})
	}
}

func TestConvertNetworkPolicyPeers(t *testing.T) {
	peers := []networkingv1.NetworkPolicyPeer{
		{
			PodSelector: &metav1.LabelSelector{
				MatchLabels: map[string]string{"app": "frontend"},
			},
		},
		{
			NamespaceSelector: &metav1.LabelSelector{
				MatchLabels: map[string]string{"team": "platform"},
			},
		},
		{
			IPBlock: &networkingv1.IPBlock{
				CIDR:   "10.0.0.0/24",
				Except: []string{"10.0.0.1/32"},
			},
		},
	}

	result := convertNetworkPolicyPeers(peers)

	if len(result) != 3 {
		t.Fatalf("length = %d, want 3", len(result))
	}

	// Pod selector peer
	if result[0].PodSelector["app"] != "frontend" {
		t.Errorf("PodSelector = %v, want app=frontend", result[0].PodSelector)
	}
	if result[0].NamespaceSelector != nil {
		t.Error("expected nil NamespaceSelector for peer 0")
	}

	// Namespace selector peer
	if result[1].NamespaceSelector["team"] != "platform" {
		t.Errorf("NamespaceSelector = %v, want team=platform", result[1].NamespaceSelector)
	}
	if result[1].PodSelector != nil {
		t.Error("expected nil PodSelector for peer 1")
	}

	// IP block peer
	if result[2].IPBlock != "10.0.0.0/24 except [10.0.0.1/32]" {
		t.Errorf("IPBlock = %q, want %q", result[2].IPBlock, "10.0.0.0/24 except [10.0.0.1/32]")
	}
}

func TestConvertNetworkPolicy(t *testing.T) {
	np := &networkingv1.NetworkPolicy{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "test-policy",
			Namespace: "default",
		},
		Spec: networkingv1.NetworkPolicySpec{
			PodSelector: metav1.LabelSelector{
				MatchLabels: map[string]string{"app": "web"},
			},
			PolicyTypes: []networkingv1.PolicyType{
				networkingv1.PolicyTypeIngress,
			},
		},
	}

	result, ok := convertNetworkPolicy(np)
	if !ok {
		t.Fatal("convertNetworkPolicy returned false")
	}
	info, ok := result.(NetworkPolicyInfo)
	if !ok {
		t.Fatal("result is not NetworkPolicyInfo")
	}
	if info.Name != "test-policy" {
		t.Errorf("Name = %q, want %q", info.Name, "test-policy")
	}
}

func TestConvertNetworkPolicy_WrongType(t *testing.T) {
	_, ok := convertNetworkPolicy("not a network policy")
	if ok {
		t.Error("expected convertNetworkPolicy to return false for wrong type")
	}
}
