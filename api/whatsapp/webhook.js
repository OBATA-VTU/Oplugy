import { oplugService } from './oplugService.js';

const sessions = new Map();

export default async function handler(req, res) {
  // 1. LOG EVERY REQUEST
  console.log(`--- [DEBUG] Incoming ${req.method} request ---`);

  if (req.method === 'GET') {
    const token = req.query['hub.verify_token'];
    if (token === process.env.WHATSAPP_VERIFY_TOKEN) return res.status(200).send(req.query['hub.challenge']);
    return res.status(403).send('Forbidden');
  }

  if (req.method === 'POST') {
    try {
      const body = req.body;
      // 2. LOG THE FULL PAYLOAD FROM META
      console.log("--- [DEBUG] Payload from Meta:", JSON.stringify(body));

      const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
      if (!message) {
        console.log("--- [DEBUG] No message object found in payload.");
        return res.status(200).send('OK');
      }

      const from = message.from;
      const text = message.text?.body?.trim() || message.interactive?.button_reply?.title || "";
      
      console.log(`--- [DEBUG] From: ${from}, Text: ${text}`);

      if (!sessions.has(from)) sessions.set(from, { state: 'IDLE', data: {} });
      const session = sessions.get(from);
      
      // 3. LOG USER LOOKUP
      const user = await oplugService.lookupUser(from);
      console.log(`--- [DEBUG] User Lookup: ${user.exists ? 'Found: ' + user.name : 'Not Found'}`);

      // --- BOT LOGIC ---
      if (['hi', 'hello', 'menu', 'start'].includes(text.toLowerCase())) {
        session.state = 'IDLE';
        const msg = user.exists 
          ? `👋 *Hi ${user.name}!* \n\n💰 Wallet: *₦${user.balance.toLocaleString()}*\n\nWhat would you like to buy today?`
          : `🔌 *Welcome to Oplug!* \n\nBuy Airtime & Data at the lowest rates.`;
        
        console.log("--- [DEBUG] Attempting to send buttons...");
        await sendWhatsAppButtons(from, msg);
      } 

      return res.status(200).send('OK');
    } catch (err) {
      console.error("--- [DEBUG] CRITICAL ERROR:", err.message);
      return res.status(200).send('OK');
    }
  }
}

// --- UPDATED HELPERS WITH ERROR LOGGING ---

async function sendWhatsAppMessage(to, text) {
  console.log(`--- [DEBUG] Sending Text to ${to}...`);
  const response = await fetch(`https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body: text } })
  });
  
  const result = await response.json();
  if (!response.ok) {
    console.error("--- [DEBUG] META API ERROR (Text):", JSON.stringify(result));
  } else {
    console.log("--- [DEBUG] Message sent successfully!");
  }
}

async function sendWhatsAppButtons(to, bodyText) {
  console.log(`--- [DEBUG] Sending Buttons to ${to}...`);
  const response = await fetch(`https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
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

  const result = await response.json();
  if (!response.ok) {
    console.error("--- [DEBUG] META API ERROR (Buttons):", JSON.stringify(result));
  } else {
    console.log("--- [DEBUG] Buttons sent successfully!");
  }
}