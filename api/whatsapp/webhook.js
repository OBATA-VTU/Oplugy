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

      // --- BEAUTIFIED BOT FLOW ---

      if (['hi', 'hello', 'menu'].includes(text.toLowerCase())) {
        session.state = 'IDLE';
        const msg = user.exists 
          ? `👋 *Hi ${user.name}!* \n\n💰 Wallet: *₦${user.balance.toLocaleString()}*\n⚡ Status: *Verified*\n\nWhat would you like to buy today?`
          : `🔌 *Welcome to Oplug!* \n\nBuy Airtime & Data at the lowest rates in Nigeria. \n\nSelect an option below:`;
        await sendWhatsAppButtons(from, msg);
      } 

      else if (message.type === 'interactive') {
        const id = message.interactive.button_reply?.id;
        if (id === 'buy_airtime') {
          session.state = 'AWAITING_AIRTIME_NETWORK';
          await sendWhatsAppMessage(from, "💸 *Airtime Purchase*\n\nSelect Network:\n1️⃣ MTN\n2️⃣ Airtel\n3️⃣ Glo\n4️⃣ 9mobile");
        } else if (id === 'buy_data') {
          session.state = 'AWAITING_DATA_NETWORK';
          await sendWhatsAppMessage(from, "📶 *Data Bundle*\n\nSelect Network:\n1️⃣ MTN\n2️⃣ Airtel\n3️⃣ Glo\n4️⃣ 9mobile");
        }
      }

      // ... (Flow logic for Airtime/Data using oplugService.processOrder)

      return res.status(200).send('OK');
    } catch (err) { return res.status(200).send('OK'); }
  }
}

// --- HELPERS ---
async function sendWhatsAppMessage(to, text) {
  await fetch(`https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body: text } })
  });
}

async function sendWhatsAppButtons(to, bodyText) {
  await fetch(`https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: "whatsapp", to, type: "interactive",
      interactive: {
        type: "button", body: { text: bodyText },
        action: {
          buttons: [
            { type: "reply", reply: { id: "buy_airtime", title: "Buy Airtime" } },
            { type: "reply", reply: { id: "buy_data", title: "Buy Data" } },
            { type: "reply", reply: { id: "check_balance", title: "Balance" } }
          ]
        }
      }
    })
  });
}