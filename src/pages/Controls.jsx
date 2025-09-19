import ControlPad from "../components/ControlPad";
import ProtectedRoute from "../components/ProtectedRoute";

export default function ControlsPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          <h1 className="text-xl text-cyan-300">Remote Controls</h1>
          <ControlPad />
        </div>
      </div>
    </ProtectedRoute>
  );
}
