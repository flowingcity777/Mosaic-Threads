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
    return true; // Success flag
  } catch (error) {
    const message = error.code === 409 
      ? "This pattern already exists in your library!"
      : `Failed to save pattern: ${error.message}`;
    alert(message);
    return false; // Failure flag
  }
}
