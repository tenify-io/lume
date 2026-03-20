package kube

import (
	"fmt"
	"strings"

	networkingv1 "k8s.io/api/networking/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// IngressToIngressInfo converts a Kubernetes Ingress object to an IngressInfo summary.
func IngressToIngressInfo(ing *networkingv1.Ingress) IngressInfo {
	age := ""
	if !ing.CreationTimestamp.IsZero() {
		age = FormatDuration(metav1.Now().Sub(ing.CreationTimestamp.Time))
	}

	return IngressInfo{
		Name:      ing.Name,
		Namespace: ing.Namespace,
		Class:     ingressClassName(ing),
		Hosts:     ingressHosts(ing),
		Address:   ingressAddress(ing),
		Ports:     ingressPorts(ing),
		Age:       age,
	}
}

// ingressClassName returns the ingress class name from the spec or empty string.
func ingressClassName(ing *networkingv1.Ingress) string {
	if ing.Spec.IngressClassName != nil {
		return *ing.Spec.IngressClassName
	}
	return ""
}

// ingressHosts collects unique hosts from all rules.
func ingressHosts(ing *networkingv1.Ingress) string {
	seen := make(map[string]bool)
	var hosts []string
	for _, rule := range ing.Spec.Rules {
		h := rule.Host
		if h == "" {
			h = "*"
		}
		if !seen[h] {
			seen[h] = true
			hosts = append(hosts, h)
		}
	}
	return strings.Join(hosts, ", ")
}

// ingressAddress returns the first load balancer IP or hostname from the ingress status.
func ingressAddress(ing *networkingv1.Ingress) string {
	for _, lb := range ing.Status.LoadBalancer.Ingress {
		if lb.IP != "" {
			return lb.IP
		}
		if lb.Hostname != "" {
			return lb.Hostname
		}
	}
	return ""
}

// ingressPorts returns "80" if no TLS, "80, 443" if TLS is configured.
func ingressPorts(ing *networkingv1.Ingress) string {
	if len(ing.Spec.TLS) > 0 {
		return "80, 443"
	}
	return "80"
}

// ingressDefaultBackend formats the default backend as "service:port" or empty string.
func ingressDefaultBackend(ing *networkingv1.Ingress) string {
	if ing.Spec.DefaultBackend == nil || ing.Spec.DefaultBackend.Service == nil {
		return ""
	}
	svc := ing.Spec.DefaultBackend.Service
	return formatIngressBackend(svc)
}

// formatIngressBackend formats an IngressServiceBackend as "service:port".
func formatIngressBackend(svc *networkingv1.IngressServiceBackend) string {
	port := ""
	if svc.Port.Name != "" {
		port = svc.Port.Name
	} else if svc.Port.Number != 0 {
		port = fmt.Sprintf("%d", svc.Port.Number)
	}
	if port == "" {
		return svc.Name
	}
	return fmt.Sprintf("%s:%s", svc.Name, port)
}

// convertIngress is a ResourceConverter for Ingress objects.
func convertIngress(obj any) (any, bool) {
	ing, ok := obj.(*networkingv1.Ingress)
	if !ok {
		return nil, false
	}
	return IngressToIngressInfo(ing), true
}
