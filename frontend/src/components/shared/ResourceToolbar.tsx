import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

export interface ToolbarAction {
  id: string;
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  disabled?: boolean;
  disabledReason?: string;
  loading?: boolean;
  variant?: "default" | "destructive";
  group?: string;
}

interface ResourceToolbarProps {
  actions: ToolbarAction[];
}

export function ResourceToolbar({ actions }: ResourceToolbarProps) {
  if (actions.length === 0) return null;

  const elements: React.ReactNode[] = [];
  let lastGroup: string | undefined;

  for (const action of actions) {
    if (lastGroup !== undefined && action.group !== lastGroup) {
      elements.push(
        <div
          key={`divider-${action.id}`}
          className="w-px h-5 bg-zinc-800 self-center"
        />,
      );
    }
    lastGroup = action.group;

    const Icon = action.icon;
    const button = (
      <Button
        key={action.id}
        variant={action.variant === "destructive" ? "destructive" : "outline"}
        size="xs"
        disabled={action.disabled || action.loading}
        onClick={action.onClick}
      >
        {action.loading ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          <Icon size={13} />
        )}
        {action.label}
      </Button>
    );

    if (action.disabled && action.disabledReason) {
      elements.push(
        <Tooltip key={action.id}>
          <TooltipTrigger
            render={<span />}
            className="inline-flex cursor-default"
          >
            {button}
          </TooltipTrigger>
          <TooltipContent>{action.disabledReason}</TooltipContent>
        </Tooltip>,
      );
    } else {
      elements.push(button);
    }
  }

  return <div className="flex items-center gap-1.5">{elements}</div>;
}
