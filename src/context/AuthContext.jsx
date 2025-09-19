import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { account } from "../lib/appwrite";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadSession() {
      try {
        setLoading(true);
        const me = await account.get();
        if (!isMounted) return;
        setUser(me);
        // Prefer role from account.prefs.role if present
        const r = me?.prefs?.role && ["admin","owner","driver","user"].includes(me.prefs.role)
          ? me.prefs.role
          : me?.labels?.find?.((l) => ["admin","owner","driver","user"].includes(l)) || "user";
        setRole(r);
      } catch (e) {
        if (!isMounted) return;
        setUser(null);
        setRole("user");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadSession();
    return () => {
      isMounted = false;
    };
  }, []);

  async function login({ email, password }) {
    setError(null);
    try {
      await account.createEmailPasswordSession(email, password);
      const me = await account.get();
      setUser(me);
      const r = me?.prefs?.role && ["admin","owner","driver","user"].includes(me.prefs.role)
        ? me.prefs.role
        : me?.labels?.find?.((l) => ["admin","owner","driver","user"].includes(l)) || "user";
      setRole(r);
      return { ok: true };
    } catch (e) {
      setError(e?.message || "Login failed");
      return { ok: false, error: e };
    }
  }

  async function logout() {
    try {
      await account.deleteSession("current");
    } finally {
      setUser(null);
      setRole("user");
    }
  }

  const value = useMemo(
    () => ({ user, role, loading, error, isAuthenticated: !!user, login, logout }),
    [user, role, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
