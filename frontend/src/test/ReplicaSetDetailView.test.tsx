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

const sampleReplicaSet = {
  name: "nginx-abc123",
  namespace: "default",
  uid: "rs-uid-123",
  creationTimestamp: "2026-03-10 12:00:00 UTC",
  labels: { app: "nginx", "pod-template-hash": "abc123" },
  annotations: { "deployment.kubernetes.io/revision": "1" },
  desired: 3,
  current: 3,
  ready: 3,
  age: "9d",
  selector: { app: "nginx", "pod-template-hash": "abc123" },
  ownerReferences: [{ kind: "Deployment", name: "nginx" }],
  conditions: [
    {
      type: "ReplicaFailure",
      status: "False",
      lastTransitionTime: "2026-03-10 12:01:00 UTC",
      reason: "",
      message: "",
    },
  ],
  images: ["nginx:1.25", "sidecar:v1"],
};

const sampleEvents = [
  {
    type: "Normal",
    reason: "SuccessfulCreate",
    message: "Created pod: nginx-abc123-xyz",
    source: "replicaset-controller",
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
  mockBindings.GetNamespaces.mockResolvedValue(["default"]);
  mockBindings.GetPods.mockResolvedValue([]);
  mockBindings.GetNodes.mockResolvedValue([]);
  mockBindings.GetDeployments.mockResolvedValue([]);
  mockBindings.GetStatefulSets.mockResolvedValue([]);
  mockBindings.GetDaemonSets.mockResolvedValue([]);
  mockBindings.GetReplicaSets.mockResolvedValue([
    {
      name: "nginx-abc123",
      namespace: "default",
      desired: 3,
      current: 3,
      ready: 3,
      age: "9d",
      owner: "nginx",
      images: ["nginx:1.25", "sidecar:v1"],
    },
  ]);
  mockBindings.GetReplicaSetDetail.mockResolvedValue(sampleReplicaSet);
  mockBindings.GetReplicaSetEvents.mockResolvedValue(sampleEvents);
  mockBindings.SetPreference.mockResolvedValue(undefined);
  mockBindings.SetContextAlias.mockResolvedValue(undefined);
});

describe("ReplicaSetDetailView", () => {
  it("shows replicaset detail when clicking a replicaset", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("ReplicaSets")).toBeInTheDocument();
    });
    await user.click(screen.getByText("ReplicaSets"));

    await waitFor(() => {
      expect(screen.getByText("nginx-abc123")).toBeInTheDocument();
    });
    await user.click(screen.getByText("nginx-abc123"));

    await waitFor(() => {
      expect(mockBindings.GetReplicaSetDetail).toHaveBeenCalledWith(
        "default",
        "nginx-abc123",
      );
    });

    await waitFor(() => {
      // Check the quick stats rendered
      expect(screen.getByText("Desired")).toBeInTheDocument();
      expect(screen.getByText("Current")).toBeInTheDocument();
    });
  });

  it("displays owner references with link", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("ReplicaSets")).toBeInTheDocument();
    });
    await user.click(screen.getByText("ReplicaSets"));
    await waitFor(() => {
      expect(screen.getByText("nginx-abc123")).toBeInTheDocument();
    });
    await user.click(screen.getByText("nginx-abc123"));

    await waitFor(() => {
      expect(screen.getByText("Owner References")).toBeInTheDocument();
      // The owner reference link to the deployment
      const ownerLink = screen.getByRole("button", { name: "nginx" });
      expect(ownerLink).toBeInTheDocument();
      expect(ownerLink).toHaveClass("text-zinc-200");
    });
  });

  it("displays conditions", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("ReplicaSets")).toBeInTheDocument();
    });
    await user.click(screen.getByText("ReplicaSets"));
    await waitFor(() => {
      expect(screen.getByText("nginx-abc123")).toBeInTheDocument();
    });
    await user.click(screen.getByText("nginx-abc123"));

    await waitFor(() => {
      expect(screen.getByText("Conditions")).toBeInTheDocument();
      expect(screen.getByText("ReplicaFailure")).toBeInTheDocument();
    });
  });

  it("displays events", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("ReplicaSets")).toBeInTheDocument();
    });
    await user.click(screen.getByText("ReplicaSets"));
    await waitFor(() => {
      expect(screen.getByText("nginx-abc123")).toBeInTheDocument();
    });
    await user.click(screen.getByText("nginx-abc123"));

    await waitFor(() => {
      expect(screen.getByText("Events (1)")).toBeInTheDocument();
      expect(screen.getByText("SuccessfulCreate")).toBeInTheDocument();
    });
  });

  it("displays images section", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("ReplicaSets")).toBeInTheDocument();
    });
    await user.click(screen.getByText("ReplicaSets"));
    await waitFor(() => {
      expect(screen.getByText("nginx-abc123")).toBeInTheDocument();
    });
    await user.click(screen.getByText("nginx-abc123"));

    await waitFor(() => {
      expect(screen.getByText("Images (2)")).toBeInTheDocument();
      expect(screen.getByText("nginx:1.25")).toBeInTheDocument();
      expect(screen.getByText("sidecar:v1")).toBeInTheDocument();
    });
  });

  it("displays labels and annotations", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("ReplicaSets")).toBeInTheDocument();
    });
    await user.click(screen.getByText("ReplicaSets"));
    await waitFor(() => {
      expect(screen.getByText("nginx-abc123")).toBeInTheDocument();
    });
    await user.click(screen.getByText("nginx-abc123"));

    await waitFor(() => {
      expect(screen.getByText("Labels")).toBeInTheDocument();
      expect(screen.getByText("Annotations")).toBeInTheDocument();
    });
  });

  it("shows error state when replicaset fetch fails", async () => {
    mockBindings.GetReplicaSetDetail.mockRejectedValue(
      new Error("replicaset not found"),
    );

    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("ReplicaSets")).toBeInTheDocument();
    });
    await user.click(screen.getByText("ReplicaSets"));
    await waitFor(() => {
      expect(screen.getByText("nginx-abc123")).toBeInTheDocument();
    });
    await user.click(screen.getByText("nginx-abc123"));

    await waitFor(() => {
      expect(
        screen.getByText("\u2190 Back"),
      ).toBeInTheDocument();
    });
  });
});
