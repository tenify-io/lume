package kube

// ServiceAccountInfo represents a service account summary for list views.
type ServiceAccountInfo struct {
	Name      string `json:"name"`
	Namespace string `json:"namespace"`
	Secrets   int    `json:"secrets"`
	Age       string `json:"age"`
}

// ServiceAccountDetail provides comprehensive information about a single service account.
type ServiceAccountDetail struct {
	Name                         string            `json:"name"`
	Namespace                    string            `json:"namespace"`
	UID                          string            `json:"uid"`
	CreationTimestamp            string            `json:"creationTimestamp"`
	Labels                       map[string]string `json:"labels"`
	Annotations                  map[string]string `json:"annotations"`
	Secrets                      []string          `json:"secrets"`
	ImagePullSecrets             []string          `json:"imagePullSecrets"`
	AutomountServiceAccountToken *bool             `json:"automountServiceAccountToken"`
	Age                          string            `json:"age"`
}
