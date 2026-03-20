package kube

// ServiceInfo represents a service summary for list views.
type ServiceInfo struct {
	Name       string `json:"name"`
	Namespace  string `json:"namespace"`
	Type       string `json:"type"`
	ClusterIP  string `json:"clusterIP"`
	ExternalIP string `json:"externalIP"`
	Ports      string `json:"ports"`
	Age        string `json:"age"`
	Selector   string `json:"selector"`
}

// ServicePort represents a single port on a service.
type ServicePort struct {
	Name       string `json:"name"`
	Port       int32  `json:"port"`
	Protocol   string `json:"protocol"`
	TargetPort string `json:"targetPort"`
	NodePort   int32  `json:"nodePort"`
}

// ServiceDetail provides comprehensive information about a single service.
type ServiceDetail struct {
	Name                  string            `json:"name"`
	Namespace             string            `json:"namespace"`
	UID                   string            `json:"uid"`
	CreationTimestamp     string            `json:"creationTimestamp"`
	Labels                map[string]string `json:"labels"`
	Annotations           map[string]string `json:"annotations"`
	Type                  string            `json:"type"`
	ClusterIP             string            `json:"clusterIP"`
	ExternalIP            string            `json:"externalIP"`
	SessionAffinity       string            `json:"sessionAffinity"`
	ExternalTrafficPolicy string            `json:"externalTrafficPolicy"`
	InternalTrafficPolicy string            `json:"internalTrafficPolicy"`
	IPFamilies            []string          `json:"ipFamilies"`
	IPFamilyPolicy        string            `json:"ipFamilyPolicy"`
	Ports                 []ServicePort     `json:"ports"`
	Selector              map[string]string `json:"selector"`
	Age                   string            `json:"age"`
}
