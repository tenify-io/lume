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

const sampleJob = {
  name: "data-import-28abc",
  namespace: "default",
  uid: "job-uid-123",
  creationTimestamp: "2026-03-10 12:00:00 UTC",
  labels: { "job-name": "data-import" },
  annotations: { "batch.kubernetes.io/job-tracking": "" },
  completions: "3/3",
  duration: "5m",
  age: "9d",
  status: "Complete",
  parallelism: 1,
  backoffLimit: 6,
  activeDeadlineSeconds: null,
  ttlSecondsAfterFinished: null,
  completionMode: "NonIndexed",
  suspend: false,
  active: 0,
  succeeded: 3,
  failed: 0,
  owner: "",
  conditions: [
    {
      type: "Complete",
      status: "True",
      lastTransitionTime: "2026-03-10 12:05:00 UTC",
      reason: "",
      message: "Job completed",
    },
  ],
  images: ["importer:v1"],
};

const sampleEvents = [
  {
    type: "Normal",
    reason: "SuccessfulCreate",
    message: "Created pod: data-import-28abc-xyz",
    source: "job-controller",
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
  mockBindings.GetJobs.mockResolvedValue([
    {
      name: "data-import-28abc",
      namespace: "default",
      completions: "3/3",
      duration: "5m",
      age: "9d",
      status: "Complete",
      images: ["importer:v1"],
    },
  ]);
  mockBindings.GetJobDetail.mockResolvedValue(sampleJob);
  mockBindings.GetJobEvents.mockResolvedValue(sampleEvents);
  mockBindings.SetPreference.mockResolvedValue(undefined);
  mockBindings.SetContextAlias.mockResolvedValue(undefined);
});

describe("JobDetailView", () => {
  it("shows job detail when clicking a job", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Jobs")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Jobs"));

    await waitFor(() => {
      expect(screen.getByText("data-import-28abc")).toBeInTheDocument();
    });
    await user.click(screen.getByText("data-import-28abc"));

    await waitFor(() => {
      expect(mockBindings.GetJobDetail).toHaveBeenCalledWith(
        "default",
        "data-import-28abc",
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Completions")).toBeInTheDocument();
      expect(screen.getByText("Succeeded")).toBeInTheDocument();
    });
  });

  it("displays conditions", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Jobs")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Jobs"));
    await waitFor(() => {
      expect(screen.getByText("data-import-28abc")).toBeInTheDocument();
    });
    await user.click(screen.getByText("data-import-28abc"));

    await waitFor(() => {
      expect(screen.getByText("Conditions")).toBeInTheDocument();
    });
  });

  it("displays events", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Jobs")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Jobs"));
    await waitFor(() => {
      expect(screen.getByText("data-import-28abc")).toBeInTheDocument();
    });
    await user.click(screen.getByText("data-import-28abc"));

    await waitFor(() => {
      expect(screen.getByText("Events (1)")).toBeInTheDocument();
      expect(screen.getByText("SuccessfulCreate")).toBeInTheDocument();
    });
  });

  it("shows error state when job fetch fails", async () => {
    mockBindings.GetJobDetail.mockRejectedValue(
      new Error("job not found"),
    );

    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Jobs")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Jobs"));
    await waitFor(() => {
      expect(screen.getByText("data-import-28abc")).toBeInTheDocument();
    });
    await user.click(screen.getByText("data-import-28abc"));

    await waitFor(() => {
      expect(screen.getByText("\u2190 Back")).toBeInTheDocument();
    });
  });
});
