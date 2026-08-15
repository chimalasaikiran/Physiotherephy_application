import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * In-memory storage fallback when AsyncStorage native module is null or unavailable
 */
const memoryStorage: Record<string, string> = {};

/**
 * Safe storage wrapper around AsyncStorage with automatic Web localStorage and in-memory fallbacks.
 * Prevents "Native module is null, cannot access legacy storage" runtime errors in Expo / React Native Web.
 */
export const safeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return await AsyncStorage.getItem(key);
    } catch (error: any) {
      if (
        Platform.OS === 'web' ||
        (error?.message && error.message.includes('Native module is null'))
      ) {
        if (typeof window !== 'undefined' && window.localStorage) {
          try {
            return window.localStorage.getItem(key);
          } catch (e) {
            // ignore fallback error
          }
        }
        return memoryStorage[key] || null;
      }
      console.warn('Storage getItem fallback used:', error?.message || error);
      return memoryStorage[key] || null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
      await AsyncStorage.setItem(key, value);
    } catch (error: any) {
      if (
        Platform.OS === 'web' ||
        (error?.message && error.message.includes('Native module is null'))
      ) {
        if (typeof window !== 'undefined' && window.localStorage) {
          try {
            window.localStorage.setItem(key, value);
          } catch (e) {
            // ignore fallback error
          }
        }
        memoryStorage[key] = value;
        return;
      }
      console.warn('Storage setItem fallback used:', error?.message || error);
      memoryStorage[key] = value;
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
      await AsyncStorage.removeItem(key);
    } catch (error: any) {
      if (
        Platform.OS === 'web' ||
        (error?.message && error.message.includes('Native module is null'))
      ) {
        if (typeof window !== 'undefined' && window.localStorage) {
          try {
            window.localStorage.removeItem(key);
          } catch (e) {
            // ignore fallback error
          }
        }
        delete memoryStorage[key];
        return;
      }
      console.warn('Storage removeItem fallback used:', error?.message || error);
      delete memoryStorage[key];
    }
  },
};
