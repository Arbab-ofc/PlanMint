
import React from "react";
import api from "../utils/api"; // axios instance (cookie-based)

const UserContext = React.createContext(null);

export function UserProvider({ children, auto = true }) {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(!!auto);
  const [error, setError] = React.useState(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/auth/me");                
      const u = res.data?.user ?? res.data ?? null;
      setUser(u);
      return { ok: true, user: u };
    } catch (err) {
      setUser(null);
      
      if (err?.status && err.status !== 401) setError(err);
      return { ok: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (auto) refresh(); 
  }, [auto, refresh]);

  const isAuthenticated = !!user;

  const value = React.useMemo(
    () => ({ user, setUser, loading, error, refresh, isAuthenticated }),
    [user, loading, error, refresh, isAuthenticated]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = React.useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within <UserProvider>");
  return ctx;
}
