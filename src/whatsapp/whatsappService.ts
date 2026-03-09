import axios from 'axios';

export const whatsappService = {
  getToken: () => process.env.WHATSAPP_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN,
  getPhoneId: () => process.env.WHATSAPP_PHONE_NUMBER_ID,

  async sendMessage(to: string, text: string) {
    const token = this.getToken();
    const phoneId = this.getPhoneId();
    if (!token || !phoneId) return;

    try {
      await axios.post(
        `https://graph.facebook.com/v21.0/${phoneId}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body: text }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error: any) {
      console.error('WhatsApp Send Error:', error.response?.data || error.message);
    }
  },

  async sendInteractiveButtons(to: string, body: string, buttons: { id: string, title: string }[]) {
    const token = this.getToken();
    const phoneId = this.getPhoneId();
    if (!token || !phoneId) return;

    try {
      await axios.post(
        `https://graph.facebook.com/v21.0/${phoneId}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          type: 'interactive',
          interactive: {
            type: 'button',
            body: { text: body },
            action: {
              buttons: buttons.map(b => ({
                type: 'reply',
                reply: { id: b.id, title: b.title }
              }))
            }
          }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error: any) {
      console.error('WhatsApp Buttons Error:', error.response?.data || error.message);
    }
  },

  async sendInteractiveList(to: string, body: string, buttonText: string, sections: { title: string, rows: { id: string, title: string, description?: string }[] }[]) {
    const token = this.getToken();
    const phoneId = this.getPhoneId();
    if (!token || !phoneId) return;

    try {
      await axios.post(
        `https://graph.facebook.com/v21.0/${phoneId}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          type: 'interactive',
          interactive: {
            type: 'list',
            body: { text: body },
            action: {
              button: buttonText,
              sections: sections.map(s => ({
                title: s.title,
                rows: s.rows.map(r => ({
                  id: r.id,
                  title: r.title,
                  description: r.description
                }))
              }))
            }
          }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error: any) {
      console.error('WhatsApp List Error:', error.response?.data || error.message);
    }
  },

  async updateSession(phone: string, data: any) {
    const admin = (await import('firebase-admin'));
    const db = admin.firestore();
    await db.collection('whatsapp_sessions').doc(phone).set(data, { merge: true });
  },

  async getSession(phone: string) {
    const admin = (await import('firebase-admin'));
    const db = admin.firestore();
    const doc = await db.collection('whatsapp_sessions').doc(phone).get();
    return doc.exists ? doc.data() : null;
  },

  async clearSession(phone: string) {
    const admin = (await import('firebase-admin'));
    const db = admin.firestore();
    await db.collection('whatsapp_sessions').doc(phone).delete();
  },

  async getUserByPhone(phone: string) {
    const admin = (await import('firebase-admin'));
    const db = admin.firestore();
    // Try exact match
    let snapshot = await db.collection('users').where('phone', '==', phone).limit(1).get();
    if (snapshot.empty) {
      // Try with 0 instead of 234
      const localPhone = phone.replace(/^234/, '0');
      snapshot = await db.collection('users').where('phone', '==', localPhone).limit(1).get();
    }
    return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  }
};

export function getAppUrl() {
  return process.env.APP_URL || 'https://oplug.vercel.app';
}
