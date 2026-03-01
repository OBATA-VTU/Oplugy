export default async function handler(req, res) {
  // 1. Handle Meta's Verification (GET)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Forbidden');
  }

  // 2. Handle Incoming Messages (POST)
  if (req.method === 'POST') {
    const body = req.body;

    // Check if this is a WhatsApp message event
    if (body.object === 'whatsapp_business_account' && 
        body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      
      const message = body.entry[0].changes[0].value.messages[0];
      const from = message.from; // Customer's phone number
      const text = message.text?.body?.toLowerCase() || ""; // What they said

      console.log(`Message from ${from}: ${text}`);

      // Basic Bot Logic
      let replyText = "Welcome to Oplug! 🔌\n\nHow can I help you today?\n1. Buy Airtime\n2. Buy Data\n3. Check Balance";

      if (text.includes('airtime')) {
        replyText = "To buy airtime, please visit: https://oplug.vercel.app/airtime";
      } else if (text.includes('data')) {
        replyText = "To buy data, please visit: https://oplug.vercel.app/data";
      }

      // Send the reply back to the customer
      await sendWhatsAppMessage(from, replyText);
    }

    return res.status(200).send('EVENT_RECEIVED');
  }

  res.status(405).send('Method Not Allowed');
}

// Helper function to talk to Meta's API
async function sendWhatsAppMessage(to, text) {
  const url = `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: { body: text },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Meta API Error:', data);
    }
  } catch (error) {
    console.error('Network Error:', error);
  }
}