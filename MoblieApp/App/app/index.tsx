import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { WelcomeScreen, SplashScreen } from '@/features/auth';

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  const handleGetStarted = () => {
    router.push('/login');
  };

  const handleSignIn = () => {
    router.push('/login');
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} duration={2400} />;
  }

  return (
    <WelcomeScreen
      onGetStarted={handleGetStarted}
      onSignIn={handleSignIn}
    />
  );
}
