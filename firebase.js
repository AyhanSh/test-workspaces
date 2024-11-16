// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB_2mGr6eO0ah1SaHOFxt9eAKJLGD9p5dE",
  authDomain: "test-workspaceschat.firebaseapp.com",
  projectId: "test-workspaceschat",
  storageBucket: "test-workspaceschat.firebasestorage.app",
  messagingSenderId: "1071280179668",
  appId: "1:1071280179668:web:9b7e32f6c74be255666e41",
  measurementId: "G-PJRLD0L4PC"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();