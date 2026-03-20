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

const sampleCronJob = {
  name: "daily-backup",
  namespace: "default",
  uid: "cj-uid-123",
  creationTimestamp: "2026-03-10 12:00:00 UTC",
  labels: { app: "backup" },
  annotations: { "app.kubernetes.io/version": "1.0.0" },
  schedule: "0 2 * * *",
  suspend: false,
  active: 0,
  lastSchedule: "22h",
  age: "9d",
  concurrencyPolicy: "Forbid",
  successfulJobsHistoryLimit: 3,
  failedJobsHistoryLimit: 1,
  startingDeadlineSeconds: null,
  images: ["backup:v1"],
};

const sampleEvents = [
  {
    type: "Normal",
    reason: "SuccessfulCreate",
    message: "Created job daily-backup-28abc",
    source: "cronjob-controller",
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
  mockBindings.GetCronJobs.mockResolvedValue([
    {
      name: "daily-backup",
      namespace: "default",
      schedule: "0 2 * * *",
      suspend: false,
      active: 0,
      lastSchedule: "22h",
      age: "9d",
      images: ["backup:v1"],
    },
  ]);
  mockBindings.GetCronJobDetail.mockResolvedValue(sampleCronJob);
  mockBindings.GetCronJobEvents.mockResolvedValue(sampleEvents);
  mockBindings.SetPreference.mockResolvedValue(undefined);
  mockBindings.SetContextAlias.mockResolvedValue(undefined);
});

describe("CronJobDetailView", () => {
  it("shows cronjob detail when clicking a cronjob", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("CronJobs")).toBeInTheDocument();
    });
    await user.click(screen.getByText("CronJobs"));

    await waitFor(() => {
      expect(screen.getByText("daily-backup")).toBeInTheDocument();
    });
    await user.click(screen.getByText("daily-backup"));

    await waitFor(() => {
      expect(mockBindings.GetCronJobDetail).toHaveBeenCalledWith(
        "default",
        "daily-backup",
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Schedule")).toBeInTheDocument();
      expect(screen.getByText("Concurrency Policy")).toBeInTheDocument();
      expect(screen.getByText("Forbid")).toBeInTheDocument();
    });
  });

  it("displays events", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("CronJobs")).toBeInTheDocument();
    });
    await user.click(screen.getByText("CronJobs"));
    await waitFor(() => {
      expect(screen.getByText("daily-backup")).toBeInTheDocument();
    });
    await user.click(screen.getByText("daily-backup"));

    await waitFor(() => {
      expect(screen.getByText("Events (1)")).toBeInTheDocument();
      expect(screen.getByText("SuccessfulCreate")).toBeInTheDocument();
    });
  });

  it("displays labels and annotations", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("CronJobs")).toBeInTheDocument();
    });
    await user.click(screen.getByText("CronJobs"));
    await waitFor(() => {
      expect(screen.getByText("daily-backup")).toBeInTheDocument();
    });
    await user.click(screen.getByText("daily-backup"));

    await waitFor(() => {
      expect(screen.getByText("Labels")).toBeInTheDocument();
      expect(screen.getByText("Annotations")).toBeInTheDocument();
    });
  });

  it("displays images section", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("CronJobs")).toBeInTheDocument();
    });
    await user.click(screen.getByText("CronJobs"));
    await waitFor(() => {
      expect(screen.getByText("daily-backup")).toBeInTheDocument();
    });
    await user.click(screen.getByText("daily-backup"));

    await waitFor(() => {
      expect(screen.getByText("Images (1)")).toBeInTheDocument();
      expect(screen.getByText("backup:v1")).toBeInTheDocument();
    });
  });

  it("shows error state when cronjob fetch fails", async () => {
    mockBindings.GetCronJobDetail.mockRejectedValue(
      new Error("cronjob not found"),
    );

    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("CronJobs")).toBeInTheDocument();
    });
    await user.click(screen.getByText("CronJobs"));
    await waitFor(() => {
      expect(screen.getByText("daily-backup")).toBeInTheDocument();
    });
    await user.click(screen.getByText("daily-backup"));

    await waitFor(() => {
      expect(
        screen.getByText("Back to CronJobs"),
      ).toBeInTheDocument();
    });
  });
});
