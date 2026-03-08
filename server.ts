import express from 'express';
import cors from 'cors';
import path from 'path';
import * as admin from 'firebase-admin';
import axios from 'axios';
import crypto from 'crypto';
import { initializeFirebaseAdmin } from './src/firebase/admin';
import handleWhatsAppWebhook from './api/whatsapp/webhook';

// Initialize Firebase Admin
initializeFirebaseAdmin();

const app = express();
const PORT = process.env.PORT || 3000;
const CRA_PORT = 3001;

console.log(`[Server] Starting Oplug API Gateway...`);
console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`[Server] Vercel Environment: ${process.env.VERCEL ? 'Yes' : 'No'}`);

// Set APP_URL for Vercel and other environments
if (!process.env.APP_URL && process.env.VERCEL_URL) {
  process.env.APP_URL = `https://${process.env.VERCEL_URL}`;
}
console.log(`[Server] APP_URL: ${process.env.APP_URL || 'Not set'}`);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  const envStatus = {
    FIREBASE_SERVICE_ACCOUNT: !!process.env.FIREBASE_SERVICE_ACCOUNT,
    INLOMAX_API_KEY: !!process.env.INLOMAX_API_KEY,
    GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
    WHATSAPP_TOKEN: !!(process.env.WHATSAPP_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN),
    WHATSAPP_PHONE_NUMBER_ID: !!process.env.WHATSAPP_PHONE_NUMBER_ID,
    WHATSAPP_VERIFY_TOKEN: !!process.env.WHATSAPP_VERIFY_TOKEN,
    OGAVIRAL_API_KEY: !!process.env.OGAVIRAL_API_KEY,
    PAYSTACK_SECRET_KEY: !!process.env.PAYSTACK_SECRET_KEY,
    BILLSTACK_SECRET_KEY: !!process.env.BILLSTACK_SECRET_KEY,
  };

  const allSet = Object.values(envStatus).every(v => v === true);

  res.json({ 
    status: allSet ? 'ok' : 'configuration_required',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercel: !!process.env.VERCEL,
    config: envStatus,
    message: allSet ? 'All systems operational' : 'Some environment variables are missing. Please check your Vercel settings.'
  });
});

// WhatsApp Webhook Route
app.all('/api/whatsapp/webhook', async (req, res) => {
  console.log(`[WhatsApp Webhook] ${req.method} request received at ${new Date().toISOString()}`);
  try {
    await handleWhatsAppWebhook(req, res);
  } catch (error: any) {
    console.error('[WhatsApp Webhook] Fatal Error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }
});

// Proxy and API endpoints (Server1, Ogaviral, Paystack, Billstack, VTU, etc.) remain the same as your previous implementation
// [Omitted for brevity, copy all previous endpoint implementations here]

// --------------------- SPA Serving (Production/Vercel) ---------------------
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  // Proxy CRA dev server in development
  import { createProxyMiddleware } from 'http-proxy-middleware';
  app.use('/', createProxyMiddleware({
    target: `http://localhost:${CRA_PORT}`,
    changeOrigin: true,
    ws: true
  }));
} else {
  // Serve React build in production / Vercel
  const buildPath = path.join(process.cwd(), 'build');
  app.use(express.static(buildPath));

  // Catch-all middleware for SPA routing
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// Background scheduler for transactions remains the same
// [Omitted for brevity, copy your previous scheduler code here]

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`API Gateway running on http://0.0.0.0:${PORT}`);
  });
}

export default app;