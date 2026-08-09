import React from 'react';
import { AuthHero } from './components/AuthHero';
import { AuthHeader } from './components/AuthHeader';
import { LoginForm } from './components/LoginForm';
import { AuthFooter } from './components/AuthFooter';
import type { LoginFormValues } from './types/auth';

interface LoginPageProps {
  onLoginSuccess?: (values: LoginFormValues) => void;
  onNavigateToForgotPassword?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigateToForgotPassword,
}) => {
  const handleSuccess = (values: LoginFormValues) => {
    console.log('Login successful with values:', values);
    if (onLoginSuccess) {
      onLoginSuccess(values);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-white antialiased font-sans">
      {/* Left side hero visual */}
      <AuthHero />

      {/* Right side authentication panel */}
      <div className="flex flex-col justify-between p-6 sm:p-12 lg:p-16 xl:p-24 min-h-screen overflow-y-auto max-w-2xl mx-auto lg:max-w-none w-full">
        <div className="w-full max-w-md mx-auto my-auto flex flex-col">
          <AuthHeader />
          <LoginForm
            onSuccess={handleSuccess}
            onForgotPasswordClick={onNavigateToForgotPassword}
          />
        </div>
        <div className="w-full max-w-md mx-auto">
          <AuthFooter />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
