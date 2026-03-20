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
  { name: "dev-local", cluster: "dev-cluster", user: "developer" },
];

const sampleDaemonSet = {
  name: "node-exporter",
  namespace: "monitoring",
  uid: "abc-123-def",
  creationTimestamp: "2026-03-10 12:00:00 UTC",
  labels: { app: "node-exporter", env: "prod" },
  annotations: { "app.kubernetes.io/version": "1.5.0" },
  desired: 3,
  current: 3,
  ready: 3,
  upToDate: 3,
  available: 3,
  age: "9d",
  updateStrategy: "RollingUpdate",
  minReadySeconds: 0,
  revisionHistoryLimit: 10,
  selector: { app: "node-exporter" },
  nodeSelector: { "kubernetes.io/os": "linux" },
  conditions: [
    {
      type: "Available",
      status: "True",
      lastTransitionTime: "2026-03-10 12:01:00 UTC",
      reason: "MinimumReplicasAvailable",
      message: "DaemonSet has minimum availability.",
    },
  ],
  images: ["prom/node-exporter:latest", "sidecar:v1"],
};

const sampleEvents = [
  {
    type: "Normal",
    reason: "SuccessfulCreate",
    message: "Created pod: node-exporter-abc12",
    source: "daemonset-controller",
    count: 1,
    firstTimestamp: "2026-03-10 12:00:00 UTC",
    lastTimestamp: "2026-03-10 12:00:00 UTC",
    age: "9d",
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  mockBindings.GetContexts.mockResolvedValue(sampleContexts);
  mockBindings.GetCurrentContext.mockResolvedValue("");
  mockBindings.GetContextAliases.mockResolvedValue({});
  mockBindings.GetPreference.mockResolvedValue("dev-local");
  mockBindings.ConnectToContext.mockResolvedValue(undefined);
  mockBindings.GetNamespaces.mockResolvedValue(["monitoring"]);
  mockBindings.GetPods.mockResolvedValue([]);
  mockBindings.GetNodes.mockResolvedValue([]);
  mockBindings.GetDeployments.mockResolvedValue([]);
  mockBindings.GetStatefulSets.mockResolvedValue([]);
  mockBindings.GetDaemonSets.mockResolvedValue([
    {
      name: "node-exporter",
      namespace: "monitoring",
      desired: 3,
      current: 3,
      ready: 3,
      upToDate: 3,
      available: 3,
      age: "9d",
      nodeSelector: "kubernetes.io/os=linux",
      images: ["prom/node-exporter:latest", "sidecar:v1"],
    },
  ]);
  mockBindings.GetDaemonSetDetail.mockResolvedValue(sampleDaemonSet);
  mockBindings.GetDaemonSetEvents.mockResolvedValue(sampleEvents);
  mockBindings.SetPreference.mockResolvedValue(undefined);
  mockBindings.SetContextAlias.mockResolvedValue(undefined);
});

describe("DaemonSetDetailView", () => {
  it("shows daemonset detail when clicking a daemonset", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("DaemonSets")).toBeInTheDocument();
    });
    await user.click(screen.getByText("DaemonSets"));

    await waitFor(() => {
      expect(screen.getByText("node-exporter")).toBeInTheDocument();
    });
    await user.click(screen.getByText("node-exporter"));

    await waitFor(() => {
      expect(mockBindings.GetDaemonSetDetail).toHaveBeenCalledWith(
        "monitoring",
        "node-exporter",
      );
    });

    await waitFor(() => {
      // Quick stats
      expect(screen.getByText("RollingUpdate")).toBeInTheDocument();
    });
  });

  it("displays daemonset conditions", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("DaemonSets")).toBeInTheDocument();
    });
    await user.click(screen.getByText("DaemonSets"));
    await waitFor(() => {
      expect(screen.getByText("node-exporter")).toBeInTheDocument();
    });
    await user.click(screen.getByText("node-exporter"));

    await waitFor(() => {
      expect(screen.getByText("Conditions")).toBeInTheDocument();
      expect(screen.getByText("MinimumReplicasAvailable")).toBeInTheDocument();
    });
  });

  it("displays daemonset events", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("DaemonSets")).toBeInTheDocument();
    });
    await user.click(screen.getByText("DaemonSets"));
    await waitFor(() => {
      expect(screen.getByText("node-exporter")).toBeInTheDocument();
    });
    await user.click(screen.getByText("node-exporter"));

    await waitFor(() => {
      expect(screen.getByText("Events (1)")).toBeInTheDocument();
      expect(screen.getByText("SuccessfulCreate")).toBeInTheDocument();
    });
  });

  it("displays labels and annotations", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("DaemonSets")).toBeInTheDocument();
    });
    await user.click(screen.getByText("DaemonSets"));
    await waitFor(() => {
      expect(screen.getByText("node-exporter")).toBeInTheDocument();
    });
    await user.click(screen.getByText("node-exporter"));

    await waitFor(() => {
      expect(screen.getByText("Labels")).toBeInTheDocument();
      expect(screen.getByText("Annotations")).toBeInTheDocument();
    });
  });

  it("displays images section", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("DaemonSets")).toBeInTheDocument();
    });
    await user.click(screen.getByText("DaemonSets"));
    await waitFor(() => {
      expect(screen.getByText("node-exporter")).toBeInTheDocument();
    });
    await user.click(screen.getByText("node-exporter"));

    await waitFor(() => {
      expect(screen.getByText("Images (2)")).toBeInTheDocument();
      expect(screen.getByText("prom/node-exporter:latest")).toBeInTheDocument();
      expect(screen.getByText("sidecar:v1")).toBeInTheDocument();
    });
  });

  it("displays node selector section", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("DaemonSets")).toBeInTheDocument();
    });
    await user.click(screen.getByText("DaemonSets"));
    await waitFor(() => {
      expect(screen.getByText("node-exporter")).toBeInTheDocument();
    });
    await user.click(screen.getByText("node-exporter"));

    await waitFor(() => {
      expect(screen.getByText("Node Selector")).toBeInTheDocument();
    });
  });

  it("shows error state when daemonset fetch fails", async () => {
    mockBindings.GetDaemonSetDetail.mockRejectedValue(
      new Error("daemonset not found"),
    );

    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("DaemonSets")).toBeInTheDocument();
    });
    await user.click(screen.getByText("DaemonSets"));
    await waitFor(() => {
      expect(screen.getByText("node-exporter")).toBeInTheDocument();
    });
    await user.click(screen.getByText("node-exporter"));

    await waitFor(() => {
      expect(
        screen.getByText("Back to DaemonSets"),
      ).toBeInTheDocument();
    });
  });
});
