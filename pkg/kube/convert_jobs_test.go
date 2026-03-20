package kube

import (
	"testing"
	"time"

	batchv1 "k8s.io/api/batch/v1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func TestJobToJobInfo_Complete(t *testing.T) {
	start := metav1.NewTime(time.Now().Add(-10 * time.Minute))
	end := metav1.NewTime(time.Now().Add(-5 * time.Minute))
	job := &batchv1.Job{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "data-import",
			Namespace:         "default",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-2 * time.Hour)),
		},
		Spec: batchv1.JobSpec{
			Completions: ptrInt32(3),
			Template: corev1.PodTemplateSpec{
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{
						{Image: "importer:v1"},
					},
				},
			},
		},
		Status: batchv1.JobStatus{
			Succeeded:      3,
			StartTime:      &start,
			CompletionTime: &end,
			Conditions: []batchv1.JobCondition{
				{Type: batchv1.JobComplete, Status: "True"},
			},
		},
	}

	info := JobToJobInfo(job)

	if info.Name != "data-import" {
		t.Errorf("Name = %q, want %q", info.Name, "data-import")
	}
	if info.Completions != "3/3" {
		t.Errorf("Completions = %q, want %q", info.Completions, "3/3")
	}
	if info.Status != "Complete" {
		t.Errorf("Status = %q, want %q", info.Status, "Complete")
	}
	if info.Duration != "5m" {
		t.Errorf("Duration = %q, want %q", info.Duration, "5m")
	}
	if info.Age != "2h" {
		t.Errorf("Age = %q, want %q", info.Age, "2h")
	}
	if len(info.Images) != 1 || info.Images[0] != "importer:v1" {
		t.Errorf("Images = %v, want [importer:v1]", info.Images)
	}
}

func TestJobToJobInfo_Running(t *testing.T) {
	start := metav1.NewTime(time.Now().Add(-3 * time.Minute))
	job := &batchv1.Job{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "long-task",
			Namespace:         "batch",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-5 * time.Minute)),
		},
		Spec: batchv1.JobSpec{
			Completions: ptrInt32(5),
			Template: corev1.PodTemplateSpec{
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{
						{Image: "worker:v2"},
					},
				},
			},
		},
		Status: batchv1.JobStatus{
			Active:    2,
			Succeeded: 1,
			StartTime: &start,
		},
	}

	info := JobToJobInfo(job)

	if info.Completions != "1/5" {
		t.Errorf("Completions = %q, want %q", info.Completions, "1/5")
	}
	if info.Status != "Running" {
		t.Errorf("Status = %q, want %q", info.Status, "Running")
	}
	if info.Duration != "3m" {
		t.Errorf("Duration = %q, want %q", info.Duration, "3m")
	}
}

func TestJobToJobInfo_Failed(t *testing.T) {
	job := &batchv1.Job{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "broken-job",
			Namespace:         "default",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-1 * time.Hour)),
		},
		Spec: batchv1.JobSpec{
			Template: corev1.PodTemplateSpec{
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{
						{Image: "app:v1"},
					},
				},
			},
		},
		Status: batchv1.JobStatus{
			Failed: 3,
			Conditions: []batchv1.JobCondition{
				{Type: batchv1.JobFailed, Status: "True"},
			},
		},
	}

	info := JobToJobInfo(job)

	if info.Status != "Failed" {
		t.Errorf("Status = %q, want %q", info.Status, "Failed")
	}
	if info.Completions != "0/1" {
		t.Errorf("Completions = %q, want %q", info.Completions, "0/1")
	}
}

func TestJobToJobInfo_NilCompletions(t *testing.T) {
	job := &batchv1.Job{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "one-shot",
			Namespace: "default",
		},
		Spec: batchv1.JobSpec{
			Template: corev1.PodTemplateSpec{
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{
						{Image: "task:v1"},
					},
				},
			},
		},
	}

	info := JobToJobInfo(job)

	if info.Completions != "0/1" {
		t.Errorf("Completions = %q, want %q", info.Completions, "0/1")
	}
}

func TestJobToJobInfo_ZeroTimestamp(t *testing.T) {
	job := &batchv1.Job{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "no-time",
			Namespace: "default",
		},
		Spec: batchv1.JobSpec{
			Template: corev1.PodTemplateSpec{
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{
						{Image: "app:v1"},
					},
				},
			},
		},
	}

	info := JobToJobInfo(job)

	if info.Age != "" {
		t.Errorf("Age = %q, want empty for zero timestamp", info.Age)
	}
	if info.Duration != "" {
		t.Errorf("Duration = %q, want empty when no start time", info.Duration)
	}
}

func TestConvertJob(t *testing.T) {
	job := &batchv1.Job{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "test-job",
			Namespace: "default",
		},
		Spec: batchv1.JobSpec{
			Template: corev1.PodTemplateSpec{
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{
						{Image: "app:v1"},
					},
				},
			},
		},
	}

	result, ok := convertJob(job)
	if !ok {
		t.Fatal("convertJob returned false")
	}
	info, ok := result.(JobInfo)
	if !ok {
		t.Fatal("result is not JobInfo")
	}
	if info.Name != "test-job" {
		t.Errorf("Name = %q, want %q", info.Name, "test-job")
	}
}

func TestConvertJob_WrongType(t *testing.T) {
	_, ok := convertJob("not a job")
	if ok {
		t.Error("expected convertJob to return false for wrong type")
	}
}
