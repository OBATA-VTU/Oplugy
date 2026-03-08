import { VercelRequest, VercelResponse } from '@vercel/node';
import { whatsappService, getAppUrl } from '../../src/whatsapp/whatsappService';
import { initializeFirebaseAdmin } from '../../src/firebase/admin';
import axios from 'axios';
import { GoogleGenAI } from "@google/genai";

// Initialize Firebase Admin for this serverless function
const admin = initializeFirebaseAdmin();

let ai: GoogleGenAI | null = null;

function getAi() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const timestamp = new Date().toISOString();
  console.log(`[WhatsApp Webhook] [${timestamp}] Incoming Request: ${req.method}`);
  
  // GET: Webhook Verification
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || 'oplug_vtu_bot_2024';
    
    console.log(`[WhatsApp Webhook] Verification - Mode: ${mode}, Token: ${token}, Expected: ${expectedToken}`);

    if (mode === 'subscribe' && token === expectedToken) {
      console.log(`[WhatsApp Webhook] Verification SUCCESS`);
      // Vercel requires sending the challenge as a plain string for Meta verification
      return res.status(200).send(challenge);
    } else {
      console.error(`[WhatsApp Webhook] Verification FAILED. Token mismatch or invalid mode.`);
      return res.status(403).json({ error: 'Verification failed', received: token, expected: expectedToken });
    }
  }

  // POST: Message Handling
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

      // Deduplication (using global set, though serverless functions are ephemeral)
      if (!(global as any).processedMessages) (global as any).processedMessages = new Set();
      if ((global as any).processedMessages.has(messageId)) {
        return res.status(200).json({ status: 'ok' });
      }
      (global as any).processedMessages.add(messageId);
      if ((global as any).processedMessages.size > 100) {
        const first = (global as any).processedMessages.values().next().value;
        (global as any).processedMessages.delete(first);
      }

      const session = await whatsappService.getSession(from);

      if (message.type === 'text') {
        const text = message.text.body.trim();
        console.log(`WhatsApp Text Message from ${from}: ${text}`);

        if (session && session.step && session.step !== 'IDLE') {
          // Registration Flow
          if (session.step === 'AWAITING_FIRST_NAME') {
            await whatsappService.updateSession(from, { firstName: text, step: 'AWAITING_LAST_NAME' });
            await whatsappService.sendMessage(from, `✨ *Nice to meet you, ${text}!*\n\nNow, what is your *Last Name*?`);
            return res.status(200).json({ status: 'ok' });
          }

          if (session.step === 'AWAITING_LAST_NAME') {
            await whatsappService.updateSession(from, { lastName: text, step: 'AWAITING_USERNAME' });
            await whatsappService.sendMessage(from, `📝 *Almost there!*\n\nChoose a unique *Username* for your account:`);
            return res.status(200).json({ status: 'ok' });
          }

          if (session.step === 'AWAITING_USERNAME') {
            await whatsappService.updateSession(from, { username: text, step: 'AWAITING_EMAIL' });
            await whatsappService.sendMessage(from, `📧 *Perfect!* Now please provide your *Email Address* to complete your registration.`);
            return res.status(200).json({ status: 'ok' });
          }

          if (session.step === 'AWAITING_EMAIL') {
            const email = text.toLowerCase();
            if (!email.includes('@')) {
              await whatsappService.sendMessage(from, `❌ Invalid email format. Please provide a valid email address.`);
              return res.status(200).json({ status: 'ok' });
            }

            try {
              const db = admin.firestore();
              const tempPassword = Math.random().toString(36).slice(-8);
              const userRecord = await admin.auth().createUser({
                email: email,
                password: tempPassword,
                displayName: `${session.firstName} ${session.lastName}`,
                phoneNumber: from.startsWith('+') ? from : `+${from}`
              });

              const userData = {
                id: userRecord.uid,
                firstName: session.firstName,
                lastName: session.lastName,
                fullName: `${session.firstName} ${session.lastName}`,
                username: session.username.toLowerCase(),
                email: email,
                phone: from,
                walletBalance: 0,
                role: 'user',
                status: 'active',
                referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
                referralEarnings: 0,
                referralCount: 0,
                isPinSet: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
              };

              await db.collection('users').doc(userRecord.uid).set(userData);
              await whatsappService.clearSession(from);
              await whatsappService.sendMessage(from, `🎉 *Account Created Successfully!*\n\nWelcome to Oplug, ${session.firstName}. You can now fund your wallet and start purchasing services.`);
              await sendWelcomeMenu(from, session.username, 0, email, from);
            } catch (e: any) {
              console.error('WhatsApp Registration Error:', e);
              await whatsappService.sendMessage(from, `❌ Error creating account: ${e.message}`);
            }
            return res.status(200).json({ status: 'ok' });
          }

          // Purchase Flows
          if (session.step === 'AWAITING_PHONE') {
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

          if (session.step === 'AWAITING_AIRTIME_AMOUNT') {
            const amount = parseFloat(text);
            if (isNaN(amount) || amount < 50 || amount > 50000) {
              await whatsappService.sendMessage(from, `❌ *Invalid Amount*\n\nPlease enter a valid amount between ₦50 and ₦50,000.`);
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

          if (session.step === 'AWAITING_IUC') {
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

          if (session.step === 'AWAITING_FUNDING_AMOUNT') {
            const amount = parseFloat(text);
            if (isNaN(amount) || amount < 100) {
              await whatsappService.sendMessage(from, `❌ Invalid amount. Minimum is ₦100.`);
              return res.status(200).json({ status: 'ok' });
            }

            await whatsappService.updateSession(from, { amount, step: 'AWAITING_FUNDING_METHOD' });
            await whatsappService.sendInteractiveButtons(from, `💳 *Select Payment Method*\n\nYou want to fund *₦${amount}*.\n\nHow would you like to pay?`, [
              { id: 'PS_CARD', title: 'Card 💳' },
              { id: 'PS_TRANSFER', title: 'Transfer 🏦' }
            ]);
            return res.status(200).json({ status: 'ok' });
          }

          if (session.step === 'AWAITING_METER') {
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

          if (session.step === 'AWAITING_AMOUNT') {
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
        } else {
          // AI Interaction
          const user = await whatsappService.getUserByPhone(from);
          const aiResponse = await handleAiInteraction(from, text, user);
          
          if (aiResponse.intent === 'PURCHASE') {
            await whatsappService.updateSession(from, { step: 'IDLE', service: aiResponse.service });
            await sendServiceList(from, `I see you want to buy ${aiResponse.service}. Please select a provider:`);
          } else if (aiResponse.intent === 'GREETING') {
            if (user) {
              await sendWelcomeMenu(from, user.username, user.walletBalance, user.email || 'Not Set', user.phone);
            } else {
              await sendGuestMenu(from);
            }
          } else {
            await whatsappService.sendMessage(from, aiResponse.text);
          }
        }
        return res.status(200).json({ status: 'ok' });
      }

      // Interactive Responses
      if (message.type === 'interactive') {
        const interactive = message.interactive;
        const session = await whatsappService.getSession(from);
        
        if (interactive.type === 'button_reply') {
          const buttonId = interactive.button_reply.id;

          if (buttonId === 'CREATE_ACCOUNT') {
            await whatsappService.updateSession(from, { step: 'AWAITING_FIRST_NAME' });
            await whatsappService.sendMessage(from, `🚀 *Awesome! Let's get you started.*\n\nWhat is your *First Name*?`);
          }

          if (buttonId === 'GUEST_PURCHASE' || buttonId === 'CHOOSE_SERVICE') {
            await sendServiceList(from, "Select a Service");
          }

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

          if (buttonId === 'CONFIRM_PURCHASE') {
            await handleExecutePurchase(from, session);
          }

          if (buttonId === 'GENERATE_VA') {
            const user = await whatsappService.getUserByPhone(from);
            if (!user) return res.status(200).json({ status: 'ok' });
            
            const email = user.email || user.emailAddress || user.email_address;
            if (!email || email.includes('oplug.bot')) {
              await whatsappService.sendMessage(from, `❌ *Email Missing*\n\nPlease update your profile on our website first.`);
              return res.status(200).json({ status: 'ok' });
            }

            await whatsappService.sendMessage(from, `⏳ Generating your dedicated virtual account...`);
            try {
              const resVA = await whatsappService.generateVirtualAccount({
                email: email,
                firstName: user.username,
                lastName: 'Oplug',
                phone: user.phone || from,
                reference: `REF-${user.id}-${Date.now()}`
              });

              if (resVA.status && resVA.data) {
                const account = Array.isArray(resVA.data.account) ? resVA.data.account[0] : resVA.data.account;
                if (account) {
                  const db = admin.firestore();
                  await db.collection('users').doc(user.id).update({
                    virtualAccount: {
                      account_number: account.account_number,
                      account_name: account.account_name,
                      bank_name: account.bank_name,
                      bank_id: account.bank_id,
                      reference: resVA.data.reference
                    }
                  });
                  await handleFunding(from);
                }
              } else {
                await whatsappService.sendMessage(from, `❌ Failed: ${resVA.message}`);
              }
            } catch (e: any) {
              await whatsappService.sendMessage(from, `❌ Error: ${e.message}`);
            }
          }

          if (buttonId === 'PAYSTACK_FUNDING') {
            await whatsappService.updateSession(from, { step: 'AWAITING_FUNDING_AMOUNT' });
            await whatsappService.sendMessage(from, `💰 *Fund with Paystack*\n\nHow much would you like to add to your wallet? (Min: ₦100)`);
          }

          if (buttonId === 'PS_CARD' || buttonId === 'PS_TRANSFER') {
            const user = await whatsappService.getUserByPhone(from);
            if (!user || !session?.amount) return res.status(200).json({ status: 'ok' });

            await whatsappService.sendMessage(from, `⏳ Generating your payment link...`);
            try {
              const resPS = await axios.post(`${getAppUrl()}/api/proxy?server=paystack&endpoint=transaction/initialize`, {
                email: user.email,
                amount: session.amount * 100,
                callback_url: `${getAppUrl()}/dashboard`,
                metadata: { userId: user.id, type: 'FUNDING' }
              });

              if (resPS.data.status) {
                await whatsappService.sendMessage(from, `🔗 *Payment Link Generated*\n\nClick the link below to pay ₦${session.amount}:\n\n${resPS.data.data.authorization_url}`);
                await whatsappService.clearSession(from);
              }
            } catch (e: any) {
              await whatsappService.sendMessage(from, `❌ Error: ${e.message}`);
            }
          }

          if (buttonId === 'CANCEL_PURCHASE') {
            await whatsappService.clearSession(from);
            await whatsappService.sendMessage(from, `❌ *Transaction Cancelled.*`);
          }
        }

        if (interactive.type === 'list_reply') {
          const listId = interactive.list_reply.id;
          const listTitle = interactive.list_reply.title;

          if (['MTN', 'AIRTEL', 'GLO', '9MOBILE', 'DSTV', 'GOTV', 'STARTIMES', 'IKEJA-ELECTRIC', 'EKO-ELECTRIC', 'KANO-ELECTRIC', 'PORTHARCOURT-ELECTRIC', 'JOS-ELECTRIC', 'IBADAN-ELECTRIC', 'KADUNA-ELECTRIC', 'ABUJA-ELECTRIC', 'ENUGU-ELECTRIC', 'BENIN-ELECTRIC'].includes(listId)) {
            if (!session) return res.status(200).json({ status: 'ok' });
            const service = session.service;
            if (service === 'DATA' || service === 'AIRTIME') {
              await whatsappService.updateSession(from, { network: listId, step: 'AWAITING_PHONE' });
              await whatsappService.sendMessage(from, `Please enter the *Phone Number* for the ${listId} ${service}:`);
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
            await whatsappService.sendMessage(from, `👨‍💻 *Oplug Support*\n\nContact us: https://wa.me/2348142452729`);
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
          } else if (listId.startsWith('PLAN_')) {
            const planId = listId.replace('PLAN_', '');
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
              await whatsappService.updateSession(from, { planId, planName, price, step: 'AWAITING_PHONE' });
              await whatsappService.sendMessage(from, `✨ Selected *${planName}* (₦${price}).\n\nPlease enter the *Phone Number*:`);
            }
          } else if (listId.startsWith('AMT_')) {
            const amount = parseInt(listId.replace('AMT_', ''));
            await whatsappService.updateSession(from, { planName: `₦${amount} Airtime`, price: amount, step: 'AWAITING_PHONE' });
            await whatsappService.sendMessage(from, `Please enter the *Phone Number* for Airtime:`);
          }
        }
        return res.status(200).json({ status: 'ok' });
      }
    }
  }
  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleAiInteraction(from: string, text: string, user: any) {
  try {
    const response = await getAi().models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are Oplug AI, a smart assistant for Oplug VTU platform. 
      The user says: "${text}"
      User Context: ${user ? `Username: ${user.username}, Balance: ₦${user.walletBalance}` : 'Guest User'}
      
      Available Services: Airtime, Data, Cable TV, Electricity, Education Pins.
      
      Tasks:
      1. Detect if the user wants to purchase a service.
      2. If they want to purchase, respond with JSON: {"intent": "PURCHASE", "service": "AIRTIME|DATA|CABLE|POWER|EDUCATION"}
      3. If it's a greeting, respond with JSON: {"intent": "GREETING"}
      4. Otherwise, respond with a helpful text message in JSON: {"intent": "CHAT", "text": "your response here"}
      
      Respond ONLY with JSON.`,
      config: { responseMimeType: "application/json" }
    });

    return JSON.parse(response.text || '{"intent": "CHAT", "text": "I am here to help!"}');
  } catch (e) {
    console.error('AI Error:', e);
    return { intent: "CHAT", "text": "I'm Oplug AI. How can I help you today?" };
  }
}

async function handleExecutePurchase(from: string, session: any) {
  const user = await whatsappService.getUserByPhone(from);
  if (!user) {
    await whatsappService.sendMessage(from, `❌ Account required.`);
    return;
  }

  try {
    await whatsappService.sendMessage(from, `⏳ Processing...`);
    let serviceType = '';
    let payload: any = {};
    
    if (session.service === 'DATA') {
      serviceType = 'data';
      payload = { network: session.network, plan: session.planId, mobile_number: session.phone, Ported_number: true };
    } else if (session.service === 'AIRTIME') {
      serviceType = 'airtime';
      payload = { network: session.network, amount: session.price, mobile_number: session.phone, Ported_number: true, airtime_type: 'VTU' };
    } else if (session.service === 'CABLE') {
      serviceType = 'cable';
      payload = { serviceID: session.network.toLowerCase(), plan: session.planId, iucNum: session.phone };
    } else if (session.service === 'POWER') {
      serviceType = 'electricity';
      payload = { serviceID: session.network.toLowerCase(), meterNum: session.phone, meterType: 1, amount: session.price };
    }

    const result = await whatsappService.executePurchase(user.id, serviceType, {
      amount: session.price,
      network: session.network,
      server: 1,
      payload
    });

    if (result.status) {
      await whatsappService.sendMessage(from, `✅ *Successful!*\n\nOrder for *${session.phone}* processed.\n\n_Powered by Oplug ❤️_`);
      await whatsappService.clearSession(from);
    }
  } catch (e: any) {
    await whatsappService.sendMessage(from, `❌ *Failed*: ${e.message}`);
    await whatsappService.clearSession(from);
  }
}

async function sendWelcomeMenu(from: string, username: string, balance: number, email: string, phone?: string) {
  const body = `Welcome to *Oplug* 🌟\n\n👤 *${username}*\n💰 *Balance:* ₦${balance.toLocaleString()}\n\n_Choose a service:_`;
  await whatsappService.sendInteractiveButtons(from, body, [{ id: 'CHOOSE_SERVICE', title: 'Select a Service 🛒' }]);
}

async function sendGuestMenu(from: string) {
  const body = `Welcome to *Oplug* 🌟\n\n👤 *User not found*\n\nPlease choose an option:`;
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
        { id: 'AIRTIME', title: 'Airtime', description: 'Top up airtime' },
        { id: 'DATA', title: 'Data Bundle', description: 'Cheap data' },
        { id: 'CABLE', title: 'Cable TV', description: 'DSTV, GOTV, Startimes' },
        { id: 'POWER', title: 'Electricity', description: 'Bills' }
      ]
    },
    {
      title: "Others",
      rows: [
        { id: 'FUND_WALLET', title: 'Fund Wallet', description: 'Add money' },
        { id: 'SUPPORT', title: 'Support', description: 'Chat with us' }
      ]
    }
  ];
  await whatsappService.sendInteractiveList(from, title, "View Services", sections);
}

async function handleFunding(from: string) {
  const user = await whatsappService.getUserByPhone(from);
  if (!user) return;

  if (user.virtualAccount) {
    const va = user.virtualAccount;
    const body = `🏦 *Virtual Account*\n\n🏛️ *Bank:* ${va.bank_name}\n🔢 *Number:* ${va.account_number}\n👤 *Name:* ${va.account_name}`;
    await whatsappService.sendMessage(from, body);
  } else {
    const body = `💳 *Fund Wallet*\n\nGenerate a virtual account or use Paystack?`;
    await whatsappService.sendInteractiveButtons(from, body, [
      { id: 'GENERATE_VA', title: 'Generate Account 🏦' },
      { id: 'PAYSTACK_FUNDING', title: 'Paystack 💳' }
    ]);
  }
}
