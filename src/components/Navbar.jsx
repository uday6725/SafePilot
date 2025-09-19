import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { logout, role } = useAuth();
  const linkCls = ({ isActive }) => `px-3 py-2 rounded-md ${isActive ? "bg-slate-800 text-cyan-300" : "text-slate-300 hover:text-white hover:bg-slate-800"}`;
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-slate-900/70 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="text-xl font-semibold text-cyan-400">SafePilot</Link>
        <nav className="flex gap-1 items-center">
          <NavLink to="/dashboard" className={linkCls}>Dashboard</NavLink>
          <NavLink to="/alerts" className={linkCls}>Alerts</NavLink>
          <NavLink to="/location" className={linkCls}>Location</NavLink>
          {role === "admin" && <>
            <NavLink to="/controls" className={linkCls}>Controls</NavLink>
            <NavLink to="/admin" className={linkCls}>Admin</NavLink>
          </>}
        </nav>
        <button onClick={logout} className="px-3 py-2 rounded-md bg-rose-600/80 hover:bg-rose-600 text-white">Logout</button>
      </div>
    </header>
  );
}
