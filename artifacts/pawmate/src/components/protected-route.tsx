import { useEffect, type ComponentType } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";

/**
 * Renders `component` only for a signed-in visitor; anyone else is sent to
 * /login once the session check has settled.
 */
export function ProtectedRoute({ component: Component }: { component: ComponentType<any> }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [isLoading, user, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <Component />;
}
