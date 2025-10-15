import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import DriverStatusCard from "../components/DriverStatusCard";
import AlertsFeed from "../components/AlertsFeed";
import Sparkline from "../components/Sparkline";
import { useSocket } from "../context/WebSocketContext";
import { useAuth } from "../context/AuthContext";
import { getLatestSensor, getRecentAlerts } from "../lib/dataService";

export default function Dashboard() {
  const { role } = useAuth();
  const { sensorData, setSensorData, setAlerts, history, connected, ignition, remoteControl, authEvent } = useSocket();

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="text-slate-400 text-xs">Heart Rate</div>
            <div className="text-slate-100 text-2xl">{sensorData.heartRate ?? '-'} <span className="text-slate-400 text-sm">bpm</span></div>
            <div className="mt-2"><Sparkline data={history.heartRate} color="#22d3ee" /></div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="text-slate-400 text-xs">Alcohol</div>
            <div className="text-slate-100 text-2xl">{sensorData.alcoholLevel ?? '-'} <span className="text-slate-400 text-sm">%</span></div>
            <div className="mt-2"><Sparkline data={history.alcoholLevel} color="#f472b6" /></div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="text-slate-400 text-xs">Speed</div>
            <div className="text-slate-100 text-2xl">{sensorData.speed ?? '-'} <span className="text-slate-400 text-sm">km/h</span></div>
            <div className="mt-2"><Sparkline data={history.proximity} color="#a3e635" /></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="text-slate-400 text-xs">Connection</div>
            <div className={`text-lg ${connected ? 'text-emerald-300' : 'text-rose-300'}`}>{connected ? 'Connected' : 'Disconnected'}</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="text-slate-400 text-xs">Ignition</div>
            <div className={`text-lg ${ignition?.ready ? 'text-emerald-300' : 'text-rose-300'}`}>{ignition?.ready ? 'Ready' : 'Blocked'}</div>
            {ignition?.reason && <div className="text-slate-500 text-xs">{ignition.reason}</div>}
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="text-slate-400 text-xs">Remote Control</div>
            <div className={`text-lg ${remoteControl?.enabled ? 'text-emerald-300' : 'text-slate-300'}`}>{remoteControl?.enabled ? 'Enabled' : 'Disabled'}</div>
            {remoteControl?.reason && <div className="text-slate-500 text-xs">{remoteControl.reason}</div>}
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="text-slate-400 text-xs">Driver Verification</div>
            <div className={`text-lg ${authEvent?.verified ? 'text-emerald-300' : 'text-slate-300'}`}>{authEvent?.verified ? 'Verified' : 'Pending'}</div>
            {authEvent?.method && <div className="text-slate-500 text-xs">{authEvent.method}</div>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <DriverStatusCard status={status} message={status === "Normal" ? "All sensors nominal" : status === "Warning" ? "Potential risk detected" : "Immediate attention required"} />

            {/* Quick actions depending on role */}
            {role === 'admin' && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                <div className="text-slate-300 mb-2">Admin Shortcuts</div>
                <div className="flex flex-wrap gap-2">
                  <Link to="/admin" className="px-3 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-100">Project Admin</Link>
                  <Link to="/users" className="px-3 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-100">Users</Link>
                  <Link to="/location" className="px-3 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-100">Locations</Link>
                  <Link to="/controls" className="px-3 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-100">Controls</Link>
                  <Link to="/vehicle-control" className="px-3 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-100">🏎️ Vehicle</Link>
                </div>
              </div>
            )}

            {role === 'owner' && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                <div className="text-slate-300 mb-2">Owner Shortcuts</div>
                <div className="flex flex-wrap gap-2">
                  <Link to="/garage" className="px-3 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-100">Garage</Link>
                  <Link to="/owner-drivers" className="px-3 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-100">Drivers</Link>
                  <Link to="/location" className="px-3 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-100">Locations</Link>
                  <Link to="/controls" className="px-3 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-100">Controls</Link>
                  <Link to="/vehicle-control" className="px-3 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-100">🏎️ Vehicle</Link>
                </div>
              </div>
            )}

            {role === 'driver' && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                <div className="text-slate-300 mb-2">Driver Shortcuts</div>
                <div className="flex flex-wrap gap-2">
                  <Link to="/records" className="px-3 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-100">My Records</Link>
                  <Link to="/profile" className="px-3 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-100">Profile</Link>
                  <Link to="/alerts" className="px-3 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-100">Alerts</Link>
                </div>
              </div>
            )}
          </div>
          <AlertsFeed />
        </div>
      </div>
    </div>
  );
}
