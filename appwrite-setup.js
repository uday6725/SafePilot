// appwrite-setup.js
// run with: node appwrite-setup.js

import { Client, Databases } from "node-appwrite";
import dotenv from "dotenv";

dotenv.config();

async function setup() {
  const client = new Client();

  client
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT) // e.g. https://cloud.appwrite.io/v1
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.VITE_APPWRITE_API_KEY); // must be in .env

  const databases = new Databases(client);
  const databaseId = process.env.VITE_APPWRITE_DB_ID;

  async function createCollectionWithAttributes(collectionId, name, attributes) {
    try {
      await databases.createCollection({
        databaseId,
        collectionId,
        name,
        permissions: [],
        documentSecurity: false,
        enabled: true,
      });
      console.log(`✅ Collection ${name} created`);
    } catch (err) {
      if (err.code === 409) {
        console.log(`ℹ️ Collection ${name} already exists`);
      } else throw err;
    }

    for (const attr of attributes) {
      const { type, key, required = false, array = false, size, defaultValue } = attr;
      try {
        switch (type) {
          case "string":
            await databases.createStringAttribute({
              databaseId,
              collectionId,
              key,
              required,
              array,
              size: size || 256,
              default: defaultValue,
            });
            break;
          case "integer":
            await databases.createIntegerAttribute({
              databaseId,
              collectionId,
              key,
              required,
              array,
              default: defaultValue,
            });
            break;
          case "float":
            await databases.createFloatAttribute({
              databaseId,
              collectionId,
              key,
              required,
              array,
              default: defaultValue,
            });
            break;
          case "datetime":
            await databases.createDatetimeAttribute({
              databaseId,
              collectionId,
              key,
              required,
              array,
              default: defaultValue,
            });
            break;
          default:
            console.warn(`⚠️ Unhandled attribute type: ${type}`);
        }
        console.log(`   ➕ Attribute ${key} (${type}) added`);
      } catch (err) {
        if (err.code === 409) {
          console.log(`   ℹ️ Attribute ${key} already exists`);
        } else {
          console.error(`   ❌ Error on ${key}:`, err.message);
        }
      }
    }
  }

  async function createIndexIfMissing(collectionId, key, type, attributes, orders = []) {
    try {
      await databases.createIndex({
        databaseId,
        collectionId,
        key,
        type, // 'key' | 'fulltext' | 'unique'
        attributes,
        orders,
      });
      console.log(`   🔎 Index ${key} created on ${collectionId}`);
    } catch (err) {
      if (err.code === 409) {
        console.log(`   ℹ️ Index ${key} already exists on ${collectionId}`);
      } else {
        console.error(`   ❌ Index ${key} error:`, err.message);
      }
    }
  }

  async function ensureCollectionPermissions(collectionId, permissions) {
    // permissions format example: [ 'read("users")', 'create("users")', 'update("users")', 'delete("users")' ]
    try {
      // fetch existing collection to preserve required fields like name and documentSecurity
      const col = await databases.getCollection({ databaseId, collectionId });
      await databases.updateCollection({
        databaseId,
        collectionId,
        name: col.name,
        permissions,
        documentSecurity: col.documentSecurity,
      });
      console.log(`   🔐 Permissions updated for ${collectionId}`);
    } catch (err) {
      if (err.code === 404) {
        console.log(`   ℹ️ Skipped permissions for missing collection ${collectionId}`);
      } else if (err.code === 409) {
        console.log(`   ℹ️ Permissions already set for ${collectionId}`);
      } else {
        console.error(`   ❌ Permissions update failed for ${collectionId}:`, err.message);
      }
    }
  }

  // Collections

  await createCollectionWithAttributes(
    process.env.VITE_APPWRITE_COL_ALERTS,
    "Alerts",
    [
      { type: "string", key: "level", required: true },
      { type: "string", key: "title", required: true },
      { type: "string", key: "description" },
      { type: "datetime", key: "datetime", required: true },
      // Extra field to align with frontend ordering
      { type: "datetime", key: "ts" },
    ]
  );
  if (process.env.VITE_APPWRITE_COL_ALERTS) {
    await createIndexIfMissing(process.env.VITE_APPWRITE_COL_ALERTS, 'ts_desc', 'key', ['ts'], ['DESC']);
    await ensureCollectionPermissions(process.env.VITE_APPWRITE_COL_ALERTS, ['read("users")']);
  }

  await createCollectionWithAttributes(
    process.env.VITE_APPWRITE_COL_SENSORS,
    "Sensors",
    [
      { type: "integer", key: "heartRate", required: true },
      { type: "integer", key: "drowsiness" },
      { type: "integer", key: "alcoholLevel" },
      { type: "integer", key: "proximity" },
      { type: "integer", key: "speed" },
      { type: "string", key: "status" },
      { type: "float", key: "location_lat" },
      { type: "float", key: "location_lng" },
      { type: "datetime", key: "datetime", required: true },
      // Extra field to align with frontend ordering
      { type: "datetime", key: "ts" },
    ]
  );

  await createCollectionWithAttributes(
    process.env.VITE_APPWRITE_COL_LOCATIONS,
    "Locations",
    [
      { type: "float", key: "lat", required: true },
      { type: "float", key: "lng", required: true },
      { type: "datetime", key: "datetime", required: true },
      // Extra field to align with frontend ordering
      { type: "datetime", key: "ts" },
    ]
  );

  await createCollectionWithAttributes(
    process.env.VITE_APPWRITE_COL_CONTACTS,
    "Contacts",
    [
      { type: "string", key: "name", required: true },
      { type: "string", key: "phone", required: true },
      { type: "integer", key: "priority" },
    ]
  );

  // Optional: Users collection (used by Profile/Users pages)
  if (process.env.VITE_APPWRITE_COL_USERS) {
    await createCollectionWithAttributes(
      process.env.VITE_APPWRITE_COL_USERS,
      "Users (App data)",
      [
        { type: "string", key: "name" },
        { type: "string", key: "email" },
        { type: "string", key: "role" },
        { type: "string", key: "status" },
      ]
    );
    await createIndexIfMissing(process.env.VITE_APPWRITE_COL_USERS, 'email_eq', 'key', ['email']);
    await ensureCollectionPermissions(process.env.VITE_APPWRITE_COL_USERS, ['read("users")','create("users")','update("users")','delete("users")']);
  }

  // Owner–Car–Driver model
  if (process.env.VITE_APPWRITE_COL_CARS) {
    await createCollectionWithAttributes(
      process.env.VITE_APPWRITE_COL_CARS,
      "Cars",
      [
        { type: "string", key: "ownerId", required: true },
        { type: "string", key: "alias" },
        { type: "string", key: "plateNumber" },
        { type: "string", key: "vin" },
        { type: "string", key: "make" },
        { type: "string", key: "model" },
        { type: "integer", key: "year" },
        { type: "string", key: "color" },
        { type: "datetime", key: "createdAt" },
      ]
    );
  }

  if (process.env.VITE_APPWRITE_COL_DRIVER_PROFILES) {
    await createCollectionWithAttributes(
      process.env.VITE_APPWRITE_COL_DRIVER_PROFILES,
      "DriverProfiles",
      [
        { type: "string", key: "ownerId", required: true },
        { type: "string", key: "name" },
        { type: "string", key: "email" },
        { type: "string", key: "phone" },
        { type: "string", key: "licenseNo" },
        { type: "string", key: "backgroundNotes" },
        { type: "integer", key: "violations" },
        { type: "datetime", key: "lastMedicalCheck" },
        { type: "datetime", key: "createdAt" },
      ]
    );
  }

  if (process.env.VITE_APPWRITE_COL_ASSIGNMENTS) {
    await createCollectionWithAttributes(
      process.env.VITE_APPWRITE_COL_ASSIGNMENTS,
      "Assignments",
      [
        { type: "string", key: "ownerId", required: true },
        { type: "string", key: "carId", required: true },
        { type: "string", key: "driverProfileId", required: true },
        // Boolean not handled in helper; use integer 0/1 for active
        { type: "integer", key: "active", defaultValue: 1 },
        { type: "datetime", key: "ts" },
        { type: "datetime", key: "endedAt" },
      ]
    );
  }

  if (process.env.VITE_APPWRITE_COL_DRIVER_RECORDS) {
    await createCollectionWithAttributes(
      process.env.VITE_APPWRITE_COL_DRIVER_RECORDS,
      "DriverRecords",
      [
        { type: "string", key: "driverProfileId", required: true },
        { type: "string", key: "type" },
        { type: "string", key: "level" },
        { type: "string", key: "title" },
        { type: "string", key: "description" },
        { type: "datetime", key: "ts" },
      ]
    );
  }

  console.log("🎉 Setup complete.");
}

setup().catch((err) => console.error("Fatal error:", err));
