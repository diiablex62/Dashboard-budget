import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Configuration Firebase de votre projet
const firebaseConfig = {
  apiKey: "AIzaSyA1fdAkRAEPw0jDmqfomgMc-iAJsPkozPs",
  authDomain: "budget-e4f90.firebaseapp.com",
  projectId: "budget-e4f90",
  storageBucket: "budget-e4f90.firebasestorage.app",
  messagingSenderId: "240109684689",
  appId: "1:240109684689:web:5795566dd3370d0af682f0",
  measurementId: "G-LGK99M7EMR",
};

// Initialisez Firebase
const app = initializeApp(firebaseConfig);

// Initialisez les services Firebase nécessaires
const db = getFirestore(app); // Firestore pour la base de données
const auth = getAuth(app); // Authentification
const googleProvider = new GoogleAuthProvider(); // Fournisseur Google pour l'authentification

export { db, auth, googleProvider, signInWithPopup, firebaseConfig };
