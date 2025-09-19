import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import VideoFeed from "../components/VideoFeed";
import DriverStatusCard from "../components/DriverStatusCard";
import SensorCard from "../components/SensorCard";
import AlertsFeed from "../components/AlertsFeed";
import { useSocket } from "../context/WebSocketContext";

export default function Dashboard() {
  const { sensorData } = useSocket();

  const status = useMemo(() => {
    if (sensorData.alcoholLevel >= 60) return "Critical";
    if (sensorData.alcoholLevel > 0 || sensorData.drowsiness > 60 || sensorData.proximity < 20) return "Warning";
    return "Normal";
  }, [sensorData]);

  useEffect(() => {
    // Placeholder for any side-effects when status changes
  }, [status]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
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
          <VideoFeed title="Front-view" />
          <VideoFeed title="Rear-view" />
          <VideoFeed title="Driver Cam" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <DriverStatusCard status={status} message={status === "Normal" ? "All sensors nominal" : status === "Warning" ? "Potential risk detected" : "Immediate attention required"} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <SensorCard label="Heart Rate" value={sensorData.heartRate} unit="bpm" color="emerald" />
              <SensorCard label="Drowsiness" value={sensorData.drowsiness} unit="%" color="amber" />
              <SensorCard label="Alcohol Level" value={sensorData.alcoholLevel} unit="%" color={sensorData.alcoholLevel >= 60 ? "rose" : "amber"} />
              <SensorCard label="Proximity" value={sensorData.proximity} unit="cm" color={sensorData.proximity < 20 ? "rose" : "sky"} />
            </div>
          </div>
          <AlertsFeed />
        </div>
      </div>
    </div>
  );
}
