import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const res = await login({ email, password });
    setLoading(false);
    if (res.ok) navigate("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <h1 className="text-2xl font-semibold text-cyan-400">SafePilot Admin</h1>
        <p className="text-slate-400">Sign in with your admin credentials</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-slate-400">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-md bg-slate-950 border border-slate-800 px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500" required />
          </div>
          <div>
            <label className="text-sm text-slate-400">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-md bg-slate-950 border border-slate-800 px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500" required />
          </div>
          {error && <div className="text-rose-400 text-sm">{String(error)}</div>}
          <button disabled={loading} className="w-full py-2 rounded-md bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60">{loading ? "Signing in..." : "Sign In"}</button>
        </form>
      </div>
    </div>
  );
}
