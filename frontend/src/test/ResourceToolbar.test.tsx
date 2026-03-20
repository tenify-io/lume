import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pencil, Trash2, Copy, Scaling } from "lucide-react";
import { ResourceToolbar, ToolbarAction } from "@/components/shared/ResourceToolbar";
import { TooltipProvider } from "@/components/ui/tooltip";

function renderToolbar(actions: ToolbarAction[]) {
  return render(
    <TooltipProvider>
      <ResourceToolbar actions={actions} />
    </TooltipProvider>,
  );
}

describe("ResourceToolbar", () => {
  it("renders nothing when actions is empty", () => {
    const { container } = renderToolbar([]);
    expect(container.innerHTML).toBe("");
  });

  it("renders action buttons with icons and labels", () => {
    renderToolbar([
      { id: "edit", label: "Edit YAML", icon: Pencil, onClick: vi.fn(), group: "primary" },
      { id: "copy", label: "Copy Name", icon: Copy, onClick: vi.fn(), group: "primary" },
    ]);

    expect(screen.getByRole("button", { name: /Edit YAML/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Copy Name/i })).toBeInTheDocument();
  });

  it("calls onClick when an action button is clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    renderToolbar([
      { id: "edit", label: "Edit YAML", icon: Pencil, onClick, group: "primary" },
    ]);

    await user.click(screen.getByRole("button", { name: /Edit YAML/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disables buttons when disabled is true", () => {
    renderToolbar([
      {
        id: "scale",
        label: "Scale",
        icon: Scaling,
        onClick: vi.fn(),
        disabled: true,
        disabledReason: "Not supported for this resource",
        group: "primary",
      },
    ]);

    expect(screen.getByRole("button", { name: /Scale/i })).toBeDisabled();
  });

  it("does not call onClick on disabled buttons", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    renderToolbar([
      {
        id: "scale",
        label: "Scale",
        icon: Scaling,
        onClick,
        disabled: true,
        group: "primary",
      },
    ]);

    await user.click(screen.getByRole("button", { name: /Scale/i }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("shows tooltip on hover for disabled actions with reason", async () => {
    const user = userEvent.setup();

    renderToolbar([
      {
        id: "scale",
        label: "Scale",
        icon: Scaling,
        onClick: vi.fn(),
        disabled: true,
        disabledReason: "Not supported for this resource",
        group: "primary",
      },
    ]);

    // The tooltip trigger is a <span> wrapping the disabled button
    const trigger = screen.getByText("Scale").closest("span[class*='inline-flex']") ?? screen.getByText("Scale");
    await user.hover(trigger);

    await waitFor(() => {
      expect(screen.getByText("Not supported for this resource")).toBeInTheDocument();
    });
  });

  it("disables button and shows spinner when loading", () => {
    renderToolbar([
      {
        id: "delete",
        label: "Delete",
        icon: Trash2,
        onClick: vi.fn(),
        loading: true,
        variant: "destructive",
        group: "danger",
      },
    ]);

    const button = screen.getByRole("button", { name: /Delete/i });
    expect(button).toBeDisabled();
    // Spinner SVG should have the animate-spin class
    const spinner = button.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("renders dividers between different action groups", () => {
    const { container } = renderToolbar([
      { id: "edit", label: "Edit YAML", icon: Pencil, onClick: vi.fn(), group: "primary" },
      { id: "copy", label: "Copy Name", icon: Copy, onClick: vi.fn(), group: "primary" },
      { id: "delete", label: "Delete", icon: Trash2, onClick: vi.fn(), variant: "destructive", group: "danger" },
    ]);

    const dividers = container.querySelectorAll(".bg-zinc-800.w-px");
    expect(dividers.length).toBe(1);
  });

  it("does not render dividers for single group", () => {
    const { container } = renderToolbar([
      { id: "edit", label: "Edit YAML", icon: Pencil, onClick: vi.fn(), group: "primary" },
      { id: "copy", label: "Copy Name", icon: Copy, onClick: vi.fn(), group: "primary" },
    ]);

    const dividers = container.querySelectorAll(".bg-zinc-800.w-px");
    expect(dividers.length).toBe(0);
  });

  it("applies destructive variant styling", () => {
    renderToolbar([
      {
        id: "delete",
        label: "Delete",
        icon: Trash2,
        onClick: vi.fn(),
        variant: "destructive",
        group: "danger",
      },
    ]);

    const button = screen.getByRole("button", { name: /Delete/i });
    expect(button).toBeInTheDocument();
    // The button should have destructive styling classes
    expect(button.className).toContain("destructive");
  });
});
