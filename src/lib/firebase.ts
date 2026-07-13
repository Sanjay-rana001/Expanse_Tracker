import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAC2nnZMS-zKqbPE32298L--qRDz-sMHP4",
  authDomain: "expanse-tracker-b0e66.firebaseapp.com",
  projectId: "expanse-tracker-b0e66",
  storageBucket: "expanse-tracker-b0e66.firebasestorage.app",
  messagingSenderId: "1015331060706",
  appId: "1:1015331060706:web:d5f5f284e040e1cbbed7bb",
  measurementId: "G-80CW9F793R"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;
