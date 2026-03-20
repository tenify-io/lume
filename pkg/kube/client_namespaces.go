package kube

import (
	"context"
	"fmt"
	"sort"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// GetNamespaceList returns all namespaces with full info for the list view.
func (c *Client) GetNamespaceList(ctx context.Context) ([]NamespaceInfo, error) {
	nsList, err := c.clientset.CoreV1().Namespaces().List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list namespaces: %w", err)
	}

	var namespaces []NamespaceInfo
	for i := range nsList.Items {
		namespaces = append(namespaces, NamespaceToNamespaceInfo(&nsList.Items[i]))
	}

	sort.Slice(namespaces, func(i, j int) bool {
		return namespaces[i].Name < namespaces[j].Name
	})

	return namespaces, nil
}

// GetNamespaceDetail returns detailed information about a single namespace.
func (c *Client) GetNamespaceDetail(ctx context.Context, name string) (*NamespaceDetail, error) {
	ns, err := c.clientset.CoreV1().Namespaces().Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get namespace %s: %w", name, err)
	}

	age := ""
	if !ns.CreationTimestamp.IsZero() {
		age = FormatDuration(metav1.Now().Sub(ns.CreationTimestamp.Time))
	}

	var conditions []NamespaceCondition
	for _, c := range ns.Status.Conditions {
		transition := ""
		if !c.LastTransitionTime.IsZero() {
			transition = c.LastTransitionTime.Format("2006-01-02 15:04:05 MST")
		}
		conditions = append(conditions, NamespaceCondition{
			Type:               string(c.Type),
			Status:             string(c.Status),
			LastTransitionTime: transition,
			Reason:             c.Reason,
			Message:            c.Message,
		})
	}

	return &NamespaceDetail{
		Name:              ns.Name,
		Status:            string(ns.Status.Phase),
		Age:               age,
		UID:               string(ns.UID),
		CreationTimestamp: ns.CreationTimestamp.Format("2006-01-02 15:04:05 MST"),
		Labels:            ns.Labels,
		Annotations:       FilterAnnotations(ns.Annotations),
		Conditions:        conditions,
	}, nil
}

// GetNamespaceEvents returns events related to a specific namespace.
func (c *Client) GetNamespaceEvents(ctx context.Context, name string) ([]EventInfo, error) {
	return c.ListEvents(ctx, "", name, "Namespace")
}

// GetNamespaceResourceSummary returns counts of resources within a namespace.
func (c *Client) GetNamespaceResourceSummary(ctx context.Context, name string) (*NamespaceResourceSummary, error) {
	summary := &NamespaceResourceSummary{}

	podList, err := c.clientset.CoreV1().Pods(name).List(ctx, metav1.ListOptions{})
	if err == nil {
		summary.Pods = len(podList.Items)
	}

	deployList, err := c.clientset.AppsV1().Deployments(name).List(ctx, metav1.ListOptions{})
	if err == nil {
		summary.Deployments = len(deployList.Items)
	}

	stsList, err := c.clientset.AppsV1().StatefulSets(name).List(ctx, metav1.ListOptions{})
	if err == nil {
		summary.StatefulSets = len(stsList.Items)
	}

	dsList, err := c.clientset.AppsV1().DaemonSets(name).List(ctx, metav1.ListOptions{})
	if err == nil {
		summary.DaemonSets = len(dsList.Items)
	}

	jobList, err := c.clientset.BatchV1().Jobs(name).List(ctx, metav1.ListOptions{})
	if err == nil {
		summary.Jobs = len(jobList.Items)
	}

	cronJobList, err := c.clientset.BatchV1().CronJobs(name).List(ctx, metav1.ListOptions{})
	if err == nil {
		summary.CronJobs = len(cronJobList.Items)
	}

	svcList, err := c.clientset.CoreV1().Services(name).List(ctx, metav1.ListOptions{})
	if err == nil {
		summary.Services = len(svcList.Items)
	}

	cmList, err := c.clientset.CoreV1().ConfigMaps(name).List(ctx, metav1.ListOptions{})
	if err == nil {
		summary.ConfigMaps = len(cmList.Items)
	}

	secretList, err := c.clientset.CoreV1().Secrets(name).List(ctx, metav1.ListOptions{})
	if err == nil {
		summary.Secrets = len(secretList.Items)
	}

	return summary, nil
}
