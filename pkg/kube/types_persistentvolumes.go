package kube

// PersistentVolumeInfo represents a persistent volume summary for list views.
type PersistentVolumeInfo struct {
	Name          string `json:"name"`
	Capacity      string `json:"capacity"`
	AccessModes   string `json:"accessModes"`
	ReclaimPolicy string `json:"reclaimPolicy"`
	Status        string `json:"status"`
	Claim         string `json:"claim"`
	StorageClass  string `json:"storageClass"`
	VolumeMode    string `json:"volumeMode"`
	Age           string `json:"age"`
}

// PersistentVolumeDetail provides comprehensive information about a single persistent volume.
type PersistentVolumeDetail struct {
	Name              string            `json:"name"`
	UID               string            `json:"uid"`
	CreationTimestamp string            `json:"creationTimestamp"`
	Labels            map[string]string `json:"labels"`
	Annotations       map[string]string `json:"annotations"`
	Capacity          string            `json:"capacity"`
	AccessModes       string            `json:"accessModes"`
	ReclaimPolicy     string            `json:"reclaimPolicy"`
	Status            string            `json:"status"`
	Claim             string            `json:"claim"`
	StorageClass      string            `json:"storageClass"`
	VolumeMode        string            `json:"volumeMode"`
	Source            string            `json:"source"`
	MountOptions      []string          `json:"mountOptions"`
	Age               string            `json:"age"`
}
