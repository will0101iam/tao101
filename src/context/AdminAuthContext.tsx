import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient, isSupabaseEnabled } from "@/lib/supabase";
import { getLocalAdminSession, loginAdmin, logoutAdmin } from "@/lib/cms";
import type { AdminSession } from "@/types/content";

type AdminAuthValue = {
  ready: boolean;
  session: AdminSession | null;
  mode: "local" | "supabase";
  signIn: (email: string, password: string) => Promise<AdminSession>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<AdminSession | null>;
};

const defaultValue: AdminAuthValue = {
  ready: false,
  session: null,
  mode: isSupabaseEnabled() ? "supabase" : "local",
  signIn: async () => ({ email: "", mode: isSupabaseEnabled() ? "supabase" : "local" }),
  signOut: async () => {},
  refreshSession: async () => null,
};

export const AdminAuthContext = createContext<AdminAuthValue>(defaultValue);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<AdminSession | null>(null);
  const mode: AdminAuthValue["mode"] = isSupabaseEnabled() ? "supabase" : "local";

  const refreshSession = useCallback(async () => {
    if (!isSupabaseEnabled()) {
      const localSession = getLocalAdminSession();
      setSession(localSession);
      setReady(true);
      return localSession;
    }

    const client = getSupabaseBrowserClient();
    const result = await client!.auth.getSession();
    const nextSession = result.data.session?.user?.email
      ? { email: result.data.session.user.email, mode: "supabase" as const }
      : null;
    setSession(nextSession);
    setReady(true);
    return nextSession;
  }, []);

  useEffect(() => {
    refreshSession();

    if (!isSupabaseEnabled()) {
      return;
    }

    const client = getSupabaseBrowserClient();
    const { data } = client!.auth.onAuthStateChange((_event, authSession) => {
      setSession(
        authSession?.user?.email
          ? { email: authSession.user.email, mode: "supabase" as const }
          : null,
      );
      setReady(true);
    });

    return () => data.subscription.unsubscribe();
  }, [refreshSession]);

  const signIn = useCallback(async (email: string, password: string) => {
    const nextSession = await loginAdmin(email, password);
    setSession(nextSession);
    setReady(true);
    return nextSession;
  }, []);

  const signOut = useCallback(async () => {
    await logoutAdmin();
    setSession(null);
    setReady(true);
  }, []);

  const value = useMemo(
    () => ({ ready, session, mode, signIn, signOut, refreshSession }),
    [mode, ready, refreshSession, session, signIn, signOut],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
