import React, { useState } from 'react';
import {
  Heart,
  Dumbbell,
  CreditCard,
  MessageSquare,
  Phone,
  Settings as SettingsIcon,
  RefreshCw,
  AlertTriangle,
  Code,
  ChevronRight,
  Info,
  CheckCircle2,
  Zap,
  Lock,
  X,
  Check
} from 'lucide-react';

interface IntegrationsTabProps {
  onShowToast: (message: string) => void;
}

export const IntegrationsTab: React.FC<IntegrationsTabProps> = ({ onShowToast }) => {
  // Integration States
  const [googleFitConnected, setGoogleFitConnected] = useState(false);
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [twilioBalance, setTwilioBalance] = useState<number>(142.50);

  // Modals state
  const [isConnectGoogleFitOpen, setIsConnectGoogleFitOpen] = useState(false);
  const [googleFitApiKey, setGoogleFitApiKey] = useState('');

  const [isRefillTwilioOpen, setIsRefillTwilioOpen] = useState(false);
  const [refillAmount, setRefillAmount] = useState<number>(1000);

  const [isConfigureModalOpen, setIsConfigureModalOpen] = useState<string | null>(null);
  const [isWebhooksOpen, setIsWebhooksOpen] = useState(false);

  const handleConnectGoogleFit = (e: React.FormEvent) => {
    e.preventDefault();
    setGoogleFitConnected(true);
    setIsConnectGoogleFitOpen(false);
    onShowToast('Google Fit integration successfully connected!');
  };

  const handleRefillTwilio = (e: React.FormEvent) => {
    e.preventDefault();
    setTwilioBalance((prev) => prev + refillAmount);
    setIsRefillTwilioOpen(false);
    onShowToast(`Successfully refilled ₹${refillAmount} into Twilio SMS account!`);
  };

  const handleToggleStripe = () => {
    const nextState = !stripeEnabled;
    setStripeEnabled(nextState);
    onShowToast(nextState ? 'Stripe Payments gateway enabled.' : 'Stripe Payments gateway disabled.');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 3-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column (2 Columns on Desktop) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section 1: Clinical Data */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Clinical Data
              </h3>
              <span className="px-2.5 py-0.5 text-xs font-extrabold bg-blue-50 text-blue-600 border border-blue-100 rounded-full">
                {googleFitConnected ? '2 Active' : '1 Active'}
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500">
              Sync medical records and patient health data.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
              {/* Apple Health Card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs">
                      <Heart className="w-5 h-5 fill-blue-600/10 stroke-blue-600" />
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 text-[10px] font-extrabold tracking-wider bg-blue-50 text-blue-600 border border-blue-100 rounded-full uppercase block">
                        CONNECTED
                      </span>
                      <span className="text-[11px] font-medium text-slate-400 mt-0.5 block">
                        v.2.4.1
                      </span>
                    </div>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 mt-3">Apple Health</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                    Sync patient heart rate, steps, and activity levels directly to charts.
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Last sync: 2m ago</span>
                  <button
                    onClick={() => setIsConfigureModalOpen('Apple Health')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center space-x-1 transition-colors cursor-pointer"
                  >
                    <span>Configure</span>
                    <SettingsIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Google Fit Card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-500 shrink-0">
                      <Dumbbell className="w-5 h-5" />
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-extrabold tracking-wider rounded-full uppercase ${
                      googleFitConnected ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {googleFitConnected ? 'CONNECTED' : 'DISCONNECTED'}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 mt-3">Google Fit</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                    Integration for Android users to share wellness data with clinicians.
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">
                    {googleFitConnected ? 'Last sync: Just now' : 'Requires API Key'}
                  </span>
                  {googleFitConnected ? (
                    <button
                      onClick={() => setIsConfigureModalOpen('Google Fit')}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Configure</span>
                      <SettingsIcon className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsConnectGoogleFitOpen(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Financial & Billing */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Financial & Billing
              </h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                Handle local and international clinic payments.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
              {/* Razorpay Card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600 shrink-0">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-extrabold tracking-wider bg-blue-50 text-blue-600 border border-blue-100 rounded-full uppercase">
                      CONNECTED
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 mt-3">Razorpay</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                    Preferred Indian payment gateway. Supports UPI, NetBanking, and local Cards.
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-slate-600 font-semibold">API Status: Active</span>
                  </div>
                  <button
                    onClick={() => setIsConfigureModalOpen('Razorpay')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                  >
                    Settings
                  </button>
                </div>
              </div>

              {/* Stripe Card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-500 shrink-0">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-extrabold tracking-wider rounded-full uppercase ${
                      stripeEnabled ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {stripeEnabled ? 'CONNECTED' : 'DISABLED'}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 mt-3">Stripe</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                    International billing and subscription management for medical plans.
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Global Standard</span>
                  <button
                    onClick={handleToggleStripe}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                  >
                    {stripeEnabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Communication */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Communication
              </h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                Automate appointment reminders and medical alerts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
              {/* WhatsApp Business Card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-extrabold tracking-wider bg-blue-50 text-blue-600 border border-blue-100 rounded-full uppercase">
                      CONNECTED
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 mt-3">WhatsApp Business</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                    Automated patient intake forms and test result notifications via WhatsApp.
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">98% Delivery Rate</span>
                  <button
                    onClick={() => setIsConfigureModalOpen('WhatsApp Business')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                  >
                    Configure
                  </button>
                </div>
              </div>

              {/* Twilio SMS Card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-extrabold tracking-wider rounded-full uppercase ${
                      twilioBalance < 300 ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    }`}>
                      {twilioBalance < 300 ? 'ALERT' : 'CONNECTED'}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 mt-3">Twilio SMS</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                    Fallback SMS service for high-priority emergency notifications.
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                  {twilioBalance < 300 ? (
                    <span className="text-xs font-bold text-rose-600">
                      Balance Low: ₹{twilioBalance.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-emerald-600">
                      Balance: ₹{twilioBalance.toFixed(2)}
                    </span>
                  )}
                  <button
                    onClick={() => setIsRefillTwilioOpen(true)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    Refill
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Sidebar Column (1 Column) */}
        <div className="space-y-6">
          
          {/* Card 1: Integration Health */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-5 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Integration Health</h4>
            </div>

            {/* Overall System Status */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-semibold text-slate-500">Overall System Status</span>
              <span className="text-sm font-extrabold text-blue-600">Stable</span>
            </div>

            {/* Status Progress Bar */}
            <div className="space-y-2">
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                <div className="h-full bg-blue-600 rounded-l-full" style={{ width: '80%' }} />
                <div className="h-full bg-amber-500" style={{ width: '10%' }} />
                <div className="h-full bg-rose-500 rounded-r-full" style={{ width: '10%' }} />
              </div>
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Active (8)</span>
                <span>Idle (1)</span>
                <span>Errors (1)</span>
              </div>
            </div>

            <div className="border-t border-slate-100 my-2" />

            {/* Recent API Logs */}
            <div className="space-y-3.5">
              <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Recent API Logs
              </h5>

              <div className="space-y-3">
                {/* Log Item 1 */}
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <div>
                    <h6 className="text-xs font-bold text-slate-900">Apple Health Data Sync</h6>
                    <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                      Success • 12,403 points • 2m ago
                    </p>
                  </div>
                </div>

                {/* Log Item 2 */}
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h6 className="text-xs font-bold text-slate-900">WhatsApp Notification</h6>
                    <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                      Delivered to +91 98XXX XXX42 • 15m ago
                    </p>
                  </div>
                </div>

                {/* Log Item 3 */}
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h6 className="text-xs font-bold text-slate-900">Twilio Balance Warning</h6>
                    <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                      Critical threshold reached • 1h ago
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <button
                onClick={() => setIsWebhooksOpen(true)}
                className="w-full flex items-center justify-between p-2 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center space-x-2.5">
                  <Code className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                  <span className="text-xs font-bold">Developer Webhooks</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </button>
            </div>
          </div>

          {/* Card 2: Scheduled Maintenance */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-5 shadow-2xs space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Info className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-amber-900">Scheduled Maintenance</h4>
            </div>
            <p className="text-xs text-amber-800 font-medium leading-relaxed pl-8">
              Razorpay API will be offline on Oct 14, 02:00 IST for infrastructure upgrades.
            </p>
          </div>

        </div>

      </div>

      {/* Modal 1: Connect Google Fit Modal */}
      {isConnectGoogleFitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Connect Google Fit</h3>
                  <p className="text-xs text-slate-500 font-medium">Enter OAuth API Key to establish sync.</p>
                </div>
              </div>
              <button
                onClick={() => setIsConnectGoogleFitOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConnectGoogleFit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Google Fit OAuth Client ID / API Key
                </label>
                <input
                  type="text"
                  required
                  value={googleFitApiKey}
                  onChange={(e) => setGoogleFitApiKey(e.target.value)}
                  placeholder="gfit_live_89324792348729384729"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>

              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-start space-x-2.5 text-xs text-blue-800">
                <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>API Keys are encrypted with AES-256 and stored securely in clinic vault.</span>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsConnectGoogleFitOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/20"
                >
                  Authorize & Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Refill Twilio SMS Modal */}
      {isRefillTwilioOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Refill Twilio Balance</h3>
                  <p className="text-xs text-slate-500 font-medium">Top up funds for emergency SMS outreach.</p>
                </div>
              </div>
              <button
                onClick={() => setIsRefillTwilioOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRefillTwilio} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Select Refill Amount (INR)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[500, 1000, 2500].map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setRefillAmount(amt)}
                      className={`py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        refillAmount === amt
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>New Total Balance</span>
                <span className="text-emerald-600 font-extrabold text-sm">
                  ₹{(twilioBalance + refillAmount).toFixed(2)}
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsRefillTwilioOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-rose-500/20 cursor-pointer"
                >
                  Pay & Refill Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Integration Settings / Configuration Modal */}
      {isConfigureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {isConfigureModalOpen} Configuration
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Manage sync intervals, permissions, and security parameters.
                </p>
              </div>
              <button
                onClick={() => setIsConfigureModalOpen(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Auto Sync Rate</span>
                  <span className="text-xs font-bold text-blue-600">Every 15 Minutes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Data Encryption</span>
                  <span className="text-xs font-bold text-emerald-600">AES-256 TLS 1.3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">HIPAA Data Pipeline</span>
                  <span className="text-xs font-bold text-slate-900">Verified</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsConfigureModalOpen(null)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Developer Webhooks Modal */}
      {isWebhooksOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                  <Code className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Developer Webhooks</h3>
                  <p className="text-xs text-slate-500 font-medium">Real-time webhook endpoints and payload dispatching.</p>
                </div>
              </div>
              <button
                onClick={() => setIsWebhooksOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Endpoint URL
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value="https://api.onemedical.com/v1/webhooks/health-sync"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800"
                  />
                  <button
                    onClick={() => onShowToast('Webhook URL copied to clipboard!')}
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shrink-0"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Active Event Listeners
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {['patient.created', 'appointment.booked', 'vital_signs.synced', 'invoice.paid'].map((evt) => (
                    <span key={evt} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-mono font-medium rounded-lg border border-slate-200/60">
                      {evt}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onShowToast('Test webhook ping sent! HTTP 200 OK received.')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl"
                >
                  Send Test Ping
                </button>
                <button
                  type="button"
                  onClick={() => setIsWebhooksOpen(false)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
