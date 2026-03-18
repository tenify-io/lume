import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ClusterSelectView from "../components/ClusterSelectView";

const sampleContexts = [
  { name: "arn:aws:eks:us-east-1:123:cluster/prod", cluster: "prod-cluster", user: "admin" },
  { name: "dev-local", cluster: "dev-cluster", user: "developer" },
  { name: "gke_project_zone_staging", cluster: "staging-cluster", user: "gke-user" },
];

function renderView(overrides = {}) {
  const defaultProps = {
    contexts: sampleContexts,
    aliases: {} as Record<string, string>,
    onConnect: vi.fn(),
    onAliasChange: vi.fn(),
    connecting: false,
    connectingContext: "",
  };
  return render(<ClusterSelectView {...defaultProps} {...overrides} />);
}

describe("ClusterSelectView", () => {
  it("renders all context cards", () => {
    renderView();

    // Each context name appears as a display name (font-semibold span)
    const cards = screen.getAllByRole("button");
    // 3 cards + 3 edit alias icon buttons = 6 buttons
    expect(cards.length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText("arn:aws:eks:us-east-1:123:cluster/prod")).toBeInTheDocument();
    expect(screen.getByText("dev-local")).toBeInTheDocument();
    expect(screen.getByText("gke_project_zone_staging")).toBeInTheDocument();
  });

  it("displays alias instead of context name when alias exists", () => {
    renderView({
      aliases: { "arn:aws:eks:us-east-1:123:cluster/prod": "Production" },
    });

    expect(screen.getByText("Production")).toBeInTheDocument();
    // The real context name should still be visible in smaller text
    expect(screen.getByText("arn:aws:eks:us-east-1:123:cluster/prod")).toBeInTheDocument();
  });

  it("filters contexts by search input", async () => {
    const user = userEvent.setup();
    renderView();

    const searchInput = screen.getByPlaceholderText("Filter clusters...");
    await user.type(searchInput, "dev-local");

    expect(screen.getByText("dev-local")).toBeInTheDocument();
    expect(screen.queryByText("gke_project_zone_staging")).not.toBeInTheDocument();
    expect(screen.queryByText("arn:aws:eks:us-east-1:123:cluster/prod")).not.toBeInTheDocument();
  });

  it("filters contexts by alias", async () => {
    const user = userEvent.setup();
    renderView({
      aliases: { "arn:aws:eks:us-east-1:123:cluster/prod": "Production" },
    });

    const searchInput = screen.getByPlaceholderText("Filter clusters...");
    await user.type(searchInput, "production");

    expect(screen.getByText("Production")).toBeInTheDocument();
    expect(screen.queryByText("dev-local")).not.toBeInTheDocument();
  });

  it("calls onConnect when a card is clicked", async () => {
    const onConnect = vi.fn();
    const user = userEvent.setup();
    renderView({ onConnect });

    // Click the card containing "dev-local" - use the role button with specific name
    const card = screen.getByText("dev-local").closest("[role='button']")!;
    await user.click(card);
    expect(onConnect).toHaveBeenCalledWith("dev-local");
  });

  it("shows connecting state on the clicked card", () => {
    renderView({ connecting: true, connectingContext: "dev-local" });

    expect(screen.getByText("Connecting...")).toBeInTheDocument();
  });

  it("shows empty state when no contexts", () => {
    renderView({ contexts: [] });

    expect(
      screen.getByText("No Kubernetes contexts found. Check your kubeconfig.")
    ).toBeInTheDocument();
  });

  it("enables alias editing when pencil icon is clicked", async () => {
    const user = userEvent.setup();
    renderView();

    const editButton = screen.getByLabelText("Edit alias for dev-local");
    await user.click(editButton);

    expect(screen.getByPlaceholderText("Enter alias...")).toBeInTheDocument();
  });

  it("saves alias on Enter key", async () => {
    const onAliasChange = vi.fn();
    const user = userEvent.setup();
    renderView({ onAliasChange });

    const editButton = screen.getByLabelText("Edit alias for dev-local");
    await user.click(editButton);

    const input = screen.getByPlaceholderText("Enter alias...");
    await user.type(input, "Local Dev");
    await user.keyboard("{Enter}");

    expect(onAliasChange).toHaveBeenCalledWith("dev-local", "Local Dev");
  });

  it("cancels alias editing on Escape key", async () => {
    const onAliasChange = vi.fn();
    const user = userEvent.setup();
    renderView({ onAliasChange });

    const editButton = screen.getByLabelText("Edit alias for dev-local");
    await user.click(editButton);

    const input = screen.getByPlaceholderText("Enter alias...");
    await user.type(input, "something");
    await user.keyboard("{Escape}");

    expect(onAliasChange).not.toHaveBeenCalled();
    expect(screen.queryByPlaceholderText("Enter alias...")).not.toBeInTheDocument();
  });

  it("shows no match message when filter has no results", async () => {
    const user = userEvent.setup();
    renderView();

    const searchInput = screen.getByPlaceholderText("Filter clusters...");
    await user.type(searchInput, "nonexistent");

    await waitFor(() => {
      expect(screen.getByText(/No clusters match/)).toBeInTheDocument();
    });
  });
});
