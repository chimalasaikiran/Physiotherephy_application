import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface CreatePasswordFormProps {
  onBackToLogin?: () => void;
  onSuccess?: () => void;
}

export const CreatePasswordForm: React.FC<CreatePasswordFormProps> = ({
  onBackToLogin,
  onSuccess,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, _setSuccessMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword) {
      setError('Please enter a new password.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!confirmPassword) {
      setError('Please confirm your new password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    // Simulate API call for password reset
    setTimeout(() => {
      setIsSubmitting(false);
      if (onSuccess) {
        onSuccess();
      } else if (onBackToLogin) {
        onBackToLogin();
      }
    }, 600);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full">
      {/* Alert Messages */}
      {successMessage ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium mb-6">
          <div className="p-1 rounded-full bg-emerald-100 text-emerald-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span>{successMessage}</span>
        </div>
      ) : null}

      {error ? (
        <div className="p-3.5 mb-6 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600 flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      ) : null}

      {/* Enter New Password Input */}
      <div className="mb-4">
        <Input
          id="new-password"
          name="newPassword"
          type={showNewPassword ? 'text' : 'password'}
          label="Enter New Password"
          placeholder="Enter Your New Password"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            if (error) setError('');
          }}
          autoComplete="new-password"
          required
          rightElement={
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="p-1 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer"
              aria-label={showNewPassword ? 'Hide password' : 'Show password'}
            >
              {showNewPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-10-7-10-7a17.9 17.9 0 014.288-4.757M9.88 9.88a3 3 0 104.24 4.24m-2.12-2.12l6.364 6.364M3 3l18 18" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          }
        />
      </div>

      {/* Confirm Password Input */}
      <div className="mb-6">
        <Input
          id="confirm-password"
          name="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          label="Confirm Password"
          placeholder="Re-enter Your New Password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (error) setError('');
          }}
          autoComplete="new-password"
          required
          rightElement={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="p-1 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-10-7-10-7a17.9 17.9 0 014.288-4.757M9.88 9.88a3 3 0 104.24 4.24m-2.12-2.12l6.364 6.364M3 3l18 18" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          }
        />
      </div>

      {/* Primary Submit Button: Reset Password */}
      <Button
        type="submit"
        isLoading={isSubmitting}
        variant="primary"
        size="md"
        className="bg-[#0047BA] hover:bg-[#003896] text-white font-semibold py-3.5 text-sm rounded-xl shadow-md shadow-blue-900/10 cursor-pointer w-full"
      >
        <span className="flex items-center justify-center gap-2">
          <span>Reset Password</span>
          <svg
            className="w-4 h-4 stroke-[2.5]"
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
        </span>
      </Button>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-6">
        <div className="w-full border-t border-slate-200" />
        <span className="absolute bg-white px-4 text-[11px] font-bold text-slate-400 tracking-widest uppercase">
          OR
        </span>
      </div>

      {/* Secondary Button: Back to Login */}
      <Button
        type="button"
        variant="outline"
        onClick={onBackToLogin}
        size="md"
        className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold py-3.5 text-sm rounded-xl shadow-xs cursor-pointer w-full"
      >
        Back to Login
      </Button>
    </form>
  );
};
