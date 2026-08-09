import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface ForgotPasswordFormProps {
  onBackToLogin?: () => void;
  onSuccess?: (email: string) => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onBackToLogin,
  onSuccess,
}) => {
  const [email, setEmail] = useState('dr.smith@onemedical.com');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const validateEmail = (val: string) => {
    if (!val.trim()) {
      return 'Email address is required';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) {
      setError(err);
      return;
    }

    setError('');
    setIsSubmitting(true);

    // Simulate API network request
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMessage(
        `Reset instructions have been sent to ${email}. Please check your inbox.`
      );
      if (onSuccess) {
        onSuccess(email);
      }
    }, 800);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full">
      {successMessage ? (
        <div className="flex flex-col gap-4 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 mb-6">
          <div className="flex items-start gap-3">
            <div className="p-1 rounded-full bg-emerald-100 text-emerald-600 mt-0.5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="font-bold text-sm text-emerald-900">Email Sent</h4>
              <p className="text-xs text-emerald-700 leading-relaxed">{successMessage}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage('')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline text-left self-start"
          >
            Resend email with a new link
          </button>
        </div>
      ) : null}

      {error ? (
        <div className="p-3.5 mb-4 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600 flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      ) : null}

      {/* Email Input Field */}
      <div className="flex flex-col gap-1.5 w-full mb-6">
        <label
          htmlFor="reset-email"
          className="text-xs sm:text-sm font-semibold text-slate-700 tracking-wide"
        >
          Email address
        </label>
        <div className="relative flex items-center">
          <input
            id="reset-email"
            name="email"
            type="email"
            placeholder="dr.smith@onemedical.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError('');
            }}
            required
            autoComplete="email"
            className="w-full px-4 py-3.5 text-sm text-slate-800 bg-[#EEF2FF] border border-[#DBE2FE] hover:border-[#C4D1FE] focus:border-[#0047BA] focus:bg-white focus:ring-4 focus:ring-[#0047BA]/10 rounded-xl transition-all outline-none font-medium placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Primary Submit Button: Send Reset Link */}
      <Button
        type="submit"
        isLoading={isSubmitting}
        variant="primary"
        size="md"
        className="bg-[#0047BA] hover:bg-[#003896] text-white font-semibold py-3.5 text-sm rounded-xl shadow-md shadow-blue-900/10 cursor-pointer"
      >
        <span className="flex items-center justify-center gap-2">
          <span>Send Reset code</span>
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
        className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold py-3.5 text-sm rounded-xl shadow-xs cursor-pointer"
      >
        Back to Login
      </Button>
    </form>
  );
};
