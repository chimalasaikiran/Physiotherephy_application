import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface VerifyIdentityFormProps {
  email?: string;
  onBackToForgotPassword?: () => void;
  onVerifySuccess?: (code: string) => void;
}

export const VerifyIdentityForm: React.FC<VerifyIdentityFormProps> = ({
  email = 'dr.smith@onemedical.com',
  onBackToForgotPassword,
  onVerifySuccess,
}) => {
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [timerSeconds, setTimerSeconds] = useState<number>(45);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (timerSeconds > 0 && !canResend) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setCanResend(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerSeconds, canResend]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (index: number, value: string) => {
    // Only accept numeric input
    const cleaned = value.replace(/[^0-9]/g, '');
    if (!cleaned && value !== '') return;

    const newCode = [...code];

    if (cleaned.length > 1) {
      // Handle multi-character entry or auto-fill
      const digits = cleaned.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newCode[i] = digits[i] || '';
      }
      setCode(newCode);
      const nextIdx = Math.min(digits.length, 5);
      inputRefs.current[nextIdx]?.focus();
    } else {
      newCode[index] = cleaned;
      setCode(newCode);
      if (error) setError('');

      // Auto-advance to next input if digit entered
      if (cleaned && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!code[index] && index > 0) {
        // Move focus back on backspace if current field is empty
        inputRefs.current[index - 1]?.focus();
      } else {
        const newCode = [...code];
        newCode[index] = '';
        setCode(newCode);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pastedData) return;

    const digits = pastedData.split('');
    const newCode = [...code];
    for (let i = 0; i < 6; i++) {
      newCode[i] = digits[i] || '';
    }
    setCode(newCode);
    if (error) setError('');

    const focusIndex = Math.min(digits.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleResendCode = () => {
    setTimerSeconds(45);
    setCanResend(false);
    setError('');
    setSuccessMsg(`A new 6-digit verification code has been sent to ${email}.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');

    if (fullCode.length < 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setError('');
    setIsVerifying(true);

    // Simulate verification API request
    setTimeout(() => {
      setIsVerifying(false);
      setSuccessMsg('Identity verified successfully!');
      if (onVerifySuccess) {
        onVerifySuccess(fullCode);
      }
    }, 800);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full">
      {/* Alert Messages */}
      {successMsg ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium mb-6">
          <div className="p-1 rounded-full bg-emerald-100 text-emerald-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span>{successMsg}</span>
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

      {/* 6-digit Circular OTP Input Boxes */}
      <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3.5 my-4 w-full">
        {code.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => {
              inputRefs.current[idx] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleInputChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            aria-label={`Digit ${idx + 1} of verification code`}
            className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full text-center text-lg sm:text-xl font-bold font-mono transition-all outline-none border ${
              digit
                ? 'bg-white border-[#0047BA] text-[#0047BA] ring-2 ring-[#0047BA]/10 shadow-sm'
                : 'bg-[#F0F4FA] border-slate-200/80 text-slate-800 focus:bg-white focus:border-[#0047BA] focus:ring-4 focus:ring-[#0047BA]/15'
            }`}
          />
        ))}
      </div>

      {/* Resend Code Timer Row */}
      <div className="flex items-center justify-start mt-2 mb-8 text-xs sm:text-sm text-slate-500 font-medium">
        {!canResend ? (
          <span>
            Resend code in{' '}
            <span className="text-[#0047BA] font-semibold font-mono">
              {formatTimer(timerSeconds)}
            </span>
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResendCode}
            className="text-[#0047BA] font-semibold hover:underline focus:outline-none cursor-pointer"
          >
            Resend code
          </button>
        )}
      </div>

      {/* Primary Submit Button: Verify Code */}
      <Button
        type="submit"
        isLoading={isVerifying}
        variant="primary"
        size="md"
        className="bg-[#0047BA] hover:bg-[#003896] text-white font-semibold py-3.5 text-sm rounded-xl shadow-md shadow-blue-900/10 cursor-pointer w-full"
      >
        <span className="flex items-center justify-center gap-2">
          <span>Verify Code</span>
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

      {/* Secondary Button: Back to Forgot Password */}
      <Button
        type="button"
        variant="outline"
        onClick={onBackToForgotPassword}
        size="md"
        className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold py-3.5 text-sm rounded-xl shadow-xs cursor-pointer w-full"
      >
        Back to Forgot Password
      </Button>
    </form>
  );
};
