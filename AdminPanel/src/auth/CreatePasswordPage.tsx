import React from 'react';
import { AuthHero } from './components/AuthHero';
import { AuthHeader } from './components/AuthHeader';
import { CreatePasswordForm } from './components/CreatePasswordForm';
import { AuthFooter } from './components/AuthFooter';

interface CreatePasswordPageProps {
  onBackToLogin?: () => void;
  onSuccess?: () => void;
}

export const CreatePasswordPage: React.FC<CreatePasswordPageProps> = ({
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
            title="Create New Password"
            subtitle="Create a strong password to secure your account and protect sensitive patient data."
          />
          <CreatePasswordForm
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

export default CreatePasswordPage;
