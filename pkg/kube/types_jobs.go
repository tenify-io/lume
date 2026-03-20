package kube

// JobInfo represents a job summary for list views.
type JobInfo struct {
	Name        string   `json:"name"`
	Namespace   string   `json:"namespace"`
	Completions string   `json:"completions"`
	Duration    string   `json:"duration"`
	Age         string   `json:"age"`
	Status      string   `json:"status"`
	Images      []string `json:"images"`
}

// JobDetail provides comprehensive information about a single job.
type JobDetail struct {
	Name                    string            `json:"name"`
	Namespace               string            `json:"namespace"`
	UID                     string            `json:"uid"`
	CreationTimestamp       string            `json:"creationTimestamp"`
	Labels                  map[string]string `json:"labels"`
	Annotations             map[string]string `json:"annotations"`
	Completions             string            `json:"completions"`
	Duration                string            `json:"duration"`
	Age                     string            `json:"age"`
	Status                  string            `json:"status"`
	Parallelism             *int32            `json:"parallelism"`
	BackoffLimit            *int32            `json:"backoffLimit"`
	ActiveDeadlineSeconds   *int64            `json:"activeDeadlineSeconds"`
	TTLSecondsAfterFinished *int32            `json:"ttlSecondsAfterFinished"`
	CompletionMode          string            `json:"completionMode"`
	Suspend                 bool              `json:"suspend"`
	Active                  int32             `json:"active"`
	Succeeded               int32             `json:"succeeded"`
	Failed                  int32             `json:"failed"`
	Owner                   string            `json:"owner"`
	Conditions              []JobCondition    `json:"conditions"`
	Images                  []string          `json:"images"`
}

// JobCondition represents a condition of a job.
type JobCondition struct {
	Type               string `json:"type"`
	Status             string `json:"status"`
	LastTransitionTime string `json:"lastTransitionTime"`
	Reason             string `json:"reason"`
	Message            string `json:"message"`
}
