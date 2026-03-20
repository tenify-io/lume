package kube

import (
	"context"
	"fmt"
	"sort"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// GetJobs returns jobs, optionally filtered by namespace ("" for all namespaces).
func (c *Client) GetJobs(ctx context.Context, namespace string) ([]JobInfo, error) {
	if namespace == "" {
		namespace = metav1.NamespaceAll
	}

	jobList, err := c.clientset.BatchV1().Jobs(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list jobs: %w", err)
	}

	var jobs []JobInfo
	for i := range jobList.Items {
		jobs = append(jobs, JobToJobInfo(&jobList.Items[i]))
	}

	sort.Slice(jobs, func(i, j int) bool {
		if jobs[i].Namespace != jobs[j].Namespace {
			return jobs[i].Namespace < jobs[j].Namespace
		}
		return jobs[i].Name < jobs[j].Name
	})

	return jobs, nil
}

// GetJobDetail returns detailed information about a single job.
func (c *Client) GetJobDetail(ctx context.Context, namespace, name string) (*JobDetail, error) {
	job, err := c.clientset.BatchV1().Jobs(namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get job %s/%s: %w", namespace, name, err)
	}

	age := ""
	if !job.CreationTimestamp.IsZero() {
		age = FormatDuration(metav1.Now().Sub(job.CreationTimestamp.Time))
	}

	var conditions []JobCondition
	for _, c := range job.Status.Conditions {
		transition := ""
		if !c.LastTransitionTime.IsZero() {
			transition = c.LastTransitionTime.Format("2006-01-02 15:04:05 MST")
		}
		conditions = append(conditions, JobCondition{
			Type:               string(c.Type),
			Status:             string(c.Status),
			LastTransitionTime: transition,
			Reason:             c.Reason,
			Message:            c.Message,
		})
	}

	var images []string
	for _, c := range job.Spec.Template.Spec.Containers {
		images = append(images, c.Image)
	}

	owner := ""
	for _, ref := range job.OwnerReferences {
		if ref.Kind == "CronJob" {
			owner = ref.Name
			break
		}
	}

	completionMode := ""
	if job.Spec.CompletionMode != nil {
		completionMode = string(*job.Spec.CompletionMode)
	}

	suspend := false
	if job.Spec.Suspend != nil {
		suspend = *job.Spec.Suspend
	}

	return &JobDetail{
		Name:                    job.Name,
		Namespace:               job.Namespace,
		UID:                     string(job.UID),
		CreationTimestamp:       job.CreationTimestamp.Format("2006-01-02 15:04:05 MST"),
		Labels:                  job.Labels,
		Annotations:             FilterAnnotations(job.Annotations),
		Completions:             formatJobCompletions(job),
		Duration:                jobDuration(job),
		Age:                     age,
		Status:                  jobStatus(job),
		Parallelism:             job.Spec.Parallelism,
		BackoffLimit:            job.Spec.BackoffLimit,
		ActiveDeadlineSeconds:   job.Spec.ActiveDeadlineSeconds,
		TTLSecondsAfterFinished: job.Spec.TTLSecondsAfterFinished,
		CompletionMode:          completionMode,
		Suspend:                 suspend,
		Active:                  job.Status.Active,
		Succeeded:               job.Status.Succeeded,
		Failed:                  job.Status.Failed,
		Owner:                   owner,
		Conditions:              conditions,
		Images:                  images,
	}, nil
}

// GetJobEvents returns events related to a specific job.
func (c *Client) GetJobEvents(ctx context.Context, namespace, name string) ([]EventInfo, error) {
	return c.ListEvents(ctx, namespace, name, "Job")
}
