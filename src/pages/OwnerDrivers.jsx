import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import {
  listDriverProfiles,
  upsertDriverProfile,
  deleteDriverProfile,
  listCars,
  listAssignments,
  assignDriver,
  unassignDriver,
} from "../lib/dataService";

export default function OwnerDrivers() {
  const { user, role } = useAuth();
  const ownerId = user?.$id;
  const canEdit = role === "owner" || role === "admin";

  const [drivers, setDrivers] = useState([]);
  const [cars, setCars] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({ name: "", email: "", phone: "", licenseNo: "", backgroundNotes: "", violations: 0, lastMedicalCheck: "" });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [d, c, a] = await Promise.all([
          listDriverProfiles({ ownerId }).catch(() => []),
          listCars({ ownerId }).catch(() => []),
          listAssignments({ ownerId }).catch(() => []),
        ]);
        setDrivers(d);
        setCars(c);
        setAssignments(a);
      } catch (e) {
        setError(e?.message || "Failed to load drivers/cars/assignments");
      } finally {
        setLoading(false);
      }
    })();
  }, [ownerId]);

  const assignmentsByDriver = useMemo(() => {
    const map = new Map();
    for (const a of assignments) {
      if (!map.has(a.driverProfileId)) map.set(a.driverProfileId, []);
      map.get(a.driverProfileId).push(a);
    }
    return map;
  }, [assignments]);

  async function saveDriver(e) {
    e.preventDefault();
    try {
      const payload = { ...form, ownerId, violations: Number(form.violations || 0) };
      const saved = await upsertDriverProfile(payload);
      setDrivers((prev) => [saved, ...prev]);
      setForm({ name: "", email: "", phone: "", licenseNo: "", backgroundNotes: "", violations: 0, lastMedicalCheck: "" });
    } catch (e) {
      setError(e?.message || "Failed to save driver profile");
    }
  }

  async function removeDriver(id) {
    try {
      await deleteDriverProfile(id);
      setDrivers((prev) => prev.filter((d) => d.$id !== id));
      setAssignments((prev) => prev.filter((a) => a.driverProfileId !== id));
    } catch (e) {
      setError(e?.message || "Failed to delete driver");
    }
  }

  async function doAssign(driverProfileId, carId) {
    try {
      const created = await assignDriver({ ownerId, driverProfileId, carId, active: true });
      setAssignments((prev) => [created, ...prev]);
    } catch (e) {
      setError(e?.message || "Failed to assign driver to car");
    }
  }

  async function doUnassign(assignmentId) {
    try {
      const updated = await unassignDriver(assignmentId);
      setAssignments((prev) => prev.map((a) => (a.$id === assignmentId ? updated : a)));
    } catch (e) {
      setError(e?.message || "Failed to unassign driver");
    }
  }

  return (
    <ProtectedRoute allowedRoles={["owner","admin"]}>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
          <h1 className="text-xl text-cyan-300">Drivers</h1>
          {error && <div className="text-rose-400 text-sm">{String(error)}</div>}

          {canEdit && (
            <form onSubmit={saveDriver} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 grid grid-cols-2 md:grid-cols-6 gap-3">
              <input className="bg-slate-950 border border-slate-800 rounded px-2 py-1" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="bg-slate-950 border border-slate-800 rounded px-2 py-1" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input className="bg-slate-950 border border-slate-800 rounded px-2 py-1" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <input className="bg-slate-950 border border-slate-800 rounded px-2 py-1" placeholder="License No" value={form.licenseNo} onChange={(e) => setForm({ ...form, licenseNo: e.target.value })} />
              <input type="date" className="bg-slate-950 border border-slate-800 rounded px-2 py-1" placeholder="Last Medical Check" value={form.lastMedicalCheck} onChange={(e) => setForm({ ...form, lastMedicalCheck: e.target.value })} />
              <input type="number" min="0" className="bg-slate-950 border border-slate-800 rounded px-2 py-1" placeholder="Violations" value={form.violations} onChange={(e) => setForm({ ...form, violations: e.target.value })} />
              <input className="bg-slate-950 border border-slate-800 rounded px-2 py-1 md:col-span-6" placeholder="Background Notes" value={form.backgroundNotes} onChange={(e) => setForm({ ...form, backgroundNotes: e.target.value })} />
              <div className="md:col-span-6 flex justify-end"><button className="px-3 py-2 rounded-md bg-emerald-700/80 hover:bg-emerald-700">Add Driver</button></div>
            </form>
          )}

          {loading ? (
            <div className="text-slate-400">Loading...</div>
          ) : (
            <div className="space-y-4">
              {drivers.map((d) => (
                <div key={d.$id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-slate-200 font-medium">
                        <Link className="hover:underline" to={`/owner-drivers/${d.$id}`}>{d.name || d.email}</Link>
                      </div>
                      <div className="text-slate-400 text-sm">{d.email} · {d.phone} · Lic: {d.licenseNo}</div>
                    </div>
                    {canEdit && (
                      <button onClick={() => removeDriver(d.$id)} className="px-3 py-1 rounded bg-rose-700/80 border border-rose-600">Delete</button>
                    )}
                  </div>
                  {d.backgroundNotes && <div className="text-slate-300 text-sm">{d.backgroundNotes}</div>}
                  <div className="text-slate-400 text-sm">Violations: {d.violations ?? 0} · Last Medical: {d.lastMedicalCheck || '-'}</div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
                    <div className="md:col-span-2">
                      <div className="text-slate-300 text-sm mb-1">Assignments</div>
                      <div className="space-y-2">
                        {(assignmentsByDriver.get(d.$id) || []).map((a) => {
                          const car = cars.find((c) => c.$id === a.carId);
                          return (
                            <div key={a.$id} className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded px-3 py-2">
                              <div className="text-slate-300 text-sm">{car ? (car.alias || `${car.make} ${car.model}`) : a.carId} · {a.active ? 'Active' : 'Inactive'}</div>
                              {a.active && canEdit && <button onClick={() => doUnassign(a.$id)} className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs">Unassign</button>}
                            </div>
                          );
                        })}
                        {(assignmentsByDriver.get(d.$id) || []).length === 0 && (
                          <div className="text-slate-500 text-sm">No assignments</div>
                        )}
                      </div>
                    </div>
                    {canEdit && (
                      <div className="space-y-2">
                        <div className="text-slate-300 text-sm">Assign to car</div>
                        <select className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1" onChange={(e) => e.target.value && doAssign(d.$id, e.target.value)} defaultValue="">
                          <option value="" disabled>Choose car</option>
                          {cars.map((c) => (
                            <option key={c.$id} value={c.$id}>{c.alias || `${c.make} ${c.model}`} ({c.plateNumber})</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {drivers.length === 0 && <div className="text-slate-500">No drivers yet.</div>}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
