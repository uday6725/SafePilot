import { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import { upsertUser, listUsers } from "../lib/dataService";

export default function Profile() {
  const { user, role } = useAuth();
  const [profile, setProfile] = useState({ name: "", email: "", role: role || "user" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Try to load a matching profile from the optional Users collection
        const docs = await listUsers(200).catch(() => []);
        const match = Array.isArray(docs) ? docs.find((d) => d.email === user?.email) : null;
        if (match) {
          setProfile({ $id: match.$id, name: match.name || user?.name || "", email: match.email || user?.email || "", role: match.role || role || "user" });
        } else {
          setProfile({ name: user?.name || "", email: user?.email || "", role: role || "user" });
        }
      } catch (e) {
        setError(e?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [user, role]);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const payload = { ...profile };
      const saved = await upsertUser(payload);
      setProfile((p) => ({ ...p, $id: saved.$id }));
    } catch (e) {
      setError(e?.message || "Failed to save profile. Ensure VITE_APPWRITE_COL_USERS is configured and write permissions are set.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProtectedRoute allowedRoles={["admin","owner","driver"]}>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="max-w-xl mx-auto px-4 py-6 space-y-4">
          <h1 className="text-xl text-cyan-300">Profile</h1>
          {loading ? (
            <div className="text-slate-400">Loading...</div>
          ) : (
            <div className="space-y-3 bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <div>
                <label className="text-sm text-slate-400">Name</label>
                <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="mt-1 w-full rounded-md bg-slate-950 border border-slate-800 px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
              </div>
              <div>
                <label className="text-sm text-slate-400">Email</label>
                <input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="mt-1 w-full rounded-md bg-slate-950 border border-slate-800 px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
              </div>
              <div>
                <label className="text-sm text-slate-400">Role</label>
                <input value={profile.role} disabled className="mt-1 w-full rounded-md bg-slate-950 border border-slate-800 px-3 py-2 text-slate-400" />
              </div>
              {error && <div className="text-rose-400 text-sm">{String(error)}</div>}
              <div className="flex justify-end gap-2">
                <button onClick={save} disabled={saving} className="px-3 py-2 rounded-md bg-emerald-700/80 hover:bg-emerald-700 disabled:opacity-60">{saving ? "Saving..." : "Save"}</button>
              </div>
            </div>
          )}
          <div className="text-slate-500 text-xs">Note: Profile writes to the optional Users collection configured via VITE_APPWRITE_COL_USERS.</div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
