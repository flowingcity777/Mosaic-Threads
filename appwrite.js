import { Storage } from "appwrite";

const storage = new Storage(client); // Initialize with your `client`

// Upload a user's pattern image
async function uploadPatternFile(file) {
  try {
    const response = await storage.createFile(
      'pattern_uploads', // Bucket ID
      'unique()',        // Auto-generate file ID
      file               // HTML file input (e.g., from <input type="file">)
    );
    console.log("Uploaded!", response.$id);
  } catch (error) {
    console.error("Upload failed:", error);
  }
}
