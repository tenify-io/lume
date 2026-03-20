package kube

import (
	"context"
	"fmt"
	"sort"
	"time"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// GetCronJobs returns cronjobs, optionally filtered by namespace ("" for all namespaces).
func (c *Client) GetCronJobs(ctx context.Context, namespace string) ([]CronJobInfo, error) {
	if namespace == "" {
		namespace = metav1.NamespaceAll
	}

	cronJobList, err := c.clientset.BatchV1().CronJobs(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list cronjobs: %w", err)
	}

	var cronJobs []CronJobInfo
	for i := range cronJobList.Items {
		cronJobs = append(cronJobs, CronJobToCronJobInfo(&cronJobList.Items[i]))
	}

	sort.Slice(cronJobs, func(i, j int) bool {
		if cronJobs[i].Namespace != cronJobs[j].Namespace {
			return cronJobs[i].Namespace < cronJobs[j].Namespace
		}
		return cronJobs[i].Name < cronJobs[j].Name
	})

	return cronJobs, nil
}

// GetCronJobDetail returns detailed information about a single cronjob.
func (c *Client) GetCronJobDetail(ctx context.Context, namespace, name string) (*CronJobDetail, error) {
	job, err := c.clientset.BatchV1().CronJobs(namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get cronjob %s/%s: %w", namespace, name, err)
	}

	age := ""
	if !job.CreationTimestamp.IsZero() {
		age = FormatDuration(metav1.Now().Sub(job.CreationTimestamp.Time))
	}

	var images []string
	for _, c := range job.Spec.JobTemplate.Spec.Template.Spec.Containers {
		images = append(images, c.Image)
	}

	lastSchedule := ""
	if job.Status.LastScheduleTime != nil && !job.Status.LastScheduleTime.IsZero() {
		lastSchedule = FormatDuration(time.Since(job.Status.LastScheduleTime.Time))
	}

	suspend := false
	if job.Spec.Suspend != nil {
		suspend = *job.Spec.Suspend
	}

	return &CronJobDetail{
		Name:                       job.Name,
		Namespace:                  job.Namespace,
		UID:                        string(job.UID),
		CreationTimestamp:          job.CreationTimestamp.Format("2006-01-02 15:04:05 MST"),
		Labels:                     job.Labels,
		Annotations:                FilterAnnotations(job.Annotations),
		Schedule:                   job.Spec.Schedule,
		Suspend:                    suspend,
		Active:                     int32(len(job.Status.Active)),
		LastSchedule:               lastSchedule,
		Age:                        age,
		ConcurrencyPolicy:          string(job.Spec.ConcurrencyPolicy),
		SuccessfulJobsHistoryLimit: job.Spec.SuccessfulJobsHistoryLimit,
		FailedJobsHistoryLimit:     job.Spec.FailedJobsHistoryLimit,
		StartingDeadlineSeconds:    job.Spec.StartingDeadlineSeconds,
		Images:                     images,
	}, nil
}

// GetCronJobEvents returns events related to a specific cronjob.
func (c *Client) GetCronJobEvents(ctx context.Context, namespace, name string) ([]EventInfo, error) {
	return c.ListEvents(ctx, namespace, name, "CronJob")
}
