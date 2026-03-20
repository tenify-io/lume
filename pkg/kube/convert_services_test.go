package kube

import (
	"testing"
	"time"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/intstr"
)

func TestServiceToServiceInfo_ClusterIP(t *testing.T) {
	svc := &corev1.Service{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "my-service",
			Namespace:         "default",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-2 * time.Hour)),
		},
		Spec: corev1.ServiceSpec{
			Type:      corev1.ServiceTypeClusterIP,
			ClusterIP: "10.96.0.1",
			Ports: []corev1.ServicePort{
				{Port: 80, Protocol: corev1.ProtocolTCP},
			},
			Selector: map[string]string{"app": "web"},
		},
	}

	info := ServiceToServiceInfo(svc)

	if info.Name != "my-service" {
		t.Errorf("Name = %q, want %q", info.Name, "my-service")
	}
	if info.Namespace != "default" {
		t.Errorf("Namespace = %q, want %q", info.Namespace, "default")
	}
	if info.Type != "ClusterIP" {
		t.Errorf("Type = %q, want %q", info.Type, "ClusterIP")
	}
	if info.ClusterIP != "10.96.0.1" {
		t.Errorf("ClusterIP = %q, want %q", info.ClusterIP, "10.96.0.1")
	}
	if info.Ports != "80/TCP" {
		t.Errorf("Ports = %q, want %q", info.Ports, "80/TCP")
	}
	if info.Selector != "app=web" {
		t.Errorf("Selector = %q, want %q", info.Selector, "app=web")
	}
	if info.Age != "2h" {
		t.Errorf("Age = %q, want %q", info.Age, "2h")
	}
	if info.ExternalIP != "" {
		t.Errorf("ExternalIP = %q, want empty", info.ExternalIP)
	}
}

func TestServiceToServiceInfo_NodePort(t *testing.T) {
	svc := &corev1.Service{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "nodeport-svc",
			Namespace:         "kube-system",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-30 * time.Minute)),
		},
		Spec: corev1.ServiceSpec{
			Type:      corev1.ServiceTypeNodePort,
			ClusterIP: "10.96.0.50",
			Ports: []corev1.ServicePort{
				{Port: 80, NodePort: 30080, Protocol: corev1.ProtocolTCP},
				{Port: 443, NodePort: 30443, Protocol: corev1.ProtocolTCP},
			},
			Selector: map[string]string{"app": "nginx", "tier": "frontend"},
		},
	}

	info := ServiceToServiceInfo(svc)

	if info.Type != "NodePort" {
		t.Errorf("Type = %q, want %q", info.Type, "NodePort")
	}
	if info.Ports != "80:30080/TCP, 443:30443/TCP" {
		t.Errorf("Ports = %q, want %q", info.Ports, "80:30080/TCP, 443:30443/TCP")
	}
	// Selector should be sorted by key
	if info.Selector != "app=nginx, tier=frontend" {
		t.Errorf("Selector = %q, want %q", info.Selector, "app=nginx, tier=frontend")
	}
}

func TestServiceToServiceInfo_LoadBalancer(t *testing.T) {
	svc := &corev1.Service{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "lb-svc",
			Namespace:         "production",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-24 * time.Hour)),
		},
		Spec: corev1.ServiceSpec{
			Type:      corev1.ServiceTypeLoadBalancer,
			ClusterIP: "10.96.1.100",
			Ports: []corev1.ServicePort{
				{Port: 443, Protocol: corev1.ProtocolTCP},
			},
			Selector: map[string]string{"app": "api"},
		},
		Status: corev1.ServiceStatus{
			LoadBalancer: corev1.LoadBalancerStatus{
				Ingress: []corev1.LoadBalancerIngress{
					{IP: "203.0.113.50"},
				},
			},
		},
	}

	info := ServiceToServiceInfo(svc)

	if info.Type != "LoadBalancer" {
		t.Errorf("Type = %q, want %q", info.Type, "LoadBalancer")
	}
	if info.ExternalIP != "203.0.113.50" {
		t.Errorf("ExternalIP = %q, want %q", info.ExternalIP, "203.0.113.50")
	}
}

func TestServiceToServiceInfo_LoadBalancerHostname(t *testing.T) {
	svc := &corev1.Service{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "aws-lb",
			Namespace: "default",
		},
		Spec: corev1.ServiceSpec{
			Type:      corev1.ServiceTypeLoadBalancer,
			ClusterIP: "10.96.1.200",
			Ports: []corev1.ServicePort{
				{Port: 80, Protocol: corev1.ProtocolTCP},
			},
		},
		Status: corev1.ServiceStatus{
			LoadBalancer: corev1.LoadBalancerStatus{
				Ingress: []corev1.LoadBalancerIngress{
					{Hostname: "abc123.us-east-1.elb.amazonaws.com"},
				},
			},
		},
	}

	info := ServiceToServiceInfo(svc)

	if info.ExternalIP != "abc123.us-east-1.elb.amazonaws.com" {
		t.Errorf("ExternalIP = %q, want %q", info.ExternalIP, "abc123.us-east-1.elb.amazonaws.com")
	}
}

func TestServiceToServiceInfo_ExternalIPs(t *testing.T) {
	svc := &corev1.Service{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "ext-svc",
			Namespace: "default",
		},
		Spec: corev1.ServiceSpec{
			Type:        corev1.ServiceTypeClusterIP,
			ClusterIP:   "10.96.0.10",
			ExternalIPs: []string{"1.2.3.4", "5.6.7.8"},
			Ports: []corev1.ServicePort{
				{Port: 80, Protocol: corev1.ProtocolTCP},
			},
		},
	}

	info := ServiceToServiceInfo(svc)

	if info.ExternalIP != "1.2.3.4, 5.6.7.8" {
		t.Errorf("ExternalIP = %q, want %q", info.ExternalIP, "1.2.3.4, 5.6.7.8")
	}
}

func TestServiceToServiceInfo_NoPorts(t *testing.T) {
	svc := &corev1.Service{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "headless",
			Namespace: "default",
		},
		Spec: corev1.ServiceSpec{
			Type:      corev1.ServiceTypeClusterIP,
			ClusterIP: "None",
		},
	}

	info := ServiceToServiceInfo(svc)

	if info.Ports != "" {
		t.Errorf("Ports = %q, want empty", info.Ports)
	}
	if info.Selector != "" {
		t.Errorf("Selector = %q, want empty", info.Selector)
	}
}

func TestServiceToServiceInfo_ZeroTimestamp(t *testing.T) {
	svc := &corev1.Service{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "no-time",
			Namespace: "default",
		},
		Spec: corev1.ServiceSpec{
			Type: corev1.ServiceTypeClusterIP,
		},
	}

	info := ServiceToServiceInfo(svc)

	if info.Age != "" {
		t.Errorf("Age = %q, want empty for zero timestamp", info.Age)
	}
}

func TestFormatServicePorts(t *testing.T) {
	tests := []struct {
		name  string
		ports []corev1.ServicePort
		want  string
	}{
		{"empty", nil, ""},
		{"single TCP", []corev1.ServicePort{{Port: 80, Protocol: corev1.ProtocolTCP}}, "80/TCP"},
		{"with nodeport", []corev1.ServicePort{{Port: 80, NodePort: 30080, Protocol: corev1.ProtocolTCP}}, "80:30080/TCP"},
		{"multiple", []corev1.ServicePort{
			{Port: 80, Protocol: corev1.ProtocolTCP},
			{Port: 443, Protocol: corev1.ProtocolTCP},
		}, "80/TCP, 443/TCP"},
		{"UDP", []corev1.ServicePort{{Port: 53, Protocol: corev1.ProtocolUDP}}, "53/UDP"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := formatServicePorts(tt.ports)
			if got != tt.want {
				t.Errorf("formatServicePorts() = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestFormatServiceSelector(t *testing.T) {
	tests := []struct {
		name     string
		selector map[string]string
		want     string
	}{
		{"nil", nil, ""},
		{"empty", map[string]string{}, ""},
		{"single", map[string]string{"app": "web"}, "app=web"},
		{"multiple sorted", map[string]string{"tier": "frontend", "app": "web"}, "app=web, tier=frontend"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := formatServiceSelector(tt.selector)
			if got != tt.want {
				t.Errorf("formatServiceSelector() = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestConvertService(t *testing.T) {
	svc := &corev1.Service{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "test-svc",
			Namespace: "default",
		},
		Spec: corev1.ServiceSpec{
			Type:      corev1.ServiceTypeClusterIP,
			ClusterIP: "10.96.0.1",
			Ports: []corev1.ServicePort{
				{Port: 80, Protocol: corev1.ProtocolTCP, TargetPort: intstr.FromInt32(8080)},
			},
		},
	}

	result, ok := convertService(svc)
	if !ok {
		t.Fatal("convertService returned false")
	}
	info, ok := result.(ServiceInfo)
	if !ok {
		t.Fatal("result is not ServiceInfo")
	}
	if info.Name != "test-svc" {
		t.Errorf("Name = %q, want %q", info.Name, "test-svc")
	}
}

func TestConvertService_WrongType(t *testing.T) {
	_, ok := convertService("not a service")
	if ok {
		t.Error("expected convertService to return false for wrong type")
	}
}
