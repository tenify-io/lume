package kube

// CronJobInfo represents a cronjob summary for list views.
type CronJobInfo struct {
	Name         string   `json:"name"`
	Namespace    string   `json:"namespace"`
	Schedule     string   `json:"schedule"`
	Suspend      bool     `json:"suspend"`
	Active       int32    `json:"active"`
	LastSchedule string   `json:"lastSchedule"`
	Age          string   `json:"age"`
	Images       []string `json:"images"`
}

// CronJobDetail provides comprehensive information about a single cronjob.
type CronJobDetail struct {
	Name                       string            `json:"name"`
	Namespace                  string            `json:"namespace"`
	UID                        string            `json:"uid"`
	CreationTimestamp          string            `json:"creationTimestamp"`
	Labels                     map[string]string `json:"labels"`
	Annotations                map[string]string `json:"annotations"`
	Schedule                   string            `json:"schedule"`
	Suspend                    bool              `json:"suspend"`
	Active                     int32             `json:"active"`
	LastSchedule               string            `json:"lastSchedule"`
	Age                        string            `json:"age"`
	ConcurrencyPolicy          string            `json:"concurrencyPolicy"`
	SuccessfulJobsHistoryLimit *int32            `json:"successfulJobsHistoryLimit"`
	FailedJobsHistoryLimit     *int32            `json:"failedJobsHistoryLimit"`
	StartingDeadlineSeconds    *int64            `json:"startingDeadlineSeconds"`
	Images                     []string          `json:"images"`
}
