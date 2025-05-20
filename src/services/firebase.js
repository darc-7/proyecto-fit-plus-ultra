// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAq6MiZIIoLM6fa3X9zadZtJnK833n1_U4",
  authDomain: "proyecto-fit-plus-ultra.firebaseapp.com",
  projectId: "proyecto-fit-plus-ultra",
  storageBucket: "proyecto-fit-plus-ultra.firebasestorage.app",
  messagingSenderId: "344980451875",
  appId: "1:344980451875:web:b8a6faddc1fada32fab796"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);