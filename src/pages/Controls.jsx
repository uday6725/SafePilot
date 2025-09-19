import ControlPad from "../components/ControlPad";
import ProtectedRoute from "../components/ProtectedRoute";
import VideoFeed from "../components/VideoFeed";
import { useSocket } from "../context/WebSocketContext";

export default function ControlsPage() {
  const { ignition, remoteControl, authEvent, lastEmergency } = useSocket();
  // Layout: keep feeds and controls visible simultaneously using viewport units
  return (
    <ProtectedRoute allowedRoles={["admin","owner"]}>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl text-cyan-300 mb-3">Remote Controls</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
              <div className="text-slate-400 text-xs">Ignition</div>
              <div className={`text-lg ${ignition?.ready ? 'text-emerald-300' : 'text-rose-300'}`}>{ignition?.ready ? 'Ready' : 'Blocked'}</div>
              {ignition?.reason && <div className="text-slate-400 text-xs">{ignition.reason}</div>}
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
              <div className="text-slate-400 text-xs">Remote Control</div>
              <div className={`text-lg ${remoteControl?.enabled ? 'text-emerald-300' : 'text-slate-300'}`}>{remoteControl?.enabled ? 'Enabled' : 'Disabled'}</div>
              {remoteControl?.reason && <div className="text-slate-400 text-xs">{remoteControl.reason}</div>}
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
              <div className="text-slate-400 text-xs">Driver Verification</div>
              <div className={`text-lg ${authEvent?.verified ? 'text-emerald-300' : 'text-slate-300'}`}>{authEvent?.verified ? 'Verified' : 'Pending'}</div>
              {authEvent?.method && <div className="text-slate-400 text-xs">Method: {authEvent.method}</div>}
            </div>
          </div>
          {lastEmergency && (
            <div className="rounded-xl border border-rose-500/60 bg-rose-500/10 p-3 mb-3">
              <div className="text-rose-300 font-semibold">Emergency Event</div>
              <div className="text-slate-300 text-sm">Alcohol {lastEmergency.alcoholLevel}% · Heart {lastEmergency.heartRate} bpm · {lastEmergency.location?.lat?.toFixed?.(4)}, {lastEmergency.location?.lng?.toFixed?.(4)}</div>
            </div>
          )}
          <div className="flex flex-col gap-3" style={{ height: "calc(100vh - 100px)" }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3" style={{ height: "50%" }}>
              <VideoFeed title="Front-view" height="100%" />
              <VideoFeed title="Rear-view" height="100%" />
              <VideoFeed title="Driver Cam" height="100%" />
            </div>
            <div style={{ height: "50%" }} className="overflow-hidden">
              <ControlPad disabled={!remoteControl?.enabled} />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
