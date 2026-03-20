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

const sampleService = {
  name: "my-api",
  namespace: "default",
  uid: "svc-uid-123",
  creationTimestamp: "2026-03-10 12:00:00 UTC",
  labels: { app: "api" },
  annotations: { "service.beta.kubernetes.io/aws-load-balancer-type": "nlb" },
  type: "ClusterIP",
  clusterIP: "10.96.0.50",
  externalIP: "",
  sessionAffinity: "None",
  externalTrafficPolicy: "",
  internalTrafficPolicy: "Cluster",
  ipFamilies: ["IPv4"],
  ipFamilyPolicy: "SingleStack",
  ports: [
    {
      name: "http",
      port: 80,
      protocol: "TCP",
      targetPort: "8080",
      nodePort: 0,
    },
  ],
  selector: { app: "api" },
  age: "9d",
};

const sampleEvents = [
  {
    type: "Normal",
    reason: "EnsuredLoadBalancer",
    message: "Ensured load balancer",
    source: "service-controller",
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
  mockBindings.GetStatefulSets.mockResolvedValue([]);
  mockBindings.GetDaemonSets.mockResolvedValue([]);
  mockBindings.GetReplicaSets.mockResolvedValue([]);
  mockBindings.GetJobs.mockResolvedValue([]);
  mockBindings.GetCronJobs.mockResolvedValue([]);
  mockBindings.GetServices.mockResolvedValue([
    {
      name: "my-api",
      namespace: "default",
      type: "ClusterIP",
      clusterIP: "10.96.0.50",
      externalIP: "",
      ports: "80/TCP",
      age: "9d",
      selector: "app=api",
    },
  ]);
  mockBindings.GetServiceDetail.mockResolvedValue(sampleService);
  mockBindings.GetServiceEvents.mockResolvedValue(sampleEvents);
  mockBindings.SetPreference.mockResolvedValue(undefined);
  mockBindings.SetContextAlias.mockResolvedValue(undefined);
});

describe("ServiceDetailView", () => {
  it("shows service detail when clicking a service", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Services")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Services"));

    await waitFor(() => {
      expect(screen.getByText("my-api")).toBeInTheDocument();
    });
    await user.click(screen.getByText("my-api"));

    await waitFor(() => {
      expect(mockBindings.GetServiceDetail).toHaveBeenCalledWith(
        "default",
        "my-api",
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Session Affinity")).toBeInTheDocument();
      expect(screen.getByText("Cluster IP")).toBeInTheDocument();
    });
  });

  it("displays ports table", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Services")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Services"));
    await waitFor(() => {
      expect(screen.getByText("my-api")).toBeInTheDocument();
    });
    await user.click(screen.getByText("my-api"));

    await waitFor(() => {
      expect(screen.getByText("Ports (1)")).toBeInTheDocument();
      expect(screen.getByText("http")).toBeInTheDocument();
    });
  });

  it("displays events", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Services")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Services"));
    await waitFor(() => {
      expect(screen.getByText("my-api")).toBeInTheDocument();
    });
    await user.click(screen.getByText("my-api"));

    await waitFor(() => {
      expect(screen.getByText("Events (1)")).toBeInTheDocument();
      expect(screen.getByText("EnsuredLoadBalancer")).toBeInTheDocument();
    });
  });

  it("displays labels and annotations", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Services")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Services"));
    await waitFor(() => {
      expect(screen.getByText("my-api")).toBeInTheDocument();
    });
    await user.click(screen.getByText("my-api"));

    await waitFor(() => {
      expect(screen.getByText("Labels")).toBeInTheDocument();
      expect(screen.getByText("Annotations")).toBeInTheDocument();
    });
  });

  it("shows error state when service fetch fails", async () => {
    mockBindings.GetServiceDetail.mockRejectedValue(
      new Error("service not found"),
    );

    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Services")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Services"));
    await waitFor(() => {
      expect(screen.getByText("my-api")).toBeInTheDocument();
    });
    await user.click(screen.getByText("my-api"));

    await waitFor(() => {
      expect(
        screen.getByText("Back to Services"),
      ).toBeInTheDocument();
    });
  });
});
