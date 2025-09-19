export const DB_ID = import.meta.env.VITE_APPWRITE_DB_ID;
export const COL_ALERTS = import.meta.env.VITE_APPWRITE_COL_ALERTS;
export const COL_SENSORS = import.meta.env.VITE_APPWRITE_COL_SENSORS;
export const COL_LOCATIONS = import.meta.env.VITE_APPWRITE_COL_LOCATIONS;
export const COL_CONTACTS = import.meta.env.VITE_APPWRITE_COL_CONTACTS;
export const COL_USERS = import.meta.env.VITE_APPWRITE_COL_USERS;

export function assertCollections() {
  const missing = [];
  if (!DB_ID) missing.push('VITE_APPWRITE_DB_ID');
  if (!COL_ALERTS) missing.push('VITE_APPWRITE_COL_ALERTS');
  if (!COL_SENSORS) missing.push('VITE_APPWRITE_COL_SENSORS');
  if (!COL_LOCATIONS) missing.push('VITE_APPWRITE_COL_LOCATIONS');
  if (!COL_CONTACTS) missing.push('VITE_APPWRITE_COL_CONTACTS');
  // COL_USERS is optional if you don't use client-side users listing
  if (missing.length) throw new Error(`Missing env for Appwrite collections: ${missing.join(', ')}`);
}
