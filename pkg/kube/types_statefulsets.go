package kube

// StatefulSetInfo represents a statefulset summary for list views.
type StatefulSetInfo struct {
	Name        string   `json:"name"`
	Namespace   string   `json:"namespace"`
	Ready       string   `json:"ready"`
	ServiceName string   `json:"serviceName"`
	Age         string   `json:"age"`
	Images      []string `json:"images"`
}

// StatefulSetDetail provides comprehensive information about a single statefulset.
type StatefulSetDetail struct {
	Name                 string                 `json:"name"`
	Namespace            string                 `json:"namespace"`
	UID                  string                 `json:"uid"`
	CreationTimestamp    string                 `json:"creationTimestamp"`
	Labels               map[string]string      `json:"labels"`
	Annotations          map[string]string      `json:"annotations"`
	Ready                string                 `json:"ready"`
	CurrentReplicas      int32                  `json:"currentReplicas"`
	UpdatedReplicas      int32                  `json:"updatedReplicas"`
	Age                  string                 `json:"age"`
	UpdateStrategy       string                 `json:"updateStrategy"`
	Partition            *int32                 `json:"partition"`
	PodManagementPolicy  string                 `json:"podManagementPolicy"`
	ServiceName          string                 `json:"serviceName"`
	RevisionHistoryLimit *int32                 `json:"revisionHistoryLimit"`
	MinReadySeconds      int32                  `json:"minReadySeconds"`
	Selector             map[string]string      `json:"selector"`
	VolumeClaimTemplates []VolumeClaimInfo      `json:"volumeClaimTemplates"`
	Conditions           []StatefulSetCondition `json:"conditions"`
	Images               []string               `json:"images"`
}

// StatefulSetCondition represents a condition of a statefulset.
type StatefulSetCondition struct {
	Type               string `json:"type"`
	Status             string `json:"status"`
	LastTransitionTime string `json:"lastTransitionTime"`
	Reason             string `json:"reason"`
	Message            string `json:"message"`
}

// VolumeClaimInfo represents a PersistentVolumeClaim template in a statefulset.
type VolumeClaimInfo struct {
	Name         string   `json:"name"`
	StorageClass string   `json:"storageClass"`
	AccessModes  []string `json:"accessModes"`
	Storage      string   `json:"storage"`
}
