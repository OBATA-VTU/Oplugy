
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
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';

const generateReferralCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const authService = {
  async login(email: string, password: string): Promise<ApiResponse<any>> {
    try {
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (!userData.referralCode || userData.referralCode.length > 8) {
          const newCode = generateReferralCode();
          await updateDoc(userDocRef, { referralCode: newCode });
          userData.referralCode = newCode;
        }

        return { 
          status: true, 
          data: { user: { ...userData, id: user.uid }, token: await user.getIdToken() },
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
      const userCredential = await signInWithPopup(provider);
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
          status: 'active',
          referralCode: generateReferralCode(),
          referralEarnings: 0,
          referralCount: 0,
          isPinSet: false,
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
      return { status: false, message: 'Auth interrupted.' };
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
        status: 'active',
        referralCode: generateReferralCode(),
        referralEarnings: 0,
        referralCount: 0,
        isPinSet: false,
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, "users", user.uid), userData);
      return { status: true, message: 'Account created!' };
    } catch (error: any) {
      return { status: false, message: error.message };
    }
  },

  async setTransactionPin(userId: string, pin: string): Promise<ApiResponse<void>> {
    try {
      await updateDoc(doc(db, "users", userId), {
        transactionPin: pin, // In production, hash this PIN
        isPinSet: true
      });
      return { status: true, message: "Transaction PIN configured." };
    } catch (error: any) {
      return { status: false, message: error.message };
    }
  },

  async logout(): Promise<void> {
    await signOut(auth);
  }
};
