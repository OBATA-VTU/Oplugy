import * as admin from 'firebase-admin';

/**
 * Initialize Firebase Admin for server-side operations.
 * This is used by the Express server and Vercel serverless functions.
 */
export function initializeFirebaseAdmin() {
  if (!admin.apps.length) {
    try {
      const saString = (process.env.FIREBASE_SERVICE_ACCOUNT || '{}').trim();
      let serviceAccount: any;
      try {
        // Remove potential wrapping quotes from Vercel env vars
        const cleanSaString = saString.replace(/^'|'$/g, '').replace(/^"|"$/g, '');
        serviceAccount = JSON.parse(cleanSaString);
      } catch (parseError) {
        console.error('[Firebase Admin] Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', parseError);
        serviceAccount = {};
      }

      if (serviceAccount.private_key) {
        // Fix escaped newlines in private key
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }

      const projectId = serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID || 'oplug-vtu';
      
      if (serviceAccount.project_id && serviceAccount.private_key) {
        console.log(`[Firebase Admin] Initializing with Service Account for project: ${projectId}`);
        try {
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: projectId
          });
        } catch (initErr: any) {
          console.error(`[Firebase Admin] Initialization Error:`, initErr.message);
        }
      } else {
        console.error(`[Firebase Admin] ERROR: Missing service account credentials (project_id or private_key).`);
        console.log(`[Firebase Admin] FIREBASE_SERVICE_ACCOUNT length: ${saString.length}`);
        console.log(`[Firebase Admin] Attempting to initialize with default credentials for project: ${projectId}`);
        admin.initializeApp({ projectId: projectId });
      }
      admin.firestore().settings({ ignoreUndefinedProperties: true });
      console.log(`Firebase Admin initialized successfully for project: ${projectId}`);
    } catch (e) {
      console.error('Error initializing Firebase Admin:', e);
    }
  }
  return admin;
}

export const adminApp = initializeFirebaseAdmin();
export const db = adminApp.firestore();
export const auth = adminApp.auth();
