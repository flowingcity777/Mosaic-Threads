// appwrite.js
import { Client, Account, Databases, Storage } from "appwrite";

// 1. Initialize Client
const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('mosaic-threads-app'); // ← Replace with your ID!

// 2. Export Core Services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// 3. Export Frequently Used Functions (Optional)
export async function uploadPatternFile(file, bucketId = 'pattern_uploads') {
  try {
    const response = await storage.createFile(
      bucketId,
      'unique()',
      file
    );
    return response.$id; // Return file ID for linking to user data
  } catch (error) {
    console.error("Upload failed:", error);
    throw error; // Re-throw for handling in UI
  }
}
