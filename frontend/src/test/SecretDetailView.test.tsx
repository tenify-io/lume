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

const sampleSecret = {
  name: "db-credentials",
  namespace: "default",
  uid: "secret-uid-123",
  creationTimestamp: "2026-03-10 12:00:00 UTC",
  labels: { app: "database" },
  annotations: { "managed-by": "helm" },
  type: "Opaque",
  data: {
    username: "admin",
    password: "s3cret-p@ssw0rd",
  },
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
  mockBindings.GetSecrets.mockResolvedValue([
    {
      name: "db-credentials",
      namespace: "default",
      type: "Opaque",
      dataCount: 2,
      age: "9d",
    },
  ]);
  mockBindings.GetSecretDetail.mockResolvedValue(sampleSecret);
  mockBindings.SetPreference.mockResolvedValue(undefined);
  mockBindings.SetContextAlias.mockResolvedValue(undefined);
});

describe("SecretDetailView", () => {
  it("shows secret detail when clicking a secret", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Secrets")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Secrets"));

    await waitFor(() => {
      expect(screen.getByText("db-credentials")).toBeInTheDocument();
    });
    await user.click(screen.getByText("db-credentials"));

    await waitFor(() => {
      expect(mockBindings.GetSecretDetail).toHaveBeenCalledWith(
        "default",
        "db-credentials",
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Type")).toBeInTheDocument();
      expect(screen.getByText("Data Keys")).toBeInTheDocument();
    });
  });

  it("displays data keys with masked values by default", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Secrets")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Secrets"));
    await waitFor(() => {
      expect(screen.getByText("db-credentials")).toBeInTheDocument();
    });
    await user.click(screen.getByText("db-credentials"));

    await waitFor(() => {
      expect(screen.getByText("Data (2)")).toBeInTheDocument();
      expect(screen.getByText("username")).toBeInTheDocument();
      expect(screen.getByText("password")).toBeInTheDocument();
    });

    // Values should be masked by default
    const maskedValues = screen.getAllByText("\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022");
    expect(maskedValues.length).toBe(2);
  });

  it("reveals value when clicking the eye icon", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Secrets")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Secrets"));
    await waitFor(() => {
      expect(screen.getByText("db-credentials")).toBeInTheDocument();
    });
    await user.click(screen.getByText("db-credentials"));

    await waitFor(() => {
      expect(screen.getByText("username")).toBeInTheDocument();
    });

    // Click the first reveal button (keys are sorted: password, username)
    const revealButtons = screen.getAllByTitle("Reveal value");
    await user.click(revealButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("s3cret-p@ssw0rd")).toBeInTheDocument();
    });

    // The other value should still be masked
    const maskedValues = screen.getAllByText("\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022");
    expect(maskedValues.length).toBe(1);
  });

  it("displays labels and annotations", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Secrets")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Secrets"));
    await waitFor(() => {
      expect(screen.getByText("db-credentials")).toBeInTheDocument();
    });
    await user.click(screen.getByText("db-credentials"));

    await waitFor(() => {
      expect(screen.getByText("Labels")).toBeInTheDocument();
      expect(screen.getByText("Annotations")).toBeInTheDocument();
    });
  });

  it("shows error state when secret fetch fails", async () => {
    mockBindings.GetSecretDetail.mockRejectedValue(
      new Error("secret not found"),
    );

    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Secrets")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Secrets"));
    await waitFor(() => {
      expect(screen.getByText("db-credentials")).toBeInTheDocument();
    });
    await user.click(screen.getByText("db-credentials"));

    await waitFor(() => {
      expect(screen.getByText("Back to Secrets")).toBeInTheDocument();
    });
  });
});
