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
import UsersPage from "./pages/Users";
import Records from "./pages/Records";
import Profile from "./pages/Profile";
import OwnerGarage from "./pages/OwnerGarage";
import OwnerDrivers from "./pages/OwnerDrivers";
import OwnerDriverDetail from "./pages/OwnerDriverDetail";
import VehicleControl from "./pages/VehicleControl";

function Layout() {
  const { isAuthenticated, role } = useAuth();
  useEffect(() => {
    if (!isAuthenticated) return;
    const enableSeed = import.meta.env.VITE_ENABLE_CLIENT_SEED === 'true';
    if (enableSeed) {
      // Fire and forget; errors will be visible in console for now
      seedMockData().catch(console.warn);
    }
  }, [isAuthenticated]);
  const home = role === 'driver' ? '/dashboard' : '/dashboard';
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {isAuthenticated && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["admin", "owner", "driver"]}><Dashboard /></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute allowedRoles={["admin", "owner", "driver"]}><Alerts /></ProtectedRoute>} />
        <Route path="/controls" element={<ControlsPage />} />
        <Route path="/location" element={<ProtectedRoute allowedRoles={["admin", "owner"]}><LocationPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPage /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute allowedRoles={["admin"]}><UsersPage /></ProtectedRoute>} />
        <Route path="/records" element={<ProtectedRoute allowedRoles={["driver"]}><Records /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute allowedRoles={["driver", "owner", "admin"]}><Profile /></ProtectedRoute>} />
        <Route path="/garage" element={<ProtectedRoute allowedRoles={["owner", "admin"]}><OwnerGarage /></ProtectedRoute>} />
        <Route path="/owner-drivers" element={<ProtectedRoute allowedRoles={["owner", "admin"]}><OwnerDrivers /></ProtectedRoute>} />
        <Route path="/owner-drivers/:driverId" element={<ProtectedRoute allowedRoles={["owner", "admin"]}><OwnerDriverDetail /></ProtectedRoute>} />
        <Route path="/vehicle-control" element={<ProtectedRoute allowedRoles={["admin", "owner"]}><VehicleControl /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to={home} replace />} />
        <Route path="*" element={<Navigate to={home} replace />} />
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
