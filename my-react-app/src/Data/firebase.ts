// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import firebase from 'firebase/app';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "better-trello-883c0.firebaseapp.com",
  projectId: "better-trello-883c0",
  storageBucket: "better-trello-883c0.firebasestorage.app",
  messagingSenderId: "639595162514",
  appId: "1:639595162514:web:625a22d33e70ed3a46af4b",
  measurementId: "G-5P3724R26Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

const db = getFirestore(app);

export { db, collection, getDocs, addDoc, auth, onAuthStateChanged};
