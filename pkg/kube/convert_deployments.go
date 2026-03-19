package kube

import (
	"fmt"

	appsv1 "k8s.io/api/apps/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// DeploymentToDeploymentInfo converts a Kubernetes Deployment object to a DeploymentInfo summary.
func DeploymentToDeploymentInfo(dep *appsv1.Deployment) DeploymentInfo {
	age := ""
	if !dep.CreationTimestamp.IsZero() {
		age = FormatDuration(metav1.Now().Sub(dep.CreationTimestamp.Time))
	}

	desired := int32(1)
	if dep.Spec.Replicas != nil {
		desired = *dep.Spec.Replicas
	}

	var images []string
	for _, c := range dep.Spec.Template.Spec.Containers {
		images = append(images, c.Image)
	}

	return DeploymentInfo{
		Name:      dep.Name,
		Namespace: dep.Namespace,
		Ready:     fmt.Sprintf("%d/%d", dep.Status.ReadyReplicas, desired),
		UpToDate:  dep.Status.UpdatedReplicas,
		Available: dep.Status.AvailableReplicas,
		Age:       age,
		Strategy:  string(dep.Spec.Strategy.Type),
		Images:    images,
	}
}

// convertDeployment is a ResourceConverter for Deployment objects.
func convertDeployment(obj interface{}) (interface{}, bool) {
	dep, ok := obj.(*appsv1.Deployment)
	if !ok {
		return nil, false
	}
	return DeploymentToDeploymentInfo(dep), true
}
