import React from 'react';
import { useRouter } from 'expo-router';
import { OtpVerificationScreen } from '@/features/auth';

export default function OtpRoute() {
  const router = useRouter();

  const handleVerifySuccess = () => {
    router.push('/complete-profile');
  };

  return <OtpVerificationScreen onVerifySuccess={handleVerifySuccess} />;
}
