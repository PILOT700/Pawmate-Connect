import { createContext, useContext, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetCurrentSession,
  getGetCurrentSessionQueryKey,
  type User,
} from "@workspace/api-client-react";

interface AuthContextValue {
  user: User | null;
  /** True only while the initial session check is in flight. */
  isLoading: boolean;
  /** Re-runs the session query — call after login/register/logout. */
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  // A signed-out visitor gets a 401 here, which is an expected answer rather
  // than a failure — retrying would just stall the app on first paint.
  const { data, isPending } = useGetCurrentSession({
    query: { queryKey: getGetCurrentSessionQueryKey(), retry: false },
  });

  const refreshSession = async () => {
    await queryClient.invalidateQueries({ queryKey: getGetCurrentSessionQueryKey() });
  };

  return (
    <AuthContext.Provider value={{ user: data ?? null, isLoading: isPending, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
