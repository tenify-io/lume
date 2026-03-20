package kube

import (
	"context"
	"fmt"
	"sort"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// GetRoles returns roles, optionally filtered by namespace ("" for all namespaces).
func (c *Client) GetRoles(ctx context.Context, namespace string) ([]RoleInfo, error) {
	if namespace == "" {
		namespace = metav1.NamespaceAll
	}

	roleList, err := c.clientset.RbacV1().Roles(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list roles: %w", err)
	}

	var roles []RoleInfo
	for i := range roleList.Items {
		roles = append(roles, RoleToRoleInfo(&roleList.Items[i]))
	}

	sort.Slice(roles, func(i, j int) bool {
		if roles[i].Namespace != roles[j].Namespace {
			return roles[i].Namespace < roles[j].Namespace
		}
		return roles[i].Name < roles[j].Name
	})

	return roles, nil
}

// GetRoleDetail returns detailed information about a single role.
func (c *Client) GetRoleDetail(ctx context.Context, namespace, name string) (*RoleDetail, error) {
	role, err := c.clientset.RbacV1().Roles(namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get role %s/%s: %w", namespace, name, err)
	}

	age := ""
	if !role.CreationTimestamp.IsZero() {
		age = FormatDuration(metav1.Now().Sub(role.CreationTimestamp.Time))
	}

	return &RoleDetail{
		Name:              role.Name,
		Namespace:         role.Namespace,
		Kind:              "Role",
		UID:               string(role.UID),
		CreationTimestamp: role.CreationTimestamp.Format("2006-01-02 15:04:05 MST"),
		Labels:            role.Labels,
		Annotations:       FilterAnnotations(role.Annotations),
		Rules:             convertPolicyRules(role.Rules),
		Age:               age,
	}, nil
}

// GetClusterRoles returns all cluster roles in the cluster.
func (c *Client) GetClusterRoles(ctx context.Context) ([]RoleInfo, error) {
	crList, err := c.clientset.RbacV1().ClusterRoles().List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list cluster roles: %w", err)
	}

	var roles []RoleInfo
	for i := range crList.Items {
		roles = append(roles, ClusterRoleToRoleInfo(&crList.Items[i]))
	}

	sort.Slice(roles, func(i, j int) bool {
		return roles[i].Name < roles[j].Name
	})

	return roles, nil
}

// GetClusterRoleDetail returns detailed information about a single cluster role.
func (c *Client) GetClusterRoleDetail(ctx context.Context, name string) (*RoleDetail, error) {
	cr, err := c.clientset.RbacV1().ClusterRoles().Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get cluster role %s: %w", name, err)
	}

	age := ""
	if !cr.CreationTimestamp.IsZero() {
		age = FormatDuration(metav1.Now().Sub(cr.CreationTimestamp.Time))
	}

	return &RoleDetail{
		Name:              cr.Name,
		Kind:              "ClusterRole",
		UID:               string(cr.UID),
		CreationTimestamp: cr.CreationTimestamp.Format("2006-01-02 15:04:05 MST"),
		Labels:            cr.Labels,
		Annotations:       FilterAnnotations(cr.Annotations),
		Rules:             convertPolicyRules(cr.Rules),
		Age:               age,
	}, nil
}
