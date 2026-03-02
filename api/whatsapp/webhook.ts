import { whatsappService } from './whatsappService';
import * as admin from 'firebase-admin';

export default async function handler(req: any, res: any) {
  // 1. Handle Meta Webhook Verification (GET)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      console.log('Meta Webhook Verified.');
      return res.status(200).send(challenge);
    } else {
      console.error('Meta Webhook Verification Failed.');
      return res.status(403).json({ error: 'Verification failed' });
    }
  }

  // 2. Handle Incoming Messages (POST)
  if (req.method === 'POST') {
    const body = req.body;

    // Check if it's a WhatsApp event
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const message = value?.messages?.[0];

      if (message && message.type === 'text') {
        const from = message.from; // User's WhatsApp ID (phone number)
        const text = message.text.body.trim().toUpperCase();
        const userName = value.contacts?.[0]?.profile?.name || 'User';

        console.log(`Received message from ${from}: ${text}`);

        try {
          const user = await whatsappService.getUserByPhone(from);

          if (!user) {
            await whatsappService.sendMessage(
              from,
              `Welcome to Oplug, ${userName}! 👋\n\nYour phone number (${from}) is not registered on our website. Please register at ${process.env.APP_URL} to use this bot.`
            );
            return res.status(200).json({ status: 'ok' });
          }

          const [cmd, ...args] = text.split(' ');

          if (cmd === 'BALANCE') {
            await whatsappService.sendMessage(
              from,
              `Hello ${user.username}, your current wallet balance is ₦${user.walletBalance?.toLocaleString()}.`
            );
            return res.status(200).json({ status: 'ok' });
          }

          if (cmd === 'PLANS') {
            const network = args[0] || 'MTN';
            const plansMessage = await whatsappService.getAvailablePlans(network);
            await whatsappService.sendMessage(from, plansMessage);
            return res.status(200).json({ status: 'ok' });
          }

          if (cmd === 'DATA') {
            if (args.length < 3) {
              await whatsappService.sendMessage(
                from,
                `To buy data, use format:\n*DATA [NETWORK] [PLAN_ID] [PHONE]*\n\nExample: *DATA MTN 1000 08012345678*\n\nReply with *PLANS [NETWORK]* to see available plan IDs.`
              );
              return res.status(200).json({ status: 'ok' });
            }

            const [network, planId, targetPhone] = args;
            
            try {
              // In a real app, we'd fetch the actual price for this planId from Firestore
              const db = admin.firestore();
              const planDoc = await db.collection('manual_pricing').doc(`s1-${network}-${planId}`).get();
              
              if (!planDoc.exists) {
                await whatsappService.sendMessage(from, `Plan ID ${planId} not found for ${network}. Please check *PLANS ${network}*.`);
                return res.status(200).json({ status: 'ok' });
              }

              const planData = planDoc.data();
              const amount = planData?.user_price || 0;

              const result = await whatsappService.executePurchase(user.id, 'data', {
                network,
                amount,
                payload: {
                  serviceID: planId,
                  mobileNumber: targetPhone
                }
              });

              if (result.status) {
                await whatsappService.sendMessage(
                  from,
                  `✅ *Success!* Data bundle has been sent to ${targetPhone}.`
                );
              }
            } catch (err: any) {
              await whatsappService.sendMessage(from, `❌ *Failed:* ${err.message}`);
            }
            return res.status(200).json({ status: 'ok' });
          }

          if (cmd === 'AIRTIME') {
            if (args.length < 3) {
              await whatsappService.sendMessage(
                from,
                `To buy airtime, use format:\n*AIRTIME [NETWORK] [AMOUNT] [PHONE]*\n\nExample: *AIRTIME MTN 100 08012345678*`
              );
              return res.status(200).json({ status: 'ok' });
            }
            
            const [network, amountStr, targetPhone] = args;
            const amount = parseFloat(amountStr);

            if (isNaN(amount) || amount < 50) {
              await whatsappService.sendMessage(from, '❌ Invalid amount. Minimum airtime is ₦50.');
              return res.status(200).json({ status: 'ok' });
            }

            try {
              const result = await whatsappService.executePurchase(user.id, 'airtime', {
                network,
                amount,
                payload: {
                  serviceID: network.toLowerCase(),
                  amount: amount,
                  mobileNumber: targetPhone
                }
              });

              if (result.status) {
                await whatsappService.sendMessage(
                  from,
                  `✅ *Success!* ₦${amount} ${network} airtime has been sent to ${targetPhone}.`
                );
              }
            } catch (err: any) {
              await whatsappService.sendMessage(from, `❌ *Failed:* ${err.message}`);
            }
            return res.status(200).json({ status: 'ok' });
          }

          if (cmd === 'HELP' || text === 'MENU') {
            await whatsappService.sendMessage(
              from,
              `*Oplug Bot Menu:*\n\n• *BALANCE:* Check wallet\n• *PLANS [NET]:* See data plans\n• *DATA [NET] [ID] [PHONE]:* Buy data\n• *AIRTIME [NET] [AMT] [PHONE]:* Buy airtime\n• *HELP:* Show this menu`
            );
            return res.status(200).json({ status: 'ok' });
          }

          // Default Response
          await whatsappService.sendMessage(
            from,
            `Hi ${user.username}! 👋 I didn't recognize that command. Type *HELP* to see what I can do.`
          );

        } catch (error) {
          console.error('WhatsApp Webhook Error:', error);
          await whatsappService.sendMessage(from, '❌ Sorry, an error occurred. Please try again later.');
        }
      }
      return res.status(200).json({ status: 'ok' });
    } else {
      return res.status(404).json({ error: 'Not a WhatsApp event' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
