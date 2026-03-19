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
  GetPreference: vi.fn().mockResolvedValue(null),
  SetPreference: vi.fn().mockResolvedValue(undefined),
  GetContextAliases: vi.fn().mockResolvedValue({}),
  SetContextAlias: vi.fn().mockResolvedValue(undefined),
  DeletePreference: vi.fn().mockResolvedValue(undefined),
  GetAllPreferences: vi.fn().mockResolvedValue({}),
  WatchPods: vi.fn().mockResolvedValue(undefined),
  UnwatchAll: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../wailsjs/go/main/App", () => mockBindings);

const mockRuntime = vi.hoisted(() => ({
  EventsOn: vi.fn().mockReturnValue(() => {}),
}));

vi.mock("../../wailsjs/runtime/runtime", () => mockRuntime);

const sampleContexts = [
  { name: "arn:aws:eks:us-east-1:123:cluster/prod", cluster: "prod-cluster", user: "admin" },
  { name: "dev-local", cluster: "dev-cluster", user: "developer" },
  { name: "gke_project_zone_staging", cluster: "staging-cluster", user: "gke-user" },
];

beforeEach(() => {
  vi.clearAllMocks();
  mockBindings.GetContexts.mockResolvedValue([]);
  mockBindings.GetCurrentContext.mockResolvedValue("");
  mockBindings.GetContextAliases.mockResolvedValue({});
  mockBindings.GetPreference.mockResolvedValue(null);
  mockBindings.ConnectToContext.mockResolvedValue(undefined);
  mockBindings.GetNamespaces.mockResolvedValue([]);
  mockBindings.GetPods.mockResolvedValue([]);
  mockBindings.GetNodes.mockResolvedValue([]);
  mockBindings.SetPreference.mockResolvedValue(undefined);
  mockBindings.SetContextAlias.mockResolvedValue(undefined);
});

describe("App", () => {
  it("renders the header with app logo", async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByAltText("Lume")).toBeInTheDocument();
    });
  });

  it("shows cluster selection view when no last_context", async () => {
    mockBindings.GetContexts.mockResolvedValue(sampleContexts);

    render(<App />);
    await waitFor(() => {
      expect(screen.getByText("Select a Cluster")).toBeInTheDocument();
    });
  });

  it("renders all cluster cards in selection view", async () => {
    mockBindings.GetContexts.mockResolvedValue(sampleContexts);

    render(<App />);
    await waitFor(() => {
      expect(screen.getByText("arn:aws:eks:us-east-1:123:cluster/prod")).toBeInTheDocument();
      expect(screen.getByText("dev-local")).toBeInTheDocument();
      expect(screen.getByText("gke_project_zone_staging")).toBeInTheDocument();
    });
  });

  it("auto-connects when last_context is set and valid", async () => {
    mockBindings.GetContexts.mockResolvedValue(sampleContexts);
    mockBindings.GetPreference.mockResolvedValue("dev-local");
    mockBindings.GetNamespaces.mockResolvedValue(["default", "kube-system"]);
    mockBindings.GetPods.mockResolvedValue([]);

    render(<App />);
    await waitFor(() => {
      expect(mockBindings.ConnectToContext).toHaveBeenCalledWith("dev-local");
    });
    // Should show the sidebar with Pods/Nodes navigation
    await waitFor(() => {
      expect(screen.getByText("Pods")).toBeInTheDocument();
      expect(screen.getByText("Nodes")).toBeInTheDocument();
    });
  });

  it("falls back to selection view when last_context is stale", async () => {
    mockBindings.GetContexts.mockResolvedValue(sampleContexts);
    mockBindings.GetPreference.mockResolvedValue("deleted-context");

    render(<App />);
    await waitFor(() => {
      expect(screen.getByText("Select a Cluster")).toBeInTheDocument();
    });
    expect(mockBindings.ConnectToContext).not.toHaveBeenCalled();
  });

  it("shows cluster name in header when connected", async () => {
    mockBindings.GetContexts.mockResolvedValue(sampleContexts);
    mockBindings.GetPreference.mockResolvedValue("dev-local");
    mockBindings.GetNamespaces.mockResolvedValue(["default"]);
    mockBindings.GetPods.mockResolvedValue([]);

    render(<App />);
    await waitFor(() => {
      const header = document.querySelector("header");
      expect(header).toHaveTextContent("dev-local");
      expect(screen.getByText("Change Cluster")).toBeInTheDocument();
    });
  });

  it("shows alias in header when alias is set", async () => {
    mockBindings.GetContexts.mockResolvedValue(sampleContexts);
    mockBindings.GetContextAliases.mockResolvedValue({
      "arn:aws:eks:us-east-1:123:cluster/prod": "Production",
    });
    mockBindings.GetPreference.mockResolvedValue("arn:aws:eks:us-east-1:123:cluster/prod");
    mockBindings.GetNamespaces.mockResolvedValue(["default"]);
    mockBindings.GetPods.mockResolvedValue([]);

    render(<App />);
    await waitFor(() => {
      const header = document.querySelector("header");
      expect(header).toHaveTextContent("Production");
    });
  });

  it("Change Cluster button returns to selection view", async () => {
    mockBindings.GetContexts.mockResolvedValue(sampleContexts);
    mockBindings.GetPreference.mockResolvedValue("dev-local");
    mockBindings.GetNamespaces.mockResolvedValue(["default"]);
    mockBindings.GetPods.mockResolvedValue([]);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Change Cluster")).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByText("Change Cluster"));

    await waitFor(() => {
      expect(screen.getByText("Select a Cluster")).toBeInTheDocument();
    });
  });

  it("shows empty state message when no contexts found", async () => {
    mockBindings.GetContexts.mockResolvedValue([]);

    render(<App />);
    await waitFor(() => {
      expect(
        screen.getByText("No Kubernetes contexts found. Check your kubeconfig."),
      ).toBeInTheDocument();
    });
  });

  it("navigates to nodes view when clicking Nodes in sidebar", async () => {
    mockBindings.GetContexts.mockResolvedValue(sampleContexts);
    mockBindings.GetPreference.mockResolvedValue("dev-local");
    mockBindings.GetNamespaces.mockResolvedValue(["default"]);
    mockBindings.GetPods.mockResolvedValue([]);
    mockBindings.GetNodes.mockResolvedValue([]);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Nodes")).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByText("Nodes"));

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Search nodes...")).toBeInTheDocument();
    });
  });
});
