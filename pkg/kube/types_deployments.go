package kube

// DeploymentInfo represents a deployment summary for list views.
type DeploymentInfo struct {
	Name      string   `json:"name"`
	Namespace string   `json:"namespace"`
	Ready     string   `json:"ready"`
	UpToDate  int32    `json:"upToDate"`
	Available int32    `json:"available"`
	Age       string   `json:"age"`
	Strategy  string   `json:"strategy"`
	Images    []string `json:"images"`
}

// DeploymentDetail provides comprehensive information about a single deployment.
type DeploymentDetail struct {
	Name                 string                `json:"name"`
	Namespace            string                `json:"namespace"`
	UID                  string                `json:"uid"`
	CreationTimestamp    string                `json:"creationTimestamp"`
	Labels               map[string]string     `json:"labels"`
	Annotations          map[string]string     `json:"annotations"`
	Ready                string                `json:"ready"`
	UpToDate             int32                 `json:"upToDate"`
	Available            int32                 `json:"available"`
	Age                  string                `json:"age"`
	Strategy             string                `json:"strategy"`
	MinReadySeconds      int32                 `json:"minReadySeconds"`
	RevisionHistoryLimit *int32                `json:"revisionHistoryLimit"`
	Selector             map[string]string     `json:"selector"`
	MaxSurge             string                `json:"maxSurge"`
	MaxUnavailable       string                `json:"maxUnavailable"`
	Conditions           []DeploymentCondition `json:"conditions"`
	Images               []string              `json:"images"`
}

// DeploymentCondition represents a condition of a deployment.
type DeploymentCondition struct {
	Type               string `json:"type"`
	Status             string `json:"status"`
	LastTransitionTime string `json:"lastTransitionTime"`
	Reason             string `json:"reason"`
	Message            string `json:"message"`
}
