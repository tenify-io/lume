package kube

// NodeInfo represents a node summary for list views.
type NodeInfo struct {
	Name             string            `json:"name"`
	Status           string            `json:"status"`
	Roles            string            `json:"roles"`
	Age              string            `json:"age"`
	KubeletVersion   string            `json:"kubeletVersion"`
	InternalIP       string            `json:"internalIP"`
	ExternalIP       string            `json:"externalIP"`
	OSImage          string            `json:"osImage"`
	ContainerRuntime string            `json:"containerRuntime"`
	Labels           map[string]string `json:"labels"`
}

// NodeDetail provides comprehensive information about a single node.
type NodeDetail struct {
	Name              string            `json:"name"`
	UID               string            `json:"uid"`
	CreationTimestamp string            `json:"creationTimestamp"`
	Labels            map[string]string `json:"labels"`
	Annotations       map[string]string `json:"annotations"`
	Status            string            `json:"status"`
	Roles             string            `json:"roles"`
	Age               string            `json:"age"`
	Addresses         []NodeAddress     `json:"addresses"`
	Conditions        []NodeCondition   `json:"conditions"`
	Capacity          NodeResources     `json:"capacity"`
	Allocatable       NodeResources     `json:"allocatable"`
	SystemInfo        NodeSystemInfo    `json:"systemInfo"`
	Taints            []NodeTaint       `json:"taints"`
	PodCIDR           string            `json:"podCIDR"`
	Images            []NodeImage       `json:"images"`
}

// NodeAddress represents a node network address.
type NodeAddress struct {
	Type    string `json:"type"`
	Address string `json:"address"`
}

// NodeCondition represents a condition of a node.
type NodeCondition struct {
	Type               string `json:"type"`
	Status             string `json:"status"`
	LastTransitionTime string `json:"lastTransitionTime"`
	Reason             string `json:"reason"`
	Message            string `json:"message"`
}

// NodeResources represents resource quantities on a node.
type NodeResources struct {
	CPU              string `json:"cpu"`
	Memory           string `json:"memory"`
	Pods             string `json:"pods"`
	EphemeralStorage string `json:"ephemeralStorage"`
}

// NodeSystemInfo contains system information about a node.
type NodeSystemInfo struct {
	MachineID               string `json:"machineID"`
	KernelVersion           string `json:"kernelVersion"`
	OSImage                 string `json:"osImage"`
	ContainerRuntimeVersion string `json:"containerRuntimeVersion"`
	KubeletVersion          string `json:"kubeletVersion"`
	OperatingSystem         string `json:"operatingSystem"`
	Architecture            string `json:"architecture"`
}

// NodeTaint represents a taint on a node.
type NodeTaint struct {
	Key    string `json:"key"`
	Value  string `json:"value"`
	Effect string `json:"effect"`
}

// NodeImage represents a container image cached on a node.
type NodeImage struct {
	Names     []string `json:"names"`
	SizeBytes int64    `json:"sizeBytes"`
}
