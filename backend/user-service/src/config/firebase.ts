import adminModule from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const admin: typeof adminModule = (adminModule as any).default || adminModule;

/**
 * Initialize Firebase Admin SDK
 */
const initFirebaseAdmin = (): any => {
  if (admin.apps && admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  // 1. Check GOOGLE_APPLICATION_CREDENTIALS or auto-detect serviceAccountKey.json in parent / root / local dirs
  const candidatePaths = [
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    path.join(process.cwd(), 'serviceAccountKey.json'),
    path.join(process.cwd(), 'serviceAccountKey.json.json'),
    path.join(process.cwd(), '..', 'serviceAccountKey.json'),
    path.join(process.cwd(), '..', 'serviceAccountKey.json.json'),
  ].filter(Boolean) as string[];

  for (const filePath of candidatePaths) {
    try {
      if (fs.existsSync(filePath)) {
        const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        console.log(`✅ Loaded Firebase Service Account from: ${filePath}`);
        return admin.initializeApp({
          credential: admin.credential.cert(fileContent),
          projectId: fileContent.project_id,
        });
      }
    } catch (e: any) {
      console.warn(`Could not load service account from ${filePath}:`, e.message);
    }
  }

  // 2. Check inline environment variables
  const projectId = process.env.FIREBASE_PROJECT_ID || 'physicotherephy-c28dd';
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  if (clientEmail && privateKey) {
    console.log(`✅ Loaded Firebase Service Account from environment variables for project: ${projectId}`);
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  // 3. Fallback to project ID initialization
  console.log(`ℹ️ Initializing Firebase Admin with Project ID: ${projectId}`);
  return admin.initializeApp({
    projectId,
  });
};

const firebaseApp = initFirebaseAdmin();

export const adminAuth = firebaseApp.auth();
export const db = firebaseApp.firestore();

export default firebaseApp;
