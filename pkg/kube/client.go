package kube

import (
	"context"
	"fmt"
	"sort"
	"time"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
)

// Client wraps a Kubernetes clientset for a specific context.
type Client struct {
	clientset *kubernetes.Clientset
}

// Clientset returns the underlying Kubernetes clientset.
func (c *Client) Clientset() kubernetes.Interface {
	return c.clientset
}

// GetContexts returns all available kubeconfig contexts.
func GetContexts() ([]Context, error) {
	loadingRules := clientcmd.NewDefaultClientConfigLoadingRules()
	config, err := loadingRules.Load()
	if err != nil {
		return nil, fmt.Errorf("failed to load kubeconfig: %w", err)
	}

	var contexts []Context
	for name, ctx := range config.Contexts {
		contexts = append(contexts, Context{
			Name:    name,
			Cluster: ctx.Cluster,
			User:    ctx.AuthInfo,
		})
	}
	sort.Slice(contexts, func(i, j int) bool {
		return contexts[i].Name < contexts[j].Name
	})
	return contexts, nil
}

// GetCurrentContext returns the name of the current kubeconfig context.
func GetCurrentContext() (string, error) {
	loadingRules := clientcmd.NewDefaultClientConfigLoadingRules()
	config, err := loadingRules.Load()
	if err != nil {
		return "", fmt.Errorf("failed to load kubeconfig: %w", err)
	}
	return config.CurrentContext, nil
}

// Connect creates a new Client for the given kubeconfig context name.
func Connect(contextName string) (*Client, error) {
	loadingRules := clientcmd.NewDefaultClientConfigLoadingRules()
	configOverrides := &clientcmd.ConfigOverrides{
		CurrentContext: contextName,
	}
	kubeConfig := clientcmd.NewNonInteractiveDeferredLoadingClientConfig(loadingRules, configOverrides)

	restConfig, err := kubeConfig.ClientConfig()
	if err != nil {
		return nil, fmt.Errorf("failed to build config for context %q: %w", contextName, err)
	}

	clientset, err := kubernetes.NewForConfig(restConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to create clientset: %w", err)
	}

	return &Client{clientset: clientset}, nil
}

// GetClusterHealth performs a lightweight health check against the API server.
func (c *Client) GetClusterHealth(ctx context.Context) ClusterHealth {
	start := time.Now()
	info, err := c.clientset.Discovery().ServerVersion()
	latency := time.Since(start).Milliseconds()

	if err != nil {
		return ClusterHealth{
			Connected: false,
			LatencyMs: latency,
			Error:     err.Error(),
		}
	}
	return ClusterHealth{
		Connected:     true,
		LatencyMs:     latency,
		ServerVersion: info.GitVersion,
	}
}

// GetNamespaces returns all namespaces in the connected cluster.
func (c *Client) GetNamespaces(ctx context.Context) ([]string, error) {
	nsList, err := c.clientset.CoreV1().Namespaces().List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list namespaces: %w", err)
	}

	var namespaces []string
	for _, ns := range nsList.Items {
		namespaces = append(namespaces, ns.Name)
	}
	sort.Strings(namespaces)
	return namespaces, nil
}
