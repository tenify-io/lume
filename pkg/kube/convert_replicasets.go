package kube

import (
	appsv1 "k8s.io/api/apps/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// ReplicaSetToReplicaSetInfo converts a Kubernetes ReplicaSet object to a ReplicaSetInfo summary.
func ReplicaSetToReplicaSetInfo(rs *appsv1.ReplicaSet) ReplicaSetInfo {
	age := ""
	if !rs.CreationTimestamp.IsZero() {
		age = FormatDuration(metav1.Now().Sub(rs.CreationTimestamp.Time))
	}

	var images []string
	for _, c := range rs.Spec.Template.Spec.Containers {
		images = append(images, c.Image)
	}

	owner := ""
	for _, ref := range rs.OwnerReferences {
		if ref.Kind == "Deployment" {
			owner = ref.Name
			break
		}
	}

	return ReplicaSetInfo{
		Name:      rs.Name,
		Namespace: rs.Namespace,
		Desired:   derefInt32(rs.Spec.Replicas),
		Current:   rs.Status.Replicas,
		Ready:     rs.Status.ReadyReplicas,
		Age:       age,
		Owner:     owner,
		Images:    images,
	}
}

// derefInt32 safely dereferences an *int32, returning 1 if nil.
func derefInt32(p *int32) int32 {
	if p != nil {
		return *p
	}
	return 1
}

// convertReplicaSet is a ResourceConverter for ReplicaSet objects.
func convertReplicaSet(obj any) (any, bool) {
	rs, ok := obj.(*appsv1.ReplicaSet)
	if !ok {
		return nil, false
	}
	return ReplicaSetToReplicaSetInfo(rs), true
}
