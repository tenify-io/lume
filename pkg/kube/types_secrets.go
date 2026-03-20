package kube

// SecretInfo represents a secret summary for list views.
type SecretInfo struct {
	Name      string `json:"name"`
	Namespace string `json:"namespace"`
	Type      string `json:"type"`
	DataCount int    `json:"dataCount"`
	Age       string `json:"age"`
}

// SecretDetail provides comprehensive information about a single secret.
type SecretDetail struct {
	Name              string            `json:"name"`
	Namespace         string            `json:"namespace"`
	UID               string            `json:"uid"`
	CreationTimestamp string            `json:"creationTimestamp"`
	Labels            map[string]string `json:"labels"`
	Annotations       map[string]string `json:"annotations"`
	Type              string            `json:"type"`
	Data              map[string]string `json:"data"`
	Age               string            `json:"age"`
}
