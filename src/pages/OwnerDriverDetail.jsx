import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import {
  listDriverProfiles,
  listAssignments,
  listCars,
  listDriverRecords,
} from "../lib/dataService";

export default function OwnerDriverDetail() {
  const { user, role } = useAuth();
  const ownerId = user?.$id;
  const { driverId } = useParams();

  const [driver, setDriver] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [cars, setCars] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentAssignment = useMemo(() => assignments.find((a) => a.active), [assignments]);
  const currentCar = useMemo(() => (currentAssignment ? cars.find((c) => c.$id === currentAssignment.carId) : null), [currentAssignment, cars]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [driversRes, carsRes, assignmentsRes, recordsRes] = await Promise.all([
          listDriverProfiles({ ownerId }),
          listCars({ ownerId }),
          listAssignments({ ownerId, driverProfileId: driverId }),
          listDriverRecords({ driverProfileId: driverId }),
        ]);
        setDriver(driversRes.find((d) => d.$id === driverId) || null);
        setCars(carsRes);
        setAssignments(assignmentsRes);
        setRecords(recordsRes);
      } catch (e) {
        setError(e?.message || "Failed to load driver detail");
      } finally {
        setLoading(false);
      }
    })();
  }, [ownerId, driverId]);

  return (
    <ProtectedRoute allowedRoles={["owner","admin"]}>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl text-cyan-300">Driver Details</h1>
            <Link to="/owner-drivers" className="text-slate-400 hover:text-white">Back to Drivers</Link>
          </div>
          {error && <div className="text-rose-400 text-sm">{String(error)}</div>}
          {loading ? (
            <div className="text-slate-400">Loading...</div>
          ) : !driver ? (
            <div className="text-slate-500">Driver not found.</div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                  <div className="text-slate-200 text-lg">{driver.name || driver.email}</div>
                  <div className="text-slate-400 text-sm">Email: {driver.email || '-'}</div>
                  <div className="text-slate-400 text-sm">Phone: {driver.phone || '-'}</div>
                  <div className="text-slate-400 text-sm">License: {driver.licenseNo || '-'}</div>
                  <div className="text-slate-400 text-sm">Last Medical: {driver.lastMedicalCheck || '-'}</div>
                  <div className="text-slate-300 text-sm mt-2">{driver.backgroundNotes || ''}</div>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                  <div className="text-slate-300 text-sm mb-2">Current Assignment</div>
                  {currentAssignment && currentCar ? (
                    <div className="space-y-1">
                      <div className="text-slate-200">{currentCar.alias || `${currentCar.make} ${currentCar.model}`}</div>
                      <div className="text-slate-400 text-sm">Plate: {currentCar.plateNumber || '-'}</div>
                      <div className="text-slate-400 text-sm">VIN: {currentCar.vin || '-'}</div>
                      <div className="text-slate-400 text-sm">Since: {currentAssignment.ts || '-'}</div>
                    </div>
                  ) : (
                    <div className="text-slate-500 text-sm">No active car assigned.</div>
                  )}
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                <div className="text-slate-300 text-sm mb-2">All Assignments</div>
                <div className="space-y-2">
                  {assignments.length ? assignments.map((a) => {
                    const car = cars.find((c) => c.$id === a.carId);
                    return (
                      <div key={a.$id} className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded px-3 py-2">
                        <div className="text-slate-300 text-sm">{car ? (car.alias || `${car.make} ${car.model}`) : a.carId}</div>
                        <div className="text-slate-400 text-xs">{a.active ? 'Active' : `Ended ${a.endedAt || ''}`}</div>
                      </div>
                    );
                  }) : <div className="text-slate-500 text-sm">No assignments found.</div>}
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                <div className="text-slate-300 text-sm mb-2">Driver Records</div>
                <div className="space-y-2">
                  {records.length ? records.map((r) => (
                    <div key={r.$id} className={`rounded-lg p-3 border ${r.level === 'critical' ? 'border-rose-500/50 bg-rose-500/10' : r.level === 'warning' ? 'border-amber-400/50 bg-amber-400/10' : 'border-slate-700 bg-slate-800/50'}`}>
                      <div className="text-xs text-slate-400 flex justify-between">
                        <span>{r.ts || '-'}</span>
                        <span className="uppercase">{r.level || r.type}</span>
                      </div>
                      <div className="text-slate-200">{r.title || r.type}</div>
                      {r.description && <div className="text-slate-400 text-sm">{r.description}</div>}
                    </div>
                  )) : <div className="text-slate-500 text-sm">No records found.</div>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
