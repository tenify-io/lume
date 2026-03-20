package main

import (
	"context"
	"fmt"
	"time"

	"github.com/tenify-io/lume/pkg/kube"
	"github.com/tenify-io/lume/pkg/preferences"
	wailsrt "github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx          context.Context
	client       *kube.Client
	prefs        *preferences.Preferences
	watcher      *kube.Watcher
	healthCancel context.CancelFunc
}

// NewApp creates a new App application struct
func NewApp() *App {
	prefs, err := preferences.New()
	if err != nil {
		println("Warning: failed to load preferences:", err.Error())
		prefs = preferences.NewInMemory()
	}
	return &App{prefs: prefs}
}

// startup is called when the app starts.
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// shutdown is called when the app is closing.
func (a *App) shutdown(_ context.Context) {
	a.StopHealthCheck()
}

// GetContexts returns all available kubeconfig contexts.
func (a *App) GetContexts() ([]kube.Context, error) {
	return kube.GetContexts()
}

// GetCurrentContext returns the name of the current kubeconfig context.
func (a *App) GetCurrentContext() (string, error) {
	return kube.GetCurrentContext()
}

// ConnectToContext creates a Kubernetes client for the given context name.
func (a *App) ConnectToContext(contextName string) error {
	if a.watcher != nil {
		a.watcher.Stop()
		a.watcher = nil
	}
	a.StopHealthCheck()

	client, err := kube.Connect(contextName)
	if err != nil {
		return err
	}
	a.client = client

	a.watcher = kube.NewWatcher(client.Clientset(), func(eventName string, data ...interface{}) {
		wailsrt.EventsEmit(a.ctx, eventName, data...)
	})

	a.StartHealthCheck()

	return nil
}

// GetClusterHealth returns the current health of the connected cluster.
func (a *App) GetClusterHealth() (kube.ClusterHealth, error) {
	if a.client == nil {
		return kube.ClusterHealth{}, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetClusterHealth(a.ctx), nil
}

// StartHealthCheck begins periodic health checks every 30 seconds,
// emitting "cluster:health" events to the frontend.
func (a *App) StartHealthCheck() {
	a.StopHealthCheck()

	ctx, cancel := context.WithCancel(a.ctx)
	a.healthCancel = cancel

	go func() {
		emit := func() {
			health := a.client.GetClusterHealth(ctx)
			wailsrt.EventsEmit(a.ctx, "cluster:health", health)
		}
		emit()

		ticker := time.NewTicker(30 * time.Second)
		defer ticker.Stop()
		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				emit()
			}
		}
	}()
}

// StopHealthCheck stops the periodic health check.
func (a *App) StopHealthCheck() {
	if a.healthCancel != nil {
		a.healthCancel()
		a.healthCancel = nil
	}
}

// GetNamespaces returns all namespaces in the connected cluster.
func (a *App) GetNamespaces() ([]string, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetNamespaces(a.ctx)
}

// GetNamespaceList returns all namespaces with full info for the list view.
func (a *App) GetNamespaceList() ([]kube.NamespaceInfo, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetNamespaceList(a.ctx)
}

// GetNamespaceDetail returns detailed information about a single namespace.
func (a *App) GetNamespaceDetail(name string) (*kube.NamespaceDetail, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetNamespaceDetail(a.ctx, name)
}

// GetNamespaceEvents returns events related to a specific namespace.
func (a *App) GetNamespaceEvents(name string) ([]kube.EventInfo, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetNamespaceEvents(a.ctx, name)
}

// GetNamespaceResourceSummary returns counts of resources within a namespace.
func (a *App) GetNamespaceResourceSummary(name string) (*kube.NamespaceResourceSummary, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetNamespaceResourceSummary(a.ctx, name)
}

// GetPods returns pods, optionally filtered by namespace ("" for all namespaces).
func (a *App) GetPods(namespace string) ([]kube.PodInfo, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetPods(a.ctx, namespace)
}

// GetPodDetail returns detailed information about a single pod.
func (a *App) GetPodDetail(namespace, name string) (*kube.PodDetail, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetPodDetail(a.ctx, namespace, name)
}

// GetPodEvents returns events related to a specific pod.
func (a *App) GetPodEvents(namespace, name string) ([]kube.EventInfo, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetPodEvents(a.ctx, namespace, name)
}

// GetDeployments returns deployments, optionally filtered by namespace ("" for all namespaces).
func (a *App) GetDeployments(namespace string) ([]kube.DeploymentInfo, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetDeployments(a.ctx, namespace)
}

// GetDeploymentDetail returns detailed information about a single deployment.
func (a *App) GetDeploymentDetail(namespace, name string) (*kube.DeploymentDetail, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetDeploymentDetail(a.ctx, namespace, name)
}

// GetDeploymentEvents returns events related to a specific deployment.
func (a *App) GetDeploymentEvents(namespace, name string) ([]kube.EventInfo, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetDeploymentEvents(a.ctx, namespace, name)
}

// GetStatefulSets returns statefulsets, optionally filtered by namespace ("" for all namespaces).
func (a *App) GetStatefulSets(namespace string) ([]kube.StatefulSetInfo, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetStatefulSets(a.ctx, namespace)
}

// GetStatefulSetDetail returns detailed information about a single statefulset.
func (a *App) GetStatefulSetDetail(namespace, name string) (*kube.StatefulSetDetail, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetStatefulSetDetail(a.ctx, namespace, name)
}

// GetStatefulSetEvents returns events related to a specific statefulset.
func (a *App) GetStatefulSetEvents(namespace, name string) ([]kube.EventInfo, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetStatefulSetEvents(a.ctx, namespace, name)
}

// GetDaemonSets returns daemonsets, optionally filtered by namespace ("" for all namespaces).
func (a *App) GetDaemonSets(namespace string) ([]kube.DaemonSetInfo, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetDaemonSets(a.ctx, namespace)
}

// GetDaemonSetDetail returns detailed information about a single daemonset.
func (a *App) GetDaemonSetDetail(namespace, name string) (*kube.DaemonSetDetail, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetDaemonSetDetail(a.ctx, namespace, name)
}

// GetDaemonSetEvents returns events related to a specific daemonset.
func (a *App) GetDaemonSetEvents(namespace, name string) ([]kube.EventInfo, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetDaemonSetEvents(a.ctx, namespace, name)
}

// GetReplicaSets returns replicasets, optionally filtered by namespace ("" for all namespaces).
func (a *App) GetReplicaSets(namespace string) ([]kube.ReplicaSetInfo, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetReplicaSets(a.ctx, namespace)
}

// GetReplicaSetDetail returns detailed information about a single replicaset.
func (a *App) GetReplicaSetDetail(namespace, name string) (*kube.ReplicaSetDetail, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetReplicaSetDetail(a.ctx, namespace, name)
}

// GetReplicaSetEvents returns events related to a specific replicaset.
func (a *App) GetReplicaSetEvents(namespace, name string) ([]kube.EventInfo, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetReplicaSetEvents(a.ctx, namespace, name)
}

// GetJobs returns jobs, optionally filtered by namespace ("" for all namespaces).
func (a *App) GetJobs(namespace string) ([]kube.JobInfo, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetJobs(a.ctx, namespace)
}

// GetJobDetail returns detailed information about a single job.
func (a *App) GetJobDetail(namespace, name string) (*kube.JobDetail, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetJobDetail(a.ctx, namespace, name)
}

// GetJobEvents returns events related to a specific job.
func (a *App) GetJobEvents(namespace, name string) ([]kube.EventInfo, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetJobEvents(a.ctx, namespace, name)
}

// GetCronJobs returns cronjobs, optionally filtered by namespace ("" for all namespaces).
func (a *App) GetCronJobs(namespace string) ([]kube.CronJobInfo, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetCronJobs(a.ctx, namespace)
}

// GetCronJobDetail returns detailed information about a single cronjob.
func (a *App) GetCronJobDetail(namespace, name string) (*kube.CronJobDetail, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetCronJobDetail(a.ctx, namespace, name)
}

// GetCronJobEvents returns events related to a specific cronjob.
func (a *App) GetCronJobEvents(namespace, name string) ([]kube.EventInfo, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetCronJobEvents(a.ctx, namespace, name)
}

// GetServices returns services, optionally filtered by namespace ("" for all namespaces).
func (a *App) GetServices(namespace string) ([]kube.ServiceInfo, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetServices(a.ctx, namespace)
}

// GetServiceDetail returns detailed information about a single service.
func (a *App) GetServiceDetail(namespace, name string) (*kube.ServiceDetail, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetServiceDetail(a.ctx, namespace, name)
}

// GetServiceEvents returns events related to a specific service.
func (a *App) GetServiceEvents(namespace, name string) ([]kube.EventInfo, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetServiceEvents(a.ctx, namespace, name)
}

// GetIngresses returns ingresses, optionally filtered by namespace ("" for all namespaces).
func (a *App) GetIngresses(namespace string) ([]kube.IngressInfo, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetIngresses(a.ctx, namespace)
}

// GetIngressDetail returns detailed information about a single ingress.
func (a *App) GetIngressDetail(namespace, name string) (*kube.IngressDetail, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetIngressDetail(a.ctx, namespace, name)
}

// GetIngressEvents returns events related to a specific ingress.
func (a *App) GetIngressEvents(namespace, name string) ([]kube.EventInfo, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetIngressEvents(a.ctx, namespace, name)
}

// GetNetworkPolicies returns network policies, optionally filtered by namespace ("" for all namespaces).
func (a *App) GetNetworkPolicies(namespace string) ([]kube.NetworkPolicyInfo, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetNetworkPolicies(a.ctx, namespace)
}

// GetNetworkPolicyDetail returns detailed information about a single network policy.
func (a *App) GetNetworkPolicyDetail(namespace, name string) (*kube.NetworkPolicyDetail, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetNetworkPolicyDetail(a.ctx, namespace, name)
}

// GetConfigMaps returns config maps, optionally filtered by namespace ("" for all namespaces).
func (a *App) GetConfigMaps(namespace string) ([]kube.ConfigMapInfo, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetConfigMaps(a.ctx, namespace)
}

// GetConfigMapDetail returns detailed information about a single config map.
func (a *App) GetConfigMapDetail(namespace, name string) (*kube.ConfigMapDetail, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetConfigMapDetail(a.ctx, namespace, name)
}

// GetSecrets returns secrets, optionally filtered by namespace ("" for all namespaces).
func (a *App) GetSecrets(namespace string) ([]kube.SecretInfo, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetSecrets(a.ctx, namespace)
}

// GetSecretDetail returns detailed information about a single secret.
func (a *App) GetSecretDetail(namespace, name string) (*kube.SecretDetail, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetSecretDetail(a.ctx, namespace, name)
}

// GetPVCs returns persistent volume claims, optionally filtered by namespace ("" for all namespaces).
func (a *App) GetPVCs(namespace string) ([]kube.PVCInfo, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetPVCs(a.ctx, namespace)
}

// GetPVCDetail returns detailed information about a single persistent volume claim.
func (a *App) GetPVCDetail(namespace, name string) (*kube.PVCDetail, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetPVCDetail(a.ctx, namespace, name)
}

// GetPVCEvents returns events related to a specific persistent volume claim.
func (a *App) GetPVCEvents(namespace, name string) ([]kube.EventInfo, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetPVCEvents(a.ctx, namespace, name)
}

// GetServiceAccounts returns service accounts, optionally filtered by namespace ("" for all namespaces).
func (a *App) GetServiceAccounts(namespace string) ([]kube.ServiceAccountInfo, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetServiceAccounts(a.ctx, namespace)
}

// GetServiceAccountDetail returns detailed information about a single service account.
func (a *App) GetServiceAccountDetail(namespace, name string) (*kube.ServiceAccountDetail, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetServiceAccountDetail(a.ctx, namespace, name)
}

// GetRoles returns roles, optionally filtered by namespace ("" for all namespaces).
func (a *App) GetRoles(namespace string) ([]kube.RoleInfo, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetRoles(a.ctx, namespace)
}

// GetRoleDetail returns detailed information about a single role.
func (a *App) GetRoleDetail(namespace, name string) (*kube.RoleDetail, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetRoleDetail(a.ctx, namespace, name)
}

// GetClusterRoles returns all cluster roles in the connected cluster.
func (a *App) GetClusterRoles() ([]kube.RoleInfo, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetClusterRoles(a.ctx)
}

// GetClusterRoleDetail returns detailed information about a single cluster role.
func (a *App) GetClusterRoleDetail(name string) (*kube.RoleDetail, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetClusterRoleDetail(a.ctx, name)
}

// GetRoleBindings returns role bindings, optionally filtered by namespace ("" for all namespaces).
func (a *App) GetRoleBindings(namespace string) ([]kube.RoleBindingInfo, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetRoleBindings(a.ctx, namespace)
}

// GetRoleBindingDetail returns detailed information about a single role binding.
func (a *App) GetRoleBindingDetail(namespace, name string) (*kube.RoleBindingDetail, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetRoleBindingDetail(a.ctx, namespace, name)
}

// GetClusterRoleBindings returns all cluster role bindings in the connected cluster.
func (a *App) GetClusterRoleBindings() ([]kube.RoleBindingInfo, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetClusterRoleBindings(a.ctx)
}

// GetClusterRoleBindingDetail returns detailed information about a single cluster role binding.
func (a *App) GetClusterRoleBindingDetail(name string) (*kube.RoleBindingDetail, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetClusterRoleBindingDetail(a.ctx, name)
}

// GetStorageClasses returns all storage classes in the connected cluster.
func (a *App) GetStorageClasses() ([]kube.StorageClassInfo, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetStorageClasses(a.ctx)
}

// GetStorageClassDetail returns detailed information about a single storage class.
func (a *App) GetStorageClassDetail(name string) (*kube.StorageClassDetail, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetStorageClassDetail(a.ctx, name)
}

// GetPersistentVolumes returns all persistent volumes in the connected cluster.
func (a *App) GetPersistentVolumes() ([]kube.PersistentVolumeInfo, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetPersistentVolumes(a.ctx)
}

// GetPersistentVolumeDetail returns detailed information about a single persistent volume.
func (a *App) GetPersistentVolumeDetail(name string) (*kube.PersistentVolumeDetail, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetPersistentVolumeDetail(a.ctx, name)
}

// GetPersistentVolumeEvents returns events related to a specific persistent volume.
func (a *App) GetPersistentVolumeEvents(name string) ([]kube.EventInfo, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetPersistentVolumeEvents(a.ctx, name)
}

// GetNodes returns all nodes in the connected cluster.
func (a *App) GetNodes() ([]kube.NodeInfo, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetNodes(a.ctx)
}

// GetNodeDetail returns detailed information about a single node.
func (a *App) GetNodeDetail(name string) (*kube.NodeDetail, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetNodeDetail(a.ctx, name)
}

// GetNodeEvents returns events related to a specific node.
func (a *App) GetNodeEvents(name string) ([]kube.EventInfo, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetNodeEvents(a.ctx, name)
}

// WatchPods starts watching pods in the given namespace for real-time updates.
// Pass "" to watch all namespaces.
func (a *App) WatchPods(namespace string) error {
	if a.watcher == nil {
		return fmt.Errorf("not connected to a cluster")
	}
	a.watcher.Start(a.ctx, namespace)
	return nil
}

// UnwatchAll stops all active resource watches.
func (a *App) UnwatchAll() {
	if a.watcher != nil {
		a.watcher.Stop()
	}
}

// GetPreference returns a stored preference value by key.
func (a *App) GetPreference(key string) any {
	return a.prefs.Get(key)
}

// SetPreference stores a preference value by key.
func (a *App) SetPreference(key string, value any) error {
	return a.prefs.Set(key, value)
}

// DeletePreference removes a stored preference by key.
func (a *App) DeletePreference(key string) error {
	return a.prefs.Delete(key)
}

// GetAllPreferences returns all stored preferences.
func (a *App) GetAllPreferences() map[string]any {
	return a.prefs.All()
}

// contextAliasesFromPrefs reads the context_aliases preference and converts it
// from the JSON-deserialized map[string]any to a typed map[string]string.
func (a *App) contextAliasesFromPrefs() map[string]string {
	raw := a.prefs.Get("context_aliases")
	aliases := make(map[string]string)
	switch m := raw.(type) {
	case map[string]string:
		for k, v := range m {
			aliases[k] = v
		}
	case map[string]any:
		for k, v := range m {
			if s, ok := v.(string); ok {
				aliases[k] = s
			}
		}
	}
	return aliases
}

// SetContextAlias sets or removes a custom display alias for a kubeconfig context.
// Pass an empty alias to remove the alias for a context.
func (a *App) SetContextAlias(contextName, alias string) error {
	aliases := a.contextAliasesFromPrefs()
	if alias == "" {
		delete(aliases, contextName)
	} else {
		aliases[contextName] = alias
	}
	return a.prefs.Set("context_aliases", aliases)
}

// GetContextAliases returns all context aliases as a map of context name to alias.
func (a *App) GetContextAliases() map[string]string {
	return a.contextAliasesFromPrefs()
}
