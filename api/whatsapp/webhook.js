import { oplugService } from '../../services/oplugService';

const sessions = new Map();

export default async function handler(req, res) {
  // ... (Verification GET logic remains the same)

  if (req.method === 'POST') {
    try {
      const body = req.body;
      const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
      if (!message) return res.status(200).send('OK');

      const from = message.from;
      const text = message.text?.body?.trim() || "";
      const session = sessions.get(from) || { state: 'IDLE', data: {} };
      const user = await oplugService.lookupUser(from);

      // --- FIX FOR "UNDEFINED" ERROR ---
      if (session.state === 'AWAITING_DATA_PLAN') {
        const plans = await oplugService.getDataPlans(session.data.network);
        const choice = parseInt(text);
        
        if (choice >= 1 && choice <= plans[session.data.network].length) {
          const plan = plans[session.data.network][choice-1];
          
          if (user.exists) {
            const result = await oplugService.processOrder('data', { ...session.data, plan_id: plan.id, provider: plan.provider }, user);
            await sendWhatsAppMessage(from, result.success ? `✅ Success! ID: ${result.orderId}` : `❌ Error: ${result.message}`);
          } else {
            // GUEST FLOW
            const pay = await oplugService.generatePaymentDetails({ ...session.data, amount: plan.price });
            
            // THE FIX: Check if 'pay' exists before using it
            if (pay && pay.account) {
              await sendWhatsAppMessage(from, `💳 Pay ₦${pay.amount} to:\nBank: ${pay.bank}\nAcc: ${pay.account}`);
            } else {
              await sendWhatsAppMessage(from, "❌ Sorry, I couldn't generate a payment account right now. Please try again later.");
            }
          }
          session.state = 'IDLE';
        }
      }
      // ... (Rest of the logic)
      
      sessions.set(from, session);
      return res.status(200).send('EVENT_RECEIVED');
    } catch (err) {
      console.error("CRITICAL ERROR:", err);
      return res.status(200).send('ERROR_HANDLED'); // Don't let Meta retry failed requests
    }
  }
}