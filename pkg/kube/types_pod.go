package kube

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

// PodDetail provides comprehensive information about a single pod.
type PodDetail struct {
	Name               string            `json:"name"`
	Namespace          string            `json:"namespace"`
	UID                string            `json:"uid"`
	CreationTimestamp  string            `json:"creationTimestamp"`
	Labels             map[string]string `json:"labels"`
	Annotations        map[string]string `json:"annotations"`
	Status             string            `json:"status"`
	Ready              string            `json:"ready"`
	Restarts           int32             `json:"restarts"`
	Age                string            `json:"age"`
	NodeName           string            `json:"nodeName"`
	IP                 string            `json:"ip"`
	HostIP             string            `json:"hostIP"`
	StartTime          string            `json:"startTime"`
	QOSClass           string            `json:"qosClass"`
	ServiceAccountName string            `json:"serviceAccountName"`
	RestartPolicy      string            `json:"restartPolicy"`
	Conditions         []PodCondition    `json:"conditions"`
	InitContainers     []ContainerDetail `json:"initContainers"`
	Containers         []ContainerDetail `json:"containers"`
	Volumes            []Volume          `json:"volumes"`
}

// PodCondition represents a condition of a pod.
type PodCondition struct {
	Type               string `json:"type"`
	Status             string `json:"status"`
	LastTransitionTime string `json:"lastTransitionTime"`
	Reason             string `json:"reason"`
	Message            string `json:"message"`
}

// ContainerDetail provides detailed information about a container.
type ContainerDetail struct {
	Name         string            `json:"name"`
	Image        string            `json:"image"`
	Ready        bool              `json:"ready"`
	State        string            `json:"state"`
	StateDetail  string            `json:"stateDetail"`
	RestartCount int32             `json:"restartCount"`
	Ports        []ContainerPort   `json:"ports"`
	Resources    ContainerResource `json:"resources"`
	VolumeMounts []VolumeMount     `json:"volumeMounts"`
}

// ContainerPort represents a port exposed by a container.
type ContainerPort struct {
	Name          string `json:"name"`
	ContainerPort int32  `json:"containerPort"`
	Protocol      string `json:"protocol"`
}

// ContainerResource holds resource requests and limits.
type ContainerResource struct {
	CPURequest    string `json:"cpuRequest"`
	CPULimit      string `json:"cpuLimit"`
	MemoryRequest string `json:"memoryRequest"`
	MemoryLimit   string `json:"memoryLimit"`
}

// VolumeMount represents a volume mount in a container.
type VolumeMount struct {
	Name      string `json:"name"`
	MountPath string `json:"mountPath"`
	ReadOnly  bool   `json:"readOnly"`
}

// Volume represents a pod-level volume definition.
type Volume struct {
	Name   string `json:"name"`
	Type   string `json:"type"`
	Source string `json:"source"`
}
