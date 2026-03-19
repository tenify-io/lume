package kube

import (
	"fmt"
	"maps"
	"time"
)

// hiddenAnnotations are annotation keys excluded from detail views.
var hiddenAnnotations = []string{
	"kubectl.kubernetes.io/last-applied-configuration",
}

// FilterAnnotations returns a copy of the annotations map with noisy
// system annotations (e.g. last-applied-configuration) removed.
func FilterAnnotations(annotations map[string]string) map[string]string {
	if len(annotations) == 0 {
		return annotations
	}
	filtered := make(map[string]string, len(annotations))
	maps.Copy(filtered, annotations)
	for _, key := range hiddenAnnotations {
		delete(filtered, key)
	}
	return filtered
}

// FormatDuration formats a duration into a human-readable string (e.g. "3d", "5h", "12m").
func FormatDuration(d time.Duration) string {
	if d < time.Minute {
		return fmt.Sprintf("%ds", int(d.Seconds()))
	}
	if d < time.Hour {
		return fmt.Sprintf("%dm", int(d.Minutes()))
	}
	if d < 24*time.Hour {
		return fmt.Sprintf("%dh", int(d.Hours()))
	}
	days := int(d.Hours() / 24)
	return fmt.Sprintf("%dd", days)
}
