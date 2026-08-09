import React from 'react';
import { AuthHero } from './components/AuthHero';
import { AuthHeader } from './components/AuthHeader';
import { AuthFooter } from './components/AuthFooter';
import { Button } from '@/components/ui/Button';

interface PasswordResetSuccessPageProps {
  onGoToLogin?: () => void;
}

export const PasswordResetSuccessPage: React.FC<PasswordResetSuccessPageProps> = ({
  onGoToLogin,
}) => {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-white antialiased font-sans">
      {/* Left side hero visual */}
      <AuthHero />

      {/* Right side authentication panel */}
      <div className="flex flex-col justify-between p-6 sm:p-12 lg:p-16 xl:p-24 min-h-screen overflow-y-auto max-w-2xl mx-auto lg:max-w-none w-full">
        <div className="w-full max-w-md mx-auto my-auto flex flex-col">
          <AuthHeader
            title="Password Reset Successfully"
            subtitle="Your password has been updated successfully. You can now sign in and continue managing appointments, patients and rehabilitation programs."
          />
          
          <div className="w-full mt-2">
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={onGoToLogin}
              className="bg-[#0047BA] hover:bg-[#003896] text-white font-semibold py-3.5 text-sm rounded-xl shadow-md shadow-blue-900/10 cursor-pointer w-full flex items-center justify-center gap-2 group transition-all"
            >
              <span>Go To Login</span>
              <svg
                className="w-4 h-4 stroke-[2.5] transform group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Button>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto">
          <AuthFooter />
        </div>
      </div>
    </div>
  );
};

export default PasswordResetSuccessPage;
