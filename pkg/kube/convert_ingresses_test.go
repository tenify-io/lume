package kube

import (
	"testing"
	"time"

	networkingv1 "k8s.io/api/networking/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func ptrPathType(pt networkingv1.PathType) *networkingv1.PathType {
	return &pt
}

func ptrString(s string) *string {
	return &s
}

func TestIngressToIngressInfo_Basic(t *testing.T) {
	ing := &networkingv1.Ingress{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "my-ingress",
			Namespace:         "default",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-2 * time.Hour)),
		},
		Spec: networkingv1.IngressSpec{
			IngressClassName: ptrString("nginx"),
			Rules: []networkingv1.IngressRule{
				{
					Host: "example.com",
					IngressRuleValue: networkingv1.IngressRuleValue{
						HTTP: &networkingv1.HTTPIngressRuleValue{
							Paths: []networkingv1.HTTPIngressPath{
								{
									Path:     "/",
									PathType: ptrPathType(networkingv1.PathTypePrefix),
									Backend: networkingv1.IngressBackend{
										Service: &networkingv1.IngressServiceBackend{
											Name: "web",
											Port: networkingv1.ServiceBackendPort{Number: 80},
										},
									},
								},
							},
						},
					},
				},
			},
		},
	}

	info := IngressToIngressInfo(ing)

	if info.Name != "my-ingress" {
		t.Errorf("Name = %q, want %q", info.Name, "my-ingress")
	}
	if info.Namespace != "default" {
		t.Errorf("Namespace = %q, want %q", info.Namespace, "default")
	}
	if info.Class != "nginx" {
		t.Errorf("Class = %q, want %q", info.Class, "nginx")
	}
	if info.Hosts != "example.com" {
		t.Errorf("Hosts = %q, want %q", info.Hosts, "example.com")
	}
	if info.Ports != "80" {
		t.Errorf("Ports = %q, want %q", info.Ports, "80")
	}
	if info.Age != "2h" {
		t.Errorf("Age = %q, want %q", info.Age, "2h")
	}
	if info.Address != "" {
		t.Errorf("Address = %q, want empty", info.Address)
	}
}

func TestIngressToIngressInfo_WithTLS(t *testing.T) {
	ing := &networkingv1.Ingress{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "tls-ingress",
			Namespace:         "production",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-24 * time.Hour)),
		},
		Spec: networkingv1.IngressSpec{
			TLS: []networkingv1.IngressTLS{
				{
					Hosts:      []string{"secure.example.com"},
					SecretName: "tls-secret",
				},
			},
			Rules: []networkingv1.IngressRule{
				{Host: "secure.example.com"},
			},
		},
	}

	info := IngressToIngressInfo(ing)

	if info.Ports != "80, 443" {
		t.Errorf("Ports = %q, want %q", info.Ports, "80, 443")
	}
}

func TestIngressToIngressInfo_MultipleHosts(t *testing.T) {
	ing := &networkingv1.Ingress{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "multi-host",
			Namespace: "default",
		},
		Spec: networkingv1.IngressSpec{
			Rules: []networkingv1.IngressRule{
				{Host: "foo.example.com"},
				{Host: "bar.example.com"},
				{Host: "foo.example.com"}, // duplicate
			},
		},
	}

	info := IngressToIngressInfo(ing)

	if info.Hosts != "foo.example.com, bar.example.com" {
		t.Errorf("Hosts = %q, want %q", info.Hosts, "foo.example.com, bar.example.com")
	}
}

func TestIngressToIngressInfo_WildcardHost(t *testing.T) {
	ing := &networkingv1.Ingress{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "wildcard",
			Namespace: "default",
		},
		Spec: networkingv1.IngressSpec{
			Rules: []networkingv1.IngressRule{
				{Host: ""},
			},
		},
	}

	info := IngressToIngressInfo(ing)

	if info.Hosts != "*" {
		t.Errorf("Hosts = %q, want %q", info.Hosts, "*")
	}
}

func TestIngressToIngressInfo_WithAddress(t *testing.T) {
	ing := &networkingv1.Ingress{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "addressed",
			Namespace: "default",
		},
		Spec: networkingv1.IngressSpec{
			Rules: []networkingv1.IngressRule{
				{Host: "example.com"},
			},
		},
		Status: networkingv1.IngressStatus{
			LoadBalancer: networkingv1.IngressLoadBalancerStatus{
				Ingress: []networkingv1.IngressLoadBalancerIngress{
					{IP: "203.0.113.10"},
				},
			},
		},
	}

	info := IngressToIngressInfo(ing)

	if info.Address != "203.0.113.10" {
		t.Errorf("Address = %q, want %q", info.Address, "203.0.113.10")
	}
}

func TestIngressToIngressInfo_WithHostname(t *testing.T) {
	ing := &networkingv1.Ingress{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "aws-ingress",
			Namespace: "default",
		},
		Spec: networkingv1.IngressSpec{
			Rules: []networkingv1.IngressRule{
				{Host: "example.com"},
			},
		},
		Status: networkingv1.IngressStatus{
			LoadBalancer: networkingv1.IngressLoadBalancerStatus{
				Ingress: []networkingv1.IngressLoadBalancerIngress{
					{Hostname: "abc123.us-east-1.elb.amazonaws.com"},
				},
			},
		},
	}

	info := IngressToIngressInfo(ing)

	if info.Address != "abc123.us-east-1.elb.amazonaws.com" {
		t.Errorf("Address = %q, want %q", info.Address, "abc123.us-east-1.elb.amazonaws.com")
	}
}

func TestIngressToIngressInfo_NoClassName(t *testing.T) {
	ing := &networkingv1.Ingress{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "no-class",
			Namespace: "default",
		},
		Spec: networkingv1.IngressSpec{
			Rules: []networkingv1.IngressRule{
				{Host: "example.com"},
			},
		},
	}

	info := IngressToIngressInfo(ing)

	if info.Class != "" {
		t.Errorf("Class = %q, want empty", info.Class)
	}
}

func TestIngressToIngressInfo_ZeroTimestamp(t *testing.T) {
	ing := &networkingv1.Ingress{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "no-time",
			Namespace: "default",
		},
		Spec: networkingv1.IngressSpec{},
	}

	info := IngressToIngressInfo(ing)

	if info.Age != "" {
		t.Errorf("Age = %q, want empty for zero timestamp", info.Age)
	}
}

func TestIngressDefaultBackend(t *testing.T) {
	tests := []struct {
		name string
		ing  *networkingv1.Ingress
		want string
	}{
		{
			"nil default backend",
			&networkingv1.Ingress{},
			"",
		},
		{
			"with service port number",
			&networkingv1.Ingress{
				Spec: networkingv1.IngressSpec{
					DefaultBackend: &networkingv1.IngressBackend{
						Service: &networkingv1.IngressServiceBackend{
							Name: "default-svc",
							Port: networkingv1.ServiceBackendPort{Number: 8080},
						},
					},
				},
			},
			"default-svc:8080",
		},
		{
			"with service port name",
			&networkingv1.Ingress{
				Spec: networkingv1.IngressSpec{
					DefaultBackend: &networkingv1.IngressBackend{
						Service: &networkingv1.IngressServiceBackend{
							Name: "default-svc",
							Port: networkingv1.ServiceBackendPort{Name: "http"},
						},
					},
				},
			},
			"default-svc:http",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := ingressDefaultBackend(tt.ing)
			if got != tt.want {
				t.Errorf("ingressDefaultBackend() = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestFormatIngressBackend(t *testing.T) {
	tests := []struct {
		name string
		svc  *networkingv1.IngressServiceBackend
		want string
	}{
		{
			"port number",
			&networkingv1.IngressServiceBackend{
				Name: "api",
				Port: networkingv1.ServiceBackendPort{Number: 80},
			},
			"api:80",
		},
		{
			"port name",
			&networkingv1.IngressServiceBackend{
				Name: "api",
				Port: networkingv1.ServiceBackendPort{Name: "http"},
			},
			"api:http",
		},
		{
			"no port",
			&networkingv1.IngressServiceBackend{
				Name: "api",
			},
			"api",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := formatIngressBackend(tt.svc)
			if got != tt.want {
				t.Errorf("formatIngressBackend() = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestConvertIngress(t *testing.T) {
	ing := &networkingv1.Ingress{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "test-ingress",
			Namespace: "default",
		},
		Spec: networkingv1.IngressSpec{
			IngressClassName: ptrString("nginx"),
			Rules: []networkingv1.IngressRule{
				{Host: "example.com"},
			},
		},
	}

	result, ok := convertIngress(ing)
	if !ok {
		t.Fatal("convertIngress returned false")
	}
	info, ok := result.(IngressInfo)
	if !ok {
		t.Fatal("result is not IngressInfo")
	}
	if info.Name != "test-ingress" {
		t.Errorf("Name = %q, want %q", info.Name, "test-ingress")
	}
}

func TestConvertIngress_WrongType(t *testing.T) {
	_, ok := convertIngress("not an ingress")
	if ok {
		t.Error("expected convertIngress to return false for wrong type")
	}
}
