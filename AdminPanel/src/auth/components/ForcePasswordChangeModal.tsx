import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export const ForcePasswordChangeModal: React.FC = () => {
  const { adminProfile, updateCredentials, logout } = useAuth();
  const [newEmail, setNewEmail] = useState(adminProfile?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!adminProfile || !adminProfile.mustChangePassword) {
    return null;
  }

  const validate = (): boolean => {
    if (!newEmail.trim()) {
      setError('Please enter your updated administrator email address.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(newEmail.trim())) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (!newPassword) {
      setError('Please enter a new password.');
      return false;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return false;
    }
    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError('Password must contain uppercase, lowercase letters, and a number.');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await updateCredentials(newEmail.trim(), newPassword);
    } catch (err: any) {
      console.error('Credentials change error:', err);
      setError(err.message || 'Failed to update credentials. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
        {/* Header Icon */}
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 002-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">Update Admin Credentials</h2>
          <p className="text-xs text-slate-500 mt-1">
            Welcome <span className="font-semibold text-slate-700">{adminProfile.fullName}</span>! You logged in with temporary credentials. Please set your permanent administrator email and password to continue.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="newEmail"
            name="newEmail"
            type="email"
            label="Administrator Email Address"
            placeholder="e.g. admin.clinic@physiotherapy.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
          />

          <Input
            id="newPassword"
            name="newPassword"
            type={showPassword ? 'text' : 'password'}
            label="New Permanent Password"
            placeholder="Minimum 8 characters (Uppercase, lowercase, digit)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs font-medium text-slate-500 hover:text-slate-800"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            }
          />

          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            label="Confirm Permanent Password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <div className="pt-2 flex flex-col gap-2">
            <Button type="submit" isLoading={isSubmitting} variant="primary" className="w-full py-3">
              Save Credentials & Access Dashboard
            </Button>
            <button
              type="button"
              onClick={logout}
              className="text-xs text-slate-500 hover:text-slate-700 py-1 text-center font-medium cursor-pointer"
            >
              Sign out instead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

