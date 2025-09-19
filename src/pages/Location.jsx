import { useEffect, useMemo, useState } from "react";
import { useSocket } from "../context/WebSocketContext";
import MapView from "../components/MapView";
import { getPath } from "../lib/dataService";

export default function LocationPage() {
  const { sensorData } = useSocket();
  const [path, setPath] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const p = await getPath(200);
        if (Array.isArray(p) && p.length) setPath(p);
      } catch (e) {
        console.warn("Failed to fetch path", e);
      }
    })();
  }, []);

  // Append live location updates to the path (rolling window of 300 points)
  useEffect(() => {
    const loc = sensorData?.location;
    if (!loc || typeof loc.lat !== 'number' || typeof loc.lng !== 'number') return;
    setPath((prev) => {
      const last = prev[prev.length - 1];
      if (last && Math.abs(last.lat - loc.lat) < 1e-6 && Math.abs(last.lng - loc.lng) < 1e-6) return prev;
      const next = [...prev, loc];
      if (next.length > 300) next.shift();
      return next;
    });
  }, [sensorData]);

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
