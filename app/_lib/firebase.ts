import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAItfRy15RRV2FQezT36S8qM_O-UnvK7Lo",
  authDomain: "monopolywebgame.firebaseapp.com",
  projectId: "monopolywebgame",
  storageBucket: "monopolywebgame.firebasestorage.app",
  databaseURL: "https://monopolywebgame-default-rtdb.europe-west1.firebasedatabase.app",
  messagingSenderId: "209693199500",
  appId: "1:209693199500:web:5fdee3c9bec72b3afabfa9",
  measurementId: "G-PEE18SJ7RQ"
};

// ✅ Prevent re-initialization (important for Next.js / Fast Refresh)
export const app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
// export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
