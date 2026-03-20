package kube

import (
	"fmt"
	"sort"
	"strings"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// ServiceToServiceInfo converts a Kubernetes Service object to a ServiceInfo summary.
func ServiceToServiceInfo(svc *corev1.Service) ServiceInfo {
	age := ""
	if !svc.CreationTimestamp.IsZero() {
		age = FormatDuration(metav1.Now().Sub(svc.CreationTimestamp.Time))
	}

	return ServiceInfo{
		Name:       svc.Name,
		Namespace:  svc.Namespace,
		Type:       string(svc.Spec.Type),
		ClusterIP:  svc.Spec.ClusterIP,
		ExternalIP: serviceExternalIP(svc),
		Ports:      formatServicePorts(svc.Spec.Ports),
		Age:        age,
		Selector:   formatServiceSelector(svc.Spec.Selector),
	}
}

// formatServicePorts formats service ports as a human-readable string.
// Examples: "80/TCP", "80:30001/TCP", "80/TCP, 443/TCP".
func formatServicePorts(ports []corev1.ServicePort) string {
	if len(ports) == 0 {
		return ""
	}

	parts := make([]string, 0, len(ports))
	for _, p := range ports {
		if p.NodePort != 0 {
			parts = append(parts, fmt.Sprintf("%d:%d/%s", p.Port, p.NodePort, p.Protocol))
		} else {
			parts = append(parts, fmt.Sprintf("%d/%s", p.Port, p.Protocol))
		}
	}
	return strings.Join(parts, ", ")
}

// formatServiceSelector formats selector labels as a sorted comma-separated string.
func formatServiceSelector(selector map[string]string) string {
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

// serviceExternalIP returns the external IP for a service.
// For LoadBalancer services, it returns the first ingress IP or hostname.
// For services with ExternalIPs set, it returns those.
func serviceExternalIP(svc *corev1.Service) string {
	// Check spec.externalIPs first
	if len(svc.Spec.ExternalIPs) > 0 {
		return strings.Join(svc.Spec.ExternalIPs, ", ")
	}

	// Check LoadBalancer ingress
	if svc.Spec.Type == corev1.ServiceTypeLoadBalancer {
		var ips []string
		for _, ingress := range svc.Status.LoadBalancer.Ingress {
			if ingress.IP != "" {
				ips = append(ips, ingress.IP)
			} else if ingress.Hostname != "" {
				ips = append(ips, ingress.Hostname)
			}
		}
		if len(ips) > 0 {
			return strings.Join(ips, ", ")
		}
	}

	return ""
}

// convertService is a ResourceConverter for Service objects.
func convertService(obj any) (any, bool) {
	svc, ok := obj.(*corev1.Service)
	if !ok {
		return nil, false
	}
	return ServiceToServiceInfo(svc), true
}
