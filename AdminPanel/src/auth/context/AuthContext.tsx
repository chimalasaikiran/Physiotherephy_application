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
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';
import type { AdminProfile, AdminRole, AdminModule, PermissionAction } from '../types/auth';
import { ROLE_PERMISSIONS } from '../types/auth';

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
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

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
              } else {
                // Firebase user exists but no admin record — unauthorized
                await signOut(auth);
                setFirebaseUser(null);
                setAdminProfile(null);
                setAuthError('Unauthorized: Your account does not have administrator privileges.');
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
        setFirebaseUser(null);
        setAdminProfile(null);
        setIsLoading(false);
      }
    });

    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      unsubscribeAuth();
    };
  }, []);

  /**
   * Login with Firebase email/password only.
   * No localStorage credential fallback — all auth goes through Firebase.
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setIsLoading(false);
      let msg = 'Invalid email address or password.';
      if (err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        msg = 'Invalid email address or password.';
      } else if (err?.code === 'auth/too-many-requests') {
        msg = 'Too many failed attempts. Please try again later or reset your password.';
      } else if (err?.code === 'auth/user-disabled') {
        msg = 'This account has been disabled. Contact your system administrator.';
      }
      setAuthError(msg);
      throw new Error(msg);
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
    if (!newPassword || newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters.');
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
