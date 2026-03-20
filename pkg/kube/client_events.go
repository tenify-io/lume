package kube

import (
	"context"
	"fmt"
	"sort"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/fields"
)

// ListEvents returns events for a specific resource identified by namespace, name, and kind.
// For cluster-scoped resources (Nodes, Namespaces, PersistentVolumes), pass namespace as "".
func (c *Client) ListEvents(ctx context.Context, namespace, name, kind string) ([]EventInfo, error) {
	selectors := []fields.Selector{
		fields.OneTermEqualSelector("involvedObject.name", name),
		fields.OneTermEqualSelector("involvedObject.kind", kind),
	}
	if namespace != "" {
		selectors = append(selectors, fields.OneTermEqualSelector("involvedObject.namespace", namespace))
	}
	fieldSelector := fields.AndSelectors(selectors...).String()

	eventList, err := c.clientset.CoreV1().Events(namespace).List(ctx, metav1.ListOptions{
		FieldSelector: fieldSelector,
	})
	if err != nil {
		qualifiedName := name
		if namespace != "" {
			qualifiedName = namespace + "/" + name
		}
		return nil, fmt.Errorf("failed to list events for %s %s: %w", kind, qualifiedName, err)
	}

	var events []EventInfo
	for _, e := range eventList.Items {
		firstSeen := ""
		if !e.FirstTimestamp.IsZero() {
			firstSeen = e.FirstTimestamp.Format("2006-01-02 15:04:05 MST")
		}
		lastSeen := ""
		age := ""
		if !e.LastTimestamp.IsZero() {
			lastSeen = e.LastTimestamp.Format("2006-01-02 15:04:05 MST")
			age = FormatDuration(metav1.Now().Sub(e.LastTimestamp.Time))
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
			Age:            age,
		})
	}

	sort.Slice(events, func(i, j int) bool {
		return events[i].LastTimestamp > events[j].LastTimestamp
	})

	return events, nil
}
