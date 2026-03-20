package kube

import (
	"context"
	"fmt"
	"sort"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// GetIngresses returns ingresses, optionally filtered by namespace ("" for all namespaces).
func (c *Client) GetIngresses(ctx context.Context, namespace string) ([]IngressInfo, error) {
	if namespace == "" {
		namespace = metav1.NamespaceAll
	}

	ingList, err := c.clientset.NetworkingV1().Ingresses(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list ingresses: %w", err)
	}

	var ingresses []IngressInfo
	for i := range ingList.Items {
		ingresses = append(ingresses, IngressToIngressInfo(&ingList.Items[i]))
	}

	sort.Slice(ingresses, func(i, j int) bool {
		if ingresses[i].Namespace != ingresses[j].Namespace {
			return ingresses[i].Namespace < ingresses[j].Namespace
		}
		return ingresses[i].Name < ingresses[j].Name
	})

	return ingresses, nil
}

// GetIngressDetail returns detailed information about a single ingress.
func (c *Client) GetIngressDetail(ctx context.Context, namespace, name string) (*IngressDetail, error) {
	ing, err := c.clientset.NetworkingV1().Ingresses(namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get ingress %s/%s: %w", namespace, name, err)
	}

	age := ""
	if !ing.CreationTimestamp.IsZero() {
		age = FormatDuration(metav1.Now().Sub(ing.CreationTimestamp.Time))
	}

	var tls []IngressTLS
	for _, t := range ing.Spec.TLS {
		tls = append(tls, IngressTLS{
			Hosts:      t.Hosts,
			SecretName: t.SecretName,
		})
	}

	var rules []IngressRule
	for _, r := range ing.Spec.Rules {
		rule := IngressRule{
			Host: r.Host,
		}
		if r.HTTP != nil {
			for _, p := range r.HTTP.Paths {
				pathType := ""
				if p.PathType != nil {
					pathType = string(*p.PathType)
				}
				backend := ""
				if p.Backend.Service != nil {
					backend = formatIngressBackend(p.Backend.Service)
				}
				rule.Paths = append(rule.Paths, IngressPath{
					Path:     p.Path,
					PathType: pathType,
					Backend:  backend,
				})
			}
		}
		rules = append(rules, rule)
	}

	return &IngressDetail{
		Name:              ing.Name,
		Namespace:         ing.Namespace,
		UID:               string(ing.UID),
		CreationTimestamp: ing.CreationTimestamp.Format("2006-01-02 15:04:05 MST"),
		Labels:            ing.Labels,
		Annotations:       FilterAnnotations(ing.Annotations),
		IngressClassName:  ingressClassName(ing),
		DefaultBackend:    ingressDefaultBackend(ing),
		TLS:               tls,
		Rules:             rules,
		Age:               age,
	}, nil
}

// GetIngressEvents returns events related to a specific ingress.
func (c *Client) GetIngressEvents(ctx context.Context, namespace, name string) ([]EventInfo, error) {
	return c.ListEvents(ctx, namespace, name, "Ingress")
}
