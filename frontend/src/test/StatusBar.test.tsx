import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
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
  GetDaemonSets: vi.fn().mockResolvedValue([]),
  GetDaemonSetDetail: vi.fn().mockResolvedValue(null),
  GetDaemonSetEvents: vi.fn().mockResolvedValue([]),
  GetReplicaSets: vi.fn().mockResolvedValue([]),
  GetReplicaSetDetail: vi.fn().mockResolvedValue(null),
  GetReplicaSetEvents: vi.fn().mockResolvedValue([]),
  GetJobs: vi.fn().mockResolvedValue([]),
  GetJobDetail: vi.fn().mockResolvedValue(null),
  GetJobEvents: vi.fn().mockResolvedValue([]),
  GetCronJobs: vi.fn().mockResolvedValue([]),
  GetCronJobDetail: vi.fn().mockResolvedValue(null),
  GetCronJobEvents: vi.fn().mockResolvedValue([]),
  GetServices: vi.fn().mockResolvedValue([]),
  GetServiceDetail: vi.fn().mockResolvedValue(null),
  GetServiceEvents: vi.fn().mockResolvedValue([]),
  GetIngresses: vi.fn().mockResolvedValue([]),
  GetIngressDetail: vi.fn().mockResolvedValue(null),
  GetIngressEvents: vi.fn().mockResolvedValue([]),
  GetNetworkPolicies: vi.fn().mockResolvedValue([]),
  GetNetworkPolicyDetail: vi.fn().mockResolvedValue(null),
  GetConfigMaps: vi.fn().mockResolvedValue([]),
  GetConfigMapDetail: vi.fn().mockResolvedValue(null),
  GetPreference: vi.fn().mockResolvedValue(null),
  SetPreference: vi.fn().mockResolvedValue(undefined),
  GetContextAliases: vi.fn().mockResolvedValue({}),
  SetContextAlias: vi.fn().mockResolvedValue(undefined),
  DeletePreference: vi.fn().mockResolvedValue(undefined),
  GetAllPreferences: vi.fn().mockResolvedValue({}),
  WatchPods: vi.fn().mockResolvedValue(undefined),
  UnwatchAll: vi.fn().mockResolvedValue(undefined),
  GetClusterHealth: vi.fn().mockResolvedValue({
    connected: true,
    latencyMs: 42,
    serverVersion: "v1.29.0",
    error: "",
  }),
  StartHealthCheck: vi.fn().mockResolvedValue(undefined),
  StopHealthCheck: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../wailsjs/go/main/App", () => mockBindings);

const mockRuntime = vi.hoisted(() => ({
  EventsOn: vi.fn().mockReturnValue(() => {}),
}));

vi.mock("../../wailsjs/runtime/runtime", () => mockRuntime);

const sampleContexts = [
  { name: "dev-local", cluster: "dev-cluster", user: "developer" },
];

beforeEach(() => {
  vi.clearAllMocks();
  mockBindings.GetContexts.mockResolvedValue(sampleContexts);
  mockBindings.GetCurrentContext.mockResolvedValue("");
  mockBindings.GetContextAliases.mockResolvedValue({});
  mockBindings.GetPreference.mockResolvedValue("dev-local");
  mockBindings.ConnectToContext.mockResolvedValue(undefined);
  mockBindings.GetNamespaces.mockResolvedValue(["default"]);
  mockBindings.GetPods.mockResolvedValue([]);
  mockBindings.SetPreference.mockResolvedValue(undefined);
  mockBindings.GetClusterHealth.mockResolvedValue({
    connected: true,
    latencyMs: 42,
    serverVersion: "v1.29.0",
    error: "",
  });
});

describe("StatusBar", () => {
  it("shows the cluster context name", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("dev-local")).toBeInTheDocument();
    });
  });

  it("shows the alias when one exists", async () => {
    mockBindings.GetContextAliases.mockResolvedValue({
      "dev-local": "Local Dev",
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Local Dev")).toBeInTheDocument();
    });
  });

  it("shows server version when connected", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("v1.29.0")).toBeInTheDocument();
    });
  });

  it("shows latency when connected", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("42ms")).toBeInTheDocument();
    });
  });

  it("shows All Namespaces when no namespace selected", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("All Namespaces")).toBeInTheDocument();
    });
  });

  it("calls GetClusterHealth on mount", async () => {
    render(<App />);

    await waitFor(() => {
      expect(mockBindings.GetClusterHealth).toHaveBeenCalled();
    });
  });

  it("subscribes to cluster:health events", async () => {
    render(<App />);

    await waitFor(() => {
      expect(mockRuntime.EventsOn).toHaveBeenCalledWith(
        "cluster:health",
        expect.any(Function),
      );
    });
  });

  it("shows reconnecting state when disconnected", async () => {
    mockBindings.GetClusterHealth.mockResolvedValue({
      connected: false,
      latencyMs: 0,
      serverVersion: "",
      error: "connection refused",
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Reconnecting...")).toBeInTheDocument();
    });
  });
});
