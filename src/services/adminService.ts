
import { db } from '../firebase/config';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  getDoc, 
  query, 
  increment,
  limit,
  orderBy,
  setDoc
} from 'firebase/firestore';
import { ApiResponse, User, UserRole, UserStatus, TransactionResponse } from '../types';

export const adminService = {
  // --- User Management ---
  async getAllUsers(): Promise<ApiResponse<User[]>> {
    try {
      const usersQuery = query(collection(db, "users"));
      const snapshot = await getDocs(usersQuery);
      
      if (snapshot.empty) {
        return { status: true, data: [], message: "No users found in the repository." };
      }

      const users = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User));
      return { status: true, data: users };
    } catch (error: any) {
      console.error("Firestore Admin Error:", error);
      return { 
        status: false, 
        message: error.code === 'permission-denied' 
          ? "Access Denied: You do not have sufficient administrative privileges." 
          : error.message || "Failed to fetch users" 
      };
    }
  },

  async updateUserRole(userId: string, newRole: UserRole): Promise<ApiResponse<void>> {
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      return { status: true, message: `Account tier updated to ${newRole.toUpperCase()}` };
    } catch (error: any) {
      return { status: false, message: error.message || "Failed to update role" };
    }
  },

  async updateUserStatus(userId: string, status: UserStatus): Promise<ApiResponse<void>> {
    try {
      await updateDoc(doc(db, "users", userId), { status: status });
      return { status: true, message: `Account status set to ${status.toUpperCase()}` };
    } catch (error: any) {
      return { status: false, message: error.message || "Failed to update status" };
    }
  },

  // --- Financial Control ---
  async creditUser(userId: string, amount: number): Promise<ApiResponse<void>> {
    try {
      if (amount <= 0) throw new Error("Amount must be greater than zero");
      await updateDoc(doc(db, "users", userId), {
        walletBalance: increment(amount)
      });
      return { status: true, message: `Successfully credited account with ₦${amount.toLocaleString()}` };
    } catch (error: any) {
      return { status: false, message: error.message || "Failed to credit user" };
    }
  },

  async debitUser(userId: string, amount: number): Promise<ApiResponse<void>> {
    try {
      if (amount <= 0) throw new Error("Amount must be greater than zero");
      
      const userDoc = await getDoc(doc(db, "users", userId));
      const currentBalance = userDoc.data()?.walletBalance || 0;
      
      if (currentBalance < amount) {
        throw new Error("Action Aborted: Insufficient user balance.");
      }

      await updateDoc(doc(db, "users", userId), {
        walletBalance: increment(-amount)
      });
      return { status: true, message: `Successfully debited account with ₦${amount.toLocaleString()}` };
    } catch (error: any) {
      return { status: false, message: error.message || "Failed to debit user" };
    }
  },

  // --- Transaction Ledger ---
  async getSystemTransactions(): Promise<ApiResponse<TransactionResponse[]>> {
    try {
      const txQuery = query(collection(db, "transactions"), orderBy("date_created", "desc"), limit(100));
      const snapshot = await getDocs(txQuery);
      const txs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as TransactionResponse));
      return { status: true, data: txs };
    } catch (error: any) {
      return { status: false, message: error.message || "Failed to fetch ledger" };
    }
  },

  // --- Global Settings ---
  async getGlobalSettings(): Promise<ApiResponse<any>> {
    try {
      const settingsDoc = await getDoc(doc(db, "settings", "global"));
      return { status: true, data: settingsDoc.exists() ? settingsDoc.data() : { announcement: '', maintenance: false } };
    } catch (error: any) {
      return { status: false, message: "Failed to fetch settings" };
    }
  },

  async updateGlobalSettings(settings: any): Promise<ApiResponse<void>> {
    try {
      await setDoc(doc(db, "settings", "global"), settings, { merge: true });
      return { status: true, message: "System settings updated." };
    } catch (error: any) {
      return { status: false, message: "Failed to update settings" };
    }
  },

  // --- Statistics ---
  async getSystemStats(): Promise<ApiResponse<any>> {
    try {
      const snapshot = await getDocs(collection(db, "users"));
      let totalBalance = 0;
      let totalUsers = snapshot.size;
      let resellers = 0;
      let admins = 0;

      snapshot.forEach(doc => {
        const data = doc.data();
        totalBalance += data.walletBalance || 0;
        if (data.role === 'reseller') resellers++;
        if (data.role === 'admin') admins++;
      });

      return {
        status: true,
        data: {
          totalUsers,
          totalBalance,
          resellers,
          admins
        }
      };
    } catch (error: any) {
      return { status: false, message: error.message || "Failed to calculate system statistics" };
    }
  }
};
