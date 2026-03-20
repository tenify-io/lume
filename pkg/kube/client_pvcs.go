package kube

import (
	"context"
	"fmt"
	"sort"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// GetPVCs returns persistent volume claims, optionally filtered by namespace ("" for all namespaces).
func (c *Client) GetPVCs(ctx context.Context, namespace string) ([]PVCInfo, error) {
	if namespace == "" {
		namespace = metav1.NamespaceAll
	}

	pvcList, err := c.clientset.CoreV1().PersistentVolumeClaims(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list persistent volume claims: %w", err)
	}

	var pvcs []PVCInfo
	for i := range pvcList.Items {
		pvcs = append(pvcs, PVCToPVCInfo(&pvcList.Items[i]))
	}

	sort.Slice(pvcs, func(i, j int) bool {
		if pvcs[i].Namespace != pvcs[j].Namespace {
			return pvcs[i].Namespace < pvcs[j].Namespace
		}
		return pvcs[i].Name < pvcs[j].Name
	})

	return pvcs, nil
}

// GetPVCDetail returns detailed information about a single persistent volume claim.
func (c *Client) GetPVCDetail(ctx context.Context, namespace, name string) (*PVCDetail, error) {
	pvc, err := c.clientset.CoreV1().PersistentVolumeClaims(namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get persistent volume claim %s/%s: %w", namespace, name, err)
	}

	age := ""
	if !pvc.CreationTimestamp.IsZero() {
		age = FormatDuration(metav1.Now().Sub(pvc.CreationTimestamp.Time))
	}

	var conditions []PVCCondition
	for _, c := range pvc.Status.Conditions {
		lastTransition := ""
		if !c.LastTransitionTime.IsZero() {
			lastTransition = c.LastTransitionTime.Format("2006-01-02 15:04:05 MST")
		}
		conditions = append(conditions, PVCCondition{
			Type:               string(c.Type),
			Status:             string(c.Status),
			LastTransitionTime: lastTransition,
			Reason:             c.Reason,
			Message:            c.Message,
		})
	}

	return &PVCDetail{
		Name:              pvc.Name,
		Namespace:         pvc.Namespace,
		UID:               string(pvc.UID),
		CreationTimestamp: pvc.CreationTimestamp.Format("2006-01-02 15:04:05 MST"),
		Labels:            pvc.Labels,
		Annotations:       FilterAnnotations(pvc.Annotations),
		Status:            string(pvc.Status.Phase),
		Volume:            pvc.Spec.VolumeName,
		Capacity:          pvcCapacity(pvc),
		AccessModes:       pvcAccessModes(pvc),
		StorageClass:      pvcStorageClass(pvc),
		VolumeMode:        pvcVolumeMode(pvc),
		DataSource:        pvcDataSource(pvc),
		Conditions:        conditions,
		Age:               age,
	}, nil
}

// GetPVCEvents returns events related to a specific persistent volume claim.
func (c *Client) GetPVCEvents(ctx context.Context, namespace, name string) ([]EventInfo, error) {
	return c.ListEvents(ctx, namespace, name, "PersistentVolumeClaim")
}
