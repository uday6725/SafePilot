import ControlPad from "../components/ControlPad";
import ProtectedRoute from "../components/ProtectedRoute";
import VideoFeed from "../components/VideoFeed";

export default function ControlsPage() {
  // Layout: keep feeds and controls visible simultaneously using viewport units
  return (
    <ProtectedRoute allowedRoles={["admin","owner"]}>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl text-cyan-300 mb-3">Remote Controls</h1>
          <div className="flex flex-col gap-3" style={{ height: "calc(100vh - 100px)" }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3" style={{ height: "50%" }}>
              <VideoFeed title="Front-view" height="100%" />
              <VideoFeed title="Rear-view" height="100%" />
              <VideoFeed title="Driver Cam" height="100%" />
            </div>
            <div style={{ height: "50%" }} className="overflow-hidden">
              <ControlPad />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
