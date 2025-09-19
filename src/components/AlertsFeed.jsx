import { useSocket } from "../context/WebSocketContext";

export default function AlertsFeed() {
  const { alerts } = useSocket();
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
      <div className="px-3 py-2 text-slate-300 border-b border-slate-800">Active Alerts</div>
      <div className="p-3 flex-1 space-y-2 max-h-80 overflow-auto">
        {alerts.length === 0 && <div className="text-slate-500 text-sm">No active alerts.</div>}
        {alerts.map((a) => (
          <div key={a.id} className={`rounded-lg p-3 border ${a.level === "critical" ? "border-rose-500/50 bg-rose-500/10" : a.level === "warning" ? "border-amber-400/50 bg-amber-400/10" : "border-slate-700 bg-slate-800/50"}`}>
            <div className="flex justify-between text-xs text-slate-400">
              <span>{new Date(a.ts).toLocaleString()}</span>
              <span className={`uppercase ${a.level === "critical" ? "text-rose-300" : a.level === "warning" ? "text-amber-300" : "text-slate-400"}`}>{a.level || "info"}</span>
            </div>
            <div className="mt-1 text-slate-200 font-medium">{a.title || "Alert"}</div>
            {a.description && <div className="text-slate-400 text-sm">{a.description}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
