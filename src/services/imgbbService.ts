import { ApiResponse } from '../types';

export const imgbbService = {
  async uploadImage(base64Image: string): Promise<ApiResponse<string>> {
    const apiKey = "a4aa97ad337019899bb59b4e94b149e0"; 
    try {
      const formData = new FormData();
      formData.append('image', base64Image.split(',')[1] || base64Image);
      
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData
      });
      
      const res = await response.json();
      if (res.success) {
        return { status: true, data: res.data.url, message: 'Upload successful' };
      }
      return { status: false, message: res.error?.message || 'Upload failed' };
    } catch (e: any) {
      return { status: false, message: e.message };
    }
  }
};