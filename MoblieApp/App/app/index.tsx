import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { WelcomeScreen, SplashScreen } from '@/features/auth';
import { useAuth } from '@/context/AuthContext';
import { getAuthNavigationRoute } from '@/navigation';

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();
  const { user, isProfileComplete, isSessionValid, isLoading } = useAuth();

  useEffect(() => {
    if (!showSplash && !isLoading) {
      const isAuthenticated = Boolean(user);
      if (isAuthenticated && isSessionValid) {
        const targetRoute = getAuthNavigationRoute({
          isAuthenticated,
          isProfileComplete,
          isSessionValid,
        });
        if (targetRoute !== '/login') {
          router.replace(targetRoute as any);
        }
      }
    }
  }, [showSplash, isLoading, user, isProfileComplete, isSessionValid]);

  const handleSplashFinish = () => {
    setShowSplash(false);
    if (!isLoading) {
      const isAuthenticated = Boolean(user);
      if (isAuthenticated && isSessionValid) {
        const targetRoute = getAuthNavigationRoute({
          isAuthenticated,
          isProfileComplete,
          isSessionValid,
        });
        if (targetRoute !== '/login') {
          router.replace(targetRoute as any);
        }
      }
    }
  };

  const handleGetStarted = () => {
    router.push('/login');
  };

  const handleSignIn = () => {
    router.push('/login');
  };

  if (showSplash || isLoading) {
    return <SplashScreen onFinish={handleSplashFinish} duration={2000} />;
  }

  return (
    <WelcomeScreen
      onGetStarted={handleGetStarted}
      onSignIn={handleSignIn}
    />
  );
}


