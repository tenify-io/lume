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

const sampleRoleBinding = {
  name: "my-binding",
  namespace: "default",
  kind: "RoleBinding",
  uid: "rb-uid-123",
  creationTimestamp: "2026-03-10 12:00:00 UTC",
  labels: { "app.kubernetes.io/managed-by": "helm" },
  annotations: { "description": "Test binding" },
  roleRef: {
    apiGroup: "rbac.authorization.k8s.io",
    kind: "Role",
    name: "my-role",
  },
  subjects: [
    { kind: "User", name: "alice", namespace: "", apiGroup: "rbac.authorization.k8s.io" },
    { kind: "ServiceAccount", name: "default", namespace: "default", apiGroup: "" },
  ],
  age: "9d",
};

const sampleClusterRoleBinding = {
  name: "cluster-admin-binding",
  namespace: "",
  kind: "ClusterRoleBinding",
  uid: "crb-uid-456",
  creationTimestamp: "2026-03-01 08:00:00 UTC",
  labels: {},
  annotations: {},
  roleRef: {
    apiGroup: "rbac.authorization.k8s.io",
    kind: "ClusterRole",
    name: "cluster-admin",
  },
  subjects: [
    { kind: "Group", name: "system:masters", namespace: "", apiGroup: "rbac.authorization.k8s.io" },
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
  mockBindings.GetRoles.mockResolvedValue([]);
  mockBindings.GetClusterRoles.mockResolvedValue([]);
  mockBindings.GetRoleBindings.mockResolvedValue([
    {
      name: "my-binding",
      namespace: "default",
      kind: "RoleBinding",
      roleRef: "Role/my-role",
      subjects: 2,
      age: "9d",
    },
  ]);
  mockBindings.GetClusterRoleBindings.mockResolvedValue([
    {
      name: "cluster-admin-binding",
      namespace: "",
      kind: "ClusterRoleBinding",
      roleRef: "ClusterRole/cluster-admin",
      subjects: 1,
      age: "18d",
    },
  ]);
  mockBindings.GetRoleBindingDetail.mockResolvedValue(sampleRoleBinding);
  mockBindings.GetClusterRoleBindingDetail.mockResolvedValue(sampleClusterRoleBinding);
  mockBindings.SetPreference.mockResolvedValue(undefined);
  mockBindings.SetContextAlias.mockResolvedValue(undefined);
});

describe("RoleBindingDetailView", () => {
  it("shows RoleBinding detail when clicking a role binding", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Bindings")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Bindings"));

    await waitFor(() => {
      expect(screen.getByText("my-binding")).toBeInTheDocument();
    });
    await user.click(screen.getByText("my-binding"));

    await waitFor(() => {
      expect(mockBindings.GetRoleBindingDetail).toHaveBeenCalledWith("default", "my-binding");
    });

    await waitFor(() => {
      expect(screen.getByText("Subjects (2)")).toBeInTheDocument();
    });
  });

  it("displays subjects table with subject details", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Bindings")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Bindings"));
    await waitFor(() => {
      expect(screen.getByText("my-binding")).toBeInTheDocument();
    });
    await user.click(screen.getByText("my-binding"));

    await waitFor(() => {
      expect(screen.getByText("alice")).toBeInTheDocument();
      expect(screen.getByText("Role Reference")).toBeInTheDocument();
    });
  });

  it("shows ClusterRoleBinding detail when clicking a cluster role binding", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Bindings")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Bindings"));

    await waitFor(() => {
      expect(screen.getByText("cluster-admin-binding")).toBeInTheDocument();
    });
    await user.click(screen.getByText("cluster-admin-binding"));

    await waitFor(() => {
      expect(mockBindings.GetClusterRoleBindingDetail).toHaveBeenCalledWith("cluster-admin-binding");
    });

    await waitFor(() => {
      expect(screen.getByText("Subjects (1)")).toBeInTheDocument();
    });
  });

  it("displays labels and annotations", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Bindings")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Bindings"));
    await waitFor(() => {
      expect(screen.getByText("my-binding")).toBeInTheDocument();
    });
    await user.click(screen.getByText("my-binding"));

    await waitFor(() => {
      expect(screen.getByText("Labels")).toBeInTheDocument();
      expect(screen.getByText("Annotations")).toBeInTheDocument();
    });
  });

  it("shows error state when RoleBinding fetch fails", async () => {
    mockBindings.GetRoleBindingDetail.mockRejectedValue(
      new Error("binding not found"),
    );

    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Bindings")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Bindings"));
    await waitFor(() => {
      expect(screen.getByText("my-binding")).toBeInTheDocument();
    });
    await user.click(screen.getByText("my-binding"));

    await waitFor(() => {
      expect(
        screen.getByText("Back to Bindings"),
      ).toBeInTheDocument();
    });
  });
});
