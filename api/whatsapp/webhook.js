import { oplugService } from '../../services/oplugService';

// In-memory session store
const sessions = new Map();

export default async function handler(req, res) {
  // 1. Webhook Verification (GET)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Forbidden');
  }

  // 2. Incoming Messages (POST)
  if (req.method === 'POST') {
    try {
      const body = req.body;
      const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
      if (!message) return res.status(200).send('OK');

      const from = message.from;
      const text = message.text?.body?.trim() || message.interactive?.button_reply?.title || "";
      
      // Get or Create Session
      if (!sessions.has(from)) sessions.set(from, { state: 'IDLE', data: {} });
      const session = sessions.get(from);
      
      // Lookup User in Firestore
      const user = await oplugService.lookupUser(from);

      // --- BOT LOGIC ---

      // Handle Initial Greeting / Menu
      if (['hi', 'hello', 'menu', 'start'].includes(text.toLowerCase())) {
        session.state = 'IDLE';
        session.data = {};
        const welcomeMsg = user.exists 
          ? `🌟 *Welcome back, ${user.name}!* \n\nYour Oplug balance is *₦${user.balance}*.\n\nWhat would you like to do?`
          : `🔌 *Welcome to Oplug!* \n\nYou can buy airtime and data instantly! \n\nWhat would you like to do?`;
        await sendWhatsAppButtons(from, welcomeMsg);
        return res.status(200).send('EVENT_RECEIVED');
      }

      // Handle Button Clicks
      if (message.type === 'interactive') {
        const buttonId = message.interactive.button_reply?.id;
        if (buttonId === 'buy_airtime') {
          session.state = 'AWAITING_AIRTIME_NETWORK';
          await sendWhatsAppMessage(from, "💸 *Airtime*\nWhich network?\n1. MTN\n2. Airtel\n3. Glo\n4. 9mobile");
        } else if (buttonId === 'buy_data') {
          session.state = 'AWAITING_DATA_NETWORK';
          await sendWhatsAppMessage(from, "📶 *Data*\nWhich network?\n1. MTN\n2. Airtel\n3. Glo\n4. 9mobile");
        } else if (buttonId === 'check_balance') {
          const balMsg = user.exists ? `💰 *Balance:* ₦${user.balance}` : "❌ No account found. Visit oplug.vercel.app to register.";
          await sendWhatsAppMessage(from, balMsg);
        }
        return res.status(200).send('EVENT_RECEIVED');
      }

      // Handle Flow Steps (Airtime/Data)
      if (session.state === 'AWAITING_DATA_NETWORK' || session.state === 'AWAITING_AIRTIME_NETWORK') {
        const networks = ['MTN', 'Airtel', 'Glo', '9mobile'];
        const choice = parseInt(text);
        if (choice >= 1 && choice <= 4) {
          const network = networks[choice-1];
          session.data.network = network;
          if (session.state === 'AWAITING_DATA_NETWORK') {
            session.state = 'AWAITING_DATA_PHONE';
            await sendWhatsAppMessage(from, `Enter the phone number for ${network} Data:`);
          } else {
            session.state = 'AWAITING_AIRTIME_PHONE';
            await sendWhatsAppMessage(from, `Enter the phone number for ${network} Airtime:`);
          }
        }
      } 
      
      else if (session.state === 'AWAITING_DATA_PHONE') {
        if (isValidPhone(text)) {
          session.state = 'AWAITING_DATA_PLAN';
          session.data.phone = text;
          const plans = await oplugService.getDataPlans(session.data.network);
          let planMsg = `*Select a Data Plan:*\n\n`;
          plans.forEach((p, i) => { planMsg += `${i+1}. ${p.label}\n`; });
          await sendWhatsAppMessage(from, planMsg);
        } else {
          await sendWhatsAppMessage(from, "❌ Invalid phone. Enter 11 digits:");
        }
      }

      else if (session.state === 'AWAITING_DATA_PLAN') {
        const plans = await oplugService.getDataPlans(session.data.network);
        const choice = parseInt(text);
        if (choice >= 1 && choice <= plans.length) {
          const plan = plans[choice-1];
          if (user.exists) {
            await sendWhatsAppMessage(from, `⏳ Processing ${plan.label}...`);
            const res = await oplugService.processOrder('data', { ...session.data, plan_id: plan.id, provider: plan.provider, price: plan.price }, user);
            await sendWhatsAppMessage(from, res.success ? `✅ Success! ID: ${res.orderId}` : `❌ Failed: ${res.message}`);
          } else {
            await sendWhatsAppMessage(from, "💳 Guest checkout is coming soon! Register at oplug.vercel.app.");
          }
          session.state = 'IDLE';
        }
      }

      return res.status(200).send('EVENT_RECEIVED');
    } catch (err) {
      console.error("CRITICAL WEBHOOK ERROR:", err);
      return res.status(200).send('OK');
    }
  }
}

// --- HELPER FUNCTIONS ---

function isValidPhone(phone) {
  return /^[0-9]{11}$/.test(phone.replace(/\s/g, ''));
}

async function sendWhatsAppMessage(to, text) {
  try {
    await fetch(`https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: { body: text }
      })
    });
  } catch (e) { console.error("Send Message Error", e); }
}

async function sendWhatsAppButtons(to, bodyText) {
  try {
    await fetch(`https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to,
        type: "interactive",
        interactive: {
          type: "button",
          body: { text: bodyText },
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
  } catch (e) { console.error("Send Buttons Error", e); }
}