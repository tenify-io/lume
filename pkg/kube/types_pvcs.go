package kube

// PVCInfo represents a persistent volume claim summary for list views.
type PVCInfo struct {
	Name         string `json:"name"`
	Namespace    string `json:"namespace"`
	Status       string `json:"status"`
	Volume       string `json:"volume"`
	Capacity     string `json:"capacity"`
	AccessModes  string `json:"accessModes"`
	StorageClass string `json:"storageClass"`
	VolumeMode   string `json:"volumeMode"`
	Age          string `json:"age"`
}

// PVCDetail provides comprehensive information about a single persistent volume claim.
type PVCDetail struct {
	Name              string            `json:"name"`
	Namespace         string            `json:"namespace"`
	UID               string            `json:"uid"`
	CreationTimestamp string            `json:"creationTimestamp"`
	Labels            map[string]string `json:"labels"`
	Annotations       map[string]string `json:"annotations"`
	Status            string            `json:"status"`
	Volume            string            `json:"volume"`
	Capacity          string            `json:"capacity"`
	AccessModes       string            `json:"accessModes"`
	StorageClass      string            `json:"storageClass"`
	VolumeMode        string            `json:"volumeMode"`
	DataSource        string            `json:"dataSource"`
	Conditions        []PVCCondition    `json:"conditions"`
	Age               string            `json:"age"`
}

// PVCCondition represents a condition on a persistent volume claim.
type PVCCondition struct {
	Type               string `json:"type"`
	Status             string `json:"status"`
	LastTransitionTime string `json:"lastTransitionTime"`
	Reason             string `json:"reason"`
	Message            string `json:"message"`
}
