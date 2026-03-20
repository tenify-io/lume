package kube

import (
	"context"
	"fmt"
	"sort"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/fields"
)

// GetPersistentVolumes returns all persistent volumes in the cluster.
func (c *Client) GetPersistentVolumes(ctx context.Context) ([]PersistentVolumeInfo, error) {
	pvList, err := c.clientset.CoreV1().PersistentVolumes().List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list persistent volumes: %w", err)
	}

	var pvs []PersistentVolumeInfo
	for i := range pvList.Items {
		pvs = append(pvs, PVToPVInfo(&pvList.Items[i]))
	}

	sort.Slice(pvs, func(i, j int) bool {
		return pvs[i].Name < pvs[j].Name
	})

	return pvs, nil
}

// GetPersistentVolumeDetail returns detailed information about a single persistent volume.
func (c *Client) GetPersistentVolumeDetail(ctx context.Context, name string) (*PersistentVolumeDetail, error) {
	pv, err := c.clientset.CoreV1().PersistentVolumes().Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get persistent volume %s: %w", name, err)
	}

	age := ""
	if !pv.CreationTimestamp.IsZero() {
		age = FormatDuration(metav1.Now().Sub(pv.CreationTimestamp.Time))
	}

	return &PersistentVolumeDetail{
		Name:              pv.Name,
		UID:               string(pv.UID),
		CreationTimestamp: pv.CreationTimestamp.Format("2006-01-02 15:04:05 MST"),
		Labels:            pv.Labels,
		Annotations:       FilterAnnotations(pv.Annotations),
		Capacity:          pvCapacity(pv),
		AccessModes:       pvAccessModes(pv.Spec.AccessModes),
		ReclaimPolicy:     string(pv.Spec.PersistentVolumeReclaimPolicy),
		Status:            string(pv.Status.Phase),
		Claim:             pvClaim(pv),
		StorageClass:      pv.Spec.StorageClassName,
		VolumeMode:        pvVolumeMode(pv),
		Source:            pvSource(pv),
		MountOptions:      pv.Spec.MountOptions,
		Age:               age,
	}, nil
}

// GetPersistentVolumeEvents returns events related to a specific persistent volume.
func (c *Client) GetPersistentVolumeEvents(ctx context.Context, name string) ([]EventInfo, error) {
	fieldSelector := fields.AndSelectors(
		fields.OneTermEqualSelector("involvedObject.name", name),
		fields.OneTermEqualSelector("involvedObject.kind", "PersistentVolume"),
	).String()

	eventList, err := c.clientset.CoreV1().Events("").List(ctx, metav1.ListOptions{
		FieldSelector: fieldSelector,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to list events for persistent volume %s: %w", name, err)
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
