// appwrite-seed.js
// npm install node-appwrite dotenv

import { Client, Databases } from "node-appwrite";
import dotenv from "dotenv";

dotenv.config();

async function seed() {
  const client = new Client();

  client
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.VITE_APPWRITE_API_KEY);

  const databases = new Databases(client);
  const databaseId = process.env.VITE_APPWRITE_DB_ID;

  // helper to create document
  async function addDoc(collectionId, data) {
    try {
      const res = await databases.createDocument(databaseId, collectionId, "unique()", data);
      console.log(`✅ Inserted into ${collectionId}:`, res.$id);
    } catch (err) {
      console.error(`❌ Failed to insert into ${collectionId}:`, err.message);
    }
  }

  // --- Alerts ---
  await addDoc(process.env.VITE_APPWRITE_COL_ALERTS, {
    level: "warning",
    title: "High Speed Detected",
    description: "Driver Mahesh Shinde exceeded safe speed limit.",
    datetime: new Date().toISOString(),
  });

  await addDoc(process.env.VITE_APPWRITE_COL_ALERTS, {
    level: "critical",
    title: "Alcohol Level High",
    description: "Alcohol level detected above threshold.",
    datetime: new Date().toISOString(),
  });

  // --- Sensors ---
  await addDoc(process.env.VITE_APPWRITE_COL_SENSORS, {
    heartRate: 88,
    drowsiness: 2,
    alcoholLevel: 0,
    proximity: 15,
    speed: 72,
    status: "active",
    location_lat: 19.7715,
    location_lng: 74.4786,
    datetime: new Date().toISOString(),
  });

  await addDoc(process.env.VITE_APPWRITE_COL_SENSORS, {
    heartRate: 95,
    drowsiness: 4,
    alcoholLevel: 1,
    proximity: 8,
    speed: 92,
    status: "alert",
    location_lat: 19.7677,
    location_lng: 74.4821,
    datetime: new Date().toISOString(),
  });

  // --- Locations ---
  await addDoc(process.env.VITE_APPWRITE_COL_LOCATIONS, {
    lat: 19.7715,
    lng: 74.4786,
    datetime: new Date().toISOString(),
  });

  await addDoc(process.env.VITE_APPWRITE_COL_LOCATIONS, {
    lat: 19.7677,
    lng: 74.4821,
    datetime: new Date().toISOString(),
  });

  // --- Contacts ---
  await addDoc(process.env.VITE_APPWRITE_COL_CONTACTS, {
    name: "Mahesh Shinde",
    phone: "+91-9876543210",
    priority: 1,
  });

  await addDoc(process.env.VITE_APPWRITE_COL_CONTACTS, {
    name: "Emergency Contact",
    phone: "+91-9123456780",
    priority: 2,
  });

  console.log("🎉 Sample data inserted successfully.");
}

seed().catch((err) => console.error("Fatal error:", err));
