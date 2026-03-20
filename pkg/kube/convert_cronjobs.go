package kube

import (
	"time"

	batchv1 "k8s.io/api/batch/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// CronJobToCronJobInfo converts a Kubernetes CronJob object to a CronJobInfo summary.
func CronJobToCronJobInfo(job *batchv1.CronJob) CronJobInfo {
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

	return CronJobInfo{
		Name:         job.Name,
		Namespace:    job.Namespace,
		Schedule:     job.Spec.Schedule,
		Suspend:      suspend,
		Active:       int32(len(job.Status.Active)),
		LastSchedule: lastSchedule,
		Age:          age,
		Images:       images,
	}
}

// convertCronJob is a ResourceConverter for CronJob objects.
func convertCronJob(obj any) (any, bool) {
	job, ok := obj.(*batchv1.CronJob)
	if !ok {
		return nil, false
	}
	return CronJobToCronJobInfo(job), true
}
