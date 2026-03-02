import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
  });
}
const db = admin.firestore();

export const oplugService = {
  // ... (lookupUser and getDataPlans remain the same)

  /**
   * REAL PAYSTACK INTEGRATION
   * Generates a dynamic bank account for guest users
   */
  async generatePaymentDetails(details) {
    try {
      const response = await fetch("https://api.paystack.co/transaction/initialize", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: `guest_${details.phone}@oplug.com`, // Placeholder email for guest
          amount: details.amount * 100, // Paystack uses Kobo (Naira * 100)
          channels: ['bank_transfer'],
          metadata: {
            phone: details.phone,
            plan_id: details.plan_id,
            type: 'whatsapp_guest_purchase'
          }
        })
      });

      const data = await response.json();
      
      if (data.status && data.data.display_text) {
        // This returns the bank details provided by Paystack
        return {
          amount: details.amount,
          bank: data.data.bank_transfer_details?.bank_name || "Paystack Checkout",
          account: data.data.bank_transfer_details?.account_number || "See Link",
          url: data.data.authorization_url
        };
      }
      return null;
    } catch (error) {
      console.error("Paystack Error:", error);
      return null;
    }
  },

  async processOrder(type, details, user) {
    // ... (Your existing order logic)
    return { success: true, orderId: "OPL-" + Math.random().toString(36).toUpperCase().substring(2, 10) };
  }
};