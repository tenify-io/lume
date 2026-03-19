package kube

import (
	"testing"
	"time"
)

func TestFormatDuration(t *testing.T) {
	tests := []struct {
		input time.Duration
		want  string
	}{
		{30 * time.Second, "30s"},
		{5 * time.Minute, "5m"},
		{3 * time.Hour, "3h"},
		{48 * time.Hour, "2d"},
		{72 * 24 * time.Hour, "72d"},
	}

	for _, tt := range tests {
		got := FormatDuration(tt.input)
		if got != tt.want {
			t.Errorf("FormatDuration(%v) = %q, want %q", tt.input, got, tt.want)
		}
	}
}

func TestFilterAnnotations_RemovesLastAppliedConfig(t *testing.T) {
	annotations := map[string]string{
		"app.kubernetes.io/name":                           "myapp",
		"kubectl.kubernetes.io/last-applied-configuration": `{"kind":"Deployment"...}`,
		"note": "important",
	}

	filtered := FilterAnnotations(annotations)

	if _, ok := filtered["kubectl.kubernetes.io/last-applied-configuration"]; ok {
		t.Error("expected last-applied-configuration to be removed")
	}
	if filtered["app.kubernetes.io/name"] != "myapp" {
		t.Error("expected other annotations to be preserved")
	}
	if filtered["note"] != "important" {
		t.Error("expected other annotations to be preserved")
	}
}

func TestFilterAnnotations_DoesNotMutateOriginal(t *testing.T) {
	annotations := map[string]string{
		"kubectl.kubernetes.io/last-applied-configuration": `{}`,
		"keep": "this",
	}

	FilterAnnotations(annotations)

	if _, ok := annotations["kubectl.kubernetes.io/last-applied-configuration"]; !ok {
		t.Error("original map should not be mutated")
	}
}

func TestFilterAnnotations_NilAndEmpty(t *testing.T) {
	if result := FilterAnnotations(nil); result != nil {
		t.Errorf("expected nil, got %v", result)
	}
	if result := FilterAnnotations(map[string]string{}); len(result) != 0 {
		t.Errorf("expected empty map, got %v", result)
	}
}
