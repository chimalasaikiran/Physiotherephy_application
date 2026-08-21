import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPhoneNumber,
  ConfirmationResult,
  signOut,
  RecaptchaVerifier,
} from 'firebase/auth';
import { safeStorage } from '../utils/storage';
import {
  auth,
  fetchUserProfile,
  saveUserProfileInFirestore,
  initializeUserRecord,
  UserProfileData,
} from '../config/firebase';
import {
  syncUserSession,
  fetchUserProfileFromService,
  updateUserProfileInService,
} from '../api/userApi';
import {
  syncProfileToPatientDetails,
  syncAvatarToPatientDetails,
} from '../api/patientSyncApi';

import { Platform } from 'react-native';
import {
  AUTH_SESSION_STORAGE_KEY,
  StoredAuthSession,
  isSessionValid as checkIsSessionValid,
} from '../navigation/authNavigation';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfileData | null;
  isLoading: boolean;
  isProfileComplete: boolean;
  isSessionValid: boolean;
  loginTimestamp: number | null;
  pendingPhoneNumber: string;
  setPendingPhoneNumber: (phone: string) => void;
  confirmationResult: ConfirmationResult | null;
  setConfirmationResult: (result: ConfirmationResult | null) => void;
  sendOtp: (phoneNumber: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (code: string) => Promise<{ success: boolean; profileCompleted: boolean; error?: string }>;
  completeProfile: (data: Partial<UserProfileData>) => Promise<boolean>;
  updateAvatar: (avatarUri: string) => Promise<boolean>;
  signOutUser: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loginTimestamp, setLoginTimestamp] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pendingPhoneNumber, setPendingPhoneNumber] = useState<string>('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // Monitor Firebase Auth session state & local persisted session validity on startup
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        const storedRaw = await safeStorage.getItem(AUTH_SESSION_STORAGE_KEY);
        let storedSession: StoredAuthSession | null = null;
        if (storedRaw) {
          try {
            storedSession = JSON.parse(storedRaw);
          } catch (e) {
            console.error('Error parsing stored auth session:', e);
          }
        }

        const timestamp = storedSession?.loginTimestamp || null;
        const valid = checkIsSessionValid(timestamp);

        if (currentUser) {
          if (!valid && storedSession) {
            // Session expired -> force sign out and clear persistence
            console.warn('Authentication session expired. Forcing sign out.');
            await signOut(auth);
            await safeStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
            setUser(null);
            setUserProfile(null);
            setLoginTimestamp(null);
          } else {
            setUser(currentUser);
            const now = timestamp || Date.now();
            setLoginTimestamp(now);

            // Fetch actual user profile directly from Firestore / backend service
            let profile = await fetchUserProfile(currentUser.uid);
            if (!profile) {
              profile = await fetchUserProfileFromService(currentUser);
            }
            if (profile) {
              setUserProfile(profile);
            }

            const isComp = Boolean(
              profile?.profileCompleted ||
              (profile?.fullName && profile.fullName.trim().length > 0)
            );

            // Ensure local storage session is updated
            const sessionData: StoredAuthSession = {
              loginTimestamp: now,
              uid: currentUser.uid,
              phone: currentUser.phoneNumber || storedSession?.phone || '',
              profileCompleted: isComp,
            };
            await safeStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(sessionData));
          }
        } else {
          if (storedSession && valid) {
            setLoginTimestamp(timestamp);
          } else {
            await safeStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
            setUser(null);
            setUserProfile(null);
            setLoginTimestamp(null);
          }
        }
      } catch (err) {
        console.error('Error checking auth session persistence:', err);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const isProfileComplete = Boolean(
    userProfile?.profileCompleted || (userProfile?.fullName && userProfile.fullName.trim().length > 0)
  );
  const isSessionValid = checkIsSessionValid(loginTimestamp);

  const refreshUserProfile = async () => {
    if (user) {
      let profile = await fetchUserProfileFromService(user);
      if (!profile) {
        profile = await fetchUserProfile(user.uid);
      }
      setUserProfile(profile);
    }
  };

  /**
   * Trigger Firebase Phone Authentication to send OTP
   */
  const sendOtp = async (phoneNumber: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setPendingPhoneNumber(phoneNumber);

      let recaptchaVerifier: any;
      if (Platform.OS === 'web') {
        recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
        });
      } else {
        recaptchaVerifier = {
          type: 'recaptcha',
          verify: async () => '',
          render: async () => 0,
          _reset: () => {},
        };
      }

      const confirmation = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        recaptchaVerifier
      );
      setConfirmationResult(confirmation);
      return { success: true };
    } catch (error: any) {
      console.error('Firebase Phone Auth Error:', error);
      let errorMsg = 'Failed to send OTP. Please check the mobile number and try again.';
      if (error.code === 'auth/invalid-phone-number') {
        errorMsg = 'The phone number format is invalid. Include country code (e.g. +91 98765 43210).';
      } else if (error.code === 'auth/billing-not-enabled') {
        errorMsg =
          'Firebase SMS billing is not enabled. For development, use a test phone number configured in Firebase Console (e.g., +91 99999 99999), or upgrade to Firebase Blaze plan.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMsg = 'Too many attempts. Please wait a few minutes before trying again.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMsg =
          'SMS Auth or SMS Region is disabled in Firebase Console. Enable Phone Auth & allowed SMS regions in Firebase Console.';
      } else if (
        error.code === 'auth/captcha-check-failed' ||
        error.code === 'auth/argument-error' ||
        error.code === 'auth/invalid-app-credential' ||
        error.code === 'auth/missing-client-identifier'
      ) {
        errorMsg =
          'reCAPTCHA verification failed. For React Native local testing, please add your phone number to Firebase Console (Auth > Phone numbers for testing).';
      }
      return { success: false, error: errorMsg };
    }
  };

  /**
   * Verify the OTP code using Firebase Authentication & sync with User Service
   */
  const verifyOtp = async (
    code: string
  ): Promise<{ success: boolean; profileCompleted: boolean; error?: string }> => {
    try {
      let loggedInUser: User | null = null;

      if (confirmationResult) {
        const credential = await confirmationResult.confirm(code);
        loggedInUser = credential.user;
      } else {
        if (auth.currentUser) {
          loggedInUser = auth.currentUser;
        } else {
          return { success: false, profileCompleted: false, error: 'OTP session expired. Please resend OTP.' };
        }
      }

      if (!loggedInUser) {
        return { success: false, profileCompleted: false, error: 'Verification failed.' };
      }

      setUser(loggedInUser);

      // 1. Check user profile directly from Firestore using authenticated user's UID
      let existingProfile = await fetchUserProfile(loggedInUser.uid);

      // 2. If not found directly in Firestore, check fallback microservice
      if (!existingProfile) {
        existingProfile = await fetchUserProfileFromService(loggedInUser);
      }

      // 3. Determine if user exists and profile is completed (profileCompleted flag or presence of fullName)
      let isComplete = false;
      if (existingProfile) {
        isComplete = Boolean(
          existingProfile.profileCompleted === true ||
          (existingProfile.fullName && existingProfile.fullName.trim().length > 0)
        );
      }

      let finalProfile: UserProfileData | null = existingProfile;

      if (!finalProfile) {
        // New user with no existing Firestore profile -> initialize user record in Firestore with profileCompleted: false
        finalProfile = await initializeUserRecord(loggedInUser);
        isComplete = false;
      } else if (!finalProfile.profileCompleted && isComplete) {
        finalProfile = { ...finalProfile, profileCompleted: true };
      }

      setUserProfile(finalProfile);

      // Securely persist login session timestamp and user info with verified profile completion state
      const now = Date.now();
      const sessionData: StoredAuthSession = {
        loginTimestamp: now,
        uid: loggedInUser.uid,
        phone: loggedInUser.phoneNumber || pendingPhoneNumber || '',
        profileCompleted: isComplete,
      };
      await safeStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(sessionData));
      setLoginTimestamp(now);

      return {
        success: true,
        profileCompleted: isComplete,
      };
    } catch (error: any) {
      console.error('Firebase OTP Verification Error:', error);
      let errorMsg = 'Invalid verification code. Please check and try again.';
      if (error.code === 'auth/invalid-verification-code') {
        errorMsg = 'The OTP entered is incorrect. Please double check.';
      } else if (error.code === 'auth/code-expired') {
        errorMsg = 'The OTP code has expired. Please request a new code.';
      }
      return { success: false, profileCompleted: false, error: errorMsg };
    }
  };

  /**
   * Complete profile and save to backend User Service microservice & Firestore.
   * Also syncs the patient record to `patient details` collection so the user
   * appears immediately in the Admin Panel's Patients module.
   */
  const completeProfile = async (profileData: Partial<UserProfileData>): Promise<boolean> => {
    const activeUser = user || auth.currentUser;
    if (!activeUser) {
      throw new Error('No authenticated user found');
    }

    try {
      const fullProfile: Partial<UserProfileData> = {
        ...profileData,
        phone: activeUser.phoneNumber || pendingPhoneNumber || userProfile?.phone || '',
      };

      // 1. Save to User Service microservice / Firestore users collection
      let updated = await updateUserProfileInService(activeUser, fullProfile);
      if (!updated) {
        await saveUserProfileInFirestore(activeUser.uid, fullProfile);
      }

      await refreshUserProfile();

      // 2. Sync to Firestore `patient details` collection so this user appears
      //    immediately in the Admin Panel's Patients module.
      try {
        const idToken = await activeUser.getIdToken();
        await syncProfileToPatientDetails(activeUser.uid, fullProfile, idToken);
      } catch (syncErr) {
        // Non-fatal — patient sync failure shouldn't block profile completion
        console.warn('[AuthContext] Patient details sync warning:', syncErr);
      }

      const now = loginTimestamp || Date.now();
      const sessionData: StoredAuthSession = {
        loginTimestamp: now,
        uid: activeUser.uid,
        phone: activeUser.phoneNumber || pendingPhoneNumber || userProfile?.phone || '',
        profileCompleted: true,
      };
      await safeStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(sessionData));
      setLoginTimestamp(now);

      return true;
    } catch (error) {
      console.error('Error in completeProfile context:', error);
      return false;
    }
  };

  /**
   * Update profile avatar picture in real-time across context, backend, and patient details.
   */
  const updateAvatar = async (avatarUri: string): Promise<boolean> => {
    try {
      // 1. Instantly update local profile state in real-time
      setUserProfile((prev) => (prev ? { ...prev, avatarUri } : { avatarUri } as any));

      // 2. Persist to backend / Firestore users collection
      const activeUser = user || auth.currentUser;
      if (activeUser) {
        let updated = await updateUserProfileInService(activeUser, { avatarUri });
        if (!updated) {
          await saveUserProfileInFirestore(activeUser.uid, { avatarUri });
        }

        // 3. Also update avatar in patient details so Admin Panel shows the new photo
        syncAvatarToPatientDetails(activeUser.uid, avatarUri).catch((e) =>
          console.warn('[AuthContext] Avatar sync to patient details warning:', e)
        );
      }
      return true;
    } catch (error) {
      console.error('Error updating avatar in context:', error);
      return false;
    }
  };

  /**
   * Sign out current Firebase authenticated user and clear persisted session
   */
  const signOutUser = async (): Promise<void> => {
    try {
      await safeStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      setLoginTimestamp(null);
      setConfirmationResult(null);
      setPendingPhoneNumber('');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isLoading,
        isProfileComplete,
        isSessionValid,
        loginTimestamp,
        pendingPhoneNumber,
        setPendingPhoneNumber,
        confirmationResult,
        setConfirmationResult,
        sendOtp,
        verifyOtp,
        completeProfile,
        updateAvatar,
        signOutUser,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


