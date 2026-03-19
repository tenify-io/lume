package kube

import (
	"fmt"

	appsv1 "k8s.io/api/apps/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// StatefulSetToStatefulSetInfo converts a Kubernetes StatefulSet object to a StatefulSetInfo summary.
func StatefulSetToStatefulSetInfo(ss *appsv1.StatefulSet) StatefulSetInfo {
	age := ""
	if !ss.CreationTimestamp.IsZero() {
		age = FormatDuration(metav1.Now().Sub(ss.CreationTimestamp.Time))
	}

	desired := int32(1)
	if ss.Spec.Replicas != nil {
		desired = *ss.Spec.Replicas
	}

	var images []string
	for _, c := range ss.Spec.Template.Spec.Containers {
		images = append(images, c.Image)
	}

	return StatefulSetInfo{
		Name:        ss.Name,
		Namespace:   ss.Namespace,
		Ready:       fmt.Sprintf("%d/%d", ss.Status.ReadyReplicas, desired),
		ServiceName: ss.Spec.ServiceName,
		Age:         age,
		Images:      images,
	}
}

// convertStatefulSet is a ResourceConverter for StatefulSet objects.
func convertStatefulSet(obj interface{}) (interface{}, bool) {
	ss, ok := obj.(*appsv1.StatefulSet)
	if !ok {
		return nil, false
	}
	return StatefulSetToStatefulSetInfo(ss), true
}
