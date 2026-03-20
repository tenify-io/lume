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
  GetStorageClasses: vi.fn().mockResolvedValue([]),
  GetStorageClassDetail: vi.fn().mockResolvedValue(null),
  GetServiceAccounts: vi.fn().mockResolvedValue([]),
  GetServiceAccountDetail: vi.fn().mockResolvedValue(null),
  GetRoles: vi.fn().mockResolvedValue([]),
  GetRoleDetail: vi.fn().mockResolvedValue(null),
  GetClusterRoles: vi.fn().mockResolvedValue([]),
  GetClusterRoleDetail: vi.fn().mockResolvedValue(null),
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

const sampleRole = {
  name: "my-role",
  namespace: "default",
  kind: "Role",
  uid: "role-uid-123",
  creationTimestamp: "2026-03-10 12:00:00 UTC",
  labels: { "app.kubernetes.io/managed-by": "helm" },
  annotations: { "description": "Test role" },
  rules: [
    {
      apiGroups: [""],
      resources: ["pods"],
      verbs: ["get", "list", "watch"],
      resourceNames: [],
      nonResourceURLs: [],
    },
    {
      apiGroups: ["apps"],
      resources: ["deployments"],
      verbs: ["get"],
      resourceNames: ["my-deploy"],
      nonResourceURLs: [],
    },
  ],
  age: "9d",
};

const sampleClusterRole = {
  name: "cluster-reader",
  namespace: "",
  kind: "ClusterRole",
  uid: "cr-uid-456",
  creationTimestamp: "2026-03-01 08:00:00 UTC",
  labels: {},
  annotations: {},
  rules: [
    {
      apiGroups: ["*"],
      resources: ["*"],
      verbs: ["get", "list"],
      resourceNames: [],
      nonResourceURLs: [],
    },
  ],
  age: "18d",
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
  mockBindings.GetPVCs.mockResolvedValue([]);
  mockBindings.GetStorageClasses.mockResolvedValue([]);
  mockBindings.GetServiceAccounts.mockResolvedValue([]);
  mockBindings.GetRoles.mockResolvedValue([
    {
      name: "my-role",
      namespace: "default",
      kind: "Role",
      rules: 2,
      age: "9d",
    },
  ]);
  mockBindings.GetClusterRoles.mockResolvedValue([
    {
      name: "cluster-reader",
      namespace: "",
      kind: "ClusterRole",
      rules: 1,
      age: "18d",
    },
  ]);
  mockBindings.GetRoleDetail.mockResolvedValue(sampleRole);
  mockBindings.GetClusterRoleDetail.mockResolvedValue(sampleClusterRole);
  mockBindings.SetPreference.mockResolvedValue(undefined);
  mockBindings.SetContextAlias.mockResolvedValue(undefined);
});

describe("RoleDetailView", () => {
  it("shows Role detail when clicking a role", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Roles")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Roles"));

    await waitFor(() => {
      expect(screen.getByText("my-role")).toBeInTheDocument();
    });
    await user.click(screen.getByText("my-role"));

    await waitFor(() => {
      expect(mockBindings.GetRoleDetail).toHaveBeenCalledWith("default", "my-role");
    });

    await waitFor(() => {
      expect(screen.getByText("Rules (2)")).toBeInTheDocument();
    });
  });

  it("displays rules table with policy details", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Roles")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Roles"));
    await waitFor(() => {
      expect(screen.getByText("my-role")).toBeInTheDocument();
    });
    await user.click(screen.getByText("my-role"));

    await waitFor(() => {
      expect(screen.getByText("get, list, watch")).toBeInTheDocument();
      expect(screen.getByText("my-deploy")).toBeInTheDocument();
    });
  });

  it("shows ClusterRole detail when clicking a cluster role", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Roles")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Roles"));

    await waitFor(() => {
      expect(screen.getByText("cluster-reader")).toBeInTheDocument();
    });
    await user.click(screen.getByText("cluster-reader"));

    await waitFor(() => {
      expect(mockBindings.GetClusterRoleDetail).toHaveBeenCalledWith("cluster-reader");
    });

    await waitFor(() => {
      expect(screen.getByText("Rules (1)")).toBeInTheDocument();
    });
  });

  it("displays labels and annotations", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Roles")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Roles"));
    await waitFor(() => {
      expect(screen.getByText("my-role")).toBeInTheDocument();
    });
    await user.click(screen.getByText("my-role"));

    await waitFor(() => {
      expect(screen.getByText("Labels")).toBeInTheDocument();
      expect(screen.getByText("Annotations")).toBeInTheDocument();
    });
  });

  it("shows error state when Role fetch fails", async () => {
    mockBindings.GetRoleDetail.mockRejectedValue(
      new Error("role not found"),
    );

    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Roles")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Roles"));
    await waitFor(() => {
      expect(screen.getByText("my-role")).toBeInTheDocument();
    });
    await user.click(screen.getByText("my-role"));

    await waitFor(() => {
      expect(
        screen.getByText("Back to Roles"),
      ).toBeInTheDocument();
    });
  });
});
