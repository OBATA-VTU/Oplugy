export default function handler(req, res) {
  // This handles the GET request from Meta for verification
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    } else {
      return res.status(403).send('Forbidden');
    }
  }
  
  // This will handle the POST request later when you start receiving messages
  res.status(200).send('EVENT_RECEIVED');
}