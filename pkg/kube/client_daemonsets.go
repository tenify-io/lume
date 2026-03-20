package kube

import (
	"context"
	"fmt"
	"maps"
	"sort"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// GetDaemonSets returns daemonsets, optionally filtered by namespace ("" for all namespaces).
func (c *Client) GetDaemonSets(ctx context.Context, namespace string) ([]DaemonSetInfo, error) {
	if namespace == "" {
		namespace = metav1.NamespaceAll
	}

	dsList, err := c.clientset.AppsV1().DaemonSets(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list daemonsets: %w", err)
	}

	var daemonsets []DaemonSetInfo
	for i := range dsList.Items {
		daemonsets = append(daemonsets, DaemonSetToDaemonSetInfo(&dsList.Items[i]))
	}

	sort.Slice(daemonsets, func(i, j int) bool {
		if daemonsets[i].Namespace != daemonsets[j].Namespace {
			return daemonsets[i].Namespace < daemonsets[j].Namespace
		}
		return daemonsets[i].Name < daemonsets[j].Name
	})

	return daemonsets, nil
}

// GetDaemonSetDetail returns detailed information about a single daemonset.
func (c *Client) GetDaemonSetDetail(ctx context.Context, namespace, name string) (*DaemonSetDetail, error) {
	ds, err := c.clientset.AppsV1().DaemonSets(namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get daemonset %s/%s: %w", namespace, name, err)
	}

	age := ""
	if !ds.CreationTimestamp.IsZero() {
		age = FormatDuration(metav1.Now().Sub(ds.CreationTimestamp.Time))
	}

	var conditions []DaemonSetCondition
	for _, c := range ds.Status.Conditions {
		transition := ""
		if !c.LastTransitionTime.IsZero() {
			transition = c.LastTransitionTime.Format("2006-01-02 15:04:05 MST")
		}
		conditions = append(conditions, DaemonSetCondition{
			Type:               string(c.Type),
			Status:             string(c.Status),
			LastTransitionTime: transition,
			Reason:             c.Reason,
			Message:            c.Message,
		})
	}

	var images []string
	for _, c := range ds.Spec.Template.Spec.Containers {
		images = append(images, c.Image)
	}

	selector := make(map[string]string)
	if ds.Spec.Selector != nil {
		maps.Copy(selector, ds.Spec.Selector.MatchLabels)
	}

	nodeSelector := make(map[string]string)
	maps.Copy(nodeSelector, ds.Spec.Template.Spec.NodeSelector)

	updateStrategy := string(ds.Spec.UpdateStrategy.Type)

	return &DaemonSetDetail{
		Name:                 ds.Name,
		Namespace:            ds.Namespace,
		UID:                  string(ds.UID),
		CreationTimestamp:    ds.CreationTimestamp.Format("2006-01-02 15:04:05 MST"),
		Labels:               ds.Labels,
		Annotations:          FilterAnnotations(ds.Annotations),
		Desired:              ds.Status.DesiredNumberScheduled,
		Current:              ds.Status.CurrentNumberScheduled,
		Ready:                ds.Status.NumberReady,
		UpToDate:             ds.Status.UpdatedNumberScheduled,
		Available:            ds.Status.NumberAvailable,
		Age:                  age,
		UpdateStrategy:       updateStrategy,
		MinReadySeconds:      ds.Spec.MinReadySeconds,
		RevisionHistoryLimit: ds.Spec.RevisionHistoryLimit,
		Selector:             selector,
		NodeSelector:         nodeSelector,
		Conditions:           conditions,
		Images:               images,
	}, nil
}

// GetDaemonSetEvents returns events related to a specific daemonset.
func (c *Client) GetDaemonSetEvents(ctx context.Context, namespace, name string) ([]EventInfo, error) {
	return c.ListEvents(ctx, namespace, name, "DaemonSet")
}
