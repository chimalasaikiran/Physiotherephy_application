import adminModule from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const admin: typeof adminModule = (adminModule as any).default || adminModule;

const initFirebaseAdmin = (): any => {
  if (admin.apps && admin.apps.length > 0) {
    return admin.apps[0]!;
  }

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
        console.log(`✅ Loaded Firebase Service Account in appointment-service from: ${filePath}`);
        return admin.initializeApp({
          credential: admin.credential.cert(fileContent),
          projectId: fileContent.project_id,
        });
      }
    } catch (e: any) {
      console.warn(`Could not load service account from ${filePath}:`, e.message);
    }
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || 'physicotherephy-c28dd';
  console.log(`ℹ️ Initializing appointment-service Firebase Admin with Project ID: ${projectId}`);
  return admin.initializeApp({
    projectId,
  });
};

const firebaseApp = initFirebaseAdmin();

export const adminAuth = firebaseApp.auth();
export const db = firebaseApp.firestore();

export default firebaseApp;
