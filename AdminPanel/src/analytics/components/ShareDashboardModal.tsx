import React, { useState } from 'react';
import { X, Share2, Copy, Check, Mail } from 'lucide-react';

interface ShareDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShareSuccess: (msg: string) => void;
}

export const ShareDashboardModal: React.FC<ShareDashboardModalProps> = ({
  isOpen,
  onClose,
  onShareSuccess,
}) => {
  const [copied, setCopied] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/analytics/share/token-${Math.random().toString(36).substring(7)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onShareSuccess('Dashboard link copied to clipboard!');
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    onShareSuccess(`Dashboard link shared with ${emailInput}`);
    setEmailInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                Share Dashboard
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Grant access or share live analytics view
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Copy Link Section */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 block">
            Direct Shareable Link
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-600 font-mono focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center space-x-1.5 cursor-pointer shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Email Invite Form */}
        <form onSubmit={handleSendInvite} className="space-y-3 pt-2 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-700 block">
            Invite via Email
          </label>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="colleague@onemedical.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
            >
              Send Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
