import { createContext, useContext, useEffect, useState } from "react";
import api, { call } from "../api";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// The backend never returns the role from /is-auth for admins, so we keep
// { role, name } in localStorage and re-verify the cookie on every page load.
const KEY = "restaurant_session";
const read = () => {
  try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(read());
  const [loading, setLoading] = useState(true);

  const save = (s) => {
    setSession(s);
    s ? localStorage.setItem(KEY, JSON.stringify(s)) : localStorage.removeItem(KEY);
  };

  useEffect(() => {
    if (!read()) { setLoading(false); return; }
    api.get("/auth/is-auth")
      .catch(() => save(null)) // cookie expired or missing
      .finally(() => setLoading(false));
  }, []);

  const register = (form) => call(api.post("/auth/register", form));

  const login = async (form) => {
    const data = await call(api.post("/auth/login", form));
    save({ role: "user", name: data.user.name, email: data.user.email });
  };

  const adminLogin = async (form) => {
    await call(api.post("/auth/admin/login", form));
    save({ role: "admin", name: "Admin", email: form.email });
  };

  const logout = async () => {
    try { await api.post("/auth/logout"); } catch { /* ignore */ }
    save(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session, loading, register, login, adminLogin, logout,
        isUser: session?.role === "user",
        isAdmin: session?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
