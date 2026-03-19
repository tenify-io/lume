import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { NavigationProvider, useNavigation, getTabTitle } from "../navigation";
import type { Route } from "../navigation";

function renderNav(initial?: Route) {
  return renderHook(() => useNavigation(), {
    wrapper: ({ children }) => (
      <NavigationProvider initial={initial}>{children}</NavigationProvider>
    ),
  });
}

describe("navigation", () => {
  describe("tabs", () => {
    it("starts with a single tab", () => {
      const { result } = renderNav();
      expect(result.current.tabs).toHaveLength(1);
      expect(result.current.route).toEqual({ page: "cluster-select" });
    });

    it("opens a new tab", () => {
      const { result } = renderNav({ page: "pods" });

      act(() => result.current.openTab({ page: "nodes" }));

      expect(result.current.tabs).toHaveLength(2);
      expect(result.current.route).toEqual({ page: "nodes" });
    });

    it("opens a new tab with default route", () => {
      const { result } = renderNav();

      act(() => result.current.openTab());

      expect(result.current.tabs).toHaveLength(2);
      expect(result.current.route).toEqual({ page: "pods" });
    });

    it("closes a tab and activates the next", () => {
      const { result } = renderNav({ page: "pods" });

      act(() => result.current.openTab({ page: "nodes" }));
      act(() => result.current.openTab({ page: "deployments" }));
      // Close the middle tab (nodes) — should activate deployments
      const nodesTabId = result.current.tabs[1].id;
      act(() => result.current.switchTab(nodesTabId));
      act(() => result.current.closeTab(nodesTabId));

      expect(result.current.tabs).toHaveLength(2);
      expect(result.current.route).toEqual({ page: "deployments" });
    });

    it("closing the last remaining tab creates a fresh one", () => {
      const { result } = renderNav({ page: "nodes" });
      const tabId = result.current.tabs[0].id;

      act(() => result.current.closeTab(tabId));

      expect(result.current.tabs).toHaveLength(1);
      expect(result.current.route).toEqual({ page: "pods" });
    });

    it("switches between tabs", () => {
      const { result } = renderNav({ page: "pods" });

      act(() => result.current.openTab({ page: "nodes" }));
      const podsTabId = result.current.tabs[0].id;

      act(() => result.current.switchTab(podsTabId));

      expect(result.current.route).toEqual({ page: "pods" });
    });

    it("resetTabs replaces all tabs with a single tab", () => {
      const { result } = renderNav({ page: "pods" });

      act(() => result.current.openTab({ page: "nodes" }));
      act(() => result.current.openTab({ page: "deployments" }));
      expect(result.current.tabs).toHaveLength(3);

      act(() => result.current.resetTabs({ page: "cluster-select" }));

      expect(result.current.tabs).toHaveLength(1);
      expect(result.current.route).toEqual({ page: "cluster-select" });
    });
  });

  describe("per-tab history", () => {
    it("navigate pushes to backStack and clears forwardStack", () => {
      const { result } = renderNav({ page: "pods" });

      act(() => result.current.navigate({ page: "nodes" }));

      expect(result.current.route).toEqual({ page: "nodes" });
      expect(result.current.canGoBack).toBe(true);
      expect(result.current.canGoForward).toBe(false);
    });

    it("goBack pops from backStack", () => {
      const { result } = renderNav({ page: "pods" });

      act(() => result.current.navigate({ page: "nodes" }));
      act(() => result.current.goBack());

      expect(result.current.route).toEqual({ page: "pods" });
      expect(result.current.canGoBack).toBe(false);
      expect(result.current.canGoForward).toBe(true);
    });

    it("goForward pops from forwardStack", () => {
      const { result } = renderNav({ page: "pods" });

      act(() => result.current.navigate({ page: "nodes" }));
      act(() => result.current.goBack());
      act(() => result.current.goForward());

      expect(result.current.route).toEqual({ page: "nodes" });
      expect(result.current.canGoBack).toBe(true);
      expect(result.current.canGoForward).toBe(false);
    });

    it("navigate after goBack clears forwardStack", () => {
      const { result } = renderNav({ page: "pods" });

      act(() => result.current.navigate({ page: "nodes" }));
      act(() => result.current.goBack());
      act(() => result.current.navigate({ page: "deployments" }));

      expect(result.current.canGoForward).toBe(false);
      expect(result.current.canGoBack).toBe(true);
    });

    it("history is independent per tab", () => {
      const { result } = renderNav({ page: "pods" });

      // Navigate in first tab
      act(() => result.current.navigate({ page: "nodes" }));
      expect(result.current.canGoBack).toBe(true);

      // Open second tab
      act(() => result.current.openTab({ page: "deployments" }));
      expect(result.current.canGoBack).toBe(false);

      // Switch back to first tab
      const firstTabId = result.current.tabs[0].id;
      act(() => result.current.switchTab(firstTabId));
      expect(result.current.canGoBack).toBe(true);
    });
  });

  describe("getTabTitle", () => {
    it("returns correct titles for all route types", () => {
      expect(getTabTitle({ page: "cluster-select" })).toBe("Clusters");
      expect(getTabTitle({ page: "pods" })).toBe("Pods");
      expect(getTabTitle({ page: "pod-detail", namespace: "default", name: "nginx-abc" })).toBe("nginx-abc");
      expect(getTabTitle({ page: "nodes" })).toBe("Nodes");
      expect(getTabTitle({ page: "node-detail", name: "worker-1" })).toBe("worker-1");
      expect(getTabTitle({ page: "deployments" })).toBe("Deployments");
      expect(getTabTitle({ page: "deployment-detail", namespace: "prod", name: "api-server" })).toBe("api-server");
    });
  });
});
