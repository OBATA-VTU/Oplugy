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

        // Handle Greetings
        const greetings = ['HI', 'HELLO', 'WASSUP', 'HEY', 'YO', 'GOOD MORNING', 'GOOD AFTERNOON', 'GOOD EVENING'];
        if (greetings.includes(text) && !session) {
          const user = await whatsappService.getUserByPhone(from);
          if (user) {
            await sendWelcomeMenu(from, user.username, user.walletBalance, user.phone);
          } else {
            await sendGuestMenu(from);
          }
          return res.status(200).json({ status: 'ok' });
        }

        // Handle Ongoing Session (Account Creation)
        if (session?.step === 'AWAITING_USERNAME') {
          await whatsappService.updateSession(from, { username: text, step: 'AWAITING_EMAIL' });
          await whatsappService.sendMessage(from, `Great! Now please provide your *Email Address* to complete your registration.`);
          return res.status(200).json({ status: 'ok' });
        }

        if (session?.step === 'AWAITING_EMAIL') {
          const email = text.toLowerCase();
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

        // Handle Phone Input for Purchase
        if (session?.step === 'AWAITING_PHONE') {
          const phone = text.replace(/\s+/g, '');
          if (phone.length < 10) {
            await whatsappService.sendMessage(from, `❌ Invalid phone number. Please provide a valid 11-digit phone number.`);
            return res.status(200).json({ status: 'ok' });
          }
          
          await whatsappService.updateSession(from, { phone: phone, step: 'AWAITING_CONFIRMATION' });
          const summary = `*Order Confirmation*\n\nService: *${session.service}*\nNetwork: *${session.network}*\nPlan: *${session.planName}*\nPhone: *${phone}*\nPrice: *₦${session.price}*\n\nProceed with purchase?`;
          await whatsappService.sendInteractiveButtons(from, summary, [
            { id: 'CONFIRM_PURCHASE', title: 'Confirm ✅' },
            { id: 'CANCEL_PURCHASE', title: 'Cancel ❌' }
          ]);
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
        const session = await whatsappService.getSession(from);
        
        // Button Replies
        if (interactive.type === 'button_reply') {
          const buttonId = interactive.button_reply.id;

          if (buttonId === 'CREATE_ACCOUNT') {
            await whatsappService.updateSession(from, { step: 'AWAITING_USERNAME' });
            await whatsappService.sendMessage(from, `Awesome! Let's get you started.\n\nWhat would you like your *Username* to be?`);
          }

          if (buttonId === 'GUEST_PURCHASE' || buttonId === 'CHOOSE_SERVICE') {
            await sendServiceList(from, "Select a Service");
          }

          // Handle Network Selection
          if (['MTN', 'AIRTEL', 'GLO', '9MOBILE'].includes(buttonId)) {
            const service = session?.service;
            if (service === 'DATA') {
              const plans = await (whatsappService as any).getPlansForList(buttonId, 'DATA');
              if (plans.length > 0) {
                await whatsappService.updateSession(from, { network: buttonId });
                await whatsappService.sendInteractiveList(from, `Select an ${buttonId} Data Plan`, "View Plans", [{ title: "Available Plans", rows: plans.slice(0, 10) }]);
              } else {
                await whatsappService.sendMessage(from, `❌ No plans found for ${buttonId} at the moment.`);
              }
            } else if (service === 'AIRTIME') {
              const plans = await (whatsappService as any).getPlansForList(buttonId, 'AIRTIME');
              await whatsappService.updateSession(from, { network: buttonId });
              await whatsappService.sendInteractiveList(from, `Select ${buttonId} Airtime Amount`, "View Amounts", [{ title: "Amounts", rows: plans }]);
            }
          }

          // Handle Confirmation
          if (buttonId === 'CONFIRM_PURCHASE') {
            await handleExecutePurchase(from, session);
          }

          if (buttonId === 'CANCEL_PURCHASE') {
            await whatsappService.clearSession(from);
            await whatsappService.sendMessage(from, `❌ Transaction cancelled.`);
            const user = await whatsappService.getUserByPhone(from);
            if (user) await sendWelcomeMenu(from, user.username, user.walletBalance, user.phone);
            else await sendGuestMenu(from);
          }
        }

        // List Replies
        if (interactive.type === 'list_reply') {
          const listId = interactive.list_reply.id;
          const listTitle = interactive.list_reply.title;

          // Handle Network Selection (from List Reply now)
          if (['MTN', 'AIRTEL', 'GLO', '9MOBILE'].includes(listId)) {
            const service = session?.service;
            if (service === 'DATA') {
              const plans = await (whatsappService as any).getPlansForList(listId, 'DATA');
              if (plans.length > 0) {
                await whatsappService.updateSession(from, { network: listId });
                await whatsappService.sendInteractiveList(from, `Select an ${listId} Data Plan`, "View Plans", [{ title: "Available Plans", rows: plans.slice(0, 10) }]);
              } else {
                await whatsappService.sendMessage(from, `❌ No plans found for ${listId} at the moment.`);
              }
            } else if (service === 'AIRTIME') {
              const plans = await (whatsappService as any).getPlansForList(listId, 'AIRTIME');
              await whatsappService.updateSession(from, { network: listId });
              await whatsappService.sendInteractiveList(from, `Select ${listId} Airtime Amount`, "View Amounts", [{ title: "Amounts", rows: plans }]);
            }
          } else if (listId === 'FUND_WALLET') {
            await handleFunding(from);
          } else if (listId === 'SUPPORT') {
            await whatsappService.sendMessage(from, `👨‍💻 *Oplug Support*\n\nFor any issues or inquiries, please contact our support team on WhatsApp: https://wa.me/2348142452729`);
          } else if (['AIRTIME', 'DATA', 'CABLE', 'POWER'].includes(listId)) {
            await whatsappService.updateSession(from, { service: listId, step: 'AWAITING_NETWORK' });
            const networks = [
              { id: 'MTN', title: 'MTN', description: 'MTN Nigeria' },
              { id: 'AIRTEL', title: 'Airtel', description: 'Airtel Africa' },
              { id: 'GLO', title: 'Glo', description: 'Globacom' },
              { id: '9MOBILE', title: '9mobile', description: '9mobile Nigeria' }
            ];
            await whatsappService.sendInteractiveList(from, `Select your *${listId}* Network:`, "View Networks", [{ title: "Networks", rows: networks }]);
          } else if (listId.startsWith('PLAN_')) {
            const planId = listId.replace('PLAN_', '');
            // Extract price from description if possible or fetch from DB
            // For now, let's assume we store it in the session or fetch it again
            const db = admin.firestore();
            const planDoc = await db.collection('manual_pricing').doc(planId).get();
            const planData = planDoc.data();
            
            await whatsappService.updateSession(from, { 
              planId: planId, 
              planName: planData?.plan_name || listTitle,
              price: planData?.user_price || 0,
              step: 'AWAITING_PHONE' 
            });
            await whatsappService.sendMessage(from, `Please enter the *Phone Number* to receive the ${session?.service}:`);
          } else if (listId.startsWith('AMT_')) {
            const amount = parseInt(listId.replace('AMT_', ''));
            await whatsappService.updateSession(from, { 
              planName: `₦${amount} Airtime`,
              price: amount,
              step: 'AWAITING_PHONE' 
            });
            await whatsappService.sendMessage(from, `Please enter the *Phone Number* to receive the Airtime:`);
          }
        }
      }

      return res.status(200).json({ status: 'ok' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleExecutePurchase(from: string, session: any) {
  const user = await whatsappService.getUserByPhone(from);
  if (!user) {
    await whatsappService.sendMessage(from, `❌ You need an account to make purchases. Please use the "Create Account" button.`);
    return;
  }

  try {
    await whatsappService.sendMessage(from, `⏳ Processing your order...`);
    
    let serviceType = '';
    let payload: any = {};
    
    if (session.service === 'DATA') {
      serviceType = 'paydata';
      payload = {
        network: session.network,
        plan: session.planId,
        mobile_number: session.phone,
        Ported_number: true
      };
    } else if (session.service === 'AIRTIME') {
      serviceType = 'payairtime';
      payload = {
        network: session.network,
        amount: session.price,
        mobile_number: session.phone,
        Ported_number: true,
        airtime_type: 'VTU'
      };
    }

    const result = await whatsappService.executePurchase(user.id, serviceType, {
      amount: session.price,
      network: session.network,
      payload
    });

    if (result.status) {
      await whatsappService.sendMessage(from, `✅ *Purchase Successful!*\n\nYour order for ${session.planName} on ${session.phone} has been completed.`);
      await whatsappService.clearSession(from);
      const updatedUser = await whatsappService.getUserByPhone(from);
      await sendWelcomeMenu(from, updatedUser.username, updatedUser.walletBalance, updatedUser.phone);
    }
  } catch (e: any) {
    await whatsappService.sendMessage(from, `❌ *Transaction Failed*\n\nReason: ${e.message}`);
    await whatsappService.clearSession(from);
  }
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
    const payment = await whatsappService.initializePaystackPayment(email, 1000, { phone: from });
    const checkoutUrl = payment.data.authorization_url;
    
    await whatsappService.sendMessage(from, `💳 *Fund Your Wallet*\n\nTo fund your wallet via Bank Transfer or Card, use the link below:\n\n🔗 ${checkoutUrl}\n\n*Bank Transfer Details:*\nOnce you open the link, select "Transfer" to see your dedicated virtual account number.\n\n_Payment is confirmed instantly!_`);
  } catch (e) {
    await whatsappService.sendMessage(from, `❌ Sorry, could not generate payment link. Please fund via our website: ${process.env.APP_URL}/funding`);
  }
}
