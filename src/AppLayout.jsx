import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { WebSocketProvider } from "./context/WebSocketContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Alerts from "./pages/Alerts";
import ControlsPage from "./pages/Controls";
import LocationPage from "./pages/Location";
import AdminPage from "./pages/Admin";
import ProtectedRoute from "./components/ProtectedRoute";
import { seedMockData } from "./lib/dataService";

function Layout() {
  const { isAuthenticated } = useAuth();
  useEffect(() => {
    if (!isAuthenticated) return;
    const enableSeed = import.meta.env.VITE_ENABLE_CLIENT_SEED === 'true';
    if (enableSeed) {
      // Fire and forget; errors will be visible in console for now
      seedMockData().catch(console.warn);
    }
  }, [isAuthenticated]);
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {isAuthenticated && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["admin","user"]}><Dashboard /></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute allowedRoles={["admin","user"]}><Alerts /></ProtectedRoute>} />
        <Route path="/controls" element={<ControlsPage />} />
        <Route path="/location" element={<ProtectedRoute allowedRoles={["admin","user"]}><LocationPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPage /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

export default function AppLayout() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      </WebSocketProvider>
    </AuthProvider>
  );
}
