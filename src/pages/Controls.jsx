import ControlPad from "../components/ControlPad";
import ProtectedRoute from "../components/ProtectedRoute";
import VideoFeed from "../components/VideoFeed";
import ESP32Camera from "../components/ESP32Camera";
import { useSocket } from "../context/WebSocketContext";

export default function ControlsPage() {
  const { ignition, remoteControl, authEvent, lastEmergency } = useSocket();
  // Layout: keep feeds and controls visible simultaneously using viewport units
  return (
    <ProtectedRoute allowedRoles={["admin", "owner"]}>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl text-cyan-300">Remote Controls</h1>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">LIVE_CAM: ESP32_QC_01</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 shadow-lg hover:border-slate-700 transition-all">
              <div className="text-slate-400 text-xs">Ignition</div>
              <div className={`text-lg transition-colors ${ignition?.ready ? 'text-emerald-300' : 'text-rose-300'}`}>{ignition?.ready ? 'Ready' : 'Blocked'}</div>
              {ignition?.reason && <div className="text-slate-400 text-xs mt-1">{ignition.reason}</div>}
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 shadow-lg hover:border-slate-700 transition-all">
              <div className="text-slate-400 text-xs">Remote Control</div>
              <div className={`text-lg transition-colors ${remoteControl?.enabled ? 'text-emerald-300' : 'text-slate-300'}`}>{remoteControl?.enabled ? 'Enabled' : 'Disabled'}</div>
              {remoteControl?.reason && <div className="text-slate-400 text-xs mt-1">{remoteControl.reason}</div>}
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 shadow-lg hover:border-slate-700 transition-all">
              <div className="text-slate-400 text-xs">Driver Verification</div>
              <div className={`text-lg transition-colors ${authEvent?.verified ? 'text-emerald-300' : 'text-slate-300'}`}>{authEvent?.verified ? 'Verified' : 'Pending'}</div>
              {authEvent?.method && <div className="text-slate-400 text-xs mt-1">Method: {authEvent.method}</div>}
            </div>
          </div>

          {lastEmergency && (
            <div className="rounded-xl border border-rose-500/60 bg-rose-500/10 p-3 mb-3 animate-pulse">
              <div className="text-rose-300 font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                Emergency Event Detected
              </div>
              <div className="text-slate-300 text-xs mt-1 px-4">Alcohol {lastEmergency.alcoholLevel}% · Heart {lastEmergency.heartRate} bpm · {lastEmergency.location?.lat?.toFixed?.(4)}, {lastEmergency.location?.lng?.toFixed?.(4)}</div>
            </div>
          )}

          <div className="flex flex-col gap-4" style={{ height: "calc(100vh - 120px)" }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ height: "65%" }}>
              {/* LIVE ESP32 Camera Feed (Front View) */}
              <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl transition-all hover:scale-[1.005]">
                <div className="px-3 py-2 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
                  <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">Live: Front View</span>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] text-slate-400">WS://STREAM_READY</span>
                  </div>
                </div>
                <div className="flex-grow p-1 h-full">
                  <ESP32Camera />
                </div>
              </div>

              {/* Other Static/Backup Feeds */}
              <div className="grid grid-cols-2 gap-2 h-full">
                <VideoFeed title="Rear-view" height="100%" />
                <VideoFeed title="Driver Cam" height="100%" />
              </div>
            </div>

            <div style={{ height: "35%" }} className="overflow-hidden bg-slate-900/40 rounded-xl p-1 border border-slate-800">
              <ControlPad disabled={!remoteControl?.enabled} />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
