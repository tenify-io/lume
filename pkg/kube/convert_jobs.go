package kube

import (
	"fmt"

	batchv1 "k8s.io/api/batch/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// JobToJobInfo converts a Kubernetes Job object to a JobInfo summary.
func JobToJobInfo(job *batchv1.Job) JobInfo {
	age := ""
	if !job.CreationTimestamp.IsZero() {
		age = FormatDuration(metav1.Now().Sub(job.CreationTimestamp.Time))
	}

	var images []string
	for _, c := range job.Spec.Template.Spec.Containers {
		images = append(images, c.Image)
	}

	completions := formatJobCompletions(job)
	status := jobStatus(job)
	duration := jobDuration(job)

	return JobInfo{
		Name:        job.Name,
		Namespace:   job.Namespace,
		Completions: completions,
		Duration:    duration,
		Age:         age,
		Status:      status,
		Images:      images,
	}
}

// formatJobCompletions returns a "succeeded/total" string.
func formatJobCompletions(job *batchv1.Job) string {
	total := int32(1)
	if job.Spec.Completions != nil {
		total = *job.Spec.Completions
	}
	return fmt.Sprintf("%d/%d", job.Status.Succeeded, total)
}

// jobStatus determines the current status of a job.
func jobStatus(job *batchv1.Job) string {
	for _, c := range job.Status.Conditions {
		if c.Type == batchv1.JobComplete && c.Status == "True" {
			return "Complete"
		}
		if c.Type == batchv1.JobFailed && c.Status == "True" {
			return "Failed"
		}
		if c.Type == batchv1.JobSuspended && c.Status == "True" {
			return "Suspended"
		}
	}
	if job.Status.Active > 0 {
		return "Running"
	}
	return "Pending"
}

// jobDuration returns the wall-clock duration of a job.
func jobDuration(job *batchv1.Job) string {
	if job.Status.StartTime == nil {
		return ""
	}
	end := metav1.Now().Time
	if job.Status.CompletionTime != nil {
		end = job.Status.CompletionTime.Time
	}
	return FormatDuration(end.Sub(job.Status.StartTime.Time))
}

// convertJob is a ResourceConverter for Job objects.
func convertJob(obj any) (any, bool) {
	job, ok := obj.(*batchv1.Job)
	if !ok {
		return nil, false
	}
	return JobToJobInfo(job), true
}
