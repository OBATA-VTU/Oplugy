
// This is a Vercel serverless function located at /api/proxy.ts
// DIAGNOSTIC VERSION: This is a simplified 'heartbeat' function.
// Its only purpose is to confirm that the serverless function is building,
// deploying, and executing correctly on Vercel.

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // This is the absolute first line. If this log doesn't appear in Vercel, the function failed to start.
  console.log(`[PROXY DIAGNOSTIC] Function start. Timestamp: ${new Date().toISOString()}`);

  try {
    console.log(`[PROXY DIAGNOSTIC] Request Method: ${req.method}`);
    
    // Check if body exists and is an object for detailed logging
    if (req.body && typeof req.body === 'object') {
      console.log(`[PROXY DIAGNOSTIC] Request Body Keys: ${Object.keys(req.body).join(', ')}`);
    } else {
      console.log(`[PROXY DIAGNOSTIC] Request Body is not a valid object or is empty. Received:`, req.body);
    }

    // A simple, valid response that mimics the format the client app expects
    const diagnosticResponse = {
      status: 'success', // Mimics a successful CIP API call
      message: 'Proxy is alive and responding. The build configuration is working.',
      data: {
        info: 'This is a diagnostic response. The next step is to restore the original proxy logic.',
        timestamp: new Date().toISOString(),
      },
      errors: null,
    };
    
    console.log('[PROXY DIAGNOSTIC] Sending successful diagnostic response to the client.');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(diagnosticResponse);

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[PROXY DIAGNOSTIC] FATAL ERROR IN HANDLER: ", error);
    
    // Send an error response that is still valid JSON so the client doesn't crash
    res.status(500).json({
      status: 'error',
      message: 'The diagnostic proxy function itself encountered a critical error.',
      data: null,
      errors: [{ path: 'handler', message: errorMsg, code: 'PROXY_CRASH' }],
    });
  }
}
