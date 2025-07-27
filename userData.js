// userData.js
import { storage, databases } from './appwrite.js';

const BUCKET_ID = 'YOUR_BUCKET_ID'; // Create in Appwrite Storage
const DATABASE_ID = 'YOUR_DATABASE_ID';
const PATTERNS_COLLECTION_ID = 'patterns';

// Upload pattern image to Appwrite Storage
export async function uploadPatternFile(dataUrl) {
  const blob = await fetch(dataUrl).then(res => res.blob());
  const file = new File([blob], `pattern-${Date.now()}.png`, { type: 'image/png' });

  const response = await storage.createFile(
    BUCKET_ID,
    'unique()', // Auto-generate file ID
    file
  );

  return response.$id; // Return the file ID
}

// Link pattern to user in Appwrite Database
export async function linkPatternToUser(userId, fileId) {
  await databases.createDocument(
    DATABASE_ID,
    PATTERNS_COLLECTION_ID,
    'unique()', // Auto-generate document ID
    {
      userId,
      fileId,
      createdAt: new Date().toISOString()
    }
  );
}
