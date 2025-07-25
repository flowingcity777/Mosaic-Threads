// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";       // Add auth
import { getFirestore } from "firebase/firestore"; // Add Firestore

const firebaseConfig = {
  apiKey: "AIzaSyA_XylzaQEgeZ-b6GIj6wxAvevSsKkCidA",
  authDomain: "mosaic-threads.firebaseapp.com",
  projectId: "mosaic-threads",
  storageBucket: "mosaic-threads.firebasestorage.app",
  messagingSenderId: "159260952017",
  appId: "1:159260952017:web:59036c3216f883e37d0cf0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);          // Export auth
export const db = getFirestore(app);       // Export Firestore
