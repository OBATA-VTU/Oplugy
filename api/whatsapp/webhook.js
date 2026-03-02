import { oplugService } from './oplugService'; // Ensure this path is correct!

const sessions = new Map();

export default async function handler(req, res) {
  // THIS LOG WILL SHOW IN VERCEL IF META CALLS YOU
  console.log(`--- Incoming Request: ${req.method} ---`);

  // 1. Webhook Verification (GET)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    console.log(`Verification Attempt: Mode=${mode}, Token=${token}`);

    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      console.log("✅ Webhook Verified!");
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Forbidden');
  }

  // 2. Incoming Messages (POST)
  if (req.method === 'POST') {
    try {
      const body = req.body;
      console.log("📩 Message Received:", JSON.stringify(body));

      const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
      if (!message) {
        console.log("⚠️ No message found in payload.");
        return res.status(200).send('OK');
      }

      const from = message.from;
      const text = message.text?.body?.trim() || message.interactive?.button_reply?.title || "";
      
      if (!sessions.has(from)) sessions.set(from, { state: 'IDLE', data: {} });
      const session = sessions.get(from);
      
      console.log(`Processing message from ${from}: "${text}"`);

      // Lookup User
      const user = await oplugService.lookupUser(from);
      console.log(`User Lookup: ${user.exists ? 'Found ' + user.name : 'Not Found'}`);

      // --- BOT LOGIC ---
      if (['hi', 'hello', 'menu', 'start'].includes(text.toLowerCase())) {
        session.state = 'IDLE';
        const welcomeMsg = user.exists 
          ? `🌟 *Welcome back, ${user.name}!* \n\nYour Oplug balance is *₦${user.balance.toLocaleString()}*.\n\nWhat would you like to do?`
          : `🔌 *Welcome to Oplug!* \n\nThe fastest way to buy Airtime & Data. \n\nWhat would you like to do?`;
        
        await sendWhatsAppButtons(from, welcomeMsg);
      } 
      
      // ... (Rest of your button and flow logic)

      return res.status(200).send('EVENT_RECEIVED');
    } catch (err) {
      console.error("❌ CRITICAL ERROR:", err.message);
      return res.status(200).send('OK'); 
    }
  }
}

// Ensure these helpers are at the bottom!
async function sendWhatsAppMessage(to, text) { /* ... */ }
async function sendWhatsAppButtons(to, bodyText) { /* ... */ }