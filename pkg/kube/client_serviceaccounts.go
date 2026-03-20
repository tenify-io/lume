package kube

import (
	"context"
	"fmt"
	"sort"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// GetServiceAccounts returns service accounts, optionally filtered by namespace ("" for all namespaces).
func (c *Client) GetServiceAccounts(ctx context.Context, namespace string) ([]ServiceAccountInfo, error) {
	if namespace == "" {
		namespace = metav1.NamespaceAll
	}

	saList, err := c.clientset.CoreV1().ServiceAccounts(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list service accounts: %w", err)
	}

	var serviceaccounts []ServiceAccountInfo
	for i := range saList.Items {
		serviceaccounts = append(serviceaccounts, ServiceAccountToServiceAccountInfo(&saList.Items[i]))
	}

	sort.Slice(serviceaccounts, func(i, j int) bool {
		if serviceaccounts[i].Namespace != serviceaccounts[j].Namespace {
			return serviceaccounts[i].Namespace < serviceaccounts[j].Namespace
		}
		return serviceaccounts[i].Name < serviceaccounts[j].Name
	})

	return serviceaccounts, nil
}

// GetServiceAccountDetail returns detailed information about a single service account.
func (c *Client) GetServiceAccountDetail(ctx context.Context, namespace, name string) (*ServiceAccountDetail, error) {
	sa, err := c.clientset.CoreV1().ServiceAccounts(namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get service account %s/%s: %w", namespace, name, err)
	}

	age := ""
	if !sa.CreationTimestamp.IsZero() {
		age = FormatDuration(metav1.Now().Sub(sa.CreationTimestamp.Time))
	}

	secrets := make([]string, 0, len(sa.Secrets))
	for _, s := range sa.Secrets {
		secrets = append(secrets, s.Name)
	}

	imagePullSecrets := make([]string, 0, len(sa.ImagePullSecrets))
	for _, ips := range sa.ImagePullSecrets {
		imagePullSecrets = append(imagePullSecrets, ips.Name)
	}

	return &ServiceAccountDetail{
		Name:                         sa.Name,
		Namespace:                    sa.Namespace,
		UID:                          string(sa.UID),
		CreationTimestamp:            sa.CreationTimestamp.Format("2006-01-02 15:04:05 MST"),
		Labels:                       sa.Labels,
		Annotations:                  FilterAnnotations(sa.Annotations),
		Secrets:                      secrets,
		ImagePullSecrets:             imagePullSecrets,
		AutomountServiceAccountToken: sa.AutomountServiceAccountToken,
		Age:                          age,
	}, nil
}
