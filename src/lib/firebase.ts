import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// Bridge to .env.local to ensure keys aren't leaked on GitHub
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
// The getApps() check is required for Next.js 15+ to prevent re-initialization crashes
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize the specific services needed for PawSOS
const auth = getAuth(app); // For Day 2: Signup/Login
const db = getFirestore(app); // For Day 3: Projects & Links

export { auth, db };