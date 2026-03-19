package kube

// Context represents a kubeconfig context.
type Context struct {
	Name    string `json:"name"`
	Cluster string `json:"cluster"`
	User    string `json:"user"`
}

// ClusterHealth represents the result of a cluster health check.
type ClusterHealth struct {
	Connected     bool   `json:"connected"`
	LatencyMs     int64  `json:"latencyMs"`
	ServerVersion string `json:"serverVersion"`
	Error         string `json:"error"`
}

// EventInfo represents a Kubernetes event.
type EventInfo struct {
	Type           string `json:"type"`
	Reason         string `json:"reason"`
	Message        string `json:"message"`
	Source         string `json:"source"`
	Count          int32  `json:"count"`
	FirstTimestamp string `json:"firstTimestamp"`
	LastTimestamp  string `json:"lastTimestamp"`
	Age            string `json:"age"`
}
