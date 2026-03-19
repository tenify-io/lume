package kube

// DaemonSetInfo represents a daemonset summary for list views.
type DaemonSetInfo struct {
	Name         string   `json:"name"`
	Namespace    string   `json:"namespace"`
	Desired      int32    `json:"desired"`
	Current      int32    `json:"current"`
	Ready        int32    `json:"ready"`
	UpToDate     int32    `json:"upToDate"`
	Available    int32    `json:"available"`
	Age          string   `json:"age"`
	NodeSelector string   `json:"nodeSelector"`
	Images       []string `json:"images"`
}

// DaemonSetDetail provides comprehensive information about a single daemonset.
type DaemonSetDetail struct {
	Name                 string               `json:"name"`
	Namespace            string               `json:"namespace"`
	UID                  string               `json:"uid"`
	CreationTimestamp    string               `json:"creationTimestamp"`
	Labels               map[string]string    `json:"labels"`
	Annotations          map[string]string    `json:"annotations"`
	Desired              int32                `json:"desired"`
	Current              int32                `json:"current"`
	Ready                int32                `json:"ready"`
	UpToDate             int32                `json:"upToDate"`
	Available            int32                `json:"available"`
	Age                  string               `json:"age"`
	UpdateStrategy       string               `json:"updateStrategy"`
	MinReadySeconds      int32                `json:"minReadySeconds"`
	RevisionHistoryLimit *int32               `json:"revisionHistoryLimit"`
	Selector             map[string]string    `json:"selector"`
	NodeSelector         map[string]string    `json:"nodeSelector"`
	Conditions           []DaemonSetCondition `json:"conditions"`
	Images               []string             `json:"images"`
}

// DaemonSetCondition represents a condition of a daemonset.
type DaemonSetCondition struct {
	Type               string `json:"type"`
	Status             string `json:"status"`
	LastTransitionTime string `json:"lastTransitionTime"`
	Reason             string `json:"reason"`
	Message            string `json:"message"`
}
