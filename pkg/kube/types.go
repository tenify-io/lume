package kube

// Context represents a kubeconfig context.
type Context struct {
	Name    string `json:"name"`
	Cluster string `json:"cluster"`
	User    string `json:"user"`
}

// PodInfo represents a pod.
type PodInfo struct {
	Name       string            `json:"name"`
	Namespace  string            `json:"namespace"`
	Status     string            `json:"status"`
	Ready      string            `json:"ready"`
	Restarts   int32             `json:"restarts"`
	Age        string            `json:"age"`
	Labels     map[string]string `json:"labels"`
	NodeName   string            `json:"nodeName"`
	IP         string            `json:"ip"`
	Containers []ContainerInfo   `json:"containers"`
}

// ContainerInfo represents a container within a pod.
type ContainerInfo struct {
	Name  string `json:"name"`
	Image string `json:"image"`
	Ready bool   `json:"ready"`
	State string `json:"state"`
}
