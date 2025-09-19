import { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import { deleteCar, listCars, upsertCar, listDriverProfiles, listAssignments, assignDriver, unassignDriver } from "../lib/dataService";

export default function OwnerGarage() {
  const { user, role } = useAuth();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [assignBusy, setAssignBusy] = useState(false);
  const [selectedByCar, setSelectedByCar] = useState({}); // { [carId]: driverProfileId }

  const [form, setForm] = useState({ alias: "", plateNumber: "", vin: "", make: "", model: "", year: "", color: "" });
  const canEdit = role === "owner" || role === "admin";

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [carsRes, driversRes, assignsRes] = await Promise.all([
          listCars({ ownerId: user?.$id }),
          listDriverProfiles({ ownerId: user?.$id }),
          listAssignments({ ownerId: user?.$id }),
        ]);
        setCars(carsRes);
        setDrivers(driversRes);
        setAssignments(assignsRes);
      } catch (e) {
        setError(e?.message || "Failed to load garage data. Check permissions and env IDs.");
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.$id]);

  async function saveCar(e) {
    e.preventDefault();
    try {
      const payload = { ...form, ownerId: user.$id };
      const saved = await upsertCar(payload);
      setCars((prev) => [{ ...saved }, ...prev]);
      setForm({ alias: "", plateNumber: "", vin: "", make: "", model: "", year: "", color: "" });
    } catch (e) {
      setError(e?.message || "Failed to save car");
    }
  }

  async function removeCar(id) {
    try {
      await deleteCar(id);
      setCars((prev) => prev.filter((c) => c.$id !== id));
    } catch (e) {
      setError(e?.message || "Failed to delete car");
    }
  }

  function activeAssignmentForCar(carId) {
    return assignments.find((a) => a.carId === carId && (a.active === 1 || a.active === true));
  }

  async function doAssign(carId) {
    const driverProfileId = selectedByCar[carId];
    if (!driverProfileId) return;
    setAssignBusy(true);
    try {
      const created = await assignDriver({ ownerId: user.$id, carId, driverProfileId });
      setAssignments((prev) => [created, ...prev]);
      // clear local select
      setSelectedByCar((m) => ({ ...m, [carId]: "" }));
    } catch (e) {
      setError(e?.message || "Failed to assign driver");
    } finally {
      setAssignBusy(false);
    }
  }

  async function doUnassign(assignId) {
    setAssignBusy(true);
    try {
      const ended = await unassignDriver(assignId);
      setAssignments((prev) => prev.map((a) => (a.$id === assignId ? ended : a)));
    } catch (e) {
      setError(e?.message || "Failed to unassign driver");
    } finally {
      setAssignBusy(false);
    }
  }

  return (
    <ProtectedRoute allowedRoles={["owner","admin"]}>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
          <h1 className="text-xl text-cyan-300">Garage</h1>
          {error && <div className="text-rose-400 text-sm">{String(error)}</div>}

          {canEdit && (
            <form onSubmit={saveCar} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 grid grid-cols-2 md:grid-cols-6 gap-3">
              <input className="bg-slate-950 border border-slate-800 rounded px-2 py-1" placeholder="Alias" value={form.alias} onChange={(e) => setForm({ ...form, alias: e.target.value })} />
              <input className="bg-slate-950 border border-slate-800 rounded px-2 py-1" placeholder="Plate Number" value={form.plateNumber} onChange={(e) => setForm({ ...form, plateNumber: e.target.value })} />
              <input className="bg-slate-950 border border-slate-800 rounded px-2 py-1" placeholder="VIN" value={form.vin} onChange={(e) => setForm({ ...form, vin: e.target.value })} />
              <input className="bg-slate-950 border border-slate-800 rounded px-2 py-1" placeholder="Make" value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} />
              <input className="bg-slate-950 border border-slate-800 rounded px-2 py-1" placeholder="Model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
              <input className="bg-slate-950 border border-slate-800 rounded px-2 py-1" placeholder="Year" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
              <input className="bg-slate-950 border border-slate-800 rounded px-2 py-1 md:col-span-2" placeholder="Color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
              <div className="md:col-span-2 flex items-center justify-end"><button className="px-3 py-2 rounded-md bg-emerald-700/80 hover:bg-emerald-700">Add Car</button></div>
            </form>
          )}

          {loading ? (
            <div className="text-slate-400">Loading...</div>
          ) : (
            <div className="space-y-3">
              {cars.map((c) => {
                const active = activeAssignmentForCar(c.$id);
                const availableDrivers = drivers; // could filter out currently assigned if needed
                return (
                <div key={c.$id} className="grid grid-cols-2 md:grid-cols-12 gap-2 items-center bg-slate-900/60 border border-slate-800 rounded-xl p-3">
                  <div className="col-span-2 md:col-span-2 text-slate-200">{c.alias || `${c.make} ${c.model}`}</div>
                  <div className="text-slate-400">Plate: {c.plateNumber}</div>
                  <div className="text-slate-400">VIN: {c.vin}</div>
                  <div className="text-slate-400">Make: {c.make}</div>
                  <div className="text-slate-400">Model: {c.model}</div>
                  <div className="text-slate-400">Year: {c.year}</div>
                  <div className="md:col-span-3 col-span-2">
                    <div className="text-slate-400 text-xs mb-1">Driver Assignment</div>
                    {active ? (
                      <div className="flex items-center gap-2">
                        <div className="text-slate-200 text-sm">Assigned: {drivers.find(d => d.$id === active.driverProfileId)?.name || active.driverProfileId}</div>
                        {canEdit && <button disabled={assignBusy} onClick={() => doUnassign(active.$id)} className="px-2 py-1 rounded bg-amber-600/80 hover:bg-amber-600 border border-amber-500 text-xs">Unassign</button>}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <select value={selectedByCar[c.$id] || ""} onChange={(e) => setSelectedByCar((m) => ({ ...m, [c.$id]: e.target.value }))} className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-sm flex-1">
                          <option value="">Select driver</option>
                          {availableDrivers.map((d) => (
                            <option key={d.$id} value={d.$id}>{d.name || d.email}</option>
                          ))}
                        </select>
                        {canEdit && <button disabled={assignBusy || !selectedByCar[c.$id]} onClick={() => doAssign(c.$id)} className="px-2 py-1 rounded bg-emerald-700/80 hover:bg-emerald-700 border border-emerald-600 text-xs">Assign</button>}
                      </div>
                    )}
                  </div>
                  {canEdit && (
                    <div className="flex justify-end md:col-span-1 col-span-2">
                      <button onClick={() => removeCar(c.$id)} className="px-3 py-1 rounded bg-rose-700/80 border border-rose-600">Delete</button>
                    </div>
                  )}
                </div>
              );})}
              {cars.length === 0 && <div className="text-slate-500">No cars yet.</div>}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
