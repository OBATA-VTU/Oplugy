import { oplugService } from '../../services/oplugService';

const sessions = new Map();

export default async function handler(req, res) {
  // Webhook Verification
  if (req.method === 'GET') {
    const token = req.query['hub.verify_token'];
    if (token === process.env.WHATSAPP_VERIFY_TOKEN) return res.status(200).send(req.query['hub.challenge']);
    return res.status(403).send('Forbidden');
  }

  if (req.method === 'POST') {
    try {
      const body = req.body;
      const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
      if (!message) return res.status(200).send('OK');

      const from = message.from;
      const text = message.text?.body?.trim() || message.interactive?.button_reply?.title || "";
      
      // Get Session
      if (!sessions.has(from)) sessions.set(from, { state: 'IDLE', data: {} });
      const session = sessions.get(from);
      
      // Lookup User in Firestore
      const user = await oplugService.lookupUser(from);

      // --- LOGIC ---
      if (['hi', 'hello', 'menu'].includes(text.toLowerCase())) {
        session.state = 'IDLE';
        const msg = user.exists 
          ? `🌟 *Welcome back, ${user.name}!* \nBalance: *₦${user.balance}*` 
          : `🔌 *Welcome to Oplug!* \nBuy airtime & data instantly.`;
        await sendWhatsAppButtons(from, msg);
      } 
      
      else if (message.type === 'interactive') {
        const buttonId = message.interactive.button_reply?.id;
        if (buttonId === 'buy_airtime') {
          session.state = 'AWAITING_AIRTIME_NETWORK';
          await sendWhatsAppMessage(from, "Select Network:\n1. MTN\n2. Airtel\n3. Glo\n4. 9mobile");
        } else if (buttonId === 'buy_data') {
          session.state = 'AWAITING_DATA_NETWORK';
          await sendWhatsAppMessage(from, "Select Network:\n1. MTN\n2. Airtel\n3. Glo\n4. 9mobile");
        }
      }

      // Handle Data Plan Selection
      else if (session.state === 'AWAITING_DATA_PLAN') {
        const plans = await oplugService.getDataPlans(session.data.network);
        const choice = parseInt(text);
        if (choice > 0 && choice <= plans.length) {
          const plan = plans[choice-1];
          if (user.exists) {
            await sendWhatsAppMessage(from, `⏳ Processing ${plan.label}...`);
            const res = await oplugService.processOrder('data', { ...session.data, plan_id: plan.id, provider: plan.provider, price: plan.price }, user);
            await sendWhatsAppMessage(from, res.success ? `✅ Done! ID: ${res.orderId}` : `❌ Error: ${res.message}`);
          } else {
            // Guest Flow: You can call your Paystack generation here
            await sendWhatsAppMessage(from, "💳 Guest checkout is coming soon! Please register on oplug.vercel.app to buy.");
          }
          session.state = 'IDLE';
        }
      }
      // ... (Add Airtime flow similarly)

      return res.status(200).send('EVENT_RECEIVED');
    } catch (err) {
      console.error("Webhook Error:", err);
      return res.status(200).send('OK'); // Always return 200 to Meta
    }
  }
}

// Helper functions (sendWhatsAppMessage, sendWhatsAppButtons) remain as before.