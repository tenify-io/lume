package kube

import (
	"context"
	"fmt"
	"sort"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
)

// Client wraps a Kubernetes clientset for a specific context.
type Client struct {
	clientset *kubernetes.Clientset
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

// GetPods returns pods, optionally filtered by namespace ("" for all namespaces).
func (c *Client) GetPods(ctx context.Context, namespace string) ([]PodInfo, error) {
	if namespace == "" {
		namespace = metav1.NamespaceAll
	}

	podList, err := c.clientset.CoreV1().Pods(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list pods: %w", err)
	}

	var pods []PodInfo
	for _, pod := range podList.Items {
		readyCount := 0
		totalCount := len(pod.Spec.Containers)
		var totalRestarts int32
		var containers []ContainerInfo

		for _, cs := range pod.Status.ContainerStatuses {
			totalRestarts += cs.RestartCount
			state := "unknown"
			switch {
			case cs.State.Running != nil:
				state = "running"
			case cs.State.Waiting != nil:
				state = cs.State.Waiting.Reason
			case cs.State.Terminated != nil:
				state = cs.State.Terminated.Reason
			}
			if cs.Ready {
				readyCount++
			}
			containers = append(containers, ContainerInfo{
				Name:  cs.Name,
				Image: cs.Image,
				Ready: cs.Ready,
				State: state,
			})
		}

		age := ""
		if !pod.CreationTimestamp.IsZero() {
			duration := metav1.Now().Sub(pod.CreationTimestamp.Time)
			age = FormatDuration(duration)
		}

		pods = append(pods, PodInfo{
			Name:       pod.Name,
			Namespace:  pod.Namespace,
			Status:     string(pod.Status.Phase),
			Ready:      fmt.Sprintf("%d/%d", readyCount, totalCount),
			Restarts:   totalRestarts,
			Age:        age,
			Labels:     pod.Labels,
			NodeName:   pod.Spec.NodeName,
			IP:         pod.Status.PodIP,
			Containers: containers,
		})
	}

	sort.Slice(pods, func(i, j int) bool {
		if pods[i].Namespace != pods[j].Namespace {
			return pods[i].Namespace < pods[j].Namespace
		}
		return pods[i].Name < pods[j].Name
	})

	return pods, nil
}
