import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import DriverStatusCard from "../components/DriverStatusCard";
import AlertsFeed from "../components/AlertsFeed";
import { useSocket } from "../context/WebSocketContext";
import { getLatestSensor, getRecentAlerts } from "../lib/dataService";

export default function Dashboard() {
  const { sensorData, setSensorData, setAlerts } = useSocket();

  const status = useMemo(() => {
    if (sensorData.alcoholLevel >= 60) return "Critical";
    if (sensorData.alcoholLevel > 0 || sensorData.drowsiness > 60 || sensorData.proximity < 20) return "Warning";
    return "Normal";
  }, [sensorData]);

  useEffect(() => {
    // Placeholder for any side-effects when status changes
  }, [status]);

  useEffect(() => {
    // Prefetch from Appwrite (one-time on mount)
    (async () => {
      try {
        const [latest, alerts] = await Promise.all([
          getLatestSensor().catch(() => null),
          getRecentAlerts(50).catch(() => []),
        ]);
        if (latest) setSensorData((prev) => ({ ...prev, ...latest }));
        if (alerts?.length) {
          setAlerts(alerts.map((a) => ({ id: a.$id, ts: a.ts, level: a.level, title: a.title, description: a.description })));
        }
      } catch (e) {
        // Non-blocking: show real-time data even if Appwrite prefetch fails
        console.warn("Prefetch failed", e);
      }
    })();
  }, [setSensorData, setAlerts]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {typeof Notification !== 'undefined' && Notification.permission !== 'granted' && (
          <div className="rounded-xl border border-sky-500/50 bg-sky-500/10 p-4 flex items-center justify-between">
            <div>
              <div className="text-sky-300 font-semibold">Enable Notifications</div>
              <div className="text-slate-300 text-sm">Get browser notifications for critical alerts in real time.</div>
            </div>
            <button onClick={() => Notification.requestPermission()} className="px-4 py-2 rounded-md bg-sky-600 hover:bg-sky-500 text-white">Allow</button>
          </div>
        )}
        {sensorData.alcoholLevel >= 60 && (
          <div className="rounded-xl border border-rose-500/60 bg-rose-500/10 p-4 flex items-center justify-between">
            <div>
              <div className="text-rose-300 font-semibold">Critical: High Alcohol Level Detected</div>
              <div className="text-slate-300 text-sm">Immediate admin intervention recommended. You can initiate remote control.</div>
            </div>
            <Link to="/controls" className="px-4 py-2 rounded-md bg-rose-600 hover:bg-rose-500 text-white">Open Controls</Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <DriverStatusCard status={status} message={status === "Normal" ? "All sensors nominal" : status === "Warning" ? "Potential risk detected" : "Immediate attention required"} />
          </div>
          <AlertsFeed />
        </div>
      </div>
    </div>
  );
}
