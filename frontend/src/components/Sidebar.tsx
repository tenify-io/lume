import { Server, Box, Layers } from "lucide-react";
import { useNavigation, type Route } from "@/navigation";

interface NavItem {
  label: string;
  icon: React.ElementType;
  page: Route["page"];
}

const categories: { label: string; items: NavItem[] }[] = [
  {
    label: "Cluster",
    items: [{ label: "Nodes", icon: Server, page: "nodes" }],
  },
  {
    label: "Workloads",
    items: [
      { label: "Deployments", icon: Layers, page: "deployments" },
      { label: "Pods", icon: Box, page: "pods" },
    ],
  },
];

export function Sidebar() {
  const { route, navigate } = useNavigation();

  // Determine which page is "active" — detail views highlight their parent list
  const activePage =
    route.page === "pod-detail"
      ? "pods"
      : route.page === "node-detail"
        ? "nodes"
        : route.page === "deployment-detail"
          ? "deployments"
          : route.page;

  return (
    <nav className="w-[180px] shrink-0 bg-zinc-950 border-r border-black/50 py-4 flex flex-col gap-5 overflow-y-auto">
      {categories.map((cat) => (
        <div key={cat.label}>
          <div className="px-4 mb-1.5 text-[11px] font-bold text-zinc-600 uppercase tracking-wide">
            {cat.label}
          </div>
          {cat.items.map((item) => {
            const isActive = activePage === item.page;
            return (
              <button
                key={item.page}
                onClick={() => navigate({ page: item.page } as Route)}
                className={`w-full flex items-center gap-2.5 px-4 py-1.5 text-[13px] transition-colors ${
                  isActive
                    ? "bg-zinc-800 text-zinc-200 font-medium border-l-2 border-blue-500"
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-300 border-l-2 border-transparent"
                }`}
              >
                <item.icon size={15} strokeWidth={1.8} />
                {item.label}
              </button>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
