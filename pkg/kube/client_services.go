package kube

import (
	"context"
	"fmt"
	"sort"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// GetServices returns services, optionally filtered by namespace ("" for all namespaces).
func (c *Client) GetServices(ctx context.Context, namespace string) ([]ServiceInfo, error) {
	if namespace == "" {
		namespace = metav1.NamespaceAll
	}

	svcList, err := c.clientset.CoreV1().Services(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list services: %w", err)
	}

	var services []ServiceInfo
	for i := range svcList.Items {
		services = append(services, ServiceToServiceInfo(&svcList.Items[i]))
	}

	sort.Slice(services, func(i, j int) bool {
		if services[i].Namespace != services[j].Namespace {
			return services[i].Namespace < services[j].Namespace
		}
		return services[i].Name < services[j].Name
	})

	return services, nil
}

// GetServiceDetail returns detailed information about a single service.
func (c *Client) GetServiceDetail(ctx context.Context, namespace, name string) (*ServiceDetail, error) {
	svc, err := c.clientset.CoreV1().Services(namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get service %s/%s: %w", namespace, name, err)
	}

	age := ""
	if !svc.CreationTimestamp.IsZero() {
		age = FormatDuration(metav1.Now().Sub(svc.CreationTimestamp.Time))
	}

	var ports []ServicePort
	for _, p := range svc.Spec.Ports {
		ports = append(ports, ServicePort{
			Name:       p.Name,
			Port:       p.Port,
			Protocol:   string(p.Protocol),
			TargetPort: p.TargetPort.String(),
			NodePort:   p.NodePort,
		})
	}

	externalTrafficPolicy := ""
	if svc.Spec.ExternalTrafficPolicy != "" {
		externalTrafficPolicy = string(svc.Spec.ExternalTrafficPolicy)
	}

	internalTrafficPolicy := ""
	if svc.Spec.InternalTrafficPolicy != nil {
		internalTrafficPolicy = string(*svc.Spec.InternalTrafficPolicy)
	}

	var ipFamilies []string
	for _, f := range svc.Spec.IPFamilies {
		ipFamilies = append(ipFamilies, string(f))
	}

	ipFamilyPolicy := ""
	if svc.Spec.IPFamilyPolicy != nil {
		ipFamilyPolicy = string(*svc.Spec.IPFamilyPolicy)
	}

	return &ServiceDetail{
		Name:                  svc.Name,
		Namespace:             svc.Namespace,
		UID:                   string(svc.UID),
		CreationTimestamp:     svc.CreationTimestamp.Format("2006-01-02 15:04:05 MST"),
		Labels:                svc.Labels,
		Annotations:           FilterAnnotations(svc.Annotations),
		Type:                  string(svc.Spec.Type),
		ClusterIP:             svc.Spec.ClusterIP,
		ExternalIP:            serviceExternalIP(svc),
		SessionAffinity:       string(svc.Spec.SessionAffinity),
		ExternalTrafficPolicy: externalTrafficPolicy,
		InternalTrafficPolicy: internalTrafficPolicy,
		IPFamilies:            ipFamilies,
		IPFamilyPolicy:        ipFamilyPolicy,
		Ports:                 ports,
		Selector:              svc.Spec.Selector,
		Age:                   age,
	}, nil
}

// GetServiceEvents returns events related to a specific service.
func (c *Client) GetServiceEvents(ctx context.Context, namespace, name string) ([]EventInfo, error) {
	return c.ListEvents(ctx, namespace, name, "Service")
}
