package kube

// StorageClassInfo represents a storage class summary for list views.
type StorageClassInfo struct {
	Name                 string `json:"name"`
	Provisioner          string `json:"provisioner"`
	ReclaimPolicy        string `json:"reclaimPolicy"`
	VolumeBindingMode    string `json:"volumeBindingMode"`
	AllowVolumeExpansion bool   `json:"allowVolumeExpansion"`
	Age                  string `json:"age"`
	IsDefault            bool   `json:"isDefault"`
}

// StorageClassDetail provides comprehensive information about a single storage class.
type StorageClassDetail struct {
	Name                 string            `json:"name"`
	UID                  string            `json:"uid"`
	CreationTimestamp    string            `json:"creationTimestamp"`
	Labels               map[string]string `json:"labels"`
	Annotations          map[string]string `json:"annotations"`
	Provisioner          string            `json:"provisioner"`
	ReclaimPolicy        string            `json:"reclaimPolicy"`
	VolumeBindingMode    string            `json:"volumeBindingMode"`
	AllowVolumeExpansion bool              `json:"allowVolumeExpansion"`
	Parameters           map[string]string `json:"parameters"`
	MountOptions         []string          `json:"mountOptions"`
	AllowedTopologies    []string          `json:"allowedTopologies"`
	Age                  string            `json:"age"`
	IsDefault            bool              `json:"isDefault"`
}
