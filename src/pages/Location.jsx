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
