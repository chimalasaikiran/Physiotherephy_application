import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateEmail as firebaseUpdateEmail,
  updatePassword as firebaseUpdatePassword,
  type User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';
import type { AdminProfile, AdminRole, AdminModule, PermissionAction } from '../types/auth';
import { ROLE_PERMISSIONS } from '../types/auth';

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

interface AuthContextType {
  firebaseUser: User | null;
  adminProfile: AdminProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  updateCredentials: (newEmail: string, newPassword: string) => Promise<boolean>;
  updateAdminProfileName: (newName: string) => Promise<boolean>;
  updateAdminEmail: (newEmail: string) => Promise<boolean>;
  updateAdminPassword: (newPassword: string) => Promise<boolean>;
  changePassword: (newPassword: string) => Promise<boolean>;
  clearAuthError: () => void;
  hasPermission: (module: AdminModule | '*', action?: PermissionAction) => boolean;
  hasModuleAccess: (module: AdminModule) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  adminProfile: null,
  isAuthenticated: false,
  isLoading: true,
  authError: null,
  login: async () => false,
  loginWithGoogle: async () => false,
  logout: async () => {},
  updateCredentials: async () => false,
  updateAdminProfileName: async () => false,
  updateAdminEmail: async () => false,
  updateAdminPassword: async () => false,
  changePassword: async () => false,
  clearAuthError: () => {},
  hasPermission: () => false,
  hasModuleAccess: () => false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(() => {
    try {
      const saved = localStorage.getItem('physio_admin_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (adminProfile) {
      localStorage.setItem('physio_admin_session', JSON.stringify(adminProfile));
    } else {
      localStorage.removeItem('physio_admin_session');
    }
  }, [adminProfile]);

  // Sync Admin profile data from Firestore upon Auth state change with real-time listener
  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (user) {
        setFirebaseUser(user);
        try {
          const adminDocRef = doc(db, 'admins', user.uid);
          unsubscribeSnapshot = onSnapshot(
            adminDocRef,
            async (adminSnap) => {
              if (adminSnap.exists()) {
                const data = adminSnap.data();
                if (data.isActive === false) {
                  await signOut(auth);
                  setFirebaseUser(null);
                  setAdminProfile(null);
                  setAuthError('Your administrator account has been deactivated.');
                  setIsLoading(false);
                  return;
                }

                const profile: AdminProfile = {
                  uid: user.uid,
                  email: user.email || data.email || '',
                  fullName: data.fullName || user.displayName || 'System Administrator',
                  role: (data.role as AdminRole) || 'superadmin',
                  isActive: data.isActive ?? true,
                  mustChangePassword: data.mustChangePassword ?? false,
                  department: data.department || 'Executive Clinic Operations',
                  phone: data.phone || user.phoneNumber || '',
                  createdAt: data.createdAt,
                  lastLoginAt: data.lastLoginAt,
                };

                setAdminProfile(profile);
              }
              setIsLoading(false);
            },
            (error) => {
              console.error('Error listening to admin profile snapshot:', error);
              setIsLoading(false);
            }
          );
        } catch (error: any) {
          console.error('Error initializing admin profile listener:', error);
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      unsubscribeAuth();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();

    // 1. Attempt standard Firebase Auth
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.warn('Firebase Auth standard login attempt:', err?.code, err?.message);

      // 2. Validate against Provisioned and Updated credentials
      const inputHash = await hashPassword(password);
      const tempHash = await hashPassword('TempAdmin#2026!Secured');

      const storedCredsStr = localStorage.getItem('physio_admin_credentials_store');
      const storedCreds = storedCredsStr ? JSON.parse(storedCredsStr) : null;

      // If administrator has already set custom email & password:
      if (storedCreds && storedCreds.updated) {
        if (cleanEmail === storedCreds.email.toLowerCase() && inputHash === storedCreds.passwordHash) {
          const profile: AdminProfile = {
            uid: storedCreds.uid || 'admin-primary-001',
            email: storedCreds.email,
            fullName: 'Dr. Sarah Smith (Primary Admin)',
            role: 'superadmin',
            isActive: true,
            mustChangePassword: false,
            department: 'Executive Clinic Operations',
          };
          setAdminProfile(profile);
          setIsLoading(false);
          return true;
        }

        if (cleanEmail === 'admin.temp@physiotherapy.com') {
          setIsLoading(false);
          const errStr = 'Temporary credentials have expired. Please sign in with your updated administrator email and password.';
          setAuthError(errStr);
          throw new Error(errStr);
        }

        setIsLoading(false);
        const errStr = 'Invalid email address or password.';
        setAuthError(errStr);
        throw new Error(errStr);
      }

      // Initial login using provisioned temporary credentials:
      if (cleanEmail === 'admin.temp@physiotherapy.com' && inputHash === tempHash) {
        const tempProfile: AdminProfile = {
          uid: 'admin-temp-001',
          email: 'admin.temp@physiotherapy.com',
          fullName: 'Dr. Sarah Smith (Primary Admin)',
          role: 'superadmin',
          isActive: true,
          mustChangePassword: true, // Forces initial credential update modal
          department: 'Executive Clinic Operations',
        };
        setAdminProfile(tempProfile);
        setIsLoading(false);
        return true;
      }

      setIsLoading(false);
      const userFriendlyMessage = 'Invalid email address or password.';
      setAuthError(userFriendlyMessage);
      throw new Error(userFriendlyMessage);
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const adminDocRef = doc(db, 'admins', user.uid);
      const adminSnap = await getDoc(adminDocRef);

      if (!adminSnap.exists() || adminSnap.data()?.isActive === false) {
        await signOut(auth);
        setFirebaseUser(null);
        setAdminProfile(null);
        const errorMsg = 'Unauthorized: Google account is not registered as an active Admin.';
        setAuthError(errorMsg);
        throw new Error(errorMsg);
      }

      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.error('Google Auth error:', err);
      setIsLoading(false);
      const msg = err?.message || 'Google authentication failed.';
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await signOut(auth).catch(() => {});
      localStorage.removeItem('physio_admin_session');
      setAdminProfile(null);
      setFirebaseUser(null);
      setAuthError(null);
    } catch (err: any) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateAdminProfileName = async (newName: string): Promise<boolean> => {
    const cleanName = newName.trim();
    if (!cleanName) return false;

    setAdminProfile((prev) => (prev ? { ...prev, fullName: cleanName } : null));

    const targetUid = auth.currentUser?.uid || adminProfile?.uid;
    if (targetUid) {
      try {
        const adminDocRef = doc(db, 'admins', targetUid);
        await setDoc(adminDocRef, { fullName: cleanName, updatedAt: serverTimestamp() }, { merge: true });
      } catch (err) {
        console.warn('Firestore update admin name warning:', err);
      }
    }
    return true;
  };

  const updateAdminEmail = async (newEmail: string): Promise<boolean> => {
    const cleanEmail = newEmail.trim();
    if (!cleanEmail) return false;

    if (auth.currentUser && cleanEmail.toLowerCase() !== auth.currentUser.email?.toLowerCase()) {
      try {
        await firebaseUpdateEmail(auth.currentUser, cleanEmail);
      } catch (err: any) {
        console.warn('Firebase Auth updateEmail warning:', err);
      }
    }

    const targetUid = auth.currentUser?.uid || adminProfile?.uid;
    if (targetUid) {
      try {
        const adminDocRef = doc(db, 'admins', targetUid);
        await setDoc(adminDocRef, { email: cleanEmail, updatedAt: serverTimestamp() }, { merge: true });
      } catch (err) {
        console.warn('Firestore update admin email warning:', err);
      }
    }

    setAdminProfile((prev) => (prev ? { ...prev, email: cleanEmail } : null));
    return true;
  };

  const updateAdminPassword = async (newPassword: string): Promise<boolean> => {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    if (auth.currentUser) {
      await firebaseUpdatePassword(auth.currentUser, newPassword);
    }

    const targetUid = auth.currentUser?.uid || adminProfile?.uid;
    if (targetUid) {
      try {
        const adminDocRef = doc(db, 'admins', targetUid);
        await setDoc(adminDocRef, { mustChangePassword: false, updatedAt: serverTimestamp() }, { merge: true });
      } catch (e) {
        console.warn('Error updating Firestore password status flag:', e);
      }
    }

    setAdminProfile((prev) => (prev ? { ...prev, mustChangePassword: false } : null));
    return true;
  };

  const updateCredentials = async (newEmail: string, newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);
    try {
      if (newEmail) {
        await updateAdminEmail(newEmail);
      }
      if (newPassword) {
        await updateAdminPassword(newPassword);
      }
      return true;
    } catch (error: any) {
      console.error('Error updating admin credentials:', error);
      let msg = error?.message || 'Failed to update credentials. Please try again.';
      setAuthError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (newPassword: string): Promise<boolean> => {
    return updateAdminPassword(newPassword);
  };

  const clearAuthError = () => setAuthError(null);

  // RBAC Permission Evaluator
  const hasPermission = (module: AdminModule | '*', action: PermissionAction = 'read'): boolean => {
    if (!adminProfile || !adminProfile.isActive) return false;
    if (adminProfile.role === 'superadmin' || adminProfile.role === 'admin') return true;

    const roleRules = ROLE_PERMISSIONS[adminProfile.role];
    if (!roleRules) return false;
    if (roleRules['*']) return true;

    const moduleActions = roleRules[module];
    if (!moduleActions) return false;

    return moduleActions.includes(action) || moduleActions.includes('manage');
  };

  const hasModuleAccess = (module: AdminModule): boolean => {
    return hasPermission(module, 'read');
  };

  const isAuthenticated = Boolean(adminProfile && adminProfile.isActive);

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        adminProfile,
        isAuthenticated,
        isLoading,
        authError,
        login,
        loginWithGoogle,
        logout,
        updateCredentials,
        updateAdminProfileName,
        updateAdminEmail,
        updateAdminPassword,
        changePassword,
        clearAuthError,
        hasPermission,
        hasModuleAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


