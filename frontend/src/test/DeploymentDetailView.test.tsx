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

const sampleDeployment = {
  name: "web-app",
  namespace: "default",
  uid: "abc-123-def",
  creationTimestamp: "2026-03-10 12:00:00 UTC",
  labels: { app: "web", env: "prod" },
  annotations: { "deployment.kubernetes.io/revision": "3" },
  ready: "3/3",
  upToDate: 3,
  available: 3,
  age: "9d",
  strategy: "RollingUpdate",
  minReadySeconds: 10,
  revisionHistoryLimit: 10,
  selector: { app: "web" },
  maxSurge: "25%",
  maxUnavailable: "1",
  conditions: [
    {
      type: "Available",
      status: "True",
      lastTransitionTime: "2026-03-10 12:01:00 UTC",
      reason: "MinimumReplicasAvailable",
      message: "Deployment has minimum availability.",
    },
    {
      type: "Progressing",
      status: "True",
      lastTransitionTime: "2026-03-10 12:01:00 UTC",
      reason: "NewReplicaSetAvailable",
      message: "ReplicaSet has successfully progressed.",
    },
  ],
  images: ["nginx:1.25", "sidecar:latest"],
};

const sampleEvents = [
  {
    type: "Normal",
    reason: "ScalingReplicaSet",
    message: "Scaled up replica set web-app-abc123 to 3",
    source: "deployment-controller",
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
  mockBindings.GetDeployments.mockResolvedValue([
    {
      name: "web-app",
      namespace: "default",
      ready: "3/3",
      upToDate: 3,
      available: 3,
      age: "9d",
      strategy: "RollingUpdate",
      images: ["nginx:1.25", "sidecar:latest"],
    },
  ]);
  mockBindings.GetDeploymentDetail.mockResolvedValue(sampleDeployment);
  mockBindings.GetDeploymentEvents.mockResolvedValue(sampleEvents);
  mockBindings.SetPreference.mockResolvedValue(undefined);
  mockBindings.SetContextAlias.mockResolvedValue(undefined);
});

describe("DeploymentDetailView", () => {
  it("shows deployment detail when clicking a deployment", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Deployments")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Deployments"));

    await waitFor(() => {
      expect(screen.getByText("web-app")).toBeInTheDocument();
    });
    await user.click(screen.getByText("web-app"));

    await waitFor(() => {
      expect(mockBindings.GetDeploymentDetail).toHaveBeenCalledWith(
        "default",
        "web-app",
      );
    });

    await waitFor(() => {
      // Quick stats
      expect(screen.getByText("3/3")).toBeInTheDocument();
      // Strategy
      expect(screen.getByText("RollingUpdate")).toBeInTheDocument();
    });
  });

  it("displays deployment conditions", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Deployments")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Deployments"));
    await waitFor(() => {
      expect(screen.getByText("web-app")).toBeInTheDocument();
    });
    await user.click(screen.getByText("web-app"));

    await waitFor(() => {
      expect(screen.getByText("Conditions")).toBeInTheDocument();
      expect(
        screen.getByText("MinimumReplicasAvailable"),
      ).toBeInTheDocument();
    });
  });

  it("displays deployment events", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Deployments")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Deployments"));
    await waitFor(() => {
      expect(screen.getByText("web-app")).toBeInTheDocument();
    });
    await user.click(screen.getByText("web-app"));

    await waitFor(() => {
      expect(screen.getByText("Events (1)")).toBeInTheDocument();
      expect(screen.getByText("ScalingReplicaSet")).toBeInTheDocument();
    });
  });

  it("displays labels and annotations", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Deployments")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Deployments"));
    await waitFor(() => {
      expect(screen.getByText("web-app")).toBeInTheDocument();
    });
    await user.click(screen.getByText("web-app"));

    await waitFor(() => {
      expect(screen.getByText("Labels")).toBeInTheDocument();
      expect(screen.getByText("Annotations")).toBeInTheDocument();
    });
  });

  it("displays images section", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Deployments")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Deployments"));
    await waitFor(() => {
      expect(screen.getByText("web-app")).toBeInTheDocument();
    });
    await user.click(screen.getByText("web-app"));

    await waitFor(() => {
      expect(screen.getByText("Images (2)")).toBeInTheDocument();
      expect(screen.getByText("nginx:1.25")).toBeInTheDocument();
      expect(screen.getByText("sidecar:latest")).toBeInTheDocument();
    });
  });

  it("shows error state when deployment fetch fails", async () => {
    mockBindings.GetDeploymentDetail.mockRejectedValue(
      new Error("deployment not found"),
    );

    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Deployments")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Deployments"));
    await waitFor(() => {
      expect(screen.getByText("web-app")).toBeInTheDocument();
    });
    await user.click(screen.getByText("web-app"));

    await waitFor(() => {
      expect(
        screen.getByText("Back to Deployments"),
      ).toBeInTheDocument();
    });
  });
});
