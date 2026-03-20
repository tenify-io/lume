package kube

import (
	"context"
	"fmt"
	"sort"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// GetRoleBindings returns role bindings, optionally filtered by namespace ("" for all namespaces).
func (c *Client) GetRoleBindings(ctx context.Context, namespace string) ([]RoleBindingInfo, error) {
	if namespace == "" {
		namespace = metav1.NamespaceAll
	}

	rbList, err := c.clientset.RbacV1().RoleBindings(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list role bindings: %w", err)
	}

	var bindings []RoleBindingInfo
	for i := range rbList.Items {
		bindings = append(bindings, RoleBindingToRoleBindingInfo(&rbList.Items[i]))
	}

	sort.Slice(bindings, func(i, j int) bool {
		if bindings[i].Namespace != bindings[j].Namespace {
			return bindings[i].Namespace < bindings[j].Namespace
		}
		return bindings[i].Name < bindings[j].Name
	})

	return bindings, nil
}

// GetRoleBindingDetail returns detailed information about a single role binding.
func (c *Client) GetRoleBindingDetail(ctx context.Context, namespace, name string) (*RoleBindingDetail, error) {
	rb, err := c.clientset.RbacV1().RoleBindings(namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get role binding %s/%s: %w", namespace, name, err)
	}

	age := ""
	if !rb.CreationTimestamp.IsZero() {
		age = FormatDuration(metav1.Now().Sub(rb.CreationTimestamp.Time))
	}

	return &RoleBindingDetail{
		Name:              rb.Name,
		Namespace:         rb.Namespace,
		Kind:              "RoleBinding",
		UID:               string(rb.UID),
		CreationTimestamp: rb.CreationTimestamp.Format("2006-01-02 15:04:05 MST"),
		Labels:            rb.Labels,
		Annotations:       FilterAnnotations(rb.Annotations),
		RoleRef: RoleRefInfo{
			APIGroup: rb.RoleRef.APIGroup,
			Kind:     rb.RoleRef.Kind,
			Name:     rb.RoleRef.Name,
		},
		Subjects: convertSubjects(rb.Subjects),
		Age:      age,
	}, nil
}

// GetClusterRoleBindings returns all cluster role bindings in the cluster.
func (c *Client) GetClusterRoleBindings(ctx context.Context) ([]RoleBindingInfo, error) {
	crbList, err := c.clientset.RbacV1().ClusterRoleBindings().List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list cluster role bindings: %w", err)
	}

	var bindings []RoleBindingInfo
	for i := range crbList.Items {
		bindings = append(bindings, ClusterRoleBindingToRoleBindingInfo(&crbList.Items[i]))
	}

	sort.Slice(bindings, func(i, j int) bool {
		return bindings[i].Name < bindings[j].Name
	})

	return bindings, nil
}

// GetClusterRoleBindingDetail returns detailed information about a single cluster role binding.
func (c *Client) GetClusterRoleBindingDetail(ctx context.Context, name string) (*RoleBindingDetail, error) {
	crb, err := c.clientset.RbacV1().ClusterRoleBindings().Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get cluster role binding %s: %w", name, err)
	}

	age := ""
	if !crb.CreationTimestamp.IsZero() {
		age = FormatDuration(metav1.Now().Sub(crb.CreationTimestamp.Time))
	}

	return &RoleBindingDetail{
		Name:              crb.Name,
		Kind:              "ClusterRoleBinding",
		UID:               string(crb.UID),
		CreationTimestamp: crb.CreationTimestamp.Format("2006-01-02 15:04:05 MST"),
		Labels:            crb.Labels,
		Annotations:       FilterAnnotations(crb.Annotations),
		RoleRef: RoleRefInfo{
			APIGroup: crb.RoleRef.APIGroup,
			Kind:     crb.RoleRef.Kind,
			Name:     crb.RoleRef.Name,
		},
		Subjects: convertSubjects(crb.Subjects),
		Age:      age,
	}, nil
}
