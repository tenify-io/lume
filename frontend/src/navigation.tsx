import { createContext, useCallback, useContext, useRef, useState } from "react";

export type Route =
  | { page: "cluster-select" }
  | { page: "pods" }
  | { page: "pod-detail"; namespace: string; name: string }
  | { page: "nodes" }
  | { page: "node-detail"; name: string }
  | { page: "deployments" }
  | { page: "deployment-detail"; namespace: string; name: string };

interface NavigationContextValue {
  route: Route;
  navigate: (route: Route) => void;
  goBack: () => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({
  children,
  initial = { page: "cluster-select" },
}: {
  children: React.ReactNode;
  initial?: Route;
}) {
  const [route, setRoute] = useState<Route>(initial);
  const historyRef = useRef<Route[]>([]);

  const navigate = useCallback((next: Route) => {
    setRoute((prev) => {
      historyRef.current.push(prev);
      return next;
    });
  }, []);

  const goBack = useCallback(() => {
    const prev = historyRef.current.pop();
    if (prev) {
      setRoute(prev);
    }
  }, []);

  return (
    <NavigationContext.Provider value={{ route, navigate, goBack }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error("useNavigation must be used within NavigationProvider");
  return ctx;
}
