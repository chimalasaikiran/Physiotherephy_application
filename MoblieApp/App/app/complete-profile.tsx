import React from 'react';
import { useRouter } from 'expo-router';
import { CompleteProfileScreen } from '@/features/auth';
import { getAuthNavigationRoute } from '@/navigation';

export default function CompleteProfileRoute() {
  const router = useRouter();

  const handleCompleteSuccess = () => {
    const targetRoute = getAuthNavigationRoute({
      isAuthenticated: true,
      isProfileComplete: true,
      isSessionValid: true,
    });
    router.replace(targetRoute as any);
  };

  return <CompleteProfileScreen onCompleteSuccess={handleCompleteSuccess} />;
}

