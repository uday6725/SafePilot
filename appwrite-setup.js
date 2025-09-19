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

  // Collections

  await createCollectionWithAttributes(
    process.env.VITE_APPWRITE_COL_ALERTS,
    "Alerts",
    [
      { type: "string", key: "level", required: true },
      { type: "string", key: "title", required: true },
      { type: "string", key: "description" },
      { type: "datetime", key: "datetime", required: true },
    ]
  );

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
    ]
  );

  await createCollectionWithAttributes(
    process.env.VITE_APPWRITE_COL_LOCATIONS,
    "Locations",
    [
      { type: "float", key: "lat", required: true },
      { type: "float", key: "lng", required: true },
      { type: "datetime", key: "datetime", required: true },
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

  console.log("🎉 Setup complete.");
}

setup().catch((err) => console.error("Fatal error:", err));
