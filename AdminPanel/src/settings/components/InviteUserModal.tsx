import React, { useState } from 'react';
import { X, UserPlus, Mail, Shield, Check, AlertCircle } from 'lucide-react';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteSent: (name: string, role: string) => void;
}

export const InviteUserModal: React.FC<InviteUserModalProps> = ({
  isOpen,
  onClose,
  onInviteSent,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>('Senior Therapist');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    onInviteSent(fullName, role);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setFullName('');
      setEmail('');
      setIsSubmitting(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 transform transition-all animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Invite User</h3>
              <p className="text-xs text-slate-500 font-medium">Send team invitation email</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Invitation Sent!</h4>
            <p className="text-sm text-slate-500">
              An invitation email has been sent to <span className="font-semibold text-slate-800">{email}</span>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all"
                placeholder="e.g. Dr. Alex Mercer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all"
                  placeholder="alex.mercer@onemedical.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Role & Permissions
              </label>
              <div className="relative">
                <Shield className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="Senior Therapist">Senior Therapist</option>
                  <option value="Physical Therapist">Physical Therapist</option>
                  <option value="Clinic Administrator">Clinic Administrator</option>
                  <option value="Billing Specialist">Billing Specialist</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                Send Invite
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
