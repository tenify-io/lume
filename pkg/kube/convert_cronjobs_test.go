package kube

import (
	"testing"
	"time"

	batchv1 "k8s.io/api/batch/v1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func TestCronJobToCronJobInfo_Active(t *testing.T) {
	lastSchedule := metav1.NewTime(time.Now().Add(-2 * time.Minute))
	cj := &batchv1.CronJob{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "daily-backup",
			Namespace:         "default",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-48 * time.Hour)),
		},
		Spec: batchv1.CronJobSpec{
			Schedule: "0 2 * * *",
			Suspend:  ptrBool(false),
			JobTemplate: batchv1.JobTemplateSpec{
				Spec: batchv1.JobSpec{
					Template: corev1.PodTemplateSpec{
						Spec: corev1.PodSpec{
							Containers: []corev1.Container{
								{Image: "backup:v1"},
								{Image: "sidecar:latest"},
							},
						},
					},
				},
			},
		},
		Status: batchv1.CronJobStatus{
			Active: []corev1.ObjectReference{
				{Name: "daily-backup-123"},
			},
			LastScheduleTime: &lastSchedule,
		},
	}

	info := CronJobToCronJobInfo(cj)

	if info.Name != "daily-backup" {
		t.Errorf("Name = %q, want %q", info.Name, "daily-backup")
	}
	if info.Namespace != "default" {
		t.Errorf("Namespace = %q, want %q", info.Namespace, "default")
	}
	if info.Schedule != "0 2 * * *" {
		t.Errorf("Schedule = %q, want %q", info.Schedule, "0 2 * * *")
	}
	if info.Suspend {
		t.Error("Suspend = true, want false")
	}
	if info.Active != 1 {
		t.Errorf("Active = %d, want 1", info.Active)
	}
	if info.LastSchedule != "2m" {
		t.Errorf("LastSchedule = %q, want %q", info.LastSchedule, "2m")
	}
	if info.Age != "2d" {
		t.Errorf("Age = %q, want %q", info.Age, "2d")
	}
	if len(info.Images) != 2 || info.Images[0] != "backup:v1" || info.Images[1] != "sidecar:latest" {
		t.Errorf("Images = %v, want [backup:v1 sidecar:latest]", info.Images)
	}
}

func TestCronJobToCronJobInfo_Suspended(t *testing.T) {
	cj := &batchv1.CronJob{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "suspended-job",
			Namespace:         "batch",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-1 * time.Hour)),
		},
		Spec: batchv1.CronJobSpec{
			Schedule: "*/5 * * * *",
			Suspend:  ptrBool(true),
			JobTemplate: batchv1.JobTemplateSpec{
				Spec: batchv1.JobSpec{
					Template: corev1.PodTemplateSpec{
						Spec: corev1.PodSpec{
							Containers: []corev1.Container{
								{Image: "worker:v2"},
							},
						},
					},
				},
			},
		},
		Status: batchv1.CronJobStatus{},
	}

	info := CronJobToCronJobInfo(cj)

	if !info.Suspend {
		t.Error("Suspend = false, want true")
	}
	if info.Active != 0 {
		t.Errorf("Active = %d, want 0", info.Active)
	}
	if info.LastSchedule != "" {
		t.Errorf("LastSchedule = %q, want empty", info.LastSchedule)
	}
	if info.Age != "1h" {
		t.Errorf("Age = %q, want %q", info.Age, "1h")
	}
}

func TestCronJobToCronJobInfo_NilSuspend(t *testing.T) {
	cj := &batchv1.CronJob{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "nil-suspend",
			Namespace: "default",
		},
		Spec: batchv1.CronJobSpec{
			Schedule: "0 * * * *",
			JobTemplate: batchv1.JobTemplateSpec{
				Spec: batchv1.JobSpec{
					Template: corev1.PodTemplateSpec{
						Spec: corev1.PodSpec{
							Containers: []corev1.Container{
								{Image: "app:v1"},
							},
						},
					},
				},
			},
		},
	}

	info := CronJobToCronJobInfo(cj)

	if info.Suspend {
		t.Error("Suspend = true, want false for nil Suspend")
	}
}

func TestCronJobToCronJobInfo_ZeroTimestamp(t *testing.T) {
	cj := &batchv1.CronJob{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "no-time",
			Namespace: "default",
		},
		Spec: batchv1.CronJobSpec{
			Schedule: "0 0 * * *",
			JobTemplate: batchv1.JobTemplateSpec{
				Spec: batchv1.JobSpec{
					Template: corev1.PodTemplateSpec{
						Spec: corev1.PodSpec{
							Containers: []corev1.Container{
								{Image: "app:v1"},
							},
						},
					},
				},
			},
		},
	}

	info := CronJobToCronJobInfo(cj)

	if info.Age != "" {
		t.Errorf("Age = %q, want empty for zero timestamp", info.Age)
	}
	if info.LastSchedule != "" {
		t.Errorf("LastSchedule = %q, want empty for nil LastScheduleTime", info.LastSchedule)
	}
}

func TestConvertCronJob(t *testing.T) {
	cj := &batchv1.CronJob{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "test-cronjob",
			Namespace: "default",
		},
		Spec: batchv1.CronJobSpec{
			Schedule: "*/10 * * * *",
			JobTemplate: batchv1.JobTemplateSpec{
				Spec: batchv1.JobSpec{
					Template: corev1.PodTemplateSpec{
						Spec: corev1.PodSpec{
							Containers: []corev1.Container{
								{Image: "app:v1"},
							},
						},
					},
				},
			},
		},
	}

	result, ok := convertCronJob(cj)
	if !ok {
		t.Fatal("convertCronJob returned false")
	}
	info, ok := result.(CronJobInfo)
	if !ok {
		t.Fatal("result is not CronJobInfo")
	}
	if info.Name != "test-cronjob" {
		t.Errorf("Name = %q, want %q", info.Name, "test-cronjob")
	}
	if info.Schedule != "*/10 * * * *" {
		t.Errorf("Schedule = %q, want %q", info.Schedule, "*/10 * * * *")
	}
}

func TestCronJobToCronJobInfo_WithStartingDeadline(t *testing.T) {
	cj := &batchv1.CronJob{
		ObjectMeta: metav1.ObjectMeta{
			Name:              "deadline-job",
			Namespace:         "default",
			CreationTimestamp: metav1.NewTime(time.Now().Add(-1 * time.Hour)),
		},
		Spec: batchv1.CronJobSpec{
			Schedule:                   "*/30 * * * *",
			Suspend:                    ptrBool(false),
			StartingDeadlineSeconds:    ptrInt64(200),
			SuccessfulJobsHistoryLimit: ptrInt32(5),
			FailedJobsHistoryLimit:     ptrInt32(2),
			JobTemplate: batchv1.JobTemplateSpec{
				Spec: batchv1.JobSpec{
					Template: corev1.PodTemplateSpec{
						Spec: corev1.PodSpec{
							Containers: []corev1.Container{
								{Image: "worker:v3"},
							},
						},
					},
				},
			},
		},
	}

	info := CronJobToCronJobInfo(cj)

	if info.Name != "deadline-job" {
		t.Errorf("Name = %q, want %q", info.Name, "deadline-job")
	}
	if info.Schedule != "*/30 * * * *" {
		t.Errorf("Schedule = %q, want %q", info.Schedule, "*/30 * * * *")
	}
	if len(info.Images) != 1 || info.Images[0] != "worker:v3" {
		t.Errorf("Images = %v, want [worker:v3]", info.Images)
	}
}

func TestConvertCronJob_WrongType(t *testing.T) {
	_, ok := convertCronJob("not a cronjob")
	if ok {
		t.Error("expected convertCronJob to return false for wrong type")
	}
}
