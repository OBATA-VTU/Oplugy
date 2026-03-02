import { oplugService } from './oplugService.js';

const sessions = new Map();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const token = process.env.WHATSAPP_VERIFY_TOKEN;
    if (req.query['hub.verify_token'] === token) return res.status(200).send(req.query['hub.challenge']);
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

      // --- MAIN MENU ---
      if (['hi', 'hello', 'menu', 'start'].includes(text.toLowerCase())) {
        session.state = 'IDLE';
        const welcome = `👋 *Hi ${user.name}!* \n\nWelcome to *Oplug v2.0*. \n💰 Wallet: *₦${user.balance.toLocaleString()}*\n\n_Select a service to continue:_`;
        
        await sendWhatsAppList(from, welcome, "🚀 Explore Services", [
          { id: "buy_airtime", title: "💸 Airtime", desc: "MTN, Airtel, Glo, 9mobile" },
          { id: "buy_data", title: "📶 Data Bundle", desc: "SME, Gifting, Corporate" },
          { id: "buy_cable", title: "📺 Cable TV", desc: "DSTV, GOTV, Startimes" },
          { id: "pay_elec", title: "💡 Electricity", desc: "IKEDC, EKEDC, AEDC, etc." },
          { id: "buy_edu", title: "🎓 Education Pins", desc: "WAEC, NECO, JAMB" },
          { id: "buy_smm", title: "📈 SMM Booster", desc: "Followers, Likes, Views" },
          { id: "check_bal", title: "💰 My Wallet", desc: "Check balance & history" }
        ]);
        return res.status(200).send('OK');
      }

      // --- INTERACTIVE HANDLERS ---
      if (message.type === 'interactive') {
        const id = message.interactive.list_reply?.id || message.interactive.button_reply?.id;
        
        if (id === 'buy_edu') {
          session.state = 'AWAITING_EDU_TYPE';
          await sendWhatsAppMessage(from, "🎓 *Education Pins*\n\nSelect Exam Type:\n1️⃣ *WAEC*\n2️⃣ *NECO*\n3️⃣ *NABTEB*\n4️⃣ *JAMB*");
        } 
        else if (id === 'buy_smm') {
          session.state = 'AWAITING_SMM_CAT';
          await sendWhatsAppMessage(from, "📈 *SMM Booster*\n\nSelect Category:\n1️⃣ *Instagram*\n2️⃣ *TikTok*\n3️⃣ *Facebook*\n4️⃣ *YouTube*");
        }
        // ... (Other handlers for Airtime, Data, Cable, Elec)
        return res.status(200).send('OK');
      }

      // --- FLOW LOGIC (Example: Education) ---
      if (session.state === 'AWAITING_EDU_TYPE') {
        const types = ['WAEC', 'NECO', 'NABTEB', 'JAMB'];
        const choice = parseInt(text);
        if (choice >= 1 && choice <= 4) {
          session.data.exam = types[choice-1];
          session.state = 'AWAITING_EDU_QTY';
          await sendWhatsAppMessage(from, `📝 *${session.data.exam} Pin*\n\nHow many pins do you want to purchase?`);
        }
      }

      return res.status(200).send('OK');
    } catch (err) { return res.status(200).send('OK'); }
  }
}

// (Helpers sendWhatsAppMessage and sendWhatsAppList at the bottom)