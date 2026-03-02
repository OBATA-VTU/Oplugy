import { oplugService } from '../../services/oplugService';

// In-memory session store (For Vercel, consider using @vercel/kv for persistence)
const sessions = new Map();

function getSession(phone) {
  if (!sessions.has(phone)) sessions.set(phone, { state: 'IDLE', data: {} });
  return sessions.get(phone);
}

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
    const body = req.body;
    if (body.object === 'whatsapp_business_account' && body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      const message = body.entry[0].changes[0].value.messages[0];
      const from = message.from;
      const text = message.text?.body?.trim() || "";
      const session = getSession(from);
      const user = await oplugService.lookupUser(from);

      // --- STATE MACHINE ---

      // Greeting / Menu
      if (['hi', 'hello', 'menu', 'start'].includes(text.toLowerCase())) {
        session.state = 'IDLE';
        session.data = {};
        let welcomeMsg = user.exists 
          ? `🌟 *Welcome back!* \n\nYour Oplug balance is *₦${user.balance}*.\n\nWhat would you like to do?`
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
          const balMsg = user.exists ? `💰 Balance: ₦${user.balance}` : "❌ No account found.";
          await sendWhatsAppMessage(from, balMsg);
        }
        return res.status(200).send('EVENT_RECEIVED');
      }

      // Handle Airtime Flow
      if (session.state === 'AWAITING_AIRTIME_NETWORK') {
        const networks = ['MTN', 'Airtel', 'Glo', '9mobile'];
        const choice = parseInt(text);
        if (choice >= 1 && choice <= 4) {
          session.state = 'AWAITING_AIRTIME_PHONE';
          session.data.network = networks[choice-1];
          await sendWhatsAppMessage(from, `Enter the phone number for ${session.data.network}:`);
        }
      } else if (session.state === 'AWAITING_AIRTIME_PHONE') {
        session.state = 'AWAITING_AIRTIME_AMOUNT';
        session.data.phone = text;
        await sendWhatsAppMessage(from, "Enter amount (₦):");
      } else if (session.state === 'AWAITING_AIRTIME_AMOUNT') {
        const amount = parseInt(text);
        await sendWhatsAppMessage(from, `⏳ Processing ₦${amount} Airtime...`);
        const res = await oplugService.processOrder('airtime', { ...session.data, amount });
        await sendWhatsAppMessage(from, res.success ? `✅ Success! ID: ${res.orderId}` : `❌ Failed: ${res.message}`);
        session.state = 'IDLE';
      }

      // Handle Data Flow
      else if (session.state === 'AWAITING_DATA_NETWORK') {
        const networks = ['MTN', 'Airtel', 'Glo', '9mobile'];
        const choice = parseInt(text);
        if (choice >= 1 && choice <= 4) {
          session.state = 'AWAITING_DATA_PHONE';
          session.data.network = networks[choice-1];
          await sendWhatsAppMessage(from, "Enter the phone number:");
        }
      } else if (session.state === 'AWAITING_DATA_PHONE') {
        session.state = 'AWAITING_DATA_PLAN';
        session.data.phone = text;
        const plans = await oplugService.getDataPlans(session.data.network);
        let planMsg = plans.map((p, i) => `${i+1}. ${p.label}`).join('\n');
        await sendWhatsAppMessage(from, `Select Plan:\n${planMsg}`);
      } else if (session.state === 'AWAITING_DATA_PLAN') {
        const plans = await oplugService.getDataPlans(session.data.network);
        const choice = parseInt(text);
        if (choice >= 1 && choice <= plans.length) {
          const plan = plans[choice-1];
          if (user.exists) {
            await sendWhatsAppMessage(from, `⏳ Processing ${plan.label}...`);
            const res = await oplugService.processOrder('data', { ...session.data, plan_id: plan.id });
            await sendWhatsAppMessage(from, res.success ? `✅ Success! ID: ${res.orderId}` : `❌ Failed: ${res.message}`);
          } else {
            const pay = await oplugService.generatePaymentDetails({ ...session.data, plan_id: plan.id });
            await sendWhatsAppMessage(from, `💳 Pay ₦${pay.amount} to:\nBank: ${pay.bank}\nAcc: ${pay.account}`);
          }
          session.state = 'IDLE';
        }
      }
    }
    return res.status(200).send('EVENT_RECEIVED');
  }
}

// Helper: Send Text Message
async function sendWhatsAppMessage(to, text) {
  await fetch(`https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body: text } })
  });
}

// Helper: Send Buttons
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