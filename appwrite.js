import { Client, Account, Databases, Storage } from "appwrite";

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('mosaic-threads-app');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export async function uploadPatternFile(file, bucketId = 'pattern_uploads') {
  try {
    const response = await storage.createFile(bucketId, 'unique()', file);
    return response.$id;
  } catch (error) {
    // User-friendly alerts + re-throw for UI handling
    const message = error.message.includes('permission') 
      ? "You don’t have upload permissions. Please log in."
      : `Upload failed: ${error.message}`;
    alert(message); // Or toast.error(message) if using React
    throw error; 
  }
}
