import { whatsappService } from './whatsappService';
import * as admin from 'firebase-admin';

export default async function handler(req: any, res: any) {
  // 1. Handle Meta Webhook Verification (GET)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    } else {
      return res.status(403).json({ error: 'Verification failed' });
    }
  }

  // 2. Handle Incoming Messages (POST)
  if (req.method === 'POST') {
    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const message = value?.messages?.[0];

      if (!message) return res.status(200).json({ status: 'ok' });

      const from = message.from;
      const userName = value.contacts?.[0]?.profile?.name || 'User';

      // Handle Text Messages
      if (message.type === 'text') {
        const text = message.text.body.trim().toUpperCase();
        const session = await whatsappService.getSession(from);

        // Handle Ongoing Session (Account Creation)
        if (session?.step === 'AWAITING_USERNAME') {
          await whatsappService.updateSession(from, { username: text, step: 'AWAITING_EMAIL' });
          await whatsappService.sendMessage(from, `Great! Now please provide your *Email Address* to complete your registration.`);
          return res.status(200).json({ status: 'ok' });
        }

        if (session?.step === 'AWAITING_EMAIL') {
          const email = text.toLowerCase();
          // Simple email validation
          if (!email.includes('@')) {
            await whatsappService.sendMessage(from, `❌ Invalid email format. Please provide a valid email address.`);
            return res.status(200).json({ status: 'ok' });
          }

          try {
            const db = admin.firestore();
            await db.collection('users').add({
              username: session.username,
              email: email,
              phone: from,
              walletBalance: 0,
              role: 'User',
              isPinSet: false,
              createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            await whatsappService.clearSession(from);
            await whatsappService.sendMessage(from, `🎉 *Account Created Successfully!*\n\nWelcome to Oplug, ${session.username}. You can now fund your wallet and start purchasing services.`);
            await sendWelcomeMenu(from, session.username, 0);
          } catch (e: any) {
            await whatsappService.sendMessage(from, `❌ Error creating account: ${e.message}`);
          }
          return res.status(200).json({ status: 'ok' });
        }

        // Default Greeting / Menu
        const user = await whatsappService.getUserByPhone(from);
        if (user) {
          await sendWelcomeMenu(from, user.username, user.walletBalance, user.phone);
        } else {
          await sendGuestMenu(from);
        }
      }

      // Handle Interactive Responses
      if (message.type === 'interactive') {
        const interactive = message.interactive;
        
        // Button Replies
        if (interactive.type === 'button_reply') {
          const buttonId = interactive.button_reply.id;

          if (buttonId === 'CREATE_ACCOUNT') {
            await whatsappService.updateSession(from, { step: 'AWAITING_USERNAME' });
            await whatsappService.sendMessage(from, `Awesome! Let's get you started.\n\nWhat would you like your *Username* to be?`);
          }

          if (buttonId === 'GUEST_PURCHASE') {
            await sendServiceList(from, "Guest Purchase");
          }

          if (buttonId === 'CHOOSE_SERVICE') {
            await sendServiceList(from, "Select a Service");
          }
        }

        // List Replies
        if (interactive.type === 'list_reply') {
          const listId = interactive.list_reply.id;

          if (listId === 'FUND_WALLET') {
            await handleFunding(from);
          } else if (listId === 'SUPPORT') {
            await whatsappService.sendMessage(from, `👨‍💻 *Oplug Support*\n\nFor any issues or inquiries, please contact our support team on WhatsApp: https://wa.me/2348142452729`);
          } else {
            // Handle specific services (Airtime, Data, etc.)
            await whatsappService.sendMessage(from, `You selected: *${interactive.list_reply.title}*\n\nTo proceed, please use the command format:\n*${listId} [NETWORK] [PLAN_ID/AMOUNT] [PHONE]*\n\nExample: *DATA MTN 1000 08012345678*`);
          }
        }
      }

      return res.status(200).json({ status: 'ok' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

async function sendWelcomeMenu(from: string, username: string, balance: number, phone?: string) {
  const body = `Welcome to Oplug 🌟\n\n👤 *${username}*\n📱 ${phone || from}\n💰 *Balance:* ₦${balance.toLocaleString()}\n\nChoose a service:`;
  await whatsappService.sendInteractiveButtons(from, body, [
    { id: 'CHOOSE_SERVICE', title: 'Select a Service' }
  ]);
}

async function sendGuestMenu(from: string) {
  const body = `Welcome to Oplug 🌟\n\n👤 *User not found on database*\n\nPlease choose an option:`;
  await whatsappService.sendInteractiveButtons(from, body, [
    { id: 'CREATE_ACCOUNT', title: 'Create Account' },
    { id: 'GUEST_PURCHASE', title: 'Guest Purchase' }
  ]);
}

async function sendServiceList(from: string, title: string) {
  const sections = [
    {
      title: "Main Services",
      rows: [
        { id: 'AIRTIME', title: 'Airtime', description: 'Top up airtime for all networks' },
        { id: 'DATA', title: 'Data Bundle', description: 'Cheap data for MTN, Airtel, Glo, 9mobile' },
        { id: 'CABLE', title: 'Cable TV', description: 'DSTV, GOTV, Startimes' },
        { id: 'POWER', title: 'Electricity', description: 'Prepaid & Postpaid bills' }
      ]
    },
    {
      title: "Others",
      rows: [
        { id: 'EDUCATION', title: 'Education', description: 'WAEC & NECO Result Pins' },
        { id: 'SMM', title: 'Social Boost', description: 'Followers, Likes, Views' },
        { id: 'FUND_WALLET', title: 'Fund Wallet', description: 'Add money to your Oplug wallet' },
        { id: 'SUPPORT', title: 'Any Issue/Support', description: 'Chat with our team' }
      ]
    }
  ];
  await whatsappService.sendInteractiveList(from, title, "View Services", sections);
}

async function handleFunding(from: string) {
  const user = await whatsappService.getUserByPhone(from);
  const email = user?.email || `${from}@oplug.bot`;
  
  try {
    // Initialize a small amount for guest or ask for amount? 
    // For now, let's provide instructions and a link.
    const payment = await whatsappService.initializePaystackPayment(email, 1000, { phone: from });
    const checkoutUrl = payment.data.authorization_url;
    
    await whatsappService.sendMessage(from, `💳 *Fund Your Wallet*\n\nTo fund your wallet via Bank Transfer or Card, use the link below:\n\n🔗 ${checkoutUrl}\n\n*Bank Transfer Details:*\nOnce you open the link, select "Transfer" to see your dedicated virtual account number.\n\n_Payment is confirmed instantly!_`);
  } catch (e) {
    await whatsappService.sendMessage(from, `❌ Sorry, could not generate payment link. Please fund via our website: ${process.env.APP_URL}/funding`);
  }
}
