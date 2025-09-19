import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles = ["admin"] }) {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles.length && !allowedRoles.includes(role)) return <Navigate to="/dashboard" replace />;
  return children;
}
