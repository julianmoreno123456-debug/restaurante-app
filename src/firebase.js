import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCXkjYvQSHfIPdEq0mxjbRiJ-yqmbU3sRs",
  authDomain: "restaurante-app-58794.firebaseapp.com",
  projectId: "restaurante-app-58794",
  storageBucket: "restaurante-app-58794.firebasestorage.app",
  messagingSenderId: "939055260425",
  appId: "1:939055260425:web:8a101ff620ef014737e9d8",
  measurementId: "G-WWZJSSKVCE"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);