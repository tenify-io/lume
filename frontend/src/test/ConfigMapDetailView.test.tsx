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

const sampleConfigMap = {
  name: "app-config",
  namespace: "default",
  uid: "cm-uid-123",
  creationTimestamp: "2026-03-10 12:00:00 UTC",
  labels: { app: "web" },
  annotations: { "config-version": "v2" },
  data: {
    "config.yaml": "server:\n  port: 8080",
    "settings.json": '{"debug": true}',
  },
  binaryDataKeys: [
    { name: "cert.pem", size: 1024 },
    { name: "key.pem", size: 512 },
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
  mockBindings.GetConfigMaps.mockResolvedValue([
    {
      name: "app-config",
      namespace: "default",
      dataCount: 4,
      age: "9d",
    },
  ]);
  mockBindings.GetConfigMapDetail.mockResolvedValue(sampleConfigMap);
  mockBindings.SetPreference.mockResolvedValue(undefined);
  mockBindings.SetContextAlias.mockResolvedValue(undefined);
});

describe("ConfigMapDetailView", () => {
  it("shows config map detail when clicking a config map", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("ConfigMaps")).toBeInTheDocument();
    });
    await user.click(screen.getByText("ConfigMaps"));

    await waitFor(() => {
      expect(screen.getByText("app-config")).toBeInTheDocument();
    });
    await user.click(screen.getByText("app-config"));

    await waitFor(() => {
      expect(mockBindings.GetConfigMapDetail).toHaveBeenCalledWith(
        "default",
        "app-config",
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Data Keys")).toBeInTheDocument();
      expect(screen.getByText("Binary Keys")).toBeInTheDocument();
    });
  });

  it("displays data keys as collapsible sections", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("ConfigMaps")).toBeInTheDocument();
    });
    await user.click(screen.getByText("ConfigMaps"));
    await waitFor(() => {
      expect(screen.getByText("app-config")).toBeInTheDocument();
    });
    await user.click(screen.getByText("app-config"));

    await waitFor(() => {
      expect(screen.getByText("Data (2)")).toBeInTheDocument();
      expect(screen.getByText("config.yaml")).toBeInTheDocument();
      expect(screen.getByText("settings.json")).toBeInTheDocument();
    });

    // Click to expand a data key
    await user.click(screen.getByText("config.yaml"));

    await waitFor(() => {
      expect(
        screen.getByText((content) => content.includes("port: 8080")),
      ).toBeInTheDocument();
    });
  });

  it("displays binary data keys with sizes", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("ConfigMaps")).toBeInTheDocument();
    });
    await user.click(screen.getByText("ConfigMaps"));
    await waitFor(() => {
      expect(screen.getByText("app-config")).toBeInTheDocument();
    });
    await user.click(screen.getByText("app-config"));

    await waitFor(() => {
      expect(screen.getByText("Binary Data (2)")).toBeInTheDocument();
      expect(screen.getByText("cert.pem")).toBeInTheDocument();
      expect(screen.getByText("(1024 bytes)")).toBeInTheDocument();
      expect(screen.getByText("key.pem")).toBeInTheDocument();
      expect(screen.getByText("(512 bytes)")).toBeInTheDocument();
    });
  });

  it("displays labels and annotations", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("ConfigMaps")).toBeInTheDocument();
    });
    await user.click(screen.getByText("ConfigMaps"));
    await waitFor(() => {
      expect(screen.getByText("app-config")).toBeInTheDocument();
    });
    await user.click(screen.getByText("app-config"));

    await waitFor(() => {
      expect(screen.getByText("Labels")).toBeInTheDocument();
      expect(screen.getByText("Annotations")).toBeInTheDocument();
    });
  });

  it("shows error state when config map fetch fails", async () => {
    mockBindings.GetConfigMapDetail.mockRejectedValue(
      new Error("config map not found"),
    );

    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("ConfigMaps")).toBeInTheDocument();
    });
    await user.click(screen.getByText("ConfigMaps"));
    await waitFor(() => {
      expect(screen.getByText("app-config")).toBeInTheDocument();
    });
    await user.click(screen.getByText("app-config"));

    await waitFor(() => {
      expect(screen.getByText("\u2190 Back")).toBeInTheDocument();
    });
  });
});
