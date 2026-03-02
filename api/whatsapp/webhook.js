import { oplugService } from './oplugService.js'; // Same folder import

const sessions = new Map();

export default async function handler(req, res) {
  // 1. Verification (GET)
  if (req.method === 'GET') {
    const token = req.query['hub.verify_token'];
    if (token === process.env.WHATSAPP_VERIFY_TOKEN) return res.status(200).send(req.query['hub.challenge']);
    return res.status(403).send('Forbidden');
  }

  // 2. Messages (POST)
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

      // GREETING
      if (['hi', 'hello', 'menu', 'start'].includes(text.toLowerCase())) {
        session.state = 'IDLE';
        const msg = user.exists 
          ? `👋 *Hi ${user.name}!* \n\nWallet: *₦${user.balance.toLocaleString()}*\n\nHow can we help you today?`
          : `🔌 *Welcome to Oplug!* \n\nBuy Airtime & Data instantly. \n\nWhat would you like to do?`;
        await sendWhatsAppButtons(from, msg);
        return res.status(200).send('OK');
      }

      // BUTTONS
      if (message.type === 'interactive') {
        const id = message.interactive.button_reply?.id;
        if (id === 'buy_airtime') {
          session.state = 'AWAITING_AIRTIME_NETWORK';
          await sendWhatsAppMessage(from, "💸 *Airtime*\nSelect Network:\n1. MTN\n2. Airtel\n3. Glo\n4. 9mobile");
        } else if (id === 'buy_data') {
          session.state = 'AWAITING_DATA_NETWORK';
          await sendWhatsAppMessage(from, "📶 *Data*\nSelect Network:\n1. MTN\n2. Airtel\n3. Glo\n4. 9mobile");
        }
        return res.status(200).send('OK');
      }

      // AIRTIME FLOW
      if (session.state === 'AWAITING_AIRTIME_NETWORK') {
        const nets = ['MTN', 'Airtel', 'Glo', '9mobile'];
        const choice = parseInt(text);
        if (choice >= 1 && choice <= 4) {
          session.data.network = nets[choice-1];
          session.state = 'AWAITING_AIRTIME_PHONE';
          await sendWhatsAppMessage(from, `📱 *${session.data.network} Airtime*\n\nEnter phone number:`);
        }
      } else if (session.state === 'AWAITING_AIRTIME_PHONE') {
        session.data.phone = text;
        session.state = 'AWAITING_AIRTIME_AMOUNT';
        await sendWhatsAppMessage(from, "💰 Enter amount (₦):");
      } else if (session.state === 'AWAITING_AIRTIME_AMOUNT') {
        const amt = parseInt(text);
        await sendWhatsAppMessage(from, `⏳ Processing ₦${amt} Airtime...`);
        const res = await oplugService.processOrder('airtime', { ...session.data, amount: amt }, user);
        await sendWhatsAppMessage(from, res.success ? `✅ *Success!*` : `❌ *Failed:* ${res.message}`);
        session.state = 'IDLE';
      }

      // DATA FLOW
      else if (session.state === 'AWAITING_DATA_NETWORK') {
        const nets = ['MTN', 'Airtel', 'Glo', '9mobile'];
        const choice = parseInt(text);
        if (choice >= 1 && choice <= 4) {
          session.data.network = nets[choice-1];
          session.state = 'AWAITING_DATA_PHONE';
          await sendWhatsAppMessage(from, `📱 *${session.data.network} Data*\n\nEnter phone number:`);
        }
      } else if (session.state === 'AWAITING_DATA_PHONE') {
        session.data.phone = text;
        session.state = 'AWAITING_DATA_PLAN';
        const plans = await oplugService.getDataPlans(session.data.network);
        await sendWhatsAppMessage(from, plans.map((p, i) => `${i+1}. ${p.label}`).join('\n'));
      } else if (session.state === 'AWAITING_DATA_PLAN') {
        const plans = await oplugService.getDataPlans(session.data.network);
        const choice = parseInt(text);
        if (choice >= 1 && choice <= plans.length) {
          const plan = plans[choice-1];
          if (user.exists) {
            await sendWhatsAppMessage(from, `⏳ Processing ${plan.label}...`);
            const res = await oplugService.processOrder('data', { ...session.data, plan_id: plan.id, price: plan.price }, user);
            await sendWhatsAppMessage(from, res.success ? `✅ *Success!*` : `❌ *Failed:* ${res.message}`);
          } else {
            await sendWhatsAppMessage(from, `⏳ *Generating Payment...*`);
            const pay = await oplugService.generatePaymentDetails({ ...session.data, plan_id: plan.id, amount: plan.price });
            if (pay) {
              await sendWhatsAppMessage(from, `💳 *Payment Required*\n\nTransfer *₦${pay.amount}* to:\n🏦 Bank: *${pay.bank}*\n🔢 Acc: *${pay.account}*\n\n🔗 Or pay online: ${pay.url}`);
            } else { await sendWhatsAppMessage(from, "❌ Error generating payment."); }
          }
          session.state = 'IDLE';
        }
      }

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