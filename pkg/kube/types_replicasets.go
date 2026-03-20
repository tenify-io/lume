package kube

// ReplicaSetInfo represents a replicaset summary for list views.
type ReplicaSetInfo struct {
	Name      string   `json:"name"`
	Namespace string   `json:"namespace"`
	Desired   int32    `json:"desired"`
	Current   int32    `json:"current"`
	Ready     int32    `json:"ready"`
	Age       string   `json:"age"`
	Owner     string   `json:"owner"`
	Images    []string `json:"images"`
}

// ReplicaSetDetail provides comprehensive information about a single replicaset.
type ReplicaSetDetail struct {
	Name              string                `json:"name"`
	Namespace         string                `json:"namespace"`
	UID               string                `json:"uid"`
	CreationTimestamp string                `json:"creationTimestamp"`
	Labels            map[string]string     `json:"labels"`
	Annotations       map[string]string     `json:"annotations"`
	Desired           int32                 `json:"desired"`
	Current           int32                 `json:"current"`
	Ready             int32                 `json:"ready"`
	Age               string                `json:"age"`
	Selector          map[string]string     `json:"selector"`
	OwnerReferences   []OwnerReference      `json:"ownerReferences"`
	Conditions        []ReplicaSetCondition `json:"conditions"`
	Images            []string              `json:"images"`
}

// ReplicaSetCondition represents a condition of a replicaset.
type ReplicaSetCondition struct {
	Type               string `json:"type"`
	Status             string `json:"status"`
	LastTransitionTime string `json:"lastTransitionTime"`
	Reason             string `json:"reason"`
	Message            string `json:"message"`
}

// OwnerReference represents an owner reference on a Kubernetes resource.
type OwnerReference struct {
	Kind string `json:"kind"`
	Name string `json:"name"`
}
