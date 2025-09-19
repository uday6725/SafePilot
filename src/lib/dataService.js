import { ID, Query } from "appwrite";
import { databases } from "./appwrite";
import { DB_ID, COL_ALERTS, COL_SENSORS, COL_LOCATIONS, COL_CONTACTS, COL_USERS, assertCollections } from "./collections";

export async function seedMockData() {
  assertCollections();
  // Check existing docs to avoid duplicate seeding
  const [alerts, sensors, locations, contacts] = await Promise.all([
    databases.listDocuments(DB_ID, COL_ALERTS, [Query.limit(1)]).catch(() => ({ total: 0 })),
    databases.listDocuments(DB_ID, COL_SENSORS, [Query.limit(1)]).catch(() => ({ total: 0 })),
    databases.listDocuments(DB_ID, COL_LOCATIONS, [Query.limit(1)]).catch(() => ({ total: 0 })),
    databases.listDocuments(DB_ID, COL_CONTACTS, [Query.limit(1)]).catch(() => ({ total: 0 })),
  ]);

  const promises = [];

  if (!alerts.total) {
    promises.push(
      databases.createDocument(DB_ID, COL_ALERTS, ID.unique(), { level: "warning", title: "Alcohol Detected", description: "Detected alcohol 35%", ts: new Date().toISOString() }),
      databases.createDocument(DB_ID, COL_ALERTS, ID.unique(), { level: "critical", title: "High Alcohol Level", description: "Detected alcohol 72%", ts: new Date().toISOString() })
    );
  }

  if (!sensors.total) {
    promises.push(
      databases.createDocument(DB_ID, COL_SENSORS, ID.unique(), {
        heartRate: 78,
        drowsiness: 22,
        alcoholLevel: 0,
        proximity: 60,
        speed: 12,
        status: "Normal",
        location: { lat: 19.076, lng: 72.8777 },
        ts: new Date().toISOString(),
      })
    );
  }

  if (!locations.total) {
    const path = [
      { lat: 19.076, lng: 72.8777 },
      { lat: 19.08, lng: 72.882 },
      { lat: 19.084, lng: 72.888 },
    ];
    for (const p of path) {
      promises.push(databases.createDocument(DB_ID, COL_LOCATIONS, ID.unique(), { ...p, ts: new Date().toISOString() }));
    }
  }

  if (!contacts.total) {
    const seedContacts = [
      { name: "Control Room", phone: "+91-99999 00000", priority: 1 },
      { name: "Lead Admin", phone: "+91-88888 11111", priority: 2 },
    ];
    for (const c of seedContacts) {
      promises.push(databases.createDocument(DB_ID, COL_CONTACTS, ID.unique(), c));
    }
  }

  await Promise.all(promises);
}

export async function getRecentAlerts(limit = 50) {
  assertCollections();
  const res = await databases.listDocuments(DB_ID, COL_ALERTS, [Query.orderDesc("ts"), Query.limit(limit)]);
  return res.documents;
}

export async function getAlerts({ limit = 100, resolved } = {}) {
  assertCollections();
  const filters = [Query.orderDesc("ts"), Query.limit(limit)];
  if (typeof resolved === "boolean") filters.push(Query.equal("resolved", resolved));
  const res = await databases.listDocuments(DB_ID, COL_ALERTS, filters);
  return res.documents;
}

export async function updateAlert(id, patch) {
  assertCollections();
  return databases.updateDocument(DB_ID, COL_ALERTS, id, patch);
}

export async function resolveAlert(id, isResolved = true) {
  return updateAlert(id, { resolved: !!isResolved });
}

export async function getLatestSensor() {
  assertCollections();
  const res = await databases.listDocuments(DB_ID, COL_SENSORS, [Query.orderDesc("ts"), Query.limit(1)]);
  return res.documents[0] || null;
}

export async function getPath(limit = 100) {
  assertCollections();
  const res = await databases.listDocuments(DB_ID, COL_LOCATIONS, [Query.orderDesc("ts"), Query.limit(limit)]);
  // Return chronological order
  return res.documents.sort((a, b) => new Date(a.ts) - new Date(b.ts)).map((d) => ({ lat: d.lat, lng: d.lng }));
}

export async function listContacts() {
  assertCollections();
  const res = await databases.listDocuments(DB_ID, COL_CONTACTS, [Query.orderAsc("priority"), Query.limit(5)]);
  return res.documents;
}

export async function upsertContact(doc) {
  assertCollections();
  if (doc.$id) {
    return databases.updateDocument(DB_ID, COL_CONTACTS, doc.$id, doc);
  }
  return databases.createDocument(DB_ID, COL_CONTACTS, ID.unique(), doc);
}

export async function deleteContact(id) {
  assertCollections();
  return databases.deleteDocument(DB_ID, COL_CONTACTS, id);
}

// Optional: Users collection (for admin listing on client)
export async function listUsers(limit = 100) {
  if (!COL_USERS) throw new Error("VITE_APPWRITE_COL_USERS not configured");
  const res = await databases.listDocuments(DB_ID, COL_USERS, [Query.limit(limit)]);
  return res.documents;
}

export async function upsertUser(doc) {
  if (!COL_USERS) throw new Error("VITE_APPWRITE_COL_USERS not configured");
  if (doc.$id) return databases.updateDocument(DB_ID, COL_USERS, doc.$id, doc);
  return databases.createDocument(DB_ID, COL_USERS, ID.unique(), doc);
}
