import { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { deleteContact, listContacts, upsertContact } from "../lib/dataService";

export default function AdminPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const docs = await listContacts();
        setContacts(docs.map((d) => ({ id: d.$id, name: d.name || "", phone: d.phone || "", priority: d.priority || 0 })));
      } catch (e) {
        setError(e?.message || "Failed to load contacts");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function add() {
    if (contacts.length >= 5) return;
    const doc = { name: "", phone: "", priority: contacts.length + 1 };
    const created = await upsertContact(doc);
    setContacts((c) => [...c, { id: created.$id, name: created.name || "", phone: created.phone || "", priority: created.priority || c.length + 1 }]);
  }

  async function update(id, patch) {
    const existing = contacts.find((x) => x.id === id);
    if (!existing) return;
    const updatedLocal = { ...existing, ...patch };
    setContacts((c) => c.map((x) => (x.id === id ? updatedLocal : x)));
    await upsertContact({ $id: id, ...updatedLocal });
  }

  async function remove(id) {
    await deleteContact(id);
    setContacts((c) => c.filter((x) => x.id !== id));
  }

  async function move(id, dir) {
    setContacts((c) => {
      const idx = c.findIndex((x) => x.id === id);
      if (idx < 0) return c;
      const ni = Math.max(0, Math.min(c.length - 1, idx + dir));
      const copy = [...c];
      const [it] = copy.splice(idx, 1);
      copy.splice(ni, 0, it);
      return copy.map((x, i) => ({ ...x, priority: i + 1 }));
    });
    // Persist new priorities
    const next = contacts
      .slice()
      .sort((a, b) => a.priority - b.priority)
      .map((x, i) => ({ ...x, priority: i + 1 }));
    for (const n of next) await upsertContact({ $id: n.id, ...n });
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          <h1 className="text-xl text-cyan-300">Emergency Contacts</h1>
          <p className="text-slate-400 text-sm">Manage up to 5 contacts in order of priority.</p>
          {error && <div className="text-rose-400 text-sm">{String(error)}</div>}
          {loading ? (
            <div className="text-slate-400">Loading...</div>
          ) : (
            <>
              <div className="space-y-3">
                {contacts.map((c, idx) => (
                  <div key={c.id} className="grid grid-cols-12 gap-2 items-center bg-slate-900/60 border border-slate-800 rounded-xl p-3">
                    <div className="col-span-1 text-slate-400">#{idx + 1}</div>
                    <input value={c.name} onChange={(e) => update(c.id, { name: e.target.value })} placeholder="Name" className="col-span-4 bg-slate-950 border border-slate-800 rounded px-2 py-1" />
                    <input value={c.phone} onChange={(e) => update(c.id, { phone: e.target.value })} placeholder="Phone" className="col-span-4 bg-slate-950 border border-slate-800 rounded px-2 py-1" />
                    <div className="col-span-3 flex justify-end gap-2">
                      <button onClick={() => move(c.id, -1)} className="px-2 py-1 rounded bg-slate-800 border border-slate-700">↑</button>
                      <button onClick={() => move(c.id, 1)} className="px-2 py-1 rounded bg-slate-800 border border-slate-700">↓</button>
                      <button onClick={() => remove(c.id)} className="px-2 py-1 rounded bg-rose-700/80 border border-rose-600">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
              {contacts.length < 5 && <button onClick={add} className="px-3 py-2 rounded bg-emerald-700/80 hover:bg-emerald-700">Add Contact</button>}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
