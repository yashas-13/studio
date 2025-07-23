// This file is machine-generated - edit at your own risk.
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, doc, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBLtMzqEa_y81OJNCRbnxNPems9NLMxRgI",
  authDomain: "supplysync-m929o.firebaseapp.com",
  projectId: "supplysync-m929o",
  storageBucket: "supplysync-m929o.appspot.com",
  messagingSenderId: "242460684670",
  appId: "1:242460684670:web:efbbdc69e9266a2a98832f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc, onSnapshot, doc, deleteDoc };
