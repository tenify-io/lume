import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

const mockBindings = vi.hoisted(() => ({
  GetContexts: vi.fn().mockResolvedValue([]),
  GetCurrentContext: vi.fn().mockResolvedValue(""),
  ConnectToContext: vi.fn().mockResolvedValue(undefined),
  GetNamespaces: vi.fn().mockResolvedValue([]),
  GetPods: vi.fn().mockResolvedValue([]),
  GetNodes: vi.fn().mockResolvedValue([]),
  GetNodeDetail: vi.fn().mockResolvedValue(null),
  GetNodeEvents: vi.fn().mockResolvedValue([]),
  GetPodDetail: vi.fn().mockResolvedValue(null),
  GetPodEvents: vi.fn().mockResolvedValue([]),
  GetDeployments: vi.fn().mockResolvedValue([]),
  GetDeploymentDetail: vi.fn().mockResolvedValue(null),
  GetDeploymentEvents: vi.fn().mockResolvedValue([]),
  GetStatefulSets: vi.fn().mockResolvedValue([]),
  GetStatefulSetDetail: vi.fn().mockResolvedValue(null),
  GetStatefulSetEvents: vi.fn().mockResolvedValue([]),
  GetPreference: vi.fn().mockResolvedValue(null),
  SetPreference: vi.fn().mockResolvedValue(undefined),
  GetContextAliases: vi.fn().mockResolvedValue({}),
  SetContextAlias: vi.fn().mockResolvedValue(undefined),
  DeletePreference: vi.fn().mockResolvedValue(undefined),
  GetAllPreferences: vi.fn().mockResolvedValue({}),
  WatchPods: vi.fn().mockResolvedValue(undefined),
  UnwatchAll: vi.fn().mockResolvedValue(undefined),
  GetClusterHealth: vi.fn().mockResolvedValue({ connected: true, latencyMs: 10, serverVersion: "v1.29.0", error: "" }),
  StartHealthCheck: vi.fn().mockResolvedValue(undefined),
  StopHealthCheck: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../wailsjs/go/main/App", () => mockBindings);

const mockRuntime = vi.hoisted(() => ({
  EventsOn: vi.fn().mockReturnValue(() => {}),
}));

vi.mock("../../wailsjs/runtime/runtime", () => mockRuntime);

const sampleContexts = [
  { name: "arn:aws:eks:us-east-1:123:cluster/prod", cluster: "prod-cluster", user: "admin" },
  { name: "dev-local", cluster: "dev-cluster", user: "developer" },
  { name: "gke_project_zone_staging", cluster: "staging-cluster", user: "gke-user" },
];

beforeEach(() => {
  vi.clearAllMocks();
  mockBindings.GetContexts.mockResolvedValue([]);
  mockBindings.GetCurrentContext.mockResolvedValue("");
  mockBindings.GetContextAliases.mockResolvedValue({});
  mockBindings.GetPreference.mockResolvedValue(null);
  mockBindings.ConnectToContext.mockResolvedValue(undefined);
  mockBindings.GetNamespaces.mockResolvedValue([]);
  mockBindings.GetPods.mockResolvedValue([]);
  mockBindings.GetNodes.mockResolvedValue([]);
  mockBindings.SetPreference.mockResolvedValue(undefined);
  mockBindings.SetContextAlias.mockResolvedValue(undefined);
});

describe("App", () => {
  it("renders the top bar with navigation arrows", async () => {
    render(<App />);
    await waitFor(() => {
      // TopBar renders back/forward arrows and a tab
      expect(screen.getByText("Clusters")).toBeInTheDocument();
    });
  });

  it("shows cluster selection view when no last_context", async () => {
    mockBindings.GetContexts.mockResolvedValue(sampleContexts);

    render(<App />);
    await waitFor(() => {
      expect(screen.getByText("Select a Cluster")).toBeInTheDocument();
    });
  });

  it("renders all cluster cards in selection view", async () => {
    mockBindings.GetContexts.mockResolvedValue(sampleContexts);

    render(<App />);
    await waitFor(() => {
      expect(screen.getByText("arn:aws:eks:us-east-1:123:cluster/prod")).toBeInTheDocument();
      expect(screen.getByText("dev-local")).toBeInTheDocument();
      expect(screen.getByText("gke_project_zone_staging")).toBeInTheDocument();
    });
  });

  it("auto-connects when last_context is set and valid", async () => {
    mockBindings.GetContexts.mockResolvedValue(sampleContexts);
    mockBindings.GetPreference.mockResolvedValue("dev-local");
    mockBindings.GetNamespaces.mockResolvedValue(["default", "kube-system"]);
    mockBindings.GetPods.mockResolvedValue([]);

    render(<App />);
    await waitFor(() => {
      expect(mockBindings.ConnectToContext).toHaveBeenCalledWith("dev-local");
    });
    // Should show the sidebar with Pods/Nodes navigation (also appears in tab)
    await waitFor(() => {
      expect(screen.getAllByText("Pods").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Nodes")).toBeInTheDocument();
    });
  });

  it("falls back to selection view when last_context is stale", async () => {
    mockBindings.GetContexts.mockResolvedValue(sampleContexts);
    mockBindings.GetPreference.mockResolvedValue("deleted-context");

    render(<App />);
    await waitFor(() => {
      expect(screen.getByText("Select a Cluster")).toBeInTheDocument();
    });
    expect(mockBindings.ConnectToContext).not.toHaveBeenCalled();
  });

  it("shows cluster name in status bar when connected", async () => {
    mockBindings.GetContexts.mockResolvedValue(sampleContexts);
    mockBindings.GetPreference.mockResolvedValue("dev-local");
    mockBindings.GetNamespaces.mockResolvedValue(["default"]);
    mockBindings.GetPods.mockResolvedValue([]);

    render(<App />);
    await waitFor(() => {
      expect(screen.getByText("dev-local")).toBeInTheDocument();
    });
  });

  it("shows alias in status bar when alias is set", async () => {
    mockBindings.GetContexts.mockResolvedValue(sampleContexts);
    mockBindings.GetContextAliases.mockResolvedValue({
      "arn:aws:eks:us-east-1:123:cluster/prod": "Production",
    });
    mockBindings.GetPreference.mockResolvedValue("arn:aws:eks:us-east-1:123:cluster/prod");
    mockBindings.GetNamespaces.mockResolvedValue(["default"]);
    mockBindings.GetPods.mockResolvedValue([]);

    render(<App />);
    await waitFor(() => {
      expect(screen.getByText("Production")).toBeInTheDocument();
    });
  });

  it("shows empty state message when no contexts found", async () => {
    mockBindings.GetContexts.mockResolvedValue([]);

    render(<App />);
    await waitFor(() => {
      expect(
        screen.getByText("No Kubernetes contexts found. Check your kubeconfig."),
      ).toBeInTheDocument();
    });
  });

  it("navigates to nodes view when clicking Nodes in sidebar", async () => {
    mockBindings.GetContexts.mockResolvedValue(sampleContexts);
    mockBindings.GetPreference.mockResolvedValue("dev-local");
    mockBindings.GetNamespaces.mockResolvedValue(["default"]);
    mockBindings.GetPods.mockResolvedValue([]);
    mockBindings.GetNodes.mockResolvedValue([]);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Nodes")).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByText("Nodes"));

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Search nodes...")).toBeInTheDocument();
    });
  });
});
