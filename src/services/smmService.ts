import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';

export const smmService = {
  async getServices() {
    try {
      const [apiResponse, manualPricingSnap] = await Promise.all([
        fetch('/api/proxy-smm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'services' })
        }),
        getDocs(collection(db, "manual_pricing"))
      ]);

      const data = await apiResponse.json();
      const manualPrices: Record<string, any> = {};
      manualPricingSnap.forEach(doc => {
        manualPrices[doc.id] = doc.data();
      });

      if (Array.isArray(data)) {
        return data.map((s: any) => {
          const manual = manualPrices[String(s.service)];
          return {
            ...s,
            name: s.name.replace(/Ogaviral/gi, 'Oplug'),
            manual_prices: manual || null
          };
        });
      }
      return data;
    } catch (error) {
      console.error('SMM Services Error:', error);
      return { status: 'error', message: 'Failed to fetch services' };
    }
  },

  async addOrder(data: { service: string; link: string; quantity: number }) {
    try {
      const response = await fetch('/api/proxy-smm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', data })
      });
      return await response.json();
    } catch (error) {
      console.error('SMM Add Order Error:', error);
      return { status: 'error', message: 'Failed to place order' };
    }
  },

  async getStatus(orderId: string) {
    try {
      const response = await fetch('/api/proxy-smm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'status', data: { order: orderId } })
      });
      return await response.json();
    } catch (error) {
      console.error('SMM Status Error:', error);
      return { status: 'error', message: 'Failed to fetch status' };
    }
  },

  async getBalance() {
    try {
      const response = await fetch('/api/proxy-smm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'balance' })
      });
      return await response.json();
    } catch (error) {
      console.error('SMM Balance Error:', error);
      return { status: 'error', message: 'Failed to fetch balance' };
    }
  }
};
