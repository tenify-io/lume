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

const sampleDeployments = [
  {
    name: "web-app",
    namespace: "default",
    ready: "3/3",
    upToDate: 3,
    available: 3,
    age: "5d",
    strategy: "RollingUpdate",
    images: ["nginx:1.25"],
  },
  {
    name: "api-server",
    namespace: "production",
    ready: "2/5",
    upToDate: 2,
    available: 2,
    age: "10d",
    strategy: "RollingUpdate",
    images: ["api:v2"],
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
  mockBindings.GetDeployments.mockResolvedValue(sampleDeployments);
  mockBindings.SetPreference.mockResolvedValue(undefined);
  mockBindings.SetContextAlias.mockResolvedValue(undefined);
});

describe("DeploymentListView", () => {
  it("navigates to deployments view when clicking Deployments in sidebar", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Deployments")).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByText("Deployments"));

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Search deployments..."),
      ).toBeInTheDocument();
    });
  });

  it("displays deployments in the table", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Deployments")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Deployments"));

    await waitFor(() => {
      expect(screen.getByText("web-app")).toBeInTheDocument();
      expect(screen.getByText("api-server")).toBeInTheDocument();
    });
  });

  it("shows deployment count in the status bar", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Deployments")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Deployments"));

    await waitFor(() => {
      expect(screen.getByText("2 deployment(s)")).toBeInTheDocument();
    });
  });

  it("filters deployments by search", async () => {
    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Deployments")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Deployments"));

    await waitFor(() => {
      expect(screen.getByText("web-app")).toBeInTheDocument();
    });

    await user.type(
      screen.getByPlaceholderText("Search deployments..."),
      "web",
    );

    await waitFor(() => {
      expect(screen.getByText("web-app")).toBeInTheDocument();
      expect(screen.queryByText("api-server")).not.toBeInTheDocument();
    });
  });

  it("shows empty state when no deployments found", async () => {
    mockBindings.GetDeployments.mockResolvedValue([]);

    render(<App />);

    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Deployments")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Deployments"));

    await waitFor(() => {
      expect(screen.getByText("No deployments found.")).toBeInTheDocument();
    });
  });
});
