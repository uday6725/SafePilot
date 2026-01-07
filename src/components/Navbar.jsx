import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/WebSocketContext";

export default function Navbar() {
  const { logout, role } = useAuth();
  const { connected } = useSocket();
  const linkCls = ({ isActive }) => `px-3 py-2 rounded-md ${isActive ? "bg-slate-800 text-cyan-300" : "text-slate-300 hover:text-white hover:bg-slate-800"}`;
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-slate-900/70 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="text-xl font-semibold text-cyan-400">SafePilot</Link>
        <nav className="flex gap-1 items-center">
          <NavLink to="/dashboard" className={linkCls}>Dashboard</NavLink>
          {(role === "admin" || role === "owner") && (
            <NavLink to="/location" className={linkCls}>Location</NavLink>
          )}
          {role === "owner" && (
            <>
              <NavLink to="/garage" className={linkCls}>Garage</NavLink>
              <NavLink to="/owner-drivers" className={linkCls}>Drivers</NavLink>
            </>
          )}
          <NavLink to="/alerts" className={linkCls}>Alerts</NavLink>
          {(role === "admin" || role === "owner") && (
            <>
              <NavLink to="/controls" className={linkCls}>Controls</NavLink>
              <NavLink to="/vehicle-control" className={linkCls}>Vehicle</NavLink>
              <NavLink to="/remote-control" className={linkCls}>Remote Control</NavLink>
            </>
          )}
          {role === "admin" && (
            <>
              <NavLink to="/admin" className={linkCls}>Admin</NavLink>
              <NavLink to="/users" className={linkCls}>Users</NavLink>
            </>
          )}
          {role === "driver" && (
            <>
              <NavLink to="/records" className={linkCls}>Records</NavLink>
              <NavLink to="/profile" className={linkCls}>Profile</NavLink>
            </>
          )}
        </nav>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${connected ? "bg-emerald-400" : "bg-slate-500"}`}></span>
            <span>{connected ? "Live" : "Offline"}</span>
          </div>
          <button onClick={logout} className="px-3 py-2 rounded-md bg-rose-600/80 hover:bg-rose-600 text-white">Logout</button>
        </div>
      </div>
    </header>
  );
}
