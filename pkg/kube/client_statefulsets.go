package kube

import (
	"context"
	"fmt"
	"sort"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/fields"
)

// GetStatefulSets returns statefulsets, optionally filtered by namespace ("" for all namespaces).
func (c *Client) GetStatefulSets(ctx context.Context, namespace string) ([]StatefulSetInfo, error) {
	if namespace == "" {
		namespace = metav1.NamespaceAll
	}

	ssList, err := c.clientset.AppsV1().StatefulSets(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list statefulsets: %w", err)
	}

	var statefulsets []StatefulSetInfo
	for i := range ssList.Items {
		statefulsets = append(statefulsets, StatefulSetToStatefulSetInfo(&ssList.Items[i]))
	}

	sort.Slice(statefulsets, func(i, j int) bool {
		if statefulsets[i].Namespace != statefulsets[j].Namespace {
			return statefulsets[i].Namespace < statefulsets[j].Namespace
		}
		return statefulsets[i].Name < statefulsets[j].Name
	})

	return statefulsets, nil
}

// GetStatefulSetDetail returns detailed information about a single statefulset.
func (c *Client) GetStatefulSetDetail(ctx context.Context, namespace, name string) (*StatefulSetDetail, error) {
	ss, err := c.clientset.AppsV1().StatefulSets(namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get statefulset %s/%s: %w", namespace, name, err)
	}

	age := ""
	if !ss.CreationTimestamp.IsZero() {
		age = FormatDuration(metav1.Now().Sub(ss.CreationTimestamp.Time))
	}

	desired := int32(1)
	if ss.Spec.Replicas != nil {
		desired = *ss.Spec.Replicas
	}

	var conditions []StatefulSetCondition
	for _, c := range ss.Status.Conditions {
		transition := ""
		if !c.LastTransitionTime.IsZero() {
			transition = c.LastTransitionTime.Format("2006-01-02 15:04:05 MST")
		}
		conditions = append(conditions, StatefulSetCondition{
			Type:               string(c.Type),
			Status:             string(c.Status),
			LastTransitionTime: transition,
			Reason:             c.Reason,
			Message:            c.Message,
		})
	}

	var images []string
	for _, c := range ss.Spec.Template.Spec.Containers {
		images = append(images, c.Image)
	}

	selector := make(map[string]string)
	if ss.Spec.Selector != nil {
		for k, v := range ss.Spec.Selector.MatchLabels {
			selector[k] = v
		}
	}

	var volumeClaimTemplates []VolumeClaimInfo
	for _, pvc := range ss.Spec.VolumeClaimTemplates {
		storageClass := ""
		if pvc.Spec.StorageClassName != nil {
			storageClass = *pvc.Spec.StorageClassName
		}

		var accessModes []string
		for _, am := range pvc.Spec.AccessModes {
			accessModes = append(accessModes, string(am))
		}

		storage := ""
		if qty, ok := pvc.Spec.Resources.Requests[corev1.ResourceStorage]; ok {
			storage = qty.String()
		}

		volumeClaimTemplates = append(volumeClaimTemplates, VolumeClaimInfo{
			Name:         pvc.Name,
			StorageClass: storageClass,
			AccessModes:  accessModes,
			Storage:      storage,
		})
	}

	updateStrategy := string(ss.Spec.UpdateStrategy.Type)
	var partition *int32
	if ss.Spec.UpdateStrategy.RollingUpdate != nil {
		partition = ss.Spec.UpdateStrategy.RollingUpdate.Partition
	}

	return &StatefulSetDetail{
		Name:                 ss.Name,
		Namespace:            ss.Namespace,
		UID:                  string(ss.UID),
		CreationTimestamp:    ss.CreationTimestamp.Format("2006-01-02 15:04:05 MST"),
		Labels:               ss.Labels,
		Annotations:          FilterAnnotations(ss.Annotations),
		Ready:                fmt.Sprintf("%d/%d", ss.Status.ReadyReplicas, desired),
		CurrentReplicas:      ss.Status.CurrentReplicas,
		UpdatedReplicas:      ss.Status.UpdatedReplicas,
		Age:                  age,
		UpdateStrategy:       updateStrategy,
		Partition:            partition,
		PodManagementPolicy:  string(ss.Spec.PodManagementPolicy),
		ServiceName:          ss.Spec.ServiceName,
		RevisionHistoryLimit: ss.Spec.RevisionHistoryLimit,
		MinReadySeconds:      ss.Spec.MinReadySeconds,
		Selector:             selector,
		VolumeClaimTemplates: volumeClaimTemplates,
		Conditions:           conditions,
		Images:               images,
	}, nil
}

// GetStatefulSetEvents returns events related to a specific statefulset.
func (c *Client) GetStatefulSetEvents(ctx context.Context, namespace, name string) ([]EventInfo, error) {
	fieldSelector := fields.AndSelectors(
		fields.OneTermEqualSelector("involvedObject.name", name),
		fields.OneTermEqualSelector("involvedObject.namespace", namespace),
		fields.OneTermEqualSelector("involvedObject.kind", "StatefulSet"),
	).String()

	eventList, err := c.clientset.CoreV1().Events(namespace).List(ctx, metav1.ListOptions{
		FieldSelector: fieldSelector,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to list events for statefulset %s/%s: %w", namespace, name, err)
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
