package kube

import (
	"context"
	"sync"

	"k8s.io/client-go/informers"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/cache"
)

// EventEmitter is a function that emits named events with data payloads.
type EventEmitter func(eventName string, data ...interface{})

// ResourceEvent represents a change to a Kubernetes resource.
type ResourceEvent struct {
	Type string      `json:"type"`
	Data interface{} `json:"data"`
}

// ResourceConverter converts a raw Kubernetes object into an app-specific type.
// Returns the converted value and true, or nil and false if the object type is wrong.
type ResourceConverter func(obj interface{}) (interface{}, bool)

// Watcher uses Kubernetes informers to watch resources and emit change events.
type Watcher struct {
	clientset kubernetes.Interface
	emit      EventEmitter
	mu        sync.Mutex
	cancel    context.CancelFunc
}

// NewWatcher creates a new Watcher for the given clientset.
// The emit function is called for each resource change event.
func NewWatcher(clientset kubernetes.Interface, emit EventEmitter) *Watcher {
	return &Watcher{
		clientset: clientset,
		emit:      emit,
	}
}

// watchInformer wires up Add/Update/Delete event handlers on the given informer.
// convert transforms the raw k8s object into the app-specific type.
// eventName is the channel name passed to emit (e.g., "pods:changed").
func (w *Watcher) watchInformer(informer cache.SharedIndexInformer, eventName string, convert ResourceConverter) {
	_, _ = informer.AddEventHandler(cache.ResourceEventHandlerFuncs{
		AddFunc: func(obj interface{}) {
			if data, ok := convert(obj); ok {
				w.emit(eventName, ResourceEvent{Type: "ADDED", Data: data})
			}
		},
		UpdateFunc: func(_, newObj interface{}) {
			if data, ok := convert(newObj); ok {
				w.emit(eventName, ResourceEvent{Type: "MODIFIED", Data: data})
			}
		},
		DeleteFunc: func(obj interface{}) {
			actual := obj
			if tombstone, ok := obj.(cache.DeletedFinalStateUnknown); ok {
				actual = tombstone.Obj
			}
			if data, ok := convert(actual); ok {
				w.emit(eventName, ResourceEvent{Type: "DELETED", Data: data})
			}
		},
	})
}

// Start begins watching resources. Pods are watched in the given namespace
// (pass "" for all namespaces). Nodes are always watched cluster-wide.
// Calling Start again stops existing watches first.
func (w *Watcher) Start(ctx context.Context, namespace string) {
	w.mu.Lock()
	defer w.mu.Unlock()

	if w.cancel != nil {
		w.cancel()
	}

	watchCtx, cancel := context.WithCancel(ctx)
	w.cancel = cancel

	// Namespace-scoped resources
	var nsOpts []informers.SharedInformerOption
	if namespace != "" {
		nsOpts = append(nsOpts, informers.WithNamespace(namespace))
	}
	nsFactory := informers.NewSharedInformerFactoryWithOptions(w.clientset, 0, nsOpts...)
	w.watchInformer(nsFactory.Core().V1().Pods().Informer(), "pods:changed", convertPod)
	w.watchInformer(nsFactory.Apps().V1().Deployments().Informer(), "deployments:changed", convertDeployment)
	w.watchInformer(nsFactory.Apps().V1().StatefulSets().Informer(), "statefulsets:changed", convertStatefulSet)
	w.watchInformer(nsFactory.Apps().V1().DaemonSets().Informer(), "daemonsets:changed", convertDaemonSet)

	// Cluster-scoped resources
	clusterFactory := informers.NewSharedInformerFactoryWithOptions(w.clientset, 0)
	w.watchInformer(clusterFactory.Core().V1().Nodes().Informer(), "nodes:changed", convertNode)

	nsFactory.Start(watchCtx.Done())
	clusterFactory.Start(watchCtx.Done())
}

// Stop stops all active watches.
func (w *Watcher) Stop() {
	w.mu.Lock()
	defer w.mu.Unlock()

	if w.cancel != nil {
		w.cancel()
		w.cancel = nil
	}
}
