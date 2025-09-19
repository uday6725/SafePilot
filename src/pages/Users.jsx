import { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { listUsers } from "../lib/dataService";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const docs = await listUsers(100);
        setUsers(docs);
      } catch (e) {
        setError(e?.message || "Failed to load users. Ensure VITE_APPWRITE_COL_USERS is configured and permissions are set.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
          <h1 className="text-xl text-cyan-300">Users</h1>
          {error && <div className="text-rose-400 text-sm">{String(error)}</div>}
          {loading ? (
            <div className="text-slate-400">Loading...</div>
          ) : (
            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left">
                <thead className="bg-slate-900/60 border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Role</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.$id} className="border-b border-slate-800">
                      <td className="px-3 py-2">{u.name || "-"}</td>
                      <td className="px-3 py-2">{u.email || u.username || "-"}</td>
                      <td className="px-3 py-2 uppercase">{u.role || (u.prefs?.role) || "user"}</td>
                      <td className="px-3 py-2">{u.status || "active"}</td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td className="px-3 py-4 text-slate-500" colSpan={4}>No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
