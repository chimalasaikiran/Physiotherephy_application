import React, { useRef } from 'react';
import { useRouter } from 'expo-router';
import { OtpVerificationScreen } from '@/features/auth';
import { getAuthNavigationRoute } from '@/navigation';

export default function OtpRoute() {
  const router = useRouter();
  const hasNavigatedRef = useRef(false);

  const handleVerifySuccess = (code: string, profileCompleted?: boolean) => {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;

    const route = getAuthNavigationRoute({
      isAuthenticated: true,
      isProfileComplete: Boolean(profileCompleted),
      isSessionValid: true,
    });
    router.replace(route as any);
  };

  return <OtpVerificationScreen onVerifySuccess={handleVerifySuccess} />;
}


