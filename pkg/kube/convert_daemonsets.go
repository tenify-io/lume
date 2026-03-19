package kube

import (
	"fmt"
	"sort"
	"strings"

	appsv1 "k8s.io/api/apps/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// DaemonSetToDaemonSetInfo converts a Kubernetes DaemonSet object to a DaemonSetInfo summary.
func DaemonSetToDaemonSetInfo(ds *appsv1.DaemonSet) DaemonSetInfo {
	age := ""
	if !ds.CreationTimestamp.IsZero() {
		age = FormatDuration(metav1.Now().Sub(ds.CreationTimestamp.Time))
	}

	var images []string
	for _, c := range ds.Spec.Template.Spec.Containers {
		images = append(images, c.Image)
	}

	nodeSelector := formatNodeSelector(ds.Spec.Template.Spec.NodeSelector)

	return DaemonSetInfo{
		Name:         ds.Name,
		Namespace:    ds.Namespace,
		Desired:      ds.Status.DesiredNumberScheduled,
		Current:      ds.Status.CurrentNumberScheduled,
		Ready:        ds.Status.NumberReady,
		UpToDate:     ds.Status.UpdatedNumberScheduled,
		Available:    ds.Status.NumberAvailable,
		Age:          age,
		NodeSelector: nodeSelector,
		Images:       images,
	}
}

// formatNodeSelector converts a map of node selectors to a compact "key=value,..." string.
func formatNodeSelector(sel map[string]string) string {
	if len(sel) == 0 {
		return ""
	}
	pairs := make([]string, 0, len(sel))
	for k, v := range sel {
		pairs = append(pairs, fmt.Sprintf("%s=%s", k, v))
	}
	sort.Strings(pairs)
	return strings.Join(pairs, ",")
}

// convertDaemonSet is a ResourceConverter for DaemonSet objects.
func convertDaemonSet(obj any) (any, bool) {
	ds, ok := obj.(*appsv1.DaemonSet)
	if !ok {
		return nil, false
	}
	return DaemonSetToDaemonSetInfo(ds), true
}
