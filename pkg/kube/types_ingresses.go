package kube

// IngressInfo represents an ingress summary for list views.
type IngressInfo struct {
	Name      string `json:"name"`
	Namespace string `json:"namespace"`
	Class     string `json:"class"`
	Hosts     string `json:"hosts"`
	Address   string `json:"address"`
	Ports     string `json:"ports"`
	Age       string `json:"age"`
}

// IngressTLS represents a TLS configuration on an ingress.
type IngressTLS struct {
	Hosts      []string `json:"hosts"`
	SecretName string   `json:"secretName"`
}

// IngressPath represents a single path rule within an ingress rule.
type IngressPath struct {
	Path     string `json:"path"`
	PathType string `json:"pathType"`
	Backend  string `json:"backend"`
}

// IngressRule represents a host-based routing rule on an ingress.
type IngressRule struct {
	Host  string        `json:"host"`
	Paths []IngressPath `json:"paths"`
}

// IngressDetail provides comprehensive information about a single ingress.
type IngressDetail struct {
	Name              string            `json:"name"`
	Namespace         string            `json:"namespace"`
	UID               string            `json:"uid"`
	CreationTimestamp string            `json:"creationTimestamp"`
	Labels            map[string]string `json:"labels"`
	Annotations       map[string]string `json:"annotations"`
	IngressClassName  string            `json:"ingressClassName"`
	DefaultBackend    string            `json:"defaultBackend"`
	TLS               []IngressTLS      `json:"tls"`
	Rules             []IngressRule     `json:"rules"`
	Age               string            `json:"age"`
}
