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
      // Ensure persistence is set to local before signing in
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
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

  async loginWithGoogle(): Promise<ApiResponse<any>> {
    try {
      // Setting persistence explicitly can help with the 'missing initial state' error
      await setPersistence(auth, browserLocalPersistence);
      
      const provider = new GoogleAuthProvider();
      // Forces the account picker to show up every time and improves flow reliability
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      let userData;

      if (!userDoc.exists()) {
        userData = {
          id: user.uid,
          email: user.email,
          fullName: user.displayName || 'Google User',
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
        message: 'Google login successful' 
      };
    } catch (error: any) {
      console.error("Google Login Error:", error);
      // Informative error message for the specific browser storage issue
      const msg = error.code === 'auth/internal-error' || error.message.includes('sessionStorage')
        ? "Please check your browser settings. Third-party cookies or storage might be blocked."
        : error.message || 'Google login failed';
      return { status: false, message: msg };
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
        fullName: fullName || 'New User',
        walletBalance: 0,
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

  async getProfile(uid: string): Promise<any> {
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.exists() ? userDoc.data() : null;
  }
};