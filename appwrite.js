// appwrite.js
import { Client, Account, Storage, Databases } from 'appwrite';

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1') // Your Appwrite endpoint
  .setProject('YOUR_PROJECT_ID'); // Replace with your Project ID

const account = new Account(client);
const storage = new Storage(client);
const databases = new Databases(client);

export { account, storage, databases };
