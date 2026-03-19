package main

import (
	"path/filepath"
	"testing"

	"github.com/tenify-io/lume/pkg/preferences"
)

func newTestApp(t *testing.T) *App {
	t.Helper()
	dir := t.TempDir()
	p, err := preferences.NewWithPath(filepath.Join(dir, "prefs.json"))
	if err != nil {
		t.Fatalf("NewWithPath failed: %v", err)
	}
	return &App{prefs: p}
}

func TestGetClusterHealthNotConnected(t *testing.T) {
	app := newTestApp(t)

	_, err := app.GetClusterHealth()
	if err == nil {
		t.Fatal("expected error when not connected, got nil")
	}
}

func TestSetContextAlias(t *testing.T) {
	app := newTestApp(t)

	if err := app.SetContextAlias("arn:aws:eks:us-east-1:123:cluster/prod", "prod"); err != nil {
		t.Fatalf("SetContextAlias failed: %v", err)
	}

	aliases := app.GetContextAliases()
	if aliases["arn:aws:eks:us-east-1:123:cluster/prod"] != "prod" {
		t.Errorf("got alias %q, want %q", aliases["arn:aws:eks:us-east-1:123:cluster/prod"], "prod")
	}
}

func TestSetContextAliasOverwrite(t *testing.T) {
	app := newTestApp(t)

	if err := app.SetContextAlias("my-context", "alias-v1"); err != nil {
		t.Fatalf("SetContextAlias failed: %v", err)
	}
	if err := app.SetContextAlias("my-context", "alias-v2"); err != nil {
		t.Fatalf("SetContextAlias overwrite failed: %v", err)
	}

	aliases := app.GetContextAliases()
	if aliases["my-context"] != "alias-v2" {
		t.Errorf("got alias %q, want %q", aliases["my-context"], "alias-v2")
	}
}

func TestSetContextAliasRemove(t *testing.T) {
	app := newTestApp(t)

	if err := app.SetContextAlias("my-context", "my-alias"); err != nil {
		t.Fatalf("SetContextAlias failed: %v", err)
	}
	if err := app.SetContextAlias("my-context", ""); err != nil {
		t.Fatalf("SetContextAlias remove failed: %v", err)
	}

	aliases := app.GetContextAliases()
	if _, exists := aliases["my-context"]; exists {
		t.Error("alias should have been removed but still exists")
	}
}

func TestGetContextAliasesEmpty(t *testing.T) {
	app := newTestApp(t)

	aliases := app.GetContextAliases()
	if aliases == nil {
		t.Fatal("GetContextAliases returned nil, want empty map")
	}
	if len(aliases) != 0 {
		t.Errorf("GetContextAliases returned %d entries, want 0", len(aliases))
	}
}

func TestContextAliasPersistence(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "prefs.json")

	p1, err := preferences.NewWithPath(path)
	if err != nil {
		t.Fatalf("NewWithPath failed: %v", err)
	}
	app1 := &App{prefs: p1}

	if err := app1.SetContextAlias("ctx-1", "staging"); err != nil {
		t.Fatalf("SetContextAlias failed: %v", err)
	}

	// Create a new App pointing at the same preferences file
	p2, err := preferences.NewWithPath(path)
	if err != nil {
		t.Fatalf("NewWithPath reload failed: %v", err)
	}
	app2 := &App{prefs: p2}

	aliases := app2.GetContextAliases()
	if aliases["ctx-1"] != "staging" {
		t.Errorf("after reload, got alias %q, want %q", aliases["ctx-1"], "staging")
	}
}

func TestMultipleContextAliases(t *testing.T) {
	app := newTestApp(t)

	if err := app.SetContextAlias("ctx-1", "prod"); err != nil {
		t.Fatalf("SetContextAlias ctx-1 failed: %v", err)
	}
	if err := app.SetContextAlias("ctx-2", "staging"); err != nil {
		t.Fatalf("SetContextAlias ctx-2 failed: %v", err)
	}

	aliases := app.GetContextAliases()
	if len(aliases) != 2 {
		t.Fatalf("got %d aliases, want 2", len(aliases))
	}
	if aliases["ctx-1"] != "prod" {
		t.Errorf("ctx-1 alias = %q, want %q", aliases["ctx-1"], "prod")
	}
	if aliases["ctx-2"] != "staging" {
		t.Errorf("ctx-2 alias = %q, want %q", aliases["ctx-2"], "staging")
	}
}
