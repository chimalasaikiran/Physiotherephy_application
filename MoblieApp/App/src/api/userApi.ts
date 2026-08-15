import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { User } from 'firebase/auth';
import { UserProfileData } from '../config/firebase';

const getUserBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_USER_SERVICE_URL) {
    return process.env.EXPO_PUBLIC_USER_SERVICE_URL;
  }

  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest?.debuggerHost;
  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    if (hostIp) {
      return `http://${hostIp}:5001/api/v1`;
    }
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5001/api/v1';
  }

  return 'http://localhost:5001/api/v1';
};

const BASE_URL = getUserBaseUrl();

export const syncUserSession = async (user: User): Promise<UserProfileData | null> => {
  try {
    const idToken = await user.getIdToken();
    const res = await fetch(`${BASE_URL}/users/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        uid: user.uid,
        phoneNumber: user.phoneNumber,
      }),
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.data as UserProfileData;
  } catch (error) {
    console.warn('Sync user session API failed:', error);
    return null;
  }
};

export const fetchUserProfileFromService = async (user: User): Promise<UserProfileData | null> => {
  try {
    const idToken = await user.getIdToken();
    const res = await fetch(`${BASE_URL}/users/${user.uid}`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.data as UserProfileData;
  } catch (error) {
    console.warn('Fetch user profile API failed:', error);
    return null;
  }
};

export const updateUserProfileInService = async (
  user: User,
  profileData: Partial<UserProfileData>
): Promise<boolean> => {
  try {
    const idToken = await user.getIdToken();
    const res = await fetch(`${BASE_URL}/users/${user.uid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(profileData),
    });

    return res.ok;
  } catch (error) {
    console.warn('Update user profile API failed:', error);
    return false;
  }
};
