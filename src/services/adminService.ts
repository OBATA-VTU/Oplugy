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
  setDoc,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { cipApiClient } from './cipApiClient';
import { ApiResponse, User, UserRole, UserStatus, TransactionResponse } from '../types';

export const adminService = {
  // --- User Management ---
  async getAllUsers(): Promise<ApiResponse<User[]>> {
    try {
      const usersQuery = query(collection(db, "users"));
      const snapshot = await getDocs(usersQuery);
      const users = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User));
      return { status: true, data: users };
    } catch (error: any) {
      return { status: false, message: "Failed to fetch users" };
    }
  },

  async updateUserRole(userId: string, newRole: UserRole): Promise<ApiResponse<void>> {
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      return { status: true, message: `Account tier updated to ${newRole.toUpperCase()}` };
    } catch (error: any) {
      return { status: false, message: "Failed to update role" };
    }
  },

  async updateUserStatus(userId: string, status: UserStatus): Promise<ApiResponse<void>> {
    try {
      await updateDoc(doc(db, "users", userId), { status: status });
      return { status: true, message: `Account status set to ${status.toUpperCase()}` };
    } catch (error: any) {
      return { status: false, message: "Failed to update status" };
    }
  },

  // --- Financial Control ---
  async creditUser(userId: string, amount: number): Promise<ApiResponse<void>> {
    try {
      await updateDoc(doc(db, "users", userId), { walletBalance: increment(amount) });
      return { status: true, message: `Successfully credited ₦${amount.toLocaleString()}` };
    } catch (error: any) {
      return { status: false, message: "Failed to credit user" };
    }
  },

  async debitUser(userId: string, amount: number): Promise<ApiResponse<void>> {
    try {
      await updateDoc(doc(db, "users", userId), { walletBalance: increment(-amount) });
      return { status: true, message: `Successfully debited ₦${amount.toLocaleString()}` };
    } catch (error: any) {
      return { status: false, message: "Failed to debit user" };
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
      return { status: false, message: "Failed to fetch ledger" };
    }
  },

  // --- Dual Provider Stats ---
  async getProviderBalances(): Promise<{ srv1: number; srv2: number }> {
    try {
      const [res1, res2] = await Promise.all([
        cipApiClient<any>('balance', { data: { server: 'server1' }, method: 'GET' }),
        cipApiClient<any>('user/balance', { data: { server: 'server2' }, method: 'GET' })
      ]);
      
      return {
        srv1: res1.status ? Number(res1.data?.funds || 0) : 0,
        srv2: res2.status ? Number(res2.data?.balance || 0) / 100 : 0
      };
    } catch (error) {
      return { srv1: 0, srv2: 0 };
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
          totalUsers: snapshot.size,
          totalBalance,
          resellers,
          admins
        }
      };
    } catch (error: any) {
      return { status: false, message: "Stats failure" };
    }
  },

  // --- Funding Requests ---
  async getFundingRequests(): Promise<ApiResponse<any[]>> {
    try {
      const q = query(collection(db, "funding_requests"), orderBy("date_created", "desc"), limit(50));
      const snapshot = await getDocs(q);
      const requests = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      return { status: true, data: requests };
    } catch (error: any) {
      return { status: false, message: "Failed to fetch funding requests" };
    }
  },

  async updateFundingRequestStatus(requestId: string, status: 'APPROVED' | 'REJECTED'): Promise<ApiResponse<void>> {
    try {
      const requestRef = doc(db, "funding_requests", requestId);
      const requestSnap = await getDoc(requestRef);
      
      if (!requestSnap.exists()) return { status: false, message: "Request not found" };
      
      const requestData = requestSnap.data();
      if (requestData.status !== 'PENDING') return { status: false, message: "Request already processed" };

      if (status === 'APPROVED') {
        // Credit user
        await updateDoc(doc(db, "users", requestData.userId), { 
          walletBalance: increment(requestData.amount) 
        });
        
        // Log transaction
        await addDoc(collection(db, "transactions"), {
          userId: requestData.userId,
          userEmail: requestData.userEmail,
          type: 'FUNDING',
          amount: requestData.amount,
          source: 'Manual Transfer',
          remarks: 'Manual funding approved by admin',
          status: 'SUCCESS',
          server: 'Admin Panel',
          date_created: serverTimestamp(),
          date_updated: serverTimestamp()
        });
      }

      await updateDoc(requestRef, { 
        status,
        date_updated: serverTimestamp()
      });

      return { status: true, message: `Request ${status.toLowerCase()} successfully` };
    } catch (error: any) {
      console.error("Funding update error:", error);
      return { status: false, message: "Failed to update request" };
    }
  }
};
