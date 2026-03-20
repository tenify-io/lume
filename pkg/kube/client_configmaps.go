package kube

import (
	"context"
	"fmt"
	"sort"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// GetConfigMaps returns config maps, optionally filtered by namespace ("" for all namespaces).
func (c *Client) GetConfigMaps(ctx context.Context, namespace string) ([]ConfigMapInfo, error) {
	if namespace == "" {
		namespace = metav1.NamespaceAll
	}

	cmList, err := c.clientset.CoreV1().ConfigMaps(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list config maps: %w", err)
	}

	var configmaps []ConfigMapInfo
	for i := range cmList.Items {
		configmaps = append(configmaps, ConfigMapToConfigMapInfo(&cmList.Items[i]))
	}

	sort.Slice(configmaps, func(i, j int) bool {
		if configmaps[i].Namespace != configmaps[j].Namespace {
			return configmaps[i].Namespace < configmaps[j].Namespace
		}
		return configmaps[i].Name < configmaps[j].Name
	})

	return configmaps, nil
}

// GetConfigMapDetail returns detailed information about a single config map.
func (c *Client) GetConfigMapDetail(ctx context.Context, namespace, name string) (*ConfigMapDetail, error) {
	cm, err := c.clientset.CoreV1().ConfigMaps(namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get config map %s/%s: %w", namespace, name, err)
	}

	age := ""
	if !cm.CreationTimestamp.IsZero() {
		age = FormatDuration(metav1.Now().Sub(cm.CreationTimestamp.Time))
	}

	return &ConfigMapDetail{
		Name:              cm.Name,
		Namespace:         cm.Namespace,
		UID:               string(cm.UID),
		CreationTimestamp: cm.CreationTimestamp.Format("2006-01-02 15:04:05 MST"),
		Labels:            cm.Labels,
		Annotations:       FilterAnnotations(cm.Annotations),
		Data:              cm.Data,
		BinaryDataKeys:    binaryDataKeys(cm.BinaryData),
		Age:               age,
	}, nil
}
