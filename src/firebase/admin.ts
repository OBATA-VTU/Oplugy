import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Initialize Firebase Admin for server-side operations.
 * This is used by the Express server and Vercel serverless functions.
 */
export function initializeFirebaseAdmin() {
  if (!admin.apps.length) {
    try {
      console.log('[Firebase Admin] Available Env Vars:', Object.keys(process.env).filter(k => k.includes('FIREBASE') || k.includes('GOOGLE')));
      
      // Try to load config from file as fallback for projectId and databaseId
      let fileConfig: any = {};
      try {
        const configPath = path.join(process.cwd(), 'src', 'firebase-applet-config.json');
        if (fs.existsSync(configPath)) {
          fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
          console.log('[Firebase Admin] Loaded config from firebase-applet-config.json');
        }
      } catch (e) {
        console.warn('[Firebase Admin] Could not load firebase-applet-config.json:', e);
      }

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

      const projectId = serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID || fileConfig.projectId || 'oplug-vtu';
      const databaseId = process.env.FIREBASE_DATABASE_ID || fileConfig.firestoreDatabaseId || '(default)';
      console.log(`[Firebase Admin] Detected Project ID: ${projectId}, Database ID: ${databaseId}`);
      
      if (serviceAccount.project_id && serviceAccount.private_key) {
        console.log(`[Firebase Admin] Initializing with Service Account for project: ${projectId}`);
        try {
          const app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: projectId
          });
          
          // Test connectivity
          const testDb = databaseId === '(default)' 
            ? admin.getFirestore(app) 
            : admin.getFirestore(app, databaseId);
          testDb.collection('health_check').limit(1).get()
            .then(() => console.log('[Firebase Admin] Connectivity test SUCCESSful'))
            .catch((err: any) => console.error('[Firebase Admin] Connectivity test FAILED:', err.message));
            
          return app;
        } catch (initErr: any) {
          console.error(`[Firebase Admin] Initialization Error:`, initErr.message);
        }
      } else {
        console.error(`[Firebase Admin] ERROR: Missing service account credentials (project_id or private_key).`);
        console.log(`[Firebase Admin] FIREBASE_SERVICE_ACCOUNT length: ${saString.length}`);
        console.log(`[Firebase Admin] Attempting to initialize with default credentials for project: ${projectId}`);
        return admin.initializeApp({ 
          projectId: projectId
        });
      }
    } catch (e) {
      console.error('Error initializing Firebase Admin:', e);
    }
  }
  return admin.app();
}

export const adminApp = initializeFirebaseAdmin();

// Re-calculate databaseId for the exports
let finalDatabaseId = process.env.FIREBASE_DATABASE_ID || '(default)';
if (finalDatabaseId === '(default)') {
  try {
    const configPath = path.join(process.cwd(), 'src', 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (fileConfig.firestoreDatabaseId) {
        finalDatabaseId = fileConfig.firestoreDatabaseId;
      }
    }
  } catch (e) {}
}

export const db = finalDatabaseId === '(default)' 
  ? admin.getFirestore(adminApp) 
  : admin.getFirestore(adminApp, finalDatabaseId);
export const auth = admin.getAuth(adminApp);
