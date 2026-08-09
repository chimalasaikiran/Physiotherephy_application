import React from 'react';
import { AuthHero } from './components/AuthHero';
import { AuthHeader } from './components/AuthHeader';
import { VerifyIdentityForm } from './components/VerifyIdentityForm';
import { AuthFooter } from './components/AuthFooter';

interface VerifyIdentityPageProps {
  email?: string;
  onBackToForgotPassword?: () => void;
  onSuccess?: (code: string) => void;
}

export const VerifyIdentityPage: React.FC<VerifyIdentityPageProps> = ({
  email,
  onBackToForgotPassword,
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
            title="Verify Your Identity"
            subtitle="We've sent a 6-digit verification code to your registered email address. Please enter it below to proceed."
          />
          <VerifyIdentityForm
            email={email}
            onBackToForgotPassword={onBackToForgotPassword}
            onVerifySuccess={onSuccess}
          />
        </div>
        <div className="w-full max-w-md mx-auto">
          <AuthFooter />
        </div>
      </div>
    </div>
  );
};

export default VerifyIdentityPage;
