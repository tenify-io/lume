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

const sampleServiceAccount = {
  name: "my-sa",
  namespace: "default",
  uid: "sa-uid-123",
  creationTimestamp: "2026-03-10 12:00:00 UTC",
  labels: { "app.kubernetes.io/managed-by": "helm" },
  annotations: { "description": "Main service account" },
  secrets: ["my-sa-token-abc", "my-sa-token-def"],
  imagePullSecrets: ["dockerhub-creds"],
  automountServiceAccountToken: true,
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
  mockBindings.GetPVCs.mockResolvedValue([]);
  mockBindings.GetStorageClasses.mockResolvedValue([]);
  mockBindings.GetServiceAccounts.mockResolvedValue([
    {
      name: "my-sa",
      namespace: "default",
      secrets: 2,
      age: "9d",
    },
  ]);
  mockBindings.GetServiceAccountDetail.mockResolvedValue(sampleServiceAccount);
  mockBindings.SetPreference.mockResolvedValue(undefined);
  mockBindings.SetContextAlias.mockResolvedValue(undefined);
});

describe("ServiceAccountDetailView", () => {
  it("shows ServiceAccount detail when clicking a service account", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("ServiceAccounts")).toBeInTheDocument();
    });
    await user.click(screen.getByText("ServiceAccounts"));

    await waitFor(() => {
      expect(screen.getByText("my-sa")).toBeInTheDocument();
    });
    await user.click(screen.getByText("my-sa"));

    await waitFor(() => {
      expect(mockBindings.GetServiceAccountDetail).toHaveBeenCalledWith("default", "my-sa");
    });

    await waitFor(() => {
      expect(screen.getByText("Secrets (2)")).toBeInTheDocument();
      expect(screen.getByText("Image Pull Secrets (1)")).toBeInTheDocument();
    });
  });

  it("displays secrets list and image pull secrets", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("ServiceAccounts")).toBeInTheDocument();
    });
    await user.click(screen.getByText("ServiceAccounts"));
    await waitFor(() => {
      expect(screen.getByText("my-sa")).toBeInTheDocument();
    });
    await user.click(screen.getByText("my-sa"));

    await waitFor(() => {
      expect(screen.getByText("my-sa-token-abc")).toBeInTheDocument();
      expect(screen.getByText("my-sa-token-def")).toBeInTheDocument();
      expect(screen.getByText("dockerhub-creds")).toBeInTheDocument();
    });
  });

  it("displays automount token setting", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("ServiceAccounts")).toBeInTheDocument();
    });
    await user.click(screen.getByText("ServiceAccounts"));
    await waitFor(() => {
      expect(screen.getByText("my-sa")).toBeInTheDocument();
    });
    await user.click(screen.getByText("my-sa"));

    await waitFor(() => {
      expect(screen.getByText("Automount Token")).toBeInTheDocument();
      expect(screen.getByText("Yes")).toBeInTheDocument();
    });
  });

  it("displays labels and annotations", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("ServiceAccounts")).toBeInTheDocument();
    });
    await user.click(screen.getByText("ServiceAccounts"));
    await waitFor(() => {
      expect(screen.getByText("my-sa")).toBeInTheDocument();
    });
    await user.click(screen.getByText("my-sa"));

    await waitFor(() => {
      expect(screen.getByText("Labels")).toBeInTheDocument();
      expect(screen.getByText("Annotations")).toBeInTheDocument();
    });
  });

  it("shows error state when ServiceAccount fetch fails", async () => {
    mockBindings.GetServiceAccountDetail.mockRejectedValue(
      new Error("service account not found"),
    );

    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("ServiceAccounts")).toBeInTheDocument();
    });
    await user.click(screen.getByText("ServiceAccounts"));
    await waitFor(() => {
      expect(screen.getByText("my-sa")).toBeInTheDocument();
    });
    await user.click(screen.getByText("my-sa"));

    await waitFor(() => {
      expect(
        screen.getByText("\u2190 Back"),
      ).toBeInTheDocument();
    });
  });
});
