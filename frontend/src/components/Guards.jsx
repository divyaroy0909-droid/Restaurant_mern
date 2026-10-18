import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function RequireUser({ children }) {
  const { isUser, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <p className="center muted">Loading…</p>;
  return isUser ? children : <Navigate to="/login" state={{ from: loc.pathname }} replace />;
}

export function RequireAdmin({ children }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return <p className="center muted">Loading…</p>;
  return isAdmin ? children : <Navigate to="/admin/login" replace />;
}
