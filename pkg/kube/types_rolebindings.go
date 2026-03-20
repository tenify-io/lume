package kube

// RoleBindingInfo represents a RoleBinding or ClusterRoleBinding summary for list views.
type RoleBindingInfo struct {
	Name      string `json:"name"`
	Namespace string `json:"namespace"`
	Kind      string `json:"kind"`
	RoleRef   string `json:"roleRef"`
	Subjects  int    `json:"subjects"`
	Age       string `json:"age"`
}

// RoleRefInfo represents the role reference of a RoleBinding or ClusterRoleBinding.
type RoleRefInfo struct {
	APIGroup string `json:"apiGroup"`
	Kind     string `json:"kind"`
	Name     string `json:"name"`
}

// SubjectInfo represents a subject in a RoleBinding or ClusterRoleBinding.
type SubjectInfo struct {
	Kind      string `json:"kind"`
	Name      string `json:"name"`
	Namespace string `json:"namespace"`
	APIGroup  string `json:"apiGroup"`
}

// RoleBindingDetail provides comprehensive information about a single RoleBinding or ClusterRoleBinding.
type RoleBindingDetail struct {
	Name              string            `json:"name"`
	Namespace         string            `json:"namespace"`
	Kind              string            `json:"kind"`
	UID               string            `json:"uid"`
	CreationTimestamp string            `json:"creationTimestamp"`
	Labels            map[string]string `json:"labels"`
	Annotations       map[string]string `json:"annotations"`
	RoleRef           RoleRefInfo       `json:"roleRef"`
	Subjects          []SubjectInfo     `json:"subjects"`
	Age               string            `json:"age"`
}
