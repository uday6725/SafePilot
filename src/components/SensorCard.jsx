export default function SensorCard({ label, value, unit = "", color = "emerald" }) {
  const colorCls = {
    emerald: "text-emerald-400",
    amber: "text-amber-300",
    rose: "text-rose-400",
    sky: "text-sky-400",
    violet: "text-violet-400",
  }[color] || "text-slate-200";

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
      <div className="text-slate-400 text-sm">{label}</div>
      <div className={`mt-2 text-3xl font-semibold ${colorCls}`}>
        {value}
        {unit && <span className="ml-1 text-slate-500 text-lg">{unit}</span>}
      </div>
    </div>
  );
}
