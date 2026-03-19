//go:build darwin || linux

package main

import (
	"os"
	"os/exec"
	"strings"
)

func init() {
	loadShellPATH()
}

// loadShellPATH launches the user's login shell to resolve the full PATH,
// then sets it on the current process. GUI apps on macOS and Linux may not
// inherit the shell PATH, which breaks exec-based credential plugins (e.g. aws).
func loadShellPATH() {
	shell := os.Getenv("SHELL")
	if shell == "" {
		shell = "/bin/zsh"
	}

	out, err := exec.Command(shell, "-l", "-c", `printf '\000%s' "$PATH"`).Output()
	if err != nil {
		return
	}

	if i := strings.LastIndexByte(string(out), '\000'); i != -1 {
		path := string(out[i+1:])
		if path != "" {
			_ = os.Setenv("PATH", path)
		}
	}
}
