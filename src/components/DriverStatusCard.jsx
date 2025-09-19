function clsByStatus(status) {
  if (status === "Critical") return "border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.35)]";
  if (status === "Warning") return "border-amber-400/60 shadow-[0_0_20px_rgba(251,191,36,0.25)]";
  return "border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.25)]";
}

export default function DriverStatusCard({ status = "Normal", message = "All systems nominal" }) {
  return (
    <div className={`bg-slate-900/60 rounded-xl border ${clsByStatus(status)} p-6`}>
      <div className="flex items-center justify-between">
        <h3 className="text-slate-200 text-lg">Driver Status</h3>
        <div className="text-xs uppercase tracking-wider text-slate-400">Real-time</div>
      </div>
      <div className="mt-4 flex items-end gap-4">
        <div className={`text-3xl font-semibold ${status === "Critical" ? "text-rose-400" : status === "Warning" ? "text-amber-300" : "text-emerald-400"}`}>{status}</div>
        <div className="text-slate-400">{message}</div>
      </div>
    </div>
  );
}
