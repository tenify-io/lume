package kube

import (
	"context"
	"fmt"
	"sort"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/fields"
	"k8s.io/apimachinery/pkg/util/intstr"
)

// GetDeployments returns deployments, optionally filtered by namespace ("" for all namespaces).
func (c *Client) GetDeployments(ctx context.Context, namespace string) ([]DeploymentInfo, error) {
	if namespace == "" {
		namespace = metav1.NamespaceAll
	}

	depList, err := c.clientset.AppsV1().Deployments(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list deployments: %w", err)
	}

	var deployments []DeploymentInfo
	for i := range depList.Items {
		deployments = append(deployments, DeploymentToDeploymentInfo(&depList.Items[i]))
	}

	sort.Slice(deployments, func(i, j int) bool {
		if deployments[i].Namespace != deployments[j].Namespace {
			return deployments[i].Namespace < deployments[j].Namespace
		}
		return deployments[i].Name < deployments[j].Name
	})

	return deployments, nil
}

// GetDeploymentDetail returns detailed information about a single deployment.
func (c *Client) GetDeploymentDetail(ctx context.Context, namespace, name string) (*DeploymentDetail, error) {
	dep, err := c.clientset.AppsV1().Deployments(namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get deployment %s/%s: %w", namespace, name, err)
	}

	age := ""
	if !dep.CreationTimestamp.IsZero() {
		age = FormatDuration(metav1.Now().Sub(dep.CreationTimestamp.Time))
	}

	desired := int32(1)
	if dep.Spec.Replicas != nil {
		desired = *dep.Spec.Replicas
	}

	var conditions []DeploymentCondition
	for _, c := range dep.Status.Conditions {
		transition := ""
		if !c.LastTransitionTime.IsZero() {
			transition = c.LastTransitionTime.Format("2006-01-02 15:04:05 MST")
		}
		conditions = append(conditions, DeploymentCondition{
			Type:               string(c.Type),
			Status:             string(c.Status),
			LastTransitionTime: transition,
			Reason:             c.Reason,
			Message:            c.Message,
		})
	}

	var images []string
	for _, c := range dep.Spec.Template.Spec.Containers {
		images = append(images, c.Image)
	}

	selector := make(map[string]string)
	if dep.Spec.Selector != nil {
		for k, v := range dep.Spec.Selector.MatchLabels {
			selector[k] = v
		}
	}

	maxSurge := ""
	maxUnavailable := ""
	if dep.Spec.Strategy.RollingUpdate != nil {
		maxSurge = intStrToString(dep.Spec.Strategy.RollingUpdate.MaxSurge)
		maxUnavailable = intStrToString(dep.Spec.Strategy.RollingUpdate.MaxUnavailable)
	}

	return &DeploymentDetail{
		Name:                 dep.Name,
		Namespace:            dep.Namespace,
		UID:                  string(dep.UID),
		CreationTimestamp:    dep.CreationTimestamp.Format("2006-01-02 15:04:05 MST"),
		Labels:               dep.Labels,
		Annotations:          FilterAnnotations(dep.Annotations),
		Ready:                fmt.Sprintf("%d/%d", dep.Status.ReadyReplicas, desired),
		UpToDate:             dep.Status.UpdatedReplicas,
		Available:            dep.Status.AvailableReplicas,
		Age:                  age,
		Strategy:             string(dep.Spec.Strategy.Type),
		MinReadySeconds:      dep.Spec.MinReadySeconds,
		RevisionHistoryLimit: dep.Spec.RevisionHistoryLimit,
		Selector:             selector,
		MaxSurge:             maxSurge,
		MaxUnavailable:       maxUnavailable,
		Conditions:           conditions,
		Images:               images,
	}, nil
}

// GetDeploymentEvents returns events related to a specific deployment.
func (c *Client) GetDeploymentEvents(ctx context.Context, namespace, name string) ([]EventInfo, error) {
	fieldSelector := fields.AndSelectors(
		fields.OneTermEqualSelector("involvedObject.name", name),
		fields.OneTermEqualSelector("involvedObject.namespace", namespace),
		fields.OneTermEqualSelector("involvedObject.kind", "Deployment"),
	).String()

	eventList, err := c.clientset.CoreV1().Events(namespace).List(ctx, metav1.ListOptions{
		FieldSelector: fieldSelector,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to list events for deployment %s/%s: %w", namespace, name, err)
	}

	var events []EventInfo
	for _, e := range eventList.Items {
		firstSeen := ""
		if !e.FirstTimestamp.IsZero() {
			firstSeen = e.FirstTimestamp.Format("2006-01-02 15:04:05 MST")
		}
		lastSeen := ""
		eventAge := ""
		if !e.LastTimestamp.IsZero() {
			lastSeen = e.LastTimestamp.Format("2006-01-02 15:04:05 MST")
			eventAge = FormatDuration(metav1.Now().Sub(e.LastTimestamp.Time))
		}

		source := e.Source.Component
		if e.Source.Host != "" {
			source += "/" + e.Source.Host
		}

		events = append(events, EventInfo{
			Type:           e.Type,
			Reason:         e.Reason,
			Message:        e.Message,
			Source:         source,
			Count:          e.Count,
			FirstTimestamp: firstSeen,
			LastTimestamp:  lastSeen,
			Age:            eventAge,
		})
	}

	sort.Slice(events, func(i, j int) bool {
		return events[i].LastTimestamp > events[j].LastTimestamp
	})

	return events, nil
}

// intStrToString converts an *intstr.IntOrString to a display string.
func intStrToString(v *intstr.IntOrString) string {
	if v == nil {
		return ""
	}
	return v.String()
}
