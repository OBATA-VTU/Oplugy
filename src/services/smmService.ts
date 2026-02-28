export const smmService = {
  async getServices() {
    try {
      const response = await fetch('/api/proxy-smm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'services' })
      });
      return await response.json();
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
