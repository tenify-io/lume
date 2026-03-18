package preferences

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sync"
)

// Preferences holds user preferences persisted to disk as JSON.
type Preferences struct {
	mu   sync.RWMutex
	path string
	data map[string]any
}

// New creates a Preferences store at ~/.config/lume/preferences.json
// (or the OS-appropriate config directory).
func New() (*Preferences, error) {
	configDir, err := os.UserConfigDir()
	if err != nil {
		return nil, err
	}

	dir := filepath.Join(configDir, "lume")
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return nil, err
	}

	return NewWithPath(filepath.Join(dir, "preferences.json"))
}

// NewWithPath creates a Preferences store backed by the given file path.
// It loads existing data from the file if present.
func NewWithPath(path string) (*Preferences, error) {
	p := &Preferences{
		path: path,
		data: make(map[string]any),
	}

	if err := p.load(); err != nil && !os.IsNotExist(err) {
		return nil, err
	}

	return p, nil
}

// NewInMemory creates a Preferences store that only lives in memory.
func NewInMemory() *Preferences {
	return &Preferences{
		data: make(map[string]any),
	}
}

func (p *Preferences) load() error {
	raw, err := os.ReadFile(p.path)
	if err != nil {
		return err
	}
	return json.Unmarshal(raw, &p.data)
}

func (p *Preferences) save() error {
	raw, err := json.MarshalIndent(p.data, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(p.path, raw, 0o644)
}

// Get returns a preference value by key, or nil if not set.
func (p *Preferences) Get(key string) any {
	p.mu.RLock()
	defer p.mu.RUnlock()
	return p.data[key]
}

// Set stores a preference value and persists to disk.
func (p *Preferences) Set(key string, value any) error {
	p.mu.Lock()
	defer p.mu.Unlock()
	p.data[key] = value
	return p.save()
}

// Delete removes a preference and persists to disk.
func (p *Preferences) Delete(key string) error {
	p.mu.Lock()
	defer p.mu.Unlock()
	delete(p.data, key)
	return p.save()
}

// All returns a copy of all preferences.
func (p *Preferences) All() map[string]any {
	p.mu.RLock()
	defer p.mu.RUnlock()
	out := make(map[string]any, len(p.data))
	for k, v := range p.data {
		out[k] = v
	}
	return out
}
