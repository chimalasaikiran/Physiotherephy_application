import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Info,
  Lock,
  RefreshCw,
  Plus,
  X,
  ChevronDown,
  Shield,
  Server,
  Key,
  Database
} from 'lucide-react';

interface SecurityTabProps {
  onShowToast: (message: string) => void;
}

const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}> = ({ checked, onChange, disabled }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
      checked ? 'bg-[#00A389]' : 'bg-slate-200'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    <span
      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

export const SecurityTab: React.FC<SecurityTabProps> = ({ onShowToast }) => {
  // Authentication & MFA State
  const [smsVerification, setSmsVerification] = useState(true);
  const [emailVerification, setEmailVerification] = useState(true);
  const [authenticatorApp, setAuthenticatorApp] = useState(true);

  // Password Governance State
  const [minPasswordLength, setMinPasswordLength] = useState('12 Characters');
  const [autoExpiry, setAutoExpiry] = useState(true);

  // System Access State
  const [sessionTimeout, setSessionTimeout] = useState('15');
  const [newIpAddress, setNewIpAddress] = useState('');
  const [whitelistedIps, setWhitelistedIps] = useState<string[]>([
    '192.168.1.104',
    '10.0.4.12'
  ]);

  const handleAddIp = () => {
    if (!newIpAddress.trim()) return;
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipPattern.test(newIpAddress.trim())) {
      onShowToast('Please enter a valid IP address format (e.g. 192.168.1.1)');
      return;
    }
    if (whitelistedIps.includes(newIpAddress.trim())) {
      onShowToast('IP address is already whitelisted');
      return;
    }
    setWhitelistedIps([...whitelistedIps, newIpAddress.trim()]);
    onShowToast(`Added ${newIpAddress.trim()} to IP Whitelist`);
    setNewIpAddress('');
  };

  const handleRemoveIp = (ipToRemove: string) => {
    setWhitelistedIps(whitelistedIps.filter((ip) => ip !== ipToRemove));
    onShowToast(`Removed ${ipToRemove} from IP Whitelist`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 2-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Main Content Column (Spans 2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: Authentication & MFA */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden hover:shadow-sm transition-shadow">
            {/* Header */}
            <div className="p-6 sm:p-7 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Authentication & MFA
              </h3>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#E6F7F5] text-[#00A389] border border-[#00A389]/20 self-start sm:self-auto">
                Mandatory for all clinical roles
              </span>
            </div>

            {/* List of Toggles */}
            <div className="p-6 sm:p-7 space-y-6">
              {/* Item 1: SMS Verification */}
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">SMS Verification</h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Verification codes sent via cellular network.
                  </p>
                </div>
                <ToggleSwitch
                  checked={smsVerification}
                  onChange={(val) => {
                    setSmsVerification(val);
                    onShowToast(val ? 'SMS Verification enabled' : 'SMS Verification disabled');
                  }}
                />
              </div>

              {/* Item 2: Email Verification */}
              <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-100/70">
                <div className="space-y-1 pt-5">
                  <h4 className="text-sm font-bold text-slate-900">Email Verification</h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Standard one-time passcode delivery to work email.
                  </p>
                </div>
                <div className="pt-5">
                  <ToggleSwitch
                    checked={emailVerification}
                    onChange={(val) => {
                      setEmailVerification(val);
                      onShowToast(val ? 'Email Verification enabled' : 'Email Verification disabled');
                    }}
                  />
                </div>
              </div>

              {/* Item 3: Authenticator App */}
              <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-100/70">
                <div className="space-y-1 pt-5">
                  <h4 className="text-sm font-bold text-slate-900">Authenticator App</h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Recommended for clinical staff using TOTP apps (Okta, Google).
                  </p>
                </div>
                <div className="pt-5">
                  <ToggleSwitch
                    checked={authenticatorApp}
                    onChange={(val) => {
                      setAuthenticatorApp(val);
                      onShowToast(val ? 'Authenticator App MFA enabled' : 'Authenticator App MFA disabled');
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Password Governance */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden hover:shadow-sm transition-shadow">
            <div className="p-6 sm:p-7 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Password Governance
              </h3>
            </div>

            <div className="p-6 sm:p-7 space-y-6">
              {/* Row 1: Dropdown & Requirements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Minimum Password Length */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Minimum Password Length
                  </label>
                  <div className="relative">
                    <select
                      value={minPasswordLength}
                      onChange={(e) => {
                        setMinPasswordLength(e.target.value);
                        onShowToast(`Minimum password length set to ${e.target.value}`);
                      }}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer transition-colors"
                    >
                      <option value="8 Characters">8 Characters</option>
                      <option value="10 Characters">10 Characters</option>
                      <option value="12 Characters">12 Characters</option>
                      <option value="16 Characters">16 Characters</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Complexity Requirements */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Complexity Requirements
                  </label>
                  <div className="flex flex-wrap gap-2 pt-0.5">
                    <span className="px-3.5 py-2 rounded-xl bg-slate-100/90 text-slate-700 text-xs font-semibold border border-slate-200/60 shadow-2xs">
                      Symbols
                    </span>
                    <span className="px-3.5 py-2 rounded-xl bg-slate-100/90 text-slate-700 text-xs font-semibold border border-slate-200/60 shadow-2xs">
                      Numbers
                    </span>
                    <span className="px-3.5 py-2 rounded-xl bg-slate-100/90 text-slate-700 text-xs font-semibold border border-slate-200/60 shadow-2xs">
                      Mixed Casing
                    </span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100" />

              {/* Row 2: 90-Day Auto-Expiry */}
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">90-Day Auto-Expiry</h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Force all users to refresh credentials every quarter.
                  </p>
                </div>
                <ToggleSwitch
                  checked={autoExpiry}
                  onChange={(val) => {
                    setAutoExpiry(val);
                    onShowToast(val ? '90-Day password auto-expiry enabled' : '90-Day auto-expiry disabled');
                  }}
                />
              </div>
            </div>
          </div>

          {/* Card 3: System Access */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden hover:shadow-sm transition-shadow">
            <div className="p-6 sm:p-7 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                System Access
              </h3>
            </div>

            <div className="p-6 sm:p-7 space-y-6">
              {/* Inputs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Automatic Session Timeout */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Automatic Session Timeout
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      value={sessionTimeout}
                      onChange={(e) => setSessionTimeout(e.target.value)}
                      onBlur={() => onShowToast(`Session timeout updated to ${sessionTimeout} minutes`)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                      placeholder="15"
                    />
                    <span className="text-sm font-bold text-slate-700 shrink-0">Minutes</span>
                  </div>
                </div>

                {/* IP Address Whitelisting */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    IP Address Whitelisting
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newIpAddress}
                      onChange={(e) => setNewIpAddress(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddIp();
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                      placeholder="e.g., 192.168.1.1"
                    />
                    <button
                      type="button"
                      onClick={handleAddIp}
                      className="px-5 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-sm rounded-2xl transition-colors shrink-0 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Whitelisted IPs Chips */}
              {whitelistedIps.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs font-bold text-slate-400 mr-2 uppercase tracking-wider">Active Whitelist:</span>
                  {whitelistedIps.map((ip) => (
                    <span
                      key={ip}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/70 text-xs font-bold shadow-2xs"
                    >
                      <span>{ip}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveIp(ip)}
                        className="p-0.5 hover:bg-emerald-200/50 rounded-full transition-colors text-emerald-700 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Info Banner */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center space-x-3 text-slate-600 text-xs font-medium">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Info className="w-4 h-4" />
                </div>
                <span>
                  IP Whitelisting restricts clinical system access to recognized medical office networks only.
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Encryption & Compliance */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden hover:shadow-sm transition-shadow">
            {/* Header */}
            <div className="p-6 sm:p-7 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Encryption & Compliance
              </h3>
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E6F7F5] text-[#00A389] border border-[#00A389]/20">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00A389]" />
                <span>HIPAA Compliant</span>
              </span>
            </div>

            <div className="p-6 sm:p-7">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Security Feature 1 */}
                <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/40 flex items-center space-x-4">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#00A389] shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">AES-256 Storage Encryption</h4>
                    <span className="text-xs font-bold text-[#00A389] mt-0.5 block">Verified Active</span>
                  </div>
                </div>

                {/* Security Feature 2 */}
                <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/40 flex items-center space-x-4">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#00A389] shrink-0">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">TLS 1.3 Transport Security</h4>
                    <span className="text-xs font-bold text-[#00A389] mt-0.5 block">Verified Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Sidebar Widgets Column (Spans 1 Column) */}
        <div className="space-y-6">
          
          {/* Widget 1: SECURITY HEALTH SCORE */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs text-center space-y-4 hover:shadow-sm transition-shadow">
            <span className="block text-[11px] font-extrabold text-slate-400 tracking-wider uppercase">
              SECURITY HEALTH SCORE
            </span>

            <div className="py-2">
              <div className="text-5xl font-black text-slate-900 tracking-tight">
                98%
              </div>
              <span className="inline-block text-xs font-extrabold text-[#00A389] tracking-wider uppercase mt-1">
                OPTIMAL
              </span>
            </div>

            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
              Your clinic security settings exceed the industry standard for pediatric medical facilities.
            </p>
          </div>

          {/* Widget 2: AUDIT SUMMARY */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs space-y-5 hover:shadow-sm transition-shadow">
            <span className="block text-[11px] font-extrabold text-slate-400 tracking-wider uppercase">
              AUDIT SUMMARY
            </span>

            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Last Clinical Audit</span>
                <span className="font-bold text-slate-900">Oct 22, 2023</span>
              </div>

              <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-3">
                <span className="font-semibold text-slate-500">Failed Logins (24h)</span>
                <span className="font-bold text-slate-900">3</span>
              </div>

              <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-3">
                <span className="font-semibold text-slate-500">Policy Updates</span>
                <span className="font-bold text-[#00A389]">None Pending</span>
              </div>
            </div>
          </div>

          {/* Widget 3: PHYSIOCLOUD SHIELD Banner Card */}
          <div className="relative rounded-3xl overflow-hidden shadow-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-6 text-white border border-slate-800 group">
            {/* Ambient Background Glow Effects */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#00A389]/20 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              {/* Badge/Icon graphic preview container */}
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-[#00A389] shadow-inner">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>

              <div>
                <span className="text-[10px] font-extrabold tracking-widest text-emerald-400 uppercase block mb-1">
                  PHYSIOCLOUD SHIELD
                </span>
                <h4 className="text-base font-extrabold text-white tracking-tight">
                  Enhanced Data Protection
                </h4>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/10">
                <span>Enterprise Grade</span>
                <span className="text-emerald-400 font-semibold">v2.4 Active</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SecurityTab;
