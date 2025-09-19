import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
  const [connected, setConnected] = useState(false);
  const [sensorData, setSensorData] = useState({ heartRate: 0, drowsiness: 0, alcoholLevel: 0, proximity: 0, location: { lat: 19.076, lng: 72.8777 }, speed: 0, status: "Normal" });
  const [alerts, setAlerts] = useState([]);
  const [history, setHistory] = useState({ heartRate: [], drowsiness: [], alcoholLevel: [], proximity: [] });
  const socketRef = useRef(null);

  useEffect(() => {
    const URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";
    const socket = io(URL, {
      // Allow fallback to polling in case WS is blocked by proxies/firewalls
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      timeout: 20000,
      autoConnect: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", (err) => {
      console.warn("Socket connect_error", err?.message || err);
    });

    socket.on("sensor_data", (payload) => {
      setSensorData((prev) => ({ ...prev, ...payload }));
      setHistory((h) => {
        const next = { ...h };
        const max = 100;
        if (typeof payload.heartRate === 'number') next.heartRate = [...h.heartRate, payload.heartRate].slice(-max);
        if (typeof payload.drowsiness === 'number') next.drowsiness = [...h.drowsiness, payload.drowsiness].slice(-max);
        if (typeof payload.alcoholLevel === 'number') next.alcoholLevel = [...h.alcoholLevel, payload.alcoholLevel].slice(-max);
        if (typeof payload.proximity === 'number') next.proximity = [...h.proximity, payload.proximity].slice(-max);
        return next;
      });
    });

    socket.on("new_alert", (alert) => {
      const withTs = { id: crypto.randomUUID(), ts: new Date().toISOString(), ...alert };
      setAlerts((prev) => [withTs, ...prev].slice(0, 200));
      // Browser notification for critical
      if (withTs.level === "critical" && "Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification(withTs.title || "Critical Alert", { body: withTs.description || "Immediate attention required" });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then((perm) => {
            if (perm === "granted") new Notification(withTs.title || "Critical Alert", { body: withTs.description || "Immediate attention required" });
          });
        }
      }
    });

    return () => {
      socket.removeAllListeners();
      socket.close();
    };
  }, []);

  function sendCommand(command, data = {}) {
    if (!socketRef.current) return;
    socketRef.current.emit("control_command", { command, ...data });
  }

  const value = useMemo(() => ({ connected, sensorData, setSensorData, alerts, setAlerts, history, sendCommand }), [connected, sensorData, alerts, history]);

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
}

export function useSocket() {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error("useSocket must be used within WebSocketProvider");
  return ctx;
}
