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

const sampleStatefulSets = [
  {
    name: "mysql-primary",
    namespace: "default",
    ready: "3/3",
    serviceName: "mysql",
    age: "5d",
    images: ["mysql:8.0"],
  },
  {
    name: "redis-cluster",
    namespace: "production",
    ready: "2/5",
    serviceName: "redis",
    age: "10d",
    images: ["redis:7.0"],
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  mockBindings.GetContexts.mockResolvedValue(sampleContexts);
  mockBindings.GetCurrentContext.mockResolvedValue("");
  mockBindings.GetContextAliases.mockResolvedValue({});
  mockBindings.GetPreference.mockResolvedValue("dev-local");
  mockBindings.ConnectToContext.mockResolvedValue(undefined);
  mockBindings.GetNamespaces.mockResolvedValue(["default", "production"]);
  mockBindings.GetPods.mockResolvedValue([]);
  mockBindings.GetNodes.mockResolvedValue([]);
  mockBindings.GetDeployments.mockResolvedValue([]);
  mockBindings.GetStatefulSets.mockResolvedValue(sampleStatefulSets);
  mockBindings.SetPreference.mockResolvedValue(undefined);
  mockBindings.SetContextAlias.mockResolvedValue(undefined);
});

describe("StatefulSetListView", () => {
  it("navigates to statefulsets view when clicking StatefulSets in sidebar", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("StatefulSets")).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByText("StatefulSets"));

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Search statefulsets..."),
      ).toBeInTheDocument();
    });
  });

  it("displays statefulsets in the table", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("StatefulSets")).toBeInTheDocument();
    });
    await user.click(screen.getByText("StatefulSets"));

    await waitFor(() => {
      expect(screen.getByText("mysql-primary")).toBeInTheDocument();
      expect(screen.getByText("redis-cluster")).toBeInTheDocument();
    });
  });

  it("shows statefulset count in the status bar", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("StatefulSets")).toBeInTheDocument();
    });
    await user.click(screen.getByText("StatefulSets"));

    await waitFor(() => {
      expect(screen.getByText("2 statefulset(s)")).toBeInTheDocument();
    });
  });

  it("filters statefulsets by search", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("StatefulSets")).toBeInTheDocument();
    });
    await user.click(screen.getByText("StatefulSets"));

    await waitFor(() => {
      expect(screen.getByText("mysql-primary")).toBeInTheDocument();
    });

    await user.type(
      screen.getByPlaceholderText("Search statefulsets..."),
      "mysql",
    );

    await waitFor(() => {
      expect(screen.getByText("mysql-primary")).toBeInTheDocument();
      expect(screen.queryByText("redis-cluster")).not.toBeInTheDocument();
    });
  });

  it("shows empty state when no statefulsets found", async () => {
    mockBindings.GetStatefulSets.mockResolvedValue([]);

    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("StatefulSets")).toBeInTheDocument();
    });
    await user.click(screen.getByText("StatefulSets"));

    await waitFor(() => {
      expect(screen.getByText("No statefulsets found.")).toBeInTheDocument();
    });
  });
});
