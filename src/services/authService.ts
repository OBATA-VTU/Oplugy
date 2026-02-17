
import { ApiResponse } from '../types';
import { auth, db } from '../firebase/config';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence
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
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (userDoc.exists()) {
        return { 
          status: true, 
          data: { user: { ...userDoc.data(), id: user.uid }, token: await user.getIdToken() },
          message: 'Welcome back to OBATA v2!' 
        };
      }
      
      return { status: true, data: { user, token: await user.getIdToken() } };
    } catch (error: any) {
      console.error("Login Error:", error.code);
      return { status: false, message: 'Invalid email or password. Please try again.' };
    }
  },

  async loginWithGoogle(): Promise<ApiResponse<any>> {
    try {
      await setPersistence(auth, browserLocalPersistence);
      
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ 
        prompt: 'select_account',
        display: 'popup'
      });
      
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      let userData;

      if (!userDoc.exists()) {
        userData = {
          id: user.uid,
          email: user.email,
          fullName: user.displayName || 'OBATA User',
          walletBalance: 0,
          role: 'user',
          createdAt: serverTimestamp()
        };
        await setDoc(userDocRef, userData);
      } else {
        userData = userDoc.data();
      }

      return { 
        status: true, 
        data: { user: { ...userData, id: user.uid }, token: await user.getIdToken() },
        message: 'Successfully signed in to OBATA v2' 
      };
    } catch (error: any) {
      console.error("Google Auth Error Code:", error.code);
      
      let friendlyMessage = 'Google sign-in was interrupted. Please try again.';
      
      if (error.code === 'auth/popup-closed-by-user') {
        friendlyMessage = 'Sign-in window was closed before completion.';
      } else if (error.code === 'auth/internal-error' || error.message.includes('initial state')) {
        friendlyMessage = 'Authentication error. Please ensure cookies are enabled in your browser or try another browser.';
      } else if (error.code === 'auth/network-request-failed') {
        friendlyMessage = 'Network error. Please check your internet connection.';
      }

      return { status: false, message: friendlyMessage };
    }
  },

  async signup(payload: { email: string, password: string, fullName?: string }): Promise<ApiResponse<any>> {
    try {
      const { email, password, fullName } = payload;
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (fullName) {
        await updateProfile(user, { displayName: fullName });
      }

      const userData = {
        id: user.uid,
        email: email,
        fullName: fullName || 'New OBATA User',
        walletBalance: 0,
        role: 'user',
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, "users", user.uid), userData);

      return { status: true, message: 'Your OBATA account has been created!' };
    } catch (error: any) {
      console.error("Signup Error:", error.code);
      let msg = 'Registration failed. This email might already be in use.';
      if (error.code === 'auth/weak-password') msg = 'Password is too weak. Use at least 6 characters.';
      return { status: false, message: msg };
    }
  },

  async logout(): Promise<void> {
    await signOut(auth);
  },

  async getProfile(uid: string): Promise<any> {
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.exists() ? userDoc.data() : null;
  }
};
