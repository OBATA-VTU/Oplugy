
import { db } from '../firebase/config';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  getDoc, 
  query, 
  increment
} from 'firebase/firestore';
import { ApiResponse, User, UserRole, UserStatus } from '../types';

export const adminService = {
  // --- User Management ---
  async getAllUsers(): Promise<ApiResponse<User[]>> {
    try {
      // Simplified query: Removing orderBy to prevent failures if fields are missing or indexes are not set
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
