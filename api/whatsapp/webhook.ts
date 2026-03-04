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
      const messageId = message.id;

      // Deduplication check using message ID (simple local cache for immediate retries)
      if ((global as any).processedMessages?.has(messageId)) {
        return res.status(200).json({ status: 'ok' });
      }
      if (!(global as any).processedMessages) (global as any).processedMessages = new Set();
      (global as any).processedMessages.add(messageId);
      // Keep cache small
      if ((global as any).processedMessages.size > 100) {
        const first = (global as any).processedMessages.values().next().value;
        (global as any).processedMessages.delete(first);
      }

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
          await whatsappService.sendMessage(from, `✨ *Great!* Now please provide your *Email Address* to complete your registration.`);
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
            await whatsappService.sendMessage(from, `❌ *Invalid phone number.*\n\nPlease provide a valid 11-digit phone number.`);
            return res.status(200).json({ status: 'ok' });
          }
          
          if (session.service === 'AIRTIME') {
            await whatsappService.updateSession(from, { phone: phone, step: 'AWAITING_AIRTIME_AMOUNT' });
            await whatsappService.sendMessage(from, `💰 *Enter Amount*\n\nHow much *${session.network}* airtime do you want to purchase for *${phone}*?\n\n_Minimum: ₦50, Maximum: ₦50,000_`);
          } else {
            await whatsappService.updateSession(from, { phone: phone, step: 'AWAITING_CONFIRMATION' });
            const summary = `📝 *Order Confirmation*\n\n🔹 *Service:* ${session.service}\n🔹 *Network:* ${session.network}\n🔹 *Plan:* ${session.planName}\n🔹 *Phone:* ${phone}\n💰 *Price:* ₦${session.price}\n\nProceed with purchase?`;
            await whatsappService.sendInteractiveButtons(from, summary, [
              { id: 'CONFIRM_PURCHASE', title: 'Confirm ✅' },
              { id: 'CANCEL_PURCHASE', title: 'Cancel ❌' }
            ]);
          }
          return res.status(200).json({ status: 'ok' });
        }

        // Handle Airtime Amount Input
        if (session?.step === 'AWAITING_AIRTIME_AMOUNT') {
          const amount = parseFloat(text);
          if (isNaN(amount) || amount < 100 || amount > 50000) {
            await whatsappService.sendMessage(from, `❌ *Invalid Amount*\n\nPlease enter a valid amount between ₦100 and ₦50,000.`);
            return res.status(200).json({ status: 'ok' });
          }

          await whatsappService.updateSession(from, { price: amount, planName: `${session.network} Airtime`, step: 'AWAITING_CONFIRMATION' });
          const summary = `📝 *Order Confirmation*\n\n🔹 *Service:* AIRTIME\n🔹 *Network:* ${session.network}\n🔹 *Phone:* ${session.phone}\n💰 *Amount:* ₦${amount}\n\nProceed with purchase?`;
          await whatsappService.sendInteractiveButtons(from, summary, [
            { id: 'CONFIRM_PURCHASE', title: 'Confirm ✅' },
            { id: 'CANCEL_PURCHASE', title: 'Cancel ❌' }
          ]);
          return res.status(200).json({ status: 'ok' });
        }

        // Handle IUC Input for Cable
        if (session?.step === 'AWAITING_IUC') {
          const iuc = text.replace(/\s+/g, '');
          await whatsappService.sendMessage(from, `🔍 Verifying IUC Number *${iuc}*...`);
          try {
            const verification = await (whatsappService as any).verifyNumber('CABLE', session.network, iuc);
            if (verification.status) {
              const customerName = verification.customerName || verification.data?.customerName || 'Unknown Customer';
              await whatsappService.updateSession(from, { phone: iuc, customerName, step: 'AWAITING_PLAN' });
              const plans = await (whatsappService as any).getPlansForList(session.network, 'CABLE');
              await whatsappService.sendMessage(from, `👤 *Customer:* ${customerName}\n\nSelect a plan for your *${session.network}* subscription:`);
              await whatsappService.sendInteractiveList(from, `Select ${session.network} Plan`, "View Plans", [{ title: "Plans", rows: plans.slice(0, 10) }]);
            } else {
              await whatsappService.sendMessage(from, `❌ *Verification Failed*\n\n${verification.message || 'Invalid IUC Number'}. Please check and try again.`);
            }
          } catch (e: any) {
            await whatsappService.sendMessage(from, `❌ Error verifying IUC: ${e.message}. Please try again.`);
          }
          return res.status(200).json({ status: 'ok' });
        }

        // Handle Meter Input for Power
        if (session?.step === 'AWAITING_METER') {
          const meter = text.replace(/\s+/g, '');
          await whatsappService.sendMessage(from, `🔍 Verifying Meter Number *${meter}*...`);
          try {
            const verification = await (whatsappService as any).verifyNumber('POWER', session.network, meter);
            if (verification.status) {
              const customerName = verification.customerName || verification.data?.customerName || 'Unknown Customer';
              await whatsappService.updateSession(from, { phone: meter, customerName, step: 'AWAITING_AMOUNT' });
              await whatsappService.sendMessage(from, `👤 *Customer:* ${customerName}\n\nHow much *${session.network}* electricity do you want to buy? (₦)`);
            } else {
              await whatsappService.sendMessage(from, `❌ *Verification Failed*\n\n${verification.message || 'Invalid Meter Number'}. Please check and try again.`);
            }
          } catch (e: any) {
            await whatsappService.sendMessage(from, `❌ Error verifying Meter: ${e.message}. Please try again.`);
          }
          return res.status(200).json({ status: 'ok' });
        }

        // Handle Amount Input for Power
        if (session?.step === 'AWAITING_AMOUNT') {
          const amount = parseFloat(text);
          if (isNaN(amount) || amount < 500) {
            await whatsappService.sendMessage(from, `❌ Invalid amount. Minimum is ₦500.`);
            return res.status(200).json({ status: 'ok' });
          }
          
          await whatsappService.updateSession(from, { price: amount, planName: `${session.network} Electricity`, step: 'AWAITING_CONFIRMATION' });
          const summary = `📝 *Order Confirmation*\n\n🔹 *Service:* ${session.service}\n🔹 *Provider:* ${session.network}\n🔹 *Customer:* ${session.customerName}\n🔹 *Meter:* ${session.phone}\n💰 *Amount:* ₦${amount}\n\nProceed with purchase?`;
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
            await whatsappService.sendMessage(from, `🚀 *Awesome! Let's get you started.*\n\nWhat would you like your *Username* to be?`);
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

          if (buttonId === 'GENERATE_VA') {
            const user = await whatsappService.getUserByPhone(from);
            if (!user) return;
            
            const email = user.email || user.emailAddress || user.email_address;
            if (!email) {
              await whatsappService.sendMessage(from, `❌ *Email Missing*\n\nWe couldn't find an email address for your account. Please update your profile on our website (https://oplug.com.ng/profile) first.`);
              return;
            }

            await whatsappService.sendMessage(from, `⏳ Generating your dedicated virtual account...`);
            try {
              const res = await (whatsappService as any).generateVirtualAccount({
                email: email,
                firstName: user.username,
                lastName: 'Oplug',
                phone: user.phone || from,
                reference: `REF-${user.id}-${Date.now()}`
              });

              if (res.status && res.data) {
                const account = res.data.account[0];
                const db = admin.firestore();
                await db.collection('users').doc(user.id).update({
                  virtualAccount: {
                    account_number: account.account_number,
                    account_name: account.account_name,
                    bank_name: account.bank_name,
                    bank_id: account.bank_id,
                    reference: res.data.reference
                  }
                });
                await handleFunding(from);
              } else {
                await whatsappService.sendMessage(from, `❌ Failed to generate account: ${res.message || 'Unknown error'}`);
              }
            } catch (e: any) {
              await whatsappService.sendMessage(from, `❌ Error: ${e.message}`);
            }
          }

          if (buttonId === 'PAYSTACK_LINK') {
            const user = await whatsappService.getUserByPhone(from);
            const email = user?.email || user?.emailAddress || `${from}@oplug.bot`;
            try {
              await whatsappService.sendMessage(from, `⏳ Generating payment details...`);
              const payment = await whatsappService.initializePaystackPayment(email, 1000, { phone: from });
              
              if (payment.data?.status === 'send_birthday' || payment.data?.status === 'send_otp' || payment.data?.status === 'open_url') {
                 const checkoutUrl = payment.data.authorization_url;
                 await whatsappService.sendMessage(from, `🔗 *Paystack Payment Link*\n\n${checkoutUrl}\n\n_Use this link to pay via Card or Bank Transfer._`);
              } else if (payment.data?.bank?.account_number) {
                 const bank = payment.data.bank;
                 const body = `🏦 *Bank Transfer Details*\n\n🏛️ *Bank:* ${bank.name}\n🔢 *Account Number:* ${bank.account_number}\n👤 *Account Name:* Oplug / Paystack\n💰 *Amount:* ₦1,000\n\n_Please make the transfer within 30 minutes. Your wallet will be credited automatically._`;
                 await whatsappService.sendMessage(from, body);
              } else {
                 const checkoutUrl = payment.data.authorization_url || `https://checkout.paystack.com/${payment.data.access_code}`;
                 await whatsappService.sendMessage(from, `🔗 *Paystack Payment Link*\n\n${checkoutUrl}\n\n_Use this link to pay securely._`);
              }
            } catch (e) {
              await whatsappService.sendMessage(from, `❌ Failed to generate payment details.`);
            }
          }

          if (buttonId === 'CANCEL_PURCHASE') {
            await whatsappService.clearSession(from);
            await whatsappService.sendMessage(from, `❌ *Transaction Cancelled.*`);
            const user = await whatsappService.getUserByPhone(from);
            if (user) await sendWelcomeMenu(from, user.username, user.walletBalance, user.phone);
            else await sendGuestMenu(from);
          }
        }

        // List Replies
        if (interactive.type === 'list_reply') {
          const listId = interactive.list_reply.id;
          const listTitle = interactive.list_reply.title;

          // Handle Network/Provider Selection
          if (['MTN', 'AIRTEL', 'GLO', '9MOBILE', 'DSTV', 'GOTV', 'STARTIMES', 'IKEJA-ELECTRIC', 'EKO-ELECTRIC', 'KANO-ELECTRIC', 'PORTHARCOURT-ELECTRIC', 'JOS-ELECTRIC', 'IBADAN-ELECTRIC', 'KADUNA-ELECTRIC', 'ABUJA-ELECTRIC', 'ENUGU-ELECTRIC', 'BENIN-ELECTRIC'].includes(listId)) {
            if (!session) return res.status(200).json({ status: 'ok' });
            const service = session.service;
            if (service === 'DATA') {
              const plans = await (whatsappService as any).getPlansForList(listId, 'DATA', 1);
              if (plans.length > 0) {
                await whatsappService.updateSession(from, { network: listId, step: 'AWAITING_PHONE' });
                await whatsappService.sendMessage(from, `Please enter the *Phone Number* for the ${listId} Data:`);
              } else {
                await whatsappService.sendMessage(from, `❌ No plans found for ${listId}.`);
              }
            } else if (service === 'AIRTIME') {
              await whatsappService.updateSession(from, { network: listId, step: 'AWAITING_PHONE' });
              await whatsappService.sendMessage(from, `Please enter the *Phone Number* for the ${listId} Airtime:`);
            } else if (service === 'CABLE') {
              await whatsappService.updateSession(from, { network: listId, step: 'AWAITING_IUC' });
              await whatsappService.sendMessage(from, `Please enter your *${listId} IUC Number*:`);
            } else if (service === 'POWER') {
              await whatsappService.updateSession(from, { network: listId, step: 'AWAITING_METER' });
              await whatsappService.sendMessage(from, `Please enter your *${listId} Meter Number*:`);
            }
          } else if (listId === 'FUND_WALLET') {
            await handleFunding(from);
          } else if (listId === 'SUPPORT') {
            await whatsappService.sendMessage(from, `👨‍💻 *Oplug Support*\n\nFor any issues or inquiries, please contact our support team on WhatsApp: https://wa.me/2348142452729`);
          } else if (['AIRTIME', 'DATA', 'CABLE', 'POWER'].includes(listId)) {
            await whatsappService.updateSession(from, { service: listId, server: 1, step: 'AWAITING_NETWORK' });
            
            let providers: any[] = [];
            if (listId === 'AIRTIME') {
              providers = [
                { id: 'MTN', title: 'MTN', description: 'MTN Nigeria' },
                { id: 'AIRTEL', title: 'Airtel', description: 'Airtel Africa' },
                { id: 'GLO', title: 'Glo', description: 'Globacom' },
                { id: '9MOBILE', title: '9mobile', description: '9mobile Nigeria' }
              ];
            } else if (listId === 'CABLE') {
              providers = await (whatsappService as any).getCableProviders();
            } else if (listId === 'POWER') {
              providers = await (whatsappService as any).getElectricityProviders();
            }
            await whatsappService.sendInteractiveList(from, `Select your *${listId}* Provider:`, "View Providers", [{ title: "Providers", rows: providers }]);
          }
 else if (listId.startsWith('PLAN_')) {
            const planId = listId.replace('PLAN_', '');
            // Extract price from description if possible or fetch from DB
            // For now, let's assume we store it in the session or fetch it again
            const db = admin.firestore();
            const planDoc = await db.collection('manual_pricing').doc(planId).get();
            const planData = planDoc.data();
            
            const price = planData?.user_price || 0;
            const planName = planData?.plan_name || listTitle;

            if (session?.service === 'CABLE') {
              await whatsappService.updateSession(from, { planId, price, planName, step: 'AWAITING_CONFIRMATION' });
              const summary = `📝 *Order Confirmation*\n\n🔹 *Service:* ${session.service}\n🔹 *Provider:* ${session.network}\n🔹 *Customer:* ${session.customerName}\n🔹 *IUC:* ${session.phone}\n🔹 *Plan:* ${planName}\n💰 *Price:* ₦${price}\n\nProceed with purchase?`;
              await whatsappService.sendInteractiveButtons(from, summary, [
                { id: 'CONFIRM_PURCHASE', title: 'Confirm ✅' },
                { id: 'CANCEL_PURCHASE', title: 'Cancel ❌' }
              ]);
            } else {
              await whatsappService.updateSession(from, { 
                planId: planId, 
                planName: planName,
                price: price,
                step: 'AWAITING_PHONE' 
              });
              await whatsappService.sendMessage(from, `✨ *Great!* You've selected *${planName}* (₦${price}).\n\nPlease enter the *Phone Number* you want to fund:`);
            }
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
      serviceType = 'data';
      payload = {
        network: session.network,
        plan: session.planId,
        mobile_number: session.phone,
        Ported_number: true
      };
    } else if (session.service === 'AIRTIME') {
      serviceType = 'airtime';
      payload = {
        network: session.network,
        amount: session.price,
        mobile_number: session.phone,
        Ported_number: true,
        airtime_type: 'VTU'
      };
    } else if (session.service === 'CABLE') {
      serviceType = 'cable';
      payload = {
        serviceID: session.network.toLowerCase(),
        plan: session.planId,
        iucNum: session.phone
      };
    } else if (session.service === 'POWER') {
      serviceType = 'electricity';
      payload = {
        serviceID: session.network.toLowerCase(),
        meterNum: session.phone,
        meterType: 1,
        amount: session.price
      };
    }

      const result = await whatsappService.executePurchase(user.id, serviceType, {
      amount: session.price,
      network: session.network,
      server: 1,
      payload
    });

    if (result.status) {
      const newBalance = user.walletBalance - session.price;
      await whatsappService.sendMessage(from, `✅ *Transaction Successful!*\n\nYour *${session.service}* order for *${session.phone}* has been processed successfully.\n\n💰 *New Balance:* ₦${newBalance.toLocaleString()}\n\n_Powered by OBA TECHNOLOGIES ❤️_`);
      await whatsappService.clearSession(from);
      const updatedUser = await whatsappService.getUserByPhone(from);
      if (updatedUser) await sendWelcomeMenu(from, updatedUser.username, updatedUser.walletBalance, updatedUser.phone);
    }
  } catch (e: any) {
    await whatsappService.sendMessage(from, `❌ *Transaction Failed*\n\nReason: ${e.message}\n\n_Please try again or contact support._`);
    await whatsappService.clearSession(from);
  }
}

async function sendWelcomeMenu(from: string, username: string, balance: number, phone?: string) {
  const body = `Welcome to *Oplug* 🌟\n\n👤 *${username}*\n📱 ${phone || from}\n💰 *Balance:* ₦${balance.toLocaleString()}\n\n_Choose a service to get started:_`;
  await whatsappService.sendInteractiveButtons(from, body, [
    { id: 'CHOOSE_SERVICE', title: 'Select a Service 🛒' }
  ]);
}

async function sendGuestMenu(from: string) {
  const body = `Welcome to *Oplug* 🌟\n\n👤 *User not found*\n\nIt seems you don't have an account with us yet. Please choose an option below:`;
  await whatsappService.sendInteractiveButtons(from, body, [
    { id: 'CREATE_ACCOUNT', title: 'Create Account 🚀' },
    { id: 'GUEST_PURCHASE', title: 'Guest Purchase 🛒' }
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
  if (!user) {
    await whatsappService.sendMessage(from, `❌ *Account Required*\n\nYou need an account to fund your wallet. Please use the "Create Account" button.`);
    return;
  }

  // If user has a virtual account, show it
  if (user.virtualAccount) {
    const va = user.virtualAccount;
    const body = `🏦 *Your Dedicated Virtual Account*\n\n🏛️ *Bank:* ${va.bank_name}\n🔢 *Account Number:* ${va.account_number}\n👤 *Account Name:* ${va.account_name}\n\n_Transfer any amount to this account to fund your wallet instantly!_`;
    await whatsappService.sendMessage(from, body);
    return;
  }

  // Otherwise, offer to generate one or use Paystack
  const body = `💳 *Fund Your Wallet*\n\nYou don't have a dedicated virtual account yet. Would you like to generate one or use a one-time payment link?`;
  await whatsappService.sendInteractiveButtons(from, body, [
    { id: 'GENERATE_VA', title: 'Generate Account 🏦' },
    { id: 'PAYSTACK_LINK', title: 'Payment Link 🔗' }
  ]);
}
