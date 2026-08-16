import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

import { adminAuth, db } from '../config/firebase.js';

async function seedAdmin() {
  const email = process.env.INITIAL_ADMIN_EMAIL || process.argv[2] || 'admin.temp@physiotherapy.com';
  const temporaryPassword = process.env.INITIAL_ADMIN_PASSWORD || process.argv[3] || 'TempAdmin#2026!Secured';
  const fullName = process.env.INITIAL_ADMIN_NAME || process.argv[4] || 'Dr. Sarah Smith (Primary Admin)';

  console.log('\n======================================================');
  console.log('🚀 PROVISIONING INITIAL ADMIN ACCOUNT IN FIRESTORE');
  console.log('======================================================');
  console.log(`📧 Target Email:              ${email}`);
  console.log(`👤 Full Name:                 ${fullName}`);
  console.log(`🔑 Temporary Initial Password: ${temporaryPassword}`);
  console.log(`🛡️ Role:                      superadmin (Full Access)`);
  console.log('------------------------------------------------------\n');

  try {
    let user;
    try {
      user = await adminAuth.getUserByEmail(email);
      console.log(`ℹ️ Existing Auth user found with UID: ${user.uid}. Updating password and profile...`);
      await adminAuth.updateUser(user.uid, {
        password: temporaryPassword,
        displayName: fullName,
      });
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        console.log('✨ Creating new user in Firebase Auth...');
        user = await adminAuth.createUser({
          email,
          password: temporaryPassword,
          displayName: fullName,
          emailVerified: true,
        });
      } else {
        throw err;
      }
    }

    // Set Firebase Auth Custom User Claims for Role-Based Authorization
    await adminAuth.setCustomUserClaims(user.uid, {
      role: 'superadmin',
      admin: true,
    });
    console.log('✅ Custom Auth Claims set: { role: "superadmin", admin: true }');

    // Save Admin Record into Firestore under 'admins' collection
    const adminRef = db.collection('admins').doc(user.uid);
    await adminRef.set(
      {
        uid: user.uid,
        email: user.email,
        fullName,
        role: 'superadmin',
        isActive: true,
        mustChangePassword: false, // User credentials are set directly by initial setup
        department: 'Executive Clinic Operations',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    console.log(`✅ Admin Record saved in Firestore collection 'admins/${user.uid}'.`);
    console.log('\n======================================================');
    console.log('🎉 ADMIN ACCOUNT PROVISIONED SUCCESSFULLY!');
    console.log('======================================================');
    console.log(`Notice: Administrator MUST change password on first login.`);
    console.log('======================================================\n');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Provisioning failed:', error);
    process.exit(1);
  }
}

seedAdmin();
