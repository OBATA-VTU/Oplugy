import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * Firebase configuration for Oplug VTU.
 * NOTE: For full white-label branding (removing 'firebaseapp.com' from Google Sign-in popup),
 * ensure you have added a custom domain in Firebase Console > Authentication > Settings > Domains.
 */
const firebaseConfig = {
  apiKey: "AIzaSyCOwIzX-RNNwmSfMWjqk3dfFHE6W7JFOIs",
  authDomain: "oplug-vtu.firebaseapp.com", // Replace with your custom domain (e.g., auth.oplug.com) for full branding
  projectId: "oplug-vtu",
  storageBucket: "oplug-vtu.firebasestorage.app",
  messagingSenderId: "102679462559",
  appId: "1:102679462559:web:ca920378d7d8b1bce818aa",
  measurementId: "G-CXLSFMJDNM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Oplug Auth and Database services
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;