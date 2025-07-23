// This file is machine-generated - edit at your own risk.
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, doc, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "TODO",
  authDomain: "TODO",
  projectId: "TODO",
  storageBucket: "TODO",
  messagingSenderId: "TODO",
  appId: "TODO"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc, onSnapshot, doc, deleteDoc };
