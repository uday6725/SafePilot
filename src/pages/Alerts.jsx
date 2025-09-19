import { useMemo, useState } from "react";
import { useSocket } from "../context/WebSocketContext";

export default function Alerts() {
  const { alerts } = useSocket();
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => alerts.filter((a) => filter === "all" ? true : a.level === filter), [alerts, filter]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl text-cyan-300">Alerts History</h1>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-slate-900 border border-slate-700 rounded px-2 py-1">
            <option value="all">All</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
        </div>

        <div className="mt-4 space-y-3">
          {filtered.map((a) => (
            <div key={a.id} className={`rounded-lg p-4 border ${a.level === "critical" ? "border-rose-500/50 bg-rose-500/10" : a.level === "warning" ? "border-amber-400/50 bg-amber-400/10" : "border-slate-700 bg-slate-800/50"}`}>
              <div className="flex justify-between text-xs text-slate-400">
                <span>{new Date(a.ts).toLocaleString()}</span>
                <span className={`uppercase ${a.level === "critical" ? "text-rose-300" : a.level === "warning" ? "text-amber-300" : "text-slate-400"}`}>{a.level || "info"}</span>
              </div>
              <div className="mt-1 text-slate-200 font-medium">{a.title || "Alert"}</div>
              {a.description && <div className="text-slate-400 text-sm">{a.description}</div>}
            </div>
          ))}
          {filtered.length === 0 && <div className="text-slate-500">No alerts found for this filter.</div>}
        </div>
      </div>
    </div>
  );
}
