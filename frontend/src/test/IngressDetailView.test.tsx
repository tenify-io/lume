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

const sampleIngress = {
  name: "my-ingress",
  namespace: "default",
  uid: "ing-uid-123",
  creationTimestamp: "2026-03-10 12:00:00 UTC",
  labels: { app: "web" },
  annotations: { "nginx.ingress.kubernetes.io/rewrite-target": "/" },
  ingressClassName: "nginx",
  defaultBackend: "",
  tls: [
    {
      hosts: ["secure.example.com"],
      secretName: "tls-secret",
    },
  ],
  rules: [
    {
      host: "example.com",
      paths: [
        {
          path: "/api",
          pathType: "Prefix",
          backend: "api-svc:80",
        },
        {
          path: "/web",
          pathType: "Prefix",
          backend: "web-svc:8080",
        },
      ],
    },
  ],
  age: "9d",
};

const sampleEvents = [
  {
    type: "Normal",
    reason: "Sync",
    message: "Scheduled for sync",
    source: "nginx-ingress-controller",
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
  mockBindings.GetServices.mockResolvedValue([]);
  mockBindings.GetIngresses.mockResolvedValue([
    {
      name: "my-ingress",
      namespace: "default",
      class: "nginx",
      hosts: "example.com",
      address: "203.0.113.10",
      ports: "80, 443",
      age: "9d",
    },
  ]);
  mockBindings.GetIngressDetail.mockResolvedValue(sampleIngress);
  mockBindings.GetIngressEvents.mockResolvedValue(sampleEvents);
  mockBindings.SetPreference.mockResolvedValue(undefined);
  mockBindings.SetContextAlias.mockResolvedValue(undefined);
});

describe("IngressDetailView", () => {
  it("shows ingress detail when clicking an ingress", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Ingresses")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Ingresses"));

    await waitFor(() => {
      expect(screen.getByText("my-ingress")).toBeInTheDocument();
    });
    await user.click(screen.getByText("my-ingress"));

    await waitFor(() => {
      expect(mockBindings.GetIngressDetail).toHaveBeenCalledWith(
        "default",
        "my-ingress",
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Class")).toBeInTheDocument();
      expect(screen.getByText("Default Backend")).toBeInTheDocument();
    });
  });

  it("displays rules with path tables", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Ingresses")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Ingresses"));
    await waitFor(() => {
      expect(screen.getByText("my-ingress")).toBeInTheDocument();
    });
    await user.click(screen.getByText("my-ingress"));

    await waitFor(() => {
      expect(screen.getByText("Rules (1)")).toBeInTheDocument();
      expect(screen.getByText("example.com")).toBeInTheDocument();
      expect(screen.getByText("/api")).toBeInTheDocument();
      expect(screen.getByText("api-svc:80")).toBeInTheDocument();
    });
  });

  it("displays TLS section", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Ingresses")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Ingresses"));
    await waitFor(() => {
      expect(screen.getByText("my-ingress")).toBeInTheDocument();
    });
    await user.click(screen.getByText("my-ingress"));

    await waitFor(() => {
      expect(screen.getByText("TLS (1)")).toBeInTheDocument();
      expect(screen.getByText("secure.example.com")).toBeInTheDocument();
      expect(screen.getByText("tls-secret")).toBeInTheDocument();
    });
  });

  it("displays events", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Ingresses")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Ingresses"));
    await waitFor(() => {
      expect(screen.getByText("my-ingress")).toBeInTheDocument();
    });
    await user.click(screen.getByText("my-ingress"));

    await waitFor(() => {
      expect(screen.getByText("Events (1)")).toBeInTheDocument();
      expect(screen.getByText("Sync")).toBeInTheDocument();
    });
  });

  it("displays labels and annotations", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Ingresses")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Ingresses"));
    await waitFor(() => {
      expect(screen.getByText("my-ingress")).toBeInTheDocument();
    });
    await user.click(screen.getByText("my-ingress"));

    await waitFor(() => {
      expect(screen.getByText("Labels")).toBeInTheDocument();
      expect(screen.getByText("Annotations")).toBeInTheDocument();
    });
  });

  it("shows error state when ingress fetch fails", async () => {
    mockBindings.GetIngressDetail.mockRejectedValue(
      new Error("ingress not found"),
    );

    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Ingresses")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Ingresses"));
    await waitFor(() => {
      expect(screen.getByText("my-ingress")).toBeInTheDocument();
    });
    await user.click(screen.getByText("my-ingress"));

    await waitFor(() => {
      expect(
        screen.getByText("Back to Ingresses"),
      ).toBeInTheDocument();
    });
  });
});
