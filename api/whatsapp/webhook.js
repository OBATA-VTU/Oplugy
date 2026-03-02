import { oplugService } from '../../services/oplugService';

const sessions = new Map();

export default async function handler(req, res) {
  // ... (Verification GET logic)

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

      // 1. BEAUTIFIED GREETING
      if (['hi', 'hello', 'menu', 'start'].includes(text.toLowerCase())) {
        session.state = 'IDLE';
        const msg = user.exists 
          ? `👋 *Hi ${user.name}!* \n\nWelcome back to *Oplug*. \n\n💰 Wallet: *₦${user.balance.toLocaleString()}*\n⚡ Status: *Active User*\n\nHow can we help you today?`
          : `🔌 *Welcome to Oplug!* \n\nThe fastest way to buy Airtime & Data. \n\n✨ *Discounted Rates*\n🚀 *Instant Delivery*\n💳 *Secure Payments*\n\nWhat would you like to do?`;
        await sendWhatsAppButtons(from, msg);
        return res.status(200).send('OK');
      }

      // 2. BEAUTIFIED BUTTONS
      if (message.type === 'interactive') {
        const id = message.interactive.button_reply?.id;
        if (id === 'buy_airtime') {
          session.state = 'AWAITING_AIRTIME_NETWORK';
          await sendWhatsAppMessage(from, "💸 *Airtime Purchase*\n\nWhich network are you topping up?\n\n1️⃣ MTN\n2️⃣ Airtel\n3️⃣ Glo\n4️⃣ 9mobile");
        } else if (id === 'buy_data') {
          session.state = 'AWAITING_DATA_NETWORK';
          await sendWhatsAppMessage(from, "📶 *Data Bundle*\n\nSelect your network provider:\n\n1️⃣ MTN\n2️⃣ Airtel\n3️⃣ Glo\n4️⃣ 9mobile");
        }
        return res.status(200).send('OK');
      }

      // 3. BEAUTIFIED FLOWS
      if (session.state === 'AWAITING_AIRTIME_NETWORK' || session.state === 'AWAITING_DATA_NETWORK') {
        const nets = ['MTN', 'Airtel', 'Glo', '9mobile'];
        const choice = parseInt(text);
        if (choice >= 1 && choice <= 4) {
          session.data.network = nets[choice-1];
          const type = session.state.includes('DATA') ? 'Data' : 'Airtime';
          session.state = session.state.includes('DATA') ? 'AWAITING_DATA_PHONE' : 'AWAITING_AIRTIME_PHONE';
          await sendWhatsAppMessage(from, `📱 *${session.data.network} ${type}*\n\nPlease enter the *Phone Number* to receive the service:`);
        }
      } 
      
      else if (session.state === 'AWAITING_DATA_PLAN') {
        const plans = await oplugService.getDataPlans(session.data.network);
        const choice = parseInt(text);
        if (choice >= 1 && choice <= plans.length) {
          const plan = plans[choice-1];
          if (user.exists) {
            await sendWhatsAppMessage(from, `⏳ *Processing...*\n\nSending *${plan.label}* to *${session.data.phone}*.\nPayment will be deducted from your wallet.`);
            const res = await oplugService.processOrder('data', { ...session.data, plan_id: plan.id, price: plan.price }, user);
            if (res.success) {
               await sendWhatsAppMessage(from, `✅ *Success!*\n\nTransaction ID: \`${res.orderId}\`\nYour data has been delivered. Thank you for choosing Oplug! 🔌`);
            } else {
               await sendWhatsAppMessage(from, `❌ *Failed*\n\n${res.message}`);
            }
          } else {
            // REAL PAYSTACK FLOW
            await sendWhatsAppMessage(from, `⏳ *Generating Payment...*\n\nPlease wait while we set up your secure checkout for *${plan.label}*.`);
            const pay = await oplugService.generatePaymentDetails({ ...session.data, plan_id: plan.id, amount: plan.price });
            if (pay) {
              const payMsg = `💳 *Secure Payment*\n\nTo complete your order, please transfer *₦${pay.amount.toLocaleString()}* to:\n\n🏦 Bank: *${pay.bank}*\n🔢 Account: *${pay.account}*\n\n⚠️ *Note:* This account expires in 30 mins. Your data will be sent *automatically* once payment is confirmed.\n\n🔗 Or pay online: ${pay.url}`;
              await sendWhatsAppMessage(from, payMsg);
            } else {
              await sendWhatsAppMessage(from, "❌ *Error*\n\nWe couldn't reach Paystack. Please try again later or register at oplug.vercel.app.");
            }
          }
          session.state = 'IDLE';
        }
      }

      return res.status(200).send('OK');
    } catch (err) { return res.status(200).send('OK'); }
  }
}