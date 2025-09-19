import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getAlerts } from "../lib/dataService";
import { useSocket } from "../context/WebSocketContext";

export default function Records() {
  const { user } = useAuth();
  const { history } = useSocket();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // Attempt to filter by userId if your alerts have userId
        // Fallback: fetch all alerts for now
        const docs = await getAlerts({ limit: 100 });
        setAlerts(docs);
      } catch (e) {
        console.warn("Failed to fetch records", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const myName = useMemo(() => user?.name || user?.email || "Driver", [user]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        <h1 className="text-xl text-cyan-300">{myName}'s Records</h1>
        <p className="text-slate-400 text-sm">Recent alerts and live session stats.</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <div className="text-slate-400 text-xs">Heart Rate (last 100)</div>
            <div className="text-slate-200 text-lg">{history.heartRate.at(-1) ?? "-"} bpm</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <div className="text-slate-400 text-xs">Drowsiness (last 100)</div>
            <div className="text-slate-200 text-lg">{history.drowsiness.at(-1) ?? "-"}%</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <div className="text-slate-400 text-xs">Alcohol Level (last 100)</div>
            <div className="text-slate-200 text-lg">{history.alcoholLevel.at(-1) ?? "-"}%</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <div className="text-slate-400 text-xs">Proximity (last 100)</div>
            <div className="text-slate-200 text-lg">{history.proximity.at(-1) ?? "-"} cm</div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-slate-300">Recent Alerts</h2>
          {loading && <div className="text-slate-500">Loading...</div>}
          {!loading && alerts.length === 0 && <div className="text-slate-500">No records found.</div>}
          {alerts.map((a) => (
            <div key={a.$id} className={`rounded-lg p-3 border ${a.level === "critical" ? "border-rose-500/50 bg-rose-500/10" : a.level === "warning" ? "border-amber-400/50 bg-amber-400/10" : "border-slate-700 bg-slate-800/50"}`}>
              <div className="text-xs text-slate-400 flex justify-between">
                <span>{new Date(a.ts).toLocaleString()}</span>
                <span className="uppercase">{a.level}</span>
              </div>
              <div className="text-slate-200">{a.title}</div>
              {a.description && <div className="text-slate-400 text-sm">{a.description}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
