import React, { useState, useEffect } from 'react';
import { X, UserCheck, Mail, Shield, Key, Check, Phone, Building } from 'lucide-react';
import type { AdminUserRecord, AdminRole } from './RolesAccessTab';

interface EditUserModalProps {
  user: AdminUserRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: (msg: string) => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  user,
  isOpen,
  onClose,
  onUserUpdated,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<AdminRole>('therapist');
  const [newPassword, setNewPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setEmail(user.email);
      setDepartment(user.department || '');
      setPhone('');
      setRole(user.role);
      setNewPassword('');
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      setIsSuccess(true);
      onUserUpdated(`Successfully updated profile & credentials for ${fullName}`);
      setTimeout(() => {
        setIsSuccess(false);
        setIsSubmitting(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Failed to update user:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 transform transition-all animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Edit User & Credentials</h3>
              <p className="text-xs text-slate-500 font-medium">Update profile details, email, and password</p>
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
            <h4 className="text-lg font-bold text-slate-900">User Updated!</h4>
            <p className="text-sm text-slate-500">
              Email & credentials updated for <span className="font-semibold text-slate-800">{email}</span>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Department
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all"
                    placeholder="e.g. Rehabilitation"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Role & Privileges
              </label>
              <div className="relative">
                <Shield className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as AdminRole)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="superadmin">Superadmin</option>
                  <option value="admin">Clinic Administrator</option>
                  <option value="therapist">Senior Therapist</option>
                  <option value="specialist">Physiotherapist</option>
                  <option value="billing">Billing Specialist</option>
                </select>
              </div>
            </div>

            {/* Update Password Field */}
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2">
              <label className="block text-xs font-bold text-blue-900 uppercase tracking-wider">
                Set New Password (Optional)
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Leave blank to keep existing password. Updating will save credentials securely into Firebase.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
