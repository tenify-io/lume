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
  { name: "dev-local", cluster: "dev-cluster", user: "developer" },
];

const sampleStatefulSet = {
  name: "mysql-primary",
  namespace: "default",
  uid: "abc-123-def",
  creationTimestamp: "2026-03-10 12:00:00 UTC",
  labels: { app: "mysql", env: "prod" },
  annotations: { "app.kubernetes.io/version": "8.0" },
  ready: "3/3",
  currentReplicas: 3,
  updatedReplicas: 3,
  age: "9d",
  updateStrategy: "RollingUpdate",
  partition: 0,
  podManagementPolicy: "OrderedReady",
  serviceName: "mysql",
  revisionHistoryLimit: 10,
  minReadySeconds: 0,
  selector: { app: "mysql" },
  volumeClaimTemplates: [
    {
      name: "data",
      storageClass: "gp3",
      accessModes: ["ReadWriteOnce"],
      storage: "10Gi",
    },
  ],
  conditions: [
    {
      type: "Ready",
      status: "True",
      lastTransitionTime: "2026-03-10 12:01:00 UTC",
      reason: "AllReplicasReady",
      message: "All replicas are ready.",
    },
  ],
  images: ["mysql:8.0", "exporter:latest"],
};

const sampleEvents = [
  {
    type: "Normal",
    reason: "SuccessfulCreate",
    message: "create Pod mysql-primary-0 in StatefulSet mysql-primary successful",
    source: "statefulset-controller",
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
  mockBindings.GetStatefulSets.mockResolvedValue([
    {
      name: "mysql-primary",
      namespace: "default",
      ready: "3/3",
      serviceName: "mysql",
      age: "9d",
      images: ["mysql:8.0", "exporter:latest"],
    },
  ]);
  mockBindings.GetStatefulSetDetail.mockResolvedValue(sampleStatefulSet);
  mockBindings.GetStatefulSetEvents.mockResolvedValue(sampleEvents);
  mockBindings.SetPreference.mockResolvedValue(undefined);
  mockBindings.SetContextAlias.mockResolvedValue(undefined);
});

describe("StatefulSetDetailView", () => {
  it("shows statefulset detail when clicking a statefulset", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("StatefulSets")).toBeInTheDocument();
    });
    await user.click(screen.getByText("StatefulSets"));

    await waitFor(() => {
      expect(screen.getByText("mysql-primary")).toBeInTheDocument();
    });
    await user.click(screen.getByText("mysql-primary"));

    await waitFor(() => {
      expect(mockBindings.GetStatefulSetDetail).toHaveBeenCalledWith(
        "default",
        "mysql-primary",
      );
    });

    await waitFor(() => {
      // Quick stats
      expect(screen.getByText("3/3")).toBeInTheDocument();
      // Update strategy
      expect(screen.getByText("RollingUpdate")).toBeInTheDocument();
    });
  });

  it("displays statefulset conditions", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("StatefulSets")).toBeInTheDocument();
    });
    await user.click(screen.getByText("StatefulSets"));
    await waitFor(() => {
      expect(screen.getByText("mysql-primary")).toBeInTheDocument();
    });
    await user.click(screen.getByText("mysql-primary"));

    await waitFor(() => {
      expect(screen.getByText("Conditions")).toBeInTheDocument();
      expect(screen.getByText("AllReplicasReady")).toBeInTheDocument();
    });
  });

  it("displays statefulset events", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("StatefulSets")).toBeInTheDocument();
    });
    await user.click(screen.getByText("StatefulSets"));
    await waitFor(() => {
      expect(screen.getByText("mysql-primary")).toBeInTheDocument();
    });
    await user.click(screen.getByText("mysql-primary"));

    await waitFor(() => {
      expect(screen.getByText("Events (1)")).toBeInTheDocument();
      expect(screen.getByText("SuccessfulCreate")).toBeInTheDocument();
    });
  });

  it("displays labels and annotations", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("StatefulSets")).toBeInTheDocument();
    });
    await user.click(screen.getByText("StatefulSets"));
    await waitFor(() => {
      expect(screen.getByText("mysql-primary")).toBeInTheDocument();
    });
    await user.click(screen.getByText("mysql-primary"));

    await waitFor(() => {
      expect(screen.getByText("Labels")).toBeInTheDocument();
      expect(screen.getByText("Annotations")).toBeInTheDocument();
    });
  });

  it("displays images section", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("StatefulSets")).toBeInTheDocument();
    });
    await user.click(screen.getByText("StatefulSets"));
    await waitFor(() => {
      expect(screen.getByText("mysql-primary")).toBeInTheDocument();
    });
    await user.click(screen.getByText("mysql-primary"));

    await waitFor(() => {
      expect(screen.getByText("Images (2)")).toBeInTheDocument();
      expect(screen.getByText("mysql:8.0")).toBeInTheDocument();
      expect(screen.getByText("exporter:latest")).toBeInTheDocument();
    });
  });

  it("displays volume claim templates section", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("StatefulSets")).toBeInTheDocument();
    });
    await user.click(screen.getByText("StatefulSets"));
    await waitFor(() => {
      expect(screen.getByText("mysql-primary")).toBeInTheDocument();
    });
    await user.click(screen.getByText("mysql-primary"));

    await waitFor(() => {
      expect(
        screen.getByText("Volume Claim Templates (1)"),
      ).toBeInTheDocument();
      expect(screen.getByText("gp3")).toBeInTheDocument();
      expect(screen.getByText("10Gi")).toBeInTheDocument();
    });
  });

  it("shows error state when statefulset fetch fails", async () => {
    mockBindings.GetStatefulSetDetail.mockRejectedValue(
      new Error("statefulset not found"),
    );

    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("StatefulSets")).toBeInTheDocument();
    });
    await user.click(screen.getByText("StatefulSets"));
    await waitFor(() => {
      expect(screen.getByText("mysql-primary")).toBeInTheDocument();
    });
    await user.click(screen.getByText("mysql-primary"));

    await waitFor(() => {
      expect(
        screen.getByText("Back to StatefulSets"),
      ).toBeInTheDocument();
    });
  });
});
