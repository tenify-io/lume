import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

const mockBindings = vi.hoisted(() => ({
  GetContexts: vi.fn().mockResolvedValue([]),
  GetCurrentContext: vi.fn().mockResolvedValue(""),
  ConnectToContext: vi.fn().mockResolvedValue(undefined),
  GetNamespaces: vi.fn().mockResolvedValue([]),
  GetNamespaceList: vi.fn().mockResolvedValue([]),
  GetNamespaceDetail: vi.fn().mockResolvedValue(null),
  GetNamespaceEvents: vi.fn().mockResolvedValue([]),
  GetNamespaceResourceSummary: vi.fn().mockResolvedValue(null),
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
  GetStorageClasses: vi.fn().mockResolvedValue([]),
  GetStorageClassDetail: vi.fn().mockResolvedValue(null),
  GetServiceAccounts: vi.fn().mockResolvedValue([]),
  GetServiceAccountDetail: vi.fn().mockResolvedValue(null),
  GetRoles: vi.fn().mockResolvedValue([]),
  GetRoleDetail: vi.fn().mockResolvedValue(null),
  GetClusterRoles: vi.fn().mockResolvedValue([]),
  GetClusterRoleDetail: vi.fn().mockResolvedValue(null),
  GetRoleBindings: vi.fn().mockResolvedValue([]),
  GetRoleBindingDetail: vi.fn().mockResolvedValue(null),
  GetClusterRoleBindings: vi.fn().mockResolvedValue([]),
  GetClusterRoleBindingDetail: vi.fn().mockResolvedValue(null),
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

const sampleNamespaceDetail = {
  name: "kube-system",
  status: "Active",
  age: "30d",
  uid: "ns-uid-123",
  creationTimestamp: "2026-02-17 10:00:00 UTC",
  labels: { "kubernetes.io/metadata.name": "kube-system" },
  annotations: { "description": "System namespace" },
  conditions: [
    {
      type: "NamespaceDeletionDiscoveryFailure",
      status: "False",
      lastTransitionTime: "2026-02-17 10:00:00 UTC",
      reason: "ResourcesDiscovered",
      message: "All resources successfully discovered",
    },
  ],
};

const sampleResourceSummary = {
  pods: 15,
  deployments: 3,
  statefulSets: 1,
  daemonSets: 2,
  jobs: 0,
  cronJobs: 1,
  services: 5,
  configMaps: 8,
  secrets: 12,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockBindings.GetContexts.mockResolvedValue(sampleContexts);
  mockBindings.GetCurrentContext.mockResolvedValue("");
  mockBindings.GetContextAliases.mockResolvedValue({});
  mockBindings.GetPreference.mockResolvedValue("dev-local");
  mockBindings.ConnectToContext.mockResolvedValue(undefined);
  mockBindings.GetNamespaces.mockResolvedValue(["default", "kube-system"]);
  mockBindings.GetNamespaceList.mockResolvedValue([
    { name: "default", status: "Active", age: "30d", labels: {} },
    { name: "kube-system", status: "Active", age: "30d", labels: {} },
  ]);
  mockBindings.GetNamespaceDetail.mockResolvedValue(sampleNamespaceDetail);
  mockBindings.GetNamespaceEvents.mockResolvedValue([]);
  mockBindings.GetNamespaceResourceSummary.mockResolvedValue(sampleResourceSummary);
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
  mockBindings.GetPVCs.mockResolvedValue([]);
  mockBindings.GetStorageClasses.mockResolvedValue([]);
  mockBindings.GetServiceAccounts.mockResolvedValue([]);
  mockBindings.GetRoles.mockResolvedValue([]);
  mockBindings.GetClusterRoles.mockResolvedValue([]);
  mockBindings.GetRoleBindings.mockResolvedValue([]);
  mockBindings.GetClusterRoleBindings.mockResolvedValue([]);
  mockBindings.SetPreference.mockResolvedValue(undefined);
  mockBindings.SetContextAlias.mockResolvedValue(undefined);
});

describe("NamespaceDetailView", () => {
  it("shows namespace detail when clicking a namespace", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Namespaces")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Namespaces"));

    await waitFor(() => {
      expect(screen.getByText("kube-system")).toBeInTheDocument();
    });
    await user.click(screen.getByText("kube-system"));

    await waitFor(() => {
      expect(mockBindings.GetNamespaceDetail).toHaveBeenCalledWith("kube-system");
    });

    await waitFor(() => {
      expect(screen.getByText("Resources")).toBeInTheDocument();
    });
  });

  it("displays resource summary cards with counts", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Namespaces")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Namespaces"));
    await waitFor(() => {
      expect(screen.getByText("kube-system")).toBeInTheDocument();
    });
    await user.click(screen.getByText("kube-system"));

    await waitFor(() => {
      expect(screen.getByText("15")).toBeInTheDocument();
      expect(screen.getAllByText("Pods").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getAllByText("Deployments").length).toBeGreaterThanOrEqual(1);
    });
  });

  it("displays labels and annotations", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Namespaces")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Namespaces"));
    await waitFor(() => {
      expect(screen.getByText("kube-system")).toBeInTheDocument();
    });
    await user.click(screen.getByText("kube-system"));

    await waitFor(() => {
      expect(screen.getByText("Labels")).toBeInTheDocument();
      expect(screen.getByText("Annotations")).toBeInTheDocument();
    });
  });

  it("displays conditions table", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Namespaces")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Namespaces"));
    await waitFor(() => {
      expect(screen.getByText("kube-system")).toBeInTheDocument();
    });
    await user.click(screen.getByText("kube-system"));

    await waitFor(() => {
      expect(screen.getByText("Conditions")).toBeInTheDocument();
      expect(screen.getByText("NamespaceDeletionDiscoveryFailure")).toBeInTheDocument();
    });
  });

  it("shows error state when namespace fetch fails", async () => {
    mockBindings.GetNamespaceDetail.mockRejectedValue(
      new Error("namespace not found"),
    );

    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Namespaces")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Namespaces"));
    await waitFor(() => {
      expect(screen.getByText("kube-system")).toBeInTheDocument();
    });
    await user.click(screen.getByText("kube-system"));

    await waitFor(() => {
      expect(
        screen.getByText("Back to Namespaces"),
      ).toBeInTheDocument();
    });
  });
});
