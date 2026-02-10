
import { ApiResponse } from '../types';
import { auth, db } from '../firebase/config';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';

export const authService = {
  async login(email: string, password: string): Promise<ApiResponse<any>> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Fetch extra profile data from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (userDoc.exists()) {
        return { 
          status: true, 
          data: { user: { ...userDoc.data(), id: user.uid }, token: await user.getIdToken() },
          message: 'Login successful' 
        };
      }
      
      return { status: true, data: { user, token: await user.getIdToken() } };
    } catch (error: any) {
      console.error("Login Error:", error);
      return { status: false, message: error.message || 'Login failed' };
    }
  },

  async signup(payload: { email: string, password: string, fullName?: string }): Promise<ApiResponse<any>> {
    try {
      const { email, password, fullName } = payload;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (fullName) {
        await updateProfile(user, { displayName: fullName });
      }

      // Create user profile in Firestore with initial balance
      const userData = {
        id: user.uid,
        email: email,
        fullName: fullName || 'New User',
        walletBalance: 0, // Initial balance
        role: 'user',
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, "users", user.uid), userData);

      return { status: true, message: 'Account created successfully!' };
    } catch (error: any) {
      console.error("Signup Error:", error);
      return { status: false, message: error.message || 'Registration failed' };
    }
  },

  async logout(): Promise<void> {
    await signOut(auth);
  },

  // Helper to get current Firestore user data
  async getProfile(uid: string): Promise<any> {
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.exists() ? userDoc.data() : null;
  }
};
