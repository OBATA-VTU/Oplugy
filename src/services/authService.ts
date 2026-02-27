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
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  increment
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
        return { 
          status: true, 
          data: { user: { ...userData, id: user.uid }, token: await user.getIdToken() },
          message: 'Welcome back!' 
        };
      }
      
      return { status: true, data: { user, token: await user.getIdToken() } };
    } catch (error: any) {
      return { status: false, message: 'Invalid email or password.' };
    }
  },

  async loginWithGoogle(): Promise<ApiResponse<any>> {
    try {
      await setPersistence(auth, browserLocalPersistence);
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      let userData;

      if (!userDoc.exists()) {
        userData = {
          id: user.uid,
          email: user.email,
          username: (user.email?.split('@')[0] || 'user') + Math.floor(Math.random() * 1000),
          fullName: user.displayName || 'User',
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
        message: 'Successfully signed in' 
      };
    } catch (error: any) {
      return { status: false, message: 'Login was interrupted.' };
    }
  },

  async signup(payload: { email: string, password: string, username: string, referralCode?: string, phone: string }): Promise<ApiResponse<any>> {
    try {
      const { email, password, username, referralCode, phone } = payload;
      
      // Strict check for unique username
      const usernameLower = username.toLowerCase().trim();
      const q = query(collection(db, "users"), where("username", "==", usernameLower));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return { status: false, message: "This username is already taken. Please pick another one." };
      }

      // Check for unique phone number
      const phoneQ = query(collection(db, "users"), where("phone", "==", phone.trim()));
      const phoneSnap = await getDocs(phoneQ);
      if (!phoneSnap.empty) {
        return { status: false, message: "This phone number is already registered." };
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: usernameLower });

      let referredBy = null;
      if (referralCode) {
        const refQ = query(collection(db, "users"), where("referralCode", "==", referralCode.toUpperCase().trim()));
        const refSnap = await getDocs(refQ);
        if (!refSnap.empty) {
          referredBy = refSnap.docs[0].id;
          await updateDoc(doc(db, "users", referredBy), {
            referralCount: increment(1)
          });
        }
      }

      const userData = {
        id: user.uid,
        email,
        fullName: usernameLower, // We use username as the display name now
        username: usernameLower,
        phone: phone.trim(),
        walletBalance: 0,
        role: 'user',
        status: 'active',
        referralCode: generateReferralCode(),
        referralEarnings: 0,
        referralCount: 0,
        referredBy,
        isPinSet: false,
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, "users", user.uid), userData);
      return { status: true, message: 'Account created successfully!' };
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        return { status: false, message: "This email is already registered." };
      }
      return { status: false, message: error.message };
    }
  },

  async setTransactionPin(userId: string, pin: string): Promise<ApiResponse<void>> {
    try {
      await updateDoc(doc(db, "users", userId), {
        transactionPin: pin,
        isPinSet: true
      });
      return { status: true, message: "PIN saved successfully." };
    } catch (error: any) {
      return { status: false, message: error.message };
    }
  },

  async logout(): Promise<void> {
    await signOut(auth);
  }
};