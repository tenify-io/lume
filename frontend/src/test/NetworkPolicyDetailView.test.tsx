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

const sampleNetworkPolicy = {
  name: "deny-external",
  namespace: "default",
  uid: "np-uid-123",
  creationTimestamp: "2026-03-10 12:00:00 UTC",
  labels: { app: "web" },
  annotations: { "policy-version": "v1" },
  podSelector: { app: "web" },
  policyTypes: ["Ingress", "Egress"],
  ingressRules: [
    {
      ports: [{ protocol: "TCP", port: "80" }],
      from: [
        {
          podSelector: { role: "frontend" },
          namespaceSelector: null,
          ipBlock: "",
        },
      ],
    },
  ],
  egressRules: [
    {
      ports: [{ protocol: "TCP", port: "443" }],
      to: [
        {
          podSelector: null,
          namespaceSelector: null,
          ipBlock: "10.0.0.0/24 except [10.0.0.1/32]",
        },
      ],
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
  mockBindings.GetNetworkPolicies.mockResolvedValue([
    {
      name: "deny-external",
      namespace: "default",
      podSelector: "app=web",
      policyTypes: ["Ingress", "Egress"],
      age: "9d",
    },
  ]);
  mockBindings.GetNetworkPolicyDetail.mockResolvedValue(sampleNetworkPolicy);
  mockBindings.SetPreference.mockResolvedValue(undefined);
  mockBindings.SetContextAlias.mockResolvedValue(undefined);
});

describe("NetworkPolicyDetailView", () => {
  it("shows network policy detail when clicking a network policy", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("NetworkPolicies")).toBeInTheDocument();
    });
    await user.click(screen.getByText("NetworkPolicies"));

    await waitFor(() => {
      expect(screen.getByText("deny-external")).toBeInTheDocument();
    });
    await user.click(screen.getByText("deny-external"));

    await waitFor(() => {
      expect(mockBindings.GetNetworkPolicyDetail).toHaveBeenCalledWith(
        "default",
        "deny-external",
      );
    });

    await waitFor(() => {
      expect(screen.getAllByText("Pod Selector").length).toBeGreaterThan(0);
      expect(screen.getByText("Policy Types")).toBeInTheDocument();
    });
  });

  it("displays ingress and egress rules", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("NetworkPolicies")).toBeInTheDocument();
    });
    await user.click(screen.getByText("NetworkPolicies"));
    await waitFor(() => {
      expect(screen.getByText("deny-external")).toBeInTheDocument();
    });
    await user.click(screen.getByText("deny-external"));

    await waitFor(() => {
      expect(screen.getByText("Ingress Rules (1)")).toBeInTheDocument();
      expect(screen.getByText("Egress Rules (1)")).toBeInTheDocument();
    });
  });

  it("displays ports and peers in rules", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("NetworkPolicies")).toBeInTheDocument();
    });
    await user.click(screen.getByText("NetworkPolicies"));
    await waitFor(() => {
      expect(screen.getByText("deny-external")).toBeInTheDocument();
    });
    await user.click(screen.getByText("deny-external"));

    await waitFor(() => {
      // Ingress rule port
      expect(screen.getByText("80")).toBeInTheDocument();
      // Ingress rule peer pod selector
      expect(screen.getByText("role=frontend")).toBeInTheDocument();
      // Egress rule port
      expect(screen.getByText("443")).toBeInTheDocument();
      // Egress rule peer IP block
      expect(
        screen.getByText("10.0.0.0/24 except [10.0.0.1/32]"),
      ).toBeInTheDocument();
    });
  });

  it("displays labels and annotations", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("NetworkPolicies")).toBeInTheDocument();
    });
    await user.click(screen.getByText("NetworkPolicies"));
    await waitFor(() => {
      expect(screen.getByText("deny-external")).toBeInTheDocument();
    });
    await user.click(screen.getByText("deny-external"));

    await waitFor(() => {
      expect(screen.getByText("Labels")).toBeInTheDocument();
      expect(screen.getByText("Annotations")).toBeInTheDocument();
    });
  });

  it("shows error state when network policy fetch fails", async () => {
    mockBindings.GetNetworkPolicyDetail.mockRejectedValue(
      new Error("network policy not found"),
    );

    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("NetworkPolicies")).toBeInTheDocument();
    });
    await user.click(screen.getByText("NetworkPolicies"));
    await waitFor(() => {
      expect(screen.getByText("deny-external")).toBeInTheDocument();
    });
    await user.click(screen.getByText("deny-external"));

    await waitFor(() => {
      expect(screen.getByText("\u2190 Back")).toBeInTheDocument();
    });
  });
});
