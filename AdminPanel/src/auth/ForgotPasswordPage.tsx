import React from 'react';
import { AuthHero } from './components/AuthHero';
import { AuthHeader } from './components/AuthHeader';
import { ForgotPasswordForm } from './components/ForgotPasswordForm';
import { AuthFooter } from './components/AuthFooter';

interface ForgotPasswordPageProps {
  onBackToLogin?: () => void;
  onSuccess?: (email: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onBackToLogin,
  onSuccess,
}) => {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-white antialiased font-sans">
      {/* Left side hero visual */}
      <AuthHero />

      {/* Right side authentication panel */}
      <div className="flex flex-col justify-between p-6 sm:p-12 lg:p-16 xl:p-24 min-h-screen overflow-y-auto max-w-2xl mx-auto lg:max-w-none w-full">
        <div className="w-full max-w-md mx-auto my-auto flex flex-col">
          <AuthHeader
            title="Forgot Your Password?"
            subtitle="Enter your registered email address and we'll send you instructions to reset your password."
          />
          <ForgotPasswordForm
            onBackToLogin={onBackToLogin}
            onSuccess={onSuccess}
          />
        </div>
        <div className="w-full max-w-md mx-auto">
          <AuthFooter />
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
