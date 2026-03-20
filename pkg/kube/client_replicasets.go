package kube

import (
	"context"
	"fmt"
	"maps"
	"sort"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// GetReplicaSets returns replicasets, optionally filtered by namespace ("" for all namespaces).
func (c *Client) GetReplicaSets(ctx context.Context, namespace string) ([]ReplicaSetInfo, error) {
	if namespace == "" {
		namespace = metav1.NamespaceAll
	}

	rsList, err := c.clientset.AppsV1().ReplicaSets(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list replicasets: %w", err)
	}

	var replicasets []ReplicaSetInfo
	for i := range rsList.Items {
		replicasets = append(replicasets, ReplicaSetToReplicaSetInfo(&rsList.Items[i]))
	}

	sort.Slice(replicasets, func(i, j int) bool {
		if replicasets[i].Namespace != replicasets[j].Namespace {
			return replicasets[i].Namespace < replicasets[j].Namespace
		}
		return replicasets[i].Name < replicasets[j].Name
	})

	return replicasets, nil
}

// GetReplicaSetDetail returns detailed information about a single replicaset.
func (c *Client) GetReplicaSetDetail(ctx context.Context, namespace, name string) (*ReplicaSetDetail, error) {
	rs, err := c.clientset.AppsV1().ReplicaSets(namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get replicaset %s/%s: %w", namespace, name, err)
	}

	age := ""
	if !rs.CreationTimestamp.IsZero() {
		age = FormatDuration(metav1.Now().Sub(rs.CreationTimestamp.Time))
	}

	var conditions []ReplicaSetCondition
	for _, c := range rs.Status.Conditions {
		transition := ""
		if !c.LastTransitionTime.IsZero() {
			transition = c.LastTransitionTime.Format("2006-01-02 15:04:05 MST")
		}
		conditions = append(conditions, ReplicaSetCondition{
			Type:               string(c.Type),
			Status:             string(c.Status),
			LastTransitionTime: transition,
			Reason:             c.Reason,
			Message:            c.Message,
		})
	}

	var images []string
	for _, c := range rs.Spec.Template.Spec.Containers {
		images = append(images, c.Image)
	}

	selector := make(map[string]string)
	if rs.Spec.Selector != nil {
		maps.Copy(selector, rs.Spec.Selector.MatchLabels)
	}

	var ownerRefs []OwnerReference
	for _, ref := range rs.OwnerReferences {
		ownerRefs = append(ownerRefs, OwnerReference{
			Kind: ref.Kind,
			Name: ref.Name,
		})
	}

	return &ReplicaSetDetail{
		Name:              rs.Name,
		Namespace:         rs.Namespace,
		UID:               string(rs.UID),
		CreationTimestamp: rs.CreationTimestamp.Format("2006-01-02 15:04:05 MST"),
		Labels:            rs.Labels,
		Annotations:       FilterAnnotations(rs.Annotations),
		Desired:           derefInt32(rs.Spec.Replicas),
		Current:           rs.Status.Replicas,
		Ready:             rs.Status.ReadyReplicas,
		Age:               age,
		Selector:          selector,
		OwnerReferences:   ownerRefs,
		Conditions:        conditions,
		Images:            images,
	}, nil
}

// GetReplicaSetEvents returns events related to a specific replicaset.
func (c *Client) GetReplicaSetEvents(ctx context.Context, namespace, name string) ([]EventInfo, error) {
	return c.ListEvents(ctx, namespace, name, "ReplicaSet")
}
