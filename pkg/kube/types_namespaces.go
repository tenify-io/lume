package kube

// NamespaceInfo represents a namespace summary for list views.
type NamespaceInfo struct {
	Name   string            `json:"name"`
	Status string            `json:"status"`
	Age    string            `json:"age"`
	Labels map[string]string `json:"labels"`
}

// NamespaceDetail provides comprehensive information about a single namespace.
type NamespaceDetail struct {
	Name              string               `json:"name"`
	Status            string               `json:"status"`
	Age               string               `json:"age"`
	UID               string               `json:"uid"`
	CreationTimestamp string               `json:"creationTimestamp"`
	Labels            map[string]string    `json:"labels"`
	Annotations       map[string]string    `json:"annotations"`
	Conditions        []NamespaceCondition `json:"conditions"`
}

// NamespaceCondition represents a condition of a namespace.
type NamespaceCondition struct {
	Type               string `json:"type"`
	Status             string `json:"status"`
	LastTransitionTime string `json:"lastTransitionTime"`
	Reason             string `json:"reason"`
	Message            string `json:"message"`
}

// NamespaceResourceSummary contains resource counts within a namespace.
type NamespaceResourceSummary struct {
	Pods         int `json:"pods"`
	Deployments  int `json:"deployments"`
	StatefulSets int `json:"statefulSets"`
	DaemonSets   int `json:"daemonSets"`
	Jobs         int `json:"jobs"`
	CronJobs     int `json:"cronJobs"`
	Services     int `json:"services"`
	ConfigMaps   int `json:"configMaps"`
	Secrets      int `json:"secrets"`
}
