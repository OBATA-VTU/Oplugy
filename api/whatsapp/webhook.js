import { oplugService } from './oplugService.js';

const sessions = new Map();

export default async function handler(req, res) {
  // 1. Webhook Verification (GET)
  if (req.method === 'GET') {
    const token = req.query['hub.verify_token'];
    if (token === process.env.WHATSAPP_VERIFY_TOKEN) return res.status(200).send(req.query['hub.challenge']);
    return res.status(403).send('Forbidden');
  }

  // 2. Incoming Messages (POST)
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

      // --- 1. GREETING (USING LIST MENU) ---
      const greetings = ['hi', 'hello', 'menu', 'start', 'wassup', 'good morning', 'good evening', 'good night'];
      if (greetings.includes(text.toLowerCase())) {
        session.state = 'IDLE';
        
        const welcome = user.exists 
          ? `👋 *Hi ${user.name}!* \n\nWelcome back to *Oplug*. \n💰 Wallet: *₦${user.balance.toLocaleString()}*`
          : `🔌 *Welcome to Oplug!* \n\nThe fastest way to buy Airtime, Data, Cable & more.`;

        await sendWhatsAppList(from, welcome, "Select Service", [
          { id: "buy_airtime", title: "💸 Buy Airtime", desc: "Top up your phone instantly" },
          { id: "buy_data", title: "📶 Buy Data", desc: "Cheap data for all networks" },
          { id: "buy_cable", title: "📺 Cable TV", desc: "DSTV, GOTV, Startimes" },
          { id: "pay_electricity", title: "💡 Electricity", desc: "Pay for IKEDC, EKEDC, etc." },
          { id: "buy_smm", title: "🚀 SMM Booster", desc: "Followers, Likes & Views" },
          { id: "check_balance", title: "💰 Check Balance", desc: "View your wallet balance" }
        ]);
        
        return res.status(200).send('OK');
      }

      // --- 2. INTERACTIVE HANDLER (BUTTONS & LISTS) ---
      if (message.type === 'interactive') {
        // Handle both Button clicks and List selections
        const id = message.interactive.button_reply?.id || message.interactive.list_reply?.id;
        console.log(`--- [DEBUG] Interactive ID: ${id}`);

        if (id === 'check_balance') {
          const balMsg = user.exists 
            ? `💰 *Your Balance:* ₦${user.balance.toLocaleString()}` 
            : "❌ You don't have an account yet. Register at oplug.vercel.app";
          await sendWhatsAppMessage(from, balMsg);
        } 
        else if (id === 'buy_airtime') {
          session.state = 'AWAITING_AIRTIME_NETWORK';
          await sendWhatsAppMessage(from, "💸 *Airtime*\nSelect Network:\n1. MTN\n2. Airtel\n3. Glo\n4. 9mobile");
        } 
        else if (id === 'buy_data') {
          session.state = 'AWAITING_DATA_NETWORK';
          await sendWhatsAppMessage(from, "📶 *Data Bundle*\nSelect Network:\n1. MTN\n2. Airtel\n3. Glo\n4. 9mobile");
        }
        else if (id === 'buy_cable') {
          session.state = 'AWAITING_CABLE_TYPE';
          await sendWhatsAppMessage(from, "📺 *Cable TV*\nSelect Provider:\n1. DSTV\n2. GOTV\n3. Startimes");
        }
        else if (id === 'pay_electricity') {
          session.state = 'AWAITING_ELEC_DISCO';
          await sendWhatsAppMessage(from, "💡 *Electricity*\nSelect Disco (e.g. IKEDC, EKEDC, AEDC):");
        }
        else if (id === 'buy_smm') {
          session.state = 'AWAITING_SMM_SERVICE';
          await sendWhatsAppMessage(from, "🚀 *SMM Booster*\nWhat do you need?\n1. Followers\n2. Likes\n3. Views");
        }
        
        return res.status(200).send('OK');
      }

      // ... (Rest of your flow logic)

      return res.status(200).send('OK');
    } catch (err) { 
      console.error("--- [DEBUG] Webhook Error:", err);
      return res.status(200).send('OK'); 
    }
  }
}

// --- UPDATED HELPERS ---

async function sendWhatsAppMessage(to, text) {
  await fetch(`https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body: text } })
  });
}

/**
 * NEW: Send WhatsApp List Message
 */
async function sendWhatsAppList(to, bodyText, buttonText, rows) {
  const formattedRows = rows.map(r => ({
    id: r.id,
    title: r.title,
    description: r.desc || ""
  }));

  await fetch(`https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: to,
      type: "interactive",
      interactive: {
        type: "list",
        body: { text: bodyText },
        action: {
          button: buttonText,
          sections: [
            {
              title: "Our Services",
              rows: formattedRows
            }
          ]
        }
      }
    })
  });
}