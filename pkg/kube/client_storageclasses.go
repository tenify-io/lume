package kube

import (
	"context"
	"fmt"
	"sort"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// GetStorageClasses returns all storage classes in the cluster.
func (c *Client) GetStorageClasses(ctx context.Context) ([]StorageClassInfo, error) {
	scList, err := c.clientset.StorageV1().StorageClasses().List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list storage classes: %w", err)
	}

	var scs []StorageClassInfo
	for i := range scList.Items {
		scs = append(scs, StorageClassToStorageClassInfo(&scList.Items[i]))
	}

	sort.Slice(scs, func(i, j int) bool {
		return scs[i].Name < scs[j].Name
	})

	return scs, nil
}

// GetStorageClassDetail returns detailed information about a single storage class.
func (c *Client) GetStorageClassDetail(ctx context.Context, name string) (*StorageClassDetail, error) {
	sc, err := c.clientset.StorageV1().StorageClasses().Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get storage class %s: %w", name, err)
	}

	age := ""
	if !sc.CreationTimestamp.IsZero() {
		age = FormatDuration(metav1.Now().Sub(sc.CreationTimestamp.Time))
	}

	return &StorageClassDetail{
		Name:                 sc.Name,
		UID:                  string(sc.UID),
		CreationTimestamp:    sc.CreationTimestamp.Format("2006-01-02 15:04:05 MST"),
		Labels:               sc.Labels,
		Annotations:          FilterAnnotations(sc.Annotations),
		Provisioner:          sc.Provisioner,
		ReclaimPolicy:        scReclaimPolicy(sc),
		VolumeBindingMode:    scVolumeBindingMode(sc),
		AllowVolumeExpansion: scAllowVolumeExpansion(sc),
		Parameters:           sc.Parameters,
		MountOptions:         sc.MountOptions,
		AllowedTopologies:    scAllowedTopologies(sc),
		Age:                  age,
		IsDefault:            scIsDefault(sc),
	}, nil
}
