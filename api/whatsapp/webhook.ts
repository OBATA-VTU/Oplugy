import { VercelRequest, VercelResponse } from '@vercel/node';
import { whatsappService } from '../../src/whatsapp/whatsappService';
import { initializeFirebaseAdmin } from '../../src/firebase/admin';
import { GoogleGenAI } from "@google/genai";

// Initialize Firebase Admin
initializeFirebaseAdmin();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Handle Verification (GET)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'oplug_vtu_bot_2024';

    if (mode === 'subscribe' && token === verifyToken) {
      console.log('[WhatsApp Webhook] Verification successful');
      return res.status(200).send(challenge);
    } else {
      console.warn('[WhatsApp Webhook] Verification failed');
      return res.status(403).send('Forbidden');
    }
  }

  // 2. Handle Messages (POST)
  if (req.method === 'POST') {
    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;
      const message = value?.messages?.[0];

      if (message) {
        const from = message.from;
        const type = message.type;
        let text = '';

        if (type === 'text') {
          text = message.text.body;
        } else if (type === 'interactive') {
          const interactive = message.interactive;
          if (interactive.type === 'button_reply') {
            text = interactive.button_reply.id;
          } else if (interactive.type === 'list_reply') {
            text = interactive.list_reply.id;
          }
        }

        if (text) {
          try {
            await handleMessage(from, text);
          } catch (error: any) {
            console.error('[WhatsApp Webhook] Message Handling Error:', error.message);
          }
        }
      }
      return res.status(200).json({ status: 'ok' });
    }
    return res.status(404).json({ status: 'not_found' });
  }

  return res.status(405).json({ status: 'method_not_allowed' });
}

async function handleMessage(from: string, text: string) {
  const session = await whatsappService.getSession(from);
  const user = await whatsappService.getUserByPhone(from);

  // Simple Command Handling
  if (text.toUpperCase() === 'START' || text.toUpperCase() === 'MENU' || text.toUpperCase() === 'HI' || text.toUpperCase() === 'HELLO') {
    await whatsappService.clearSession(from);
    if (user) {
      return sendWelcomeMenu(from, user);
    } else {
      return sendGuestMenu(from);
    }
  }

  // Handle Session State
  if (session) {
    return handleSession(from, text, session, user);
  }

  // AI Fallback
  return handleAiInteraction(from, text, user);
}

async function sendWelcomeMenu(from: string, user: any) {
  const body = `Welcome back to *Oplug*, ${user.username}! 🌟\n\n💰 *Balance:* ₦${(user.walletBalance || 0).toLocaleString()}\n\nWhat would you like to do today?`;
  await whatsappService.sendInteractiveButtons(from, body, [
    { id: 'BUY_SERVICES', title: 'Buy Services 🛒' },
    { id: 'CHECK_BALANCE', title: 'Check Balance 💰' },
    { id: 'TALK_TO_AI', title: 'Ask AI 🤖' }
  ]);
}

async function sendGuestMenu(from: string) {
  const body = `Welcome to *Oplug*! 🌟\n\nNigeria's most reliable VTU platform. You are currently not logged in.\n\n_Please choose an option:_`;
  await whatsappService.sendInteractiveButtons(from, body, [
    { id: 'REGISTER', title: 'Register 📝' },
    { id: 'LOGIN_HELP', title: 'Login Help 🔑' },
    { id: 'ABOUT_US', title: 'About Oplug ℹ️' }
  ]);
}

async function handleSession(from: string, text: string, session: any, user: any) {
  // Implementation of session logic (e.g. registration flow, purchase flow)
  // For brevity, I'll implement a simple registration flow
  if (session.step === 'AWAITING_USERNAME') {
    await whatsappService.updateSession(from, { username: text, step: 'AWAITING_EMAIL' });
    return whatsappService.sendMessage(from, `Great! Now please provide your *Email Address*:`);
  }
  
  if (session.step === 'AWAITING_EMAIL') {
    // Basic email validation
    if (!text.includes('@')) return whatsappService.sendMessage(from, `❌ Invalid email. Please provide a valid email address:`);
    
    await whatsappService.updateSession(from, { email: text, step: 'AWAITING_PASSWORD' });
    return whatsappService.sendMessage(from, `Almost there! Please set a *Password* for your account:`);
  }

  // ... more session handling ...
  
  // If button clicks
  if (text === 'BUY_SERVICES') {
    return whatsappService.sendInteractiveList(from, 'Select a service category:', 'View Services', [
      {
        title: 'VTU Services',
        rows: [
          { id: 'SVC_AIRTIME', title: 'Airtime 📱', description: 'Top up your mobile' },
          { id: 'SVC_DATA', title: 'Data 🌐', description: 'Cheap data bundles' },
          { id: 'SVC_CABLE', title: 'Cable TV 📺', description: 'DSTV, GOTV, Startimes' },
          { id: 'SVC_POWER', title: 'Electricity 💡', description: 'Pay power bills' }
        ]
      }
    ]);
  }

  if (text === 'REGISTER') {
    await whatsappService.updateSession(from, { step: 'AWAITING_USERNAME' });
    return whatsappService.sendMessage(from, `Welcome! Let's get you registered.\n\nWhat should we call you? (Enter a *Username*):`);
  }

  // Default fallback
  return handleAiInteraction(from, text, user);
}

async function handleAiInteraction(from: string, text: string, user: any) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  
  const systemPrompt = `You are Oplug AI, a helpful assistant for Oplug VTU platform.
  User: ${user ? user.username : 'Guest'}
  Context: Oplug provides Airtime, Data, Cable TV, and Electricity bills at wholesale rates.
  Instructions: Be concise. If the user wants to buy something, guide them to use the menu or type 'START'.`;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `${systemPrompt}\n\nUser Message: ${text}`
    });
    const response = result.text;
    await whatsappService.sendMessage(from, response);
  } catch (error) {
    console.error('AI Error:', error);
    await whatsappService.sendMessage(from, "I'm sorry, I'm having trouble thinking right now. Please type 'START' to see the main menu.");
  }
}
