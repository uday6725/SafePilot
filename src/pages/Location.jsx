import { useMemo, useState } from "react";
import { useSocket } from "../context/WebSocketContext";
import MapView from "../components/MapView";

export default function LocationPage() {
  const { sensorData } = useSocket();
  const [path] = useState(() => [
    { lat: 19.076, lng: 72.8777 },
    { lat: 19.08, lng: 72.882 },
    { lat: 19.084, lng: 72.888 },
  ]);

  const current = useMemo(() => sensorData?.location || path[path.length - 1], [sensorData, path]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        <h1 className="text-xl text-cyan-300">Vehicle Location</h1>
        <MapView path={path} current={current} />
      </div>
    </div>
  );
}
