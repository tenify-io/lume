package kube

import (
	"context"
	"fmt"
	"sort"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// GetSecrets returns secrets, optionally filtered by namespace ("" for all namespaces).
func (c *Client) GetSecrets(ctx context.Context, namespace string) ([]SecretInfo, error) {
	if namespace == "" {
		namespace = metav1.NamespaceAll
	}

	secretList, err := c.clientset.CoreV1().Secrets(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list secrets: %w", err)
	}

	var secrets []SecretInfo
	for i := range secretList.Items {
		secrets = append(secrets, SecretToSecretInfo(&secretList.Items[i]))
	}

	sort.Slice(secrets, func(i, j int) bool {
		if secrets[i].Namespace != secrets[j].Namespace {
			return secrets[i].Namespace < secrets[j].Namespace
		}
		return secrets[i].Name < secrets[j].Name
	})

	return secrets, nil
}

// GetSecretDetail returns detailed information about a single secret.
func (c *Client) GetSecretDetail(ctx context.Context, namespace, name string) (*SecretDetail, error) {
	s, err := c.clientset.CoreV1().Secrets(namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get secret %s/%s: %w", namespace, name, err)
	}

	age := ""
	if !s.CreationTimestamp.IsZero() {
		age = FormatDuration(metav1.Now().Sub(s.CreationTimestamp.Time))
	}

	data := make(map[string]string, len(s.Data))
	for k, v := range s.Data {
		data[k] = string(v)
	}

	return &SecretDetail{
		Name:              s.Name,
		Namespace:         s.Namespace,
		UID:               string(s.UID),
		CreationTimestamp: s.CreationTimestamp.Format("2006-01-02 15:04:05 MST"),
		Labels:            s.Labels,
		Annotations:       FilterAnnotations(s.Annotations),
		Type:              string(s.Type),
		Data:              data,
		Age:               age,
	}, nil
}
