import { databases } from './appwrite.js';

export async function linkPatternToUser(userId, fileId, title, colors) {
  try {
    await databases.createDocument('patterns', 'unique()', {
      userId,
      fileId,
      title,
      colors
    });
    console.log("Pattern linked to user!");
  } catch (error) {
    console.error("Linking failed:", error);
  }
}
