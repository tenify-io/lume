package preferences

import (
	"os"
	"path/filepath"
	"testing"
)

func newTestPreferences(t *testing.T) *Preferences {
	t.Helper()
	dir := t.TempDir()
	p, err := NewWithPath(filepath.Join(dir, "prefs.json"))
	if err != nil {
		t.Fatalf("NewWithPath failed: %v", err)
	}
	return p
}

func TestSetAndGet(t *testing.T) {
	p := newTestPreferences(t)

	if err := p.Set("theme", "dark"); err != nil {
		t.Fatalf("Set failed: %v", err)
	}

	got := p.Get("theme")
	if got != "dark" {
		t.Errorf("Get(theme) = %v, want %q", got, "dark")
	}
}

func TestGetMissingKey(t *testing.T) {
	p := newTestPreferences(t)

	got := p.Get("nonexistent")
	if got != nil {
		t.Errorf("Get(nonexistent) = %v, want nil", got)
	}
}

func TestDelete(t *testing.T) {
	p := newTestPreferences(t)

	if err := p.Set("key", "value"); err != nil {
		t.Fatalf("Set failed: %v", err)
	}
	if err := p.Delete("key"); err != nil {
		t.Fatalf("Delete failed: %v", err)
	}

	got := p.Get("key")
	if got != nil {
		t.Errorf("Get after Delete = %v, want nil", got)
	}
}

func TestAll(t *testing.T) {
	p := newTestPreferences(t)

	if err := p.Set("a", "1"); err != nil {
		t.Fatalf("Set a failed: %v", err)
	}
	if err := p.Set("b", "2"); err != nil {
		t.Fatalf("Set b failed: %v", err)
	}

	all := p.All()
	if len(all) != 2 {
		t.Errorf("All() returned %d entries, want 2", len(all))
	}

	// Verify All returns a copy, not the internal map
	all["c"] = "3"
	if p.Get("c") != nil {
		t.Error("All() should return a copy, not internal map")
	}
}

func TestPersistence(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "prefs.json")

	p1, err := NewWithPath(path)
	if err != nil {
		t.Fatalf("NewWithPath failed: %v", err)
	}
	if err := p1.Set("persist", "yes"); err != nil {
		t.Fatalf("Set failed: %v", err)
	}

	// Create a new Preferences pointing at the same file
	p2, err := NewWithPath(path)
	if err != nil {
		t.Fatalf("NewWithPath reload failed: %v", err)
	}

	got := p2.Get("persist")
	if got != "yes" {
		t.Errorf("After reload, Get(persist) = %v, want %q", got, "yes")
	}
}

func TestLoadMissingFile(t *testing.T) {
	dir := t.TempDir()
	p, err := NewWithPath(filepath.Join(dir, "does-not-exist.json"))
	if err != nil {
		t.Fatalf("NewWithPath failed: %v", err)
	}

	// Should have empty data, no error (missing file is OK)
	if got := p.Get("anything"); got != nil {
		t.Errorf("Get on fresh preferences = %v, want nil", got)
	}
}

func TestLoadCorruptFile(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "bad.json")
	if err := os.WriteFile(path, []byte("not json"), 0o644); err != nil {
		t.Fatalf("WriteFile failed: %v", err)
	}

	_, err := NewWithPath(path)
	if err == nil {
		t.Error("NewWithPath with corrupt file should return error")
	}
}
