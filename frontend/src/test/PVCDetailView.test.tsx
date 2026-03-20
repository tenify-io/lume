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
  GetSecrets: vi.fn().mockResolvedValue([]),
  GetSecretDetail: vi.fn().mockResolvedValue(null),
  GetPVCs: vi.fn().mockResolvedValue([]),
  GetPVCDetail: vi.fn().mockResolvedValue(null),
  GetPVCEvents: vi.fn().mockResolvedValue([]),
  GetPersistentVolumes: vi.fn().mockResolvedValue([]),
  GetPersistentVolumeDetail: vi.fn().mockResolvedValue(null),
  GetPersistentVolumeEvents: vi.fn().mockResolvedValue([]),
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

const samplePVC = {
  name: "data-claim",
  namespace: "default",
  uid: "pvc-uid-123",
  creationTimestamp: "2026-03-10 12:00:00 UTC",
  labels: { app: "myapp" },
  annotations: { "pv.kubernetes.io/bind-completed": "yes" },
  status: "Bound",
  volume: "pv-data-01",
  capacity: "10Gi",
  accessModes: "RWO",
  storageClass: "gp3",
  volumeMode: "Filesystem",
  dataSource: "",
  conditions: [
    {
      type: "Resizing",
      status: "True",
      lastTransitionTime: "2026-03-15 10:00:00 UTC",
      reason: "ExpandPending",
      message: "Waiting for volume expansion",
    },
  ],
  age: "9d",
};

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
  mockBindings.GetReplicaSets.mockResolvedValue([]);
  mockBindings.GetJobs.mockResolvedValue([]);
  mockBindings.GetCronJobs.mockResolvedValue([]);
  mockBindings.GetServices.mockResolvedValue([]);
  mockBindings.GetIngresses.mockResolvedValue([]);
  mockBindings.GetNetworkPolicies.mockResolvedValue([]);
  mockBindings.GetConfigMaps.mockResolvedValue([]);
  mockBindings.GetSecrets.mockResolvedValue([]);
  mockBindings.GetPersistentVolumes.mockResolvedValue([]);
  mockBindings.GetPVCs.mockResolvedValue([
    {
      name: "data-claim",
      namespace: "default",
      status: "Bound",
      volume: "pv-data-01",
      capacity: "10Gi",
      accessModes: "RWO",
      storageClass: "gp3",
      volumeMode: "Filesystem",
      age: "9d",
    },
  ]);
  mockBindings.GetPVCDetail.mockResolvedValue(samplePVC);
  mockBindings.SetPreference.mockResolvedValue(undefined);
  mockBindings.SetContextAlias.mockResolvedValue(undefined);
});

describe("PVCDetailView", () => {
  it("shows PVC detail when clicking a persistent volume claim", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("PVCs")).toBeInTheDocument();
    });
    await user.click(screen.getByText("PVCs"));

    await waitFor(() => {
      expect(screen.getByText("data-claim")).toBeInTheDocument();
    });
    await user.click(screen.getByText("data-claim"));

    await waitFor(() => {
      expect(mockBindings.GetPVCDetail).toHaveBeenCalledWith(
        "default",
        "data-claim",
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Capacity")).toBeInTheDocument();
      expect(screen.getByText("Access Modes")).toBeInTheDocument();
    });
  });

  it("displays storage class and volume mode", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("PVCs")).toBeInTheDocument();
    });
    await user.click(screen.getByText("PVCs"));
    await waitFor(() => {
      expect(screen.getByText("data-claim")).toBeInTheDocument();
    });
    await user.click(screen.getByText("data-claim"));

    await waitFor(() => {
      expect(screen.getByText("Storage Class")).toBeInTheDocument();
      expect(screen.getByText("gp3")).toBeInTheDocument();
      expect(screen.getByText("Volume Mode")).toBeInTheDocument();
      expect(screen.getByText("Filesystem")).toBeInTheDocument();
    });
  });

  it("displays conditions table", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("PVCs")).toBeInTheDocument();
    });
    await user.click(screen.getByText("PVCs"));
    await waitFor(() => {
      expect(screen.getByText("data-claim")).toBeInTheDocument();
    });
    await user.click(screen.getByText("data-claim"));

    await waitFor(() => {
      expect(screen.getByText("Conditions (1)")).toBeInTheDocument();
      expect(screen.getByText("Resizing")).toBeInTheDocument();
      expect(screen.getByText("ExpandPending")).toBeInTheDocument();
    });
  });

  it("displays labels and annotations", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("PVCs")).toBeInTheDocument();
    });
    await user.click(screen.getByText("PVCs"));
    await waitFor(() => {
      expect(screen.getByText("data-claim")).toBeInTheDocument();
    });
    await user.click(screen.getByText("data-claim"));

    await waitFor(() => {
      expect(screen.getByText("Labels")).toBeInTheDocument();
      expect(screen.getByText("Annotations")).toBeInTheDocument();
    });
  });

  it("shows error state when PVC fetch fails", async () => {
    mockBindings.GetPVCDetail.mockRejectedValue(
      new Error("pvc not found"),
    );

    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("PVCs")).toBeInTheDocument();
    });
    await user.click(screen.getByText("PVCs"));
    await waitFor(() => {
      expect(screen.getByText("data-claim")).toBeInTheDocument();
    });
    await user.click(screen.getByText("data-claim"));

    await waitFor(() => {
      expect(
        screen.getByText("Back to PVCs"),
      ).toBeInTheDocument();
    });
  });
});
