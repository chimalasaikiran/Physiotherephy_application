import React from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { useLoginForm } from '../hooks/useLoginForm';
import { AUTH_CONFIG } from '../config/authConfig';
import type { LoginFormValues } from '../types/auth';

interface LoginFormProps {
  onSuccess?: (values: LoginFormValues) => void;
  onForgotPasswordClick?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onForgotPasswordClick }) => {
  const {
    values,
    errors,
    showPassword,
    isSubmitting,
    handleChange,
    handleSubmit,
    togglePasswordVisibility,
    handleGoogleSignIn,
  } = useLoginForm(onSuccess);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
      {errors.general && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600">
          {errors.general}
        </div>
      )}

      {/* Email Input */}
      <Input
        id="email"
        name="email"
        type="email"
        label={AUTH_CONFIG.emailLabel}
        placeholder={AUTH_CONFIG.emailPlaceholder}
        value={values.email}
        onChange={handleChange}
        error={errors.email}
        autoComplete="email"
        required
      />

      {/* Password Input */}
      <Input
        id="password"
        name="password"
        type={showPassword ? 'text' : 'password'}
        label={AUTH_CONFIG.passwordLabel}
        placeholder={AUTH_CONFIG.passwordPlaceholder}
        value={values.password}
        onChange={handleChange}
        error={errors.password}
        autoComplete="current-password"
        required
        rightElement={
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              /* Eye Slash Icon */
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-10-7-10-7a17.9 17.9 0 014.288-4.757M9.88 9.88a3 3 0 104.24 4.24m-2.12-2.12l6.364 6.364M3 3l18 18"
                />
              </svg>
            ) : (
              /* Eye Icon matching design */
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        }
      />

      {/* Options Row: Remember Me & Forgot Password */}
      <div className="flex items-center justify-between pt-1 pb-1">
        <Checkbox
          id="rememberMe"
          name="rememberMe"
          label={AUTH_CONFIG.rememberMeLabel}
          checked={values.rememberMe}
          onChange={handleChange}
        />
        <button
          type="button"
          onClick={onForgotPasswordClick}
          className="text-xs font-semibold text-[#0b419c] hover:underline focus:outline-none focus:ring-1 focus:ring-[#0b419c] rounded px-1 transition-all cursor-pointer"
        >
          {AUTH_CONFIG.forgotPasswordText}
        </button>
      </div>

      {/* Primary Sign In Button */}
      <Button type="submit" isLoading={isSubmitting} variant="primary" size="md">
        <span className="flex items-center justify-center gap-2">
          <span>{AUTH_CONFIG.submitButtonText}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.2"
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </span>
      </Button>

      {/* Divider line */}
      <div className="relative flex items-center justify-center my-3">
        <div className="w-full border-t border-slate-200" />
        <span className="absolute bg-white px-4 text-[11px] font-bold text-slate-400 tracking-wider">
          {AUTH_CONFIG.dividerText}
        </span>
      </div>

      {/* Google Sign-in Button */}
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleSignIn}
        size="md"
        className="text-slate-700 font-semibold"
      >
        <span className="flex items-center justify-center gap-3">
          {/* Google Logo SVG */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{AUTH_CONFIG.googleSignInText}</span>
        </span>
      </Button>
    </form>
  );
};
