
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCOwIzX-RNNwmSfMWjqk3dfFHE6W7JFOIs",
  authDomain: "oplug-vtu.firebaseapp.com",
  projectId: "oplug-vtu",
  storageBucket: "oplug-vtu.firebasestorage.app",
  messagingSenderId: "102679462559",
  appId: "1:102679462559:web:ca920378d7d8b1bce818aa",
  measurementId: "G-CXLSFMJDNM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
