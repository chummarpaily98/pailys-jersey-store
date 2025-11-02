// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBeuH9vXd0vlFHVs-2FWqrofhbTAjHZ7Yc",
  authDomain: "pailys-jersey-store.firebaseapp.com",
  projectId: "pailys-jersey-store",
  storageBucket: "pailys-jersey-store.firebasestorage.app",
  messagingSenderId: "1046315369641",
  appId: "1:1046315369641:web:92bfbf8f45c8ac13d295b8"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore (database) and Storage (images)
export const db = getFirestore(app);
export const storage = getStorage(app);
