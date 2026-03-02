/**
 * Oplug API Service (v2.1.0)
 * Handles balance checks, data plans, and purchase fulfillment.
 */
const OPLUG_API_URL = "https://oplug.vercel.app/api/v1"; 
const OPLUG_API_KEY = process.env.OPLUG_API_KEY; // Set this in your Vercel Env Vars

export const oplugService = {
  // Check if user exists and get balance
  async lookupUser(phoneNumber) {
    try {
      const response = await fetch(`${OPLUG_API_URL}/user/balance`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${OPLUG_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) return { exists: false };
      const data = await response.json();
      if (data.status === "success") {
        return { exists: true, name: "User", balance: data.balance };
      }
      return { exists: false };
    } catch (error) {
      return { exists: false };
    }
  },

  // Available Data Plans (IDs match your /purchase endpoint)
  async getDataPlans(network) {
    const plans = {
      "MTN": [{ id: "1001", label: "500MB - ₦150" }, { id: "1002", label: "1GB - ₦250" }, { id: "1003", label: "2GB - ₦500" }],
      "Airtel": [{ id: "2001", label: "750MB - ₦200" }, { id: "2002", label: "1.5GB - ₦300" }],
      "Glo": [{ id: "3001", label: "1GB - ₦200" }, { id: "3002", label: "2GB - ₦400" }],
      "9mobile": [{ id: "4001", label: "1GB - ₦300" }]
    };
    return plans[network] || [];
  },

  // Process Airtime or Data Purchase
  async processOrder(type, details) {
    try {
      const response = await fetch(`${OPLUG_API_URL}/purchase`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPLUG_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: type, // 'data' or 'airtime'
          network: details.network,
          plan_id: details.plan_id, // For data
          amount: details.amount,   // For airtime
          phone: details.phone
        })
      });
      const data = await response.json();
      return { 
        success: data.status === "success", 
        orderId: data.transaction_id, 
        message: data.message 
      };
    } catch (error) {
      return { success: false, error: "Connection to Oplug failed" };
    }
  },

  // Generate Paystack Transfer details for Guest Users
  async generatePaymentDetails(details) {
    try {
      const response = await fetch(`${OPLUG_API_URL}/payment/generate-transfer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPLUG_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(details)
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      return null;
    }
  }
};