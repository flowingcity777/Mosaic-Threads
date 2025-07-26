// After uploading, save file info to a "patterns" collection
await databases.createDocument('patterns', 'unique()', {
  userId: 'USER_ID',
  fileId: response.$id,  // From storage.createFile()
  title: 'Cable Knit Sweater',
  colors: ['#FF0000', '#00FF00']
});
