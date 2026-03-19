import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { useNavigation, getTabTitle } from "@/navigation";

export function TopBar() {
  const {
    tabs,
    activeTabId,
    canGoBack,
    canGoForward,
    goBack,
    goForward,
    switchTab,
    openTab,
    closeTab,
  } = useNavigation();

  return (
    <div className="flex items-center h-10 bg-zinc-950 shrink-0 wails-drag">
      {/* Traffic light spacer (macOS) */}
      <div className="w-[70px] shrink-0" />

      {/* Back / Forward */}
      <button
        onClick={goBack}
        disabled={!canGoBack}
        className="wails-no-drag p-1 rounded-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 disabled:text-zinc-700 disabled:hover:bg-transparent transition-colors"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        onClick={goForward}
        disabled={!canGoForward}
        className="wails-no-drag p-1 mr-2 rounded-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 disabled:text-zinc-700 disabled:hover:bg-transparent transition-colors"
      >
        <ChevronRight size={16} />
      </button>

      {/* Tabs */}
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <button
            key={tab.id}
            onClick={() => switchTab(tab.id)}
            className={`wails-no-drag group flex items-center gap-1.5 h-7 px-3 max-w-[180px] rounded-sm text-[12px] transition-colors shrink-0 ${
              isActive
                ? "bg-zinc-800 text-zinc-200"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
            }`}
          >
            <span className="truncate">{getTabTitle(tab.route)}</span>
            {tabs.length > 1 && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                className={`shrink-0 p-0.5 rounded-sm hover:bg-zinc-700 ${
                  isActive
                    ? "text-zinc-500 hover:text-zinc-200"
                    : "opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-zinc-300"
                }`}
              >
                <X size={12} />
              </span>
            )}
          </button>
        );
      })}

      {/* New tab */}
      <button
        onClick={() => openTab()}
        className="wails-no-drag p-1 rounded-sm text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors shrink-0"
      >
        <Plus size={14} />
      </button>

      {/* Remaining space is draggable */}
      <div className="flex-1" />
    </div>
  );
}
