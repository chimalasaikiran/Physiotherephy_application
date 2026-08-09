import React from 'react';
import { useRouter } from 'expo-router';
import { SplashScreen } from '@/features/splash';

export default function SplashRoute() {
  const router = useRouter();

  const handleFinish = () => {
    router.replace('/login');
  };

  return <SplashScreen onFinish={handleFinish} />;
}
