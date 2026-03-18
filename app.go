package main

import (
	"context"
	"fmt"

	"github.com/tenify-io/lume/pkg/kube"
	"github.com/tenify-io/lume/pkg/preferences"
)

// App struct
type App struct {
	ctx    context.Context
	client *kube.Client
	prefs  *preferences.Preferences
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
	client, err := kube.Connect(contextName)
	if err != nil {
		return err
	}
	a.client = client
	return nil
}

// GetNamespaces returns all namespaces in the connected cluster.
func (a *App) GetNamespaces() ([]string, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetNamespaces(a.ctx)
}

// GetPods returns pods, optionally filtered by namespace ("" for all namespaces).
func (a *App) GetPods(namespace string) ([]kube.PodInfo, error) {
	if a.client == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.client.GetPods(a.ctx, namespace)
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
