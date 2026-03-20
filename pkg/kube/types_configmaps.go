package kube

// ConfigMapInfo represents a config map summary for list views.
type ConfigMapInfo struct {
	Name      string `json:"name"`
	Namespace string `json:"namespace"`
	DataCount int    `json:"dataCount"`
	Age       string `json:"age"`
}

// BinaryDataKey describes a binary data entry by name and byte size.
type BinaryDataKey struct {
	Name string `json:"name"`
	Size int    `json:"size"`
}

// ConfigMapDetail provides comprehensive information about a single config map.
type ConfigMapDetail struct {
	Name              string            `json:"name"`
	Namespace         string            `json:"namespace"`
	UID               string            `json:"uid"`
	CreationTimestamp string            `json:"creationTimestamp"`
	Labels            map[string]string `json:"labels"`
	Annotations       map[string]string `json:"annotations"`
	Data              map[string]string `json:"data"`
	BinaryDataKeys    []BinaryDataKey   `json:"binaryDataKeys"`
	Age               string            `json:"age"`
}
