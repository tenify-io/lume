package kube

// RoleInfo represents a Role or ClusterRole summary for list views.
type RoleInfo struct {
	Name      string `json:"name"`
	Namespace string `json:"namespace"`
	Kind      string `json:"kind"`
	Rules     int    `json:"rules"`
	Age       string `json:"age"`
}

// PolicyRule represents a single RBAC policy rule.
type PolicyRule struct {
	APIGroups       []string `json:"apiGroups"`
	Resources       []string `json:"resources"`
	Verbs           []string `json:"verbs"`
	ResourceNames   []string `json:"resourceNames"`
	NonResourceURLs []string `json:"nonResourceURLs"`
}

// RoleDetail provides comprehensive information about a single Role or ClusterRole.
type RoleDetail struct {
	Name              string            `json:"name"`
	Namespace         string            `json:"namespace"`
	Kind              string            `json:"kind"`
	UID               string            `json:"uid"`
	CreationTimestamp string            `json:"creationTimestamp"`
	Labels            map[string]string `json:"labels"`
	Annotations       map[string]string `json:"annotations"`
	Rules             []PolicyRule      `json:"rules"`
	Age               string            `json:"age"`
}
