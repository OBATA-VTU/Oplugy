import { oplugService } from './oplugService.js';

const sessions = new Map();

export default async function handler(req, res) {
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
      const text = message.text?.body?.trim() || "";
      if (!sessions.has(from)) sessions.set(from, { state: 'IDLE', data: {} });
      const session = sessions.get(from);
      const user = await oplugService.lookupUser(from);

      // --- BEAUTIFIED FLOW ---

      if (['hi', 'hello', 'menu', 'start'].includes(text.toLowerCase())) {
        session.state = 'IDLE';
        const msg = user.exists 
          ? `👋 *Hi ${user.name}!* \n\n💰 Wallet: *₦${user.balance.toLocaleString()}*\n⚡ Status: *Verified*\n\nWhat would you like to buy today?`
          : `🔌 *Welcome to Oplug!* \n\nBuy Airtime & Data at the lowest rates. \n\nSelect an option:`;
        await sendWhatsAppButtons(from, msg);
        return res.status(200).send('OK');
      }

      if (message.type === 'interactive') {
        const id = message.interactive.button_reply?.id;
        if (id === 'buy_airtime') {
          session.state = 'AWAITING_AIRTIME_NETWORK';
          await sendWhatsAppMessage(from, "💸 *Airtime Purchase*\n\nSelect Network:\n1️⃣ MTN\n2️⃣ Airtel\n3️⃣ Glo\n4️⃣ 9mobile");
        } else if (id === 'buy_data') {
          session.state = 'AWAITING_DATA_NETWORK';
          await sendWhatsAppMessage(from, "📶 *Data Bundle*\n\nSelect Network:\n1️⃣ MTN\n2️⃣ Airtel\n3️⃣ Glo\n4️⃣ 9mobile");
        }
        return res.status(200).send('OK');
      }

      // Fulfillment Logic (Using your Proxy Helpers)
      if (session.state === 'AWAITING_DATA_PLAN') {
        const plans = [/* Fetch from your DB or API */]; 
        const choice = parseInt(text);
        if (choice > 0) {
          const plan = plans[choice-1];
          if (user.exists) {
            await sendWhatsAppMessage(from, `⏳ *Processing...*`);
            // Call Server 1 or 2 based on your logic
            const result = await oplugService.callServer1('data', { ...session.data, plan_id: plan.id });
            if (result.status === 'success') {
               // Deduct balance in Firestore
               await admin.firestore().collection('users').doc(user.uid).update({
                 walletBalance: admin.firestore.FieldValue.increment(-plan.price)
               });
               await sendWhatsAppMessage(from, `✅ *Success!* \n\nYour data has been delivered.`);
            } else {
               await sendWhatsAppMessage(from, `❌ *Failed:* ${result.message}`);
            }
          } else {
            // Paystack Guest Flow
            const pay = await oplugService.generatePaymentDetails({ ...session.data, amount: plan.price });
            await sendWhatsAppMessage(from, `💳 *Payment Required*\n\nTransfer *₦${pay.amount}* to:\n🏦 Bank: *${pay.bank}*\n🔢 Acc: *${pay.account}*`);
          }
          session.state = 'IDLE';
        }
      }

      return res.status(200).send('OK');
    } catch (err) { return res.status(200).send('OK'); }
  }
}

// (Helpers sendWhatsAppMessage and sendWhatsAppButtons at the bottom)