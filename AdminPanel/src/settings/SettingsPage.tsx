import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Clock,
  CreditCard,
  ShieldCheck,
  Mail,
  MessageSquare,
  UserPlus,
  CloudUpload,
  FileSpreadsheet,
  Share2,
  RefreshCw,
  UserCheck,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Bell,
  Sliders,
  Palette,
  Shield,
  History,
  Building,
  Users,
  Moon,
  Sun,
  FileText
} from 'lucide-react';
import type { ClinicProfile, ActivityLogItem, PendingInvite } from './types';
import { ClinicProfileModal } from './components/ClinicProfileModal';
import { InviteUserModal } from './components/InviteUserModal';
import { IntegrationsTab } from './components/IntegrationsTab';
import { SecurityTab } from './components/SecurityTab';
import { AuditLogsTab } from './components/AuditLogsTab';
import { RolesAccessTab } from './components/RolesAccessTab';

interface SettingsPageProps {
  initialSubTab?:
    | 'Overview'
    | 'Clinic'
    | 'Users & Roles'
    | 'Notifications'
    | 'Integrations'
    | 'Branding'
    | 'Security'
    | 'Audit Logs';
  onNavigateToTab?: (tab: string) => void;
}

const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}> = ({ checked, onChange, label, disabled }) => (
  <div className="inline-flex items-center space-x-2.5">
    {label && (
      <span className={`text-xs font-semibold ${checked ? 'text-slate-700' : 'text-slate-500'}`}>
        {label}
      </span>
    )}
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
        checked ? 'bg-[#00A389]' : 'bg-slate-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
);

export const SettingsPage: React.FC<SettingsPageProps> = ({ initialSubTab = 'Security', onNavigateToTab }) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'Overview' | 'Clinic' | 'Users & Roles' | 'Notifications' | 'Integrations' | 'Branding' | 'Security' | 'Audit Logs'
  >(initialSubTab);

  React.useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Notification Toggles State
  const [clinicalAlerts, setClinicalAlerts] = useState({
    newAppointments: { email: true, inApp: true, sms: false },
    emergencyCancellations: { email: true, inApp: true, sms: true },
    criticalPatientNotes: { email: true, inApp: true, sms: false },
  });

  const [patientComms, setPatientComms] = useState({
    recoveryProgramUpdates: { email: true, inApp: false, sms: true },
  });

  const [quietHours, setQuietHours] = useState({
    enabled: false,
    startSilenceAt: '08:00 PM',
    endSilenceAt: '07:00 AM',
  });

  // Clinic profile state
  const [clinicProfile, setClinicProfile] = useState<ClinicProfile>({
    name: 'One Medical Central',
    primaryContact: 'admin@onemedical.com',
    address: '122 Innovation Plaza, Floor 4, New York, NY 10012',
    phone: '+1 (555) 019-2834',
    website: 'https://onemedical.com',
  });

  // Recent system activity state
  const [activities, setActivities] = useState<ActivityLogItem[]>([
    {
      id: 'act-1',
      user: 'Dr. Sarah Smith',
      action: 'updated the primary branding palette.',
      timestamp: 'Today, 10:45 AM',
      type: 'branding',
    },
    {
      id: 'act-2',
      user: 'Admin',
      action: 'invited Marcus Holloway as Senior Therapist.',
      timestamp: 'Yesterday, 4:20 PM',
      type: 'user',
    },
  ]);

  // Pending invites state
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([
    {
      id: 'p-1',
      name: 'Jane Doe',
      role: 'Physiotherapist',
      initials: 'JD',
      expiresIn: '48 hours',
    },
    {
      id: 'p-2',
      name: 'Marcus Holloway',
      role: 'Senior Therapist',
      initials: 'MH',
      expiresIn: '24 hours',
    },
    {
      id: 'p-3',
      name: 'Elena Rostova',
      role: 'Clinical Specialist',
      initials: 'ER',
      expiresIn: '72 hours',
    },
  ]);

  // Toast message state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isInviteUserOpen, setIsInviteUserOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleInviteUserSuccess = (name: string, role: string) => {
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const newInvite: PendingInvite = {
      id: `p-${Date.now()}`,
      name,
      role,
      initials: initials || 'US',
      expiresIn: '72 hours',
    };

    setPendingInvites([newInvite, ...pendingInvites]);
    setActivities([
      {
        id: `act-${Date.now()}`,
        user: 'Admin',
        action: `invited ${name} as ${role}.`,
        timestamp: 'Just now',
        type: 'user',
      },
      ...activities,
    ]);
    showToast(`Invitation sent to ${name} (${role})`);
  };

  const handleBackupData = () => {
    showToast('Clinic data backup initiated! Backup archive will be ready shortly.');
  };

  const handleExportAuditLog = () => {
    showToast('Exporting complete audit log CSV... File download started.');
  };

  const subTabs = [
    { id: 'Overview', label: 'Overview' },
    { id: 'Clinic', label: 'Clinic' },
    { id: 'Users & Roles', label: 'Users & Roles' },
    { id: 'Notifications', label: 'Notifications' },
    { id: 'Integrations', label: 'Integrations' },
    { id: 'Branding', label: 'Branding' },
    { id: 'Security', label: 'Security' },
    { id: 'Audit Logs', label: 'Audit Logs' },
  ] as const;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification Floating Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 border border-slate-700 animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Main Settings Header */}
      <div className="space-y-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Settings
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Manage clinic configuration, users, security and integrations.
          </p>
        </div>

        {/* Horizontal Sub-tab Menu */}
        <div className="flex items-center space-x-6 overflow-x-auto pb-1 scrollbar-none pt-2 border-b border-slate-200/80">
          {subTabs.map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as typeof activeSubTab)}
                className={`pb-3 text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer relative ${
                  isActive
                    ? 'text-blue-600 font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub Tab View Renderer */}
      {activeSubTab === 'Overview' && (
        <div className="space-y-6">
          {/* Main Section Heading */}
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Workspace Overview
            </h3>
            <p className="text-sm font-medium text-slate-500 mt-0.5">
              Manage your clinic's core configuration and subscription status.
            </p>
          </div>

          {/* Grid Layout: 2 Cols Left Main Content + 1 Col Right Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left Content Area (Spans 2 columns on desktop) */}
            <div className="lg:col-span-2 space-y-6">
              {/* 1. Clinic Profile Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs relative hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Lotus / Physiotherapy Icon Box */}
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs shrink-0">
                      <svg
                        className="w-7 h-7 stroke-emerald-600 fill-emerald-600/10"
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <circle cx="12" cy="11" r="3" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">Clinic Profile</h4>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">
                        Update your public clinic details and identity.
                      </p>
                    </div>
                  </div>

                  {/* Top Right Gear / Edit Button */}
                  <button
                    onClick={() => setIsEditProfileOpen(true)}
                    className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                    title="Edit Clinic Details"
                  >
                    <SettingsIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="border-t border-slate-100 my-5" />

                {/* Details Meta Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <span className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-1">
                      CLINIC NAME
                    </span>
                    <p className="text-sm font-bold text-slate-900">{clinicProfile.name}</p>
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-1">
                      PRIMARY CONTACT
                    </span>
                    <p className="text-sm font-medium text-slate-800">{clinicProfile.primaryContact}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-1">
                      ADDRESS
                    </span>
                    <p className="text-sm font-medium text-slate-800">{clinicProfile.address}</p>
                  </div>
                </div>
              </div>

              {/* 2. Side-by-Side Cards (Business Hours & Subscription) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Business Hours Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900">Business Hours</h4>
                  </div>

                  <div className="space-y-3 pt-1 text-sm font-medium">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Mon–Fri</span>
                      <span className="font-bold text-slate-800">08:00 AM - 06:00 PM</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Saturday</span>
                      <span className="font-bold text-slate-800">10:00 AM - 02:00 PM</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Sunday</span>
                      <span className="font-extrabold text-rose-500">Closed</span>
                    </div>
                  </div>
                </div>

                {/* Subscription Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 hover:shadow-md transition-shadow relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <h4 className="text-base font-bold text-slate-900">Subscription</h4>
                    </div>
                    <span className="px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200/60 rounded-full uppercase">
                      ACTIVE
                    </span>
                  </div>

                  <div className="space-y-3 pt-1">
                    <div>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        Plan
                      </span>
                      <p className="text-base font-extrabold text-blue-600 mt-0.5">Enterprise Pro</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-500"
                          style={{ width: '84%' }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                        <span>Usage: 84% of data cap</span>
                        <span>Renewal: Dec 14, 2024</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Recent System Activity Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-slate-900">Recent System Activity</h4>
                  <button
                    onClick={() => setActiveSubTab('Audit Logs')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                  >
                    View All Logs
                  </button>
                </div>

                <div className="space-y-4">
                  {activities.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start space-x-3.5 pb-3 border-b border-slate-100 last:border-b-0 last:pb-0"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        {item.type === 'branding' ? (
                          <RefreshCw className="w-4 h-4" />
                        ) : (
                          <UserPlus className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-700 leading-relaxed font-medium">
                          <span className="font-bold text-slate-900">{item.user}</span> {item.action}
                        </p>
                        <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
                          {item.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column (Widgets Column) */}
            <div className="space-y-6">
              {/* Widget 1: Security Health Card (Dark Slate Theme) */}
              <div className="bg-slate-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden border border-slate-800 space-y-4">
                {/* Subtle background glow effect */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/20 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-400">Status: Secure</span>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Security Health
                  </h4>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-4xl font-extrabold text-white tracking-tight">100%</span>
                    <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-400/30 rounded-full">
                      Protected
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed font-normal">
                  Your clinic's digital infrastructure is fully compliant and optimized for patient data
                  safety.
                </p>
              </div>

              {/* Widget 2: Communication Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <span className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                  COMMUNICATION
                </span>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 border border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600">
                        <Mail className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700">Email Alerts</span>
                    </div>
                    <span className="text-sm font-extrabold text-slate-900">12</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 border border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700">SMS Gateways</span>
                    </div>
                    <span className="text-sm font-extrabold text-slate-900">04</span>
                  </div>
                </div>
              </div>

              {/* Widget 3: Pending Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-base font-bold text-slate-900">Pending</h4>
                    <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center">
                      {pendingInvites.length}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 font-medium">Expiring in 48 hours</p>

                <div className="space-y-2.5">
                  {pendingInvites.slice(0, 2).map((invite) => (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {invite.initials}
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-900">{invite.name}</h5>
                          <span className="text-[11px] text-slate-400 font-medium block">
                            {invite.role}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => showToast(`Resent invitation email to ${invite.name}`)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-colors cursor-pointer"
                        title="Resend Invite"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Widget 4: Quick Actions Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <span className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                  QUICK ACTIONS
                </span>

                <div className="space-y-2.5">
                  <button
                    onClick={() => setIsInviteUserOpen(true)}
                    className="w-full flex items-center space-x-3 px-4 py-3 bg-white border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30 rounded-2xl text-xs font-bold text-slate-800 transition-all shadow-2xs group cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-slate-500 group-hover:text-blue-600" />
                    <span>Invite User</span>
                  </button>

                  <button
                    onClick={handleBackupData}
                    className="w-full flex items-center space-x-3 px-4 py-3 bg-white border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30 rounded-2xl text-xs font-bold text-slate-800 transition-all shadow-2xs group cursor-pointer"
                  >
                    <CloudUpload className="w-4 h-4 text-slate-500 group-hover:text-blue-600" />
                    <span>Backup Clinic Data</span>
                  </button>

                  <button
                    onClick={handleExportAuditLog}
                    className="w-full flex items-center space-x-3 px-4 py-3 bg-white border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30 rounded-2xl text-xs font-bold text-slate-800 transition-all shadow-2xs group cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-slate-500 group-hover:text-blue-600" />
                    <span>Export Audit Log</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clinic Sub Tab Content */}
      {activeSubTab === 'Clinic' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Clinic Details & Branding</h3>
              <p className="text-xs text-slate-500 mt-1">
                Configure clinic branch locations, operational hours, and contact details.
              </p>
            </div>
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Edit Details
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Main Branch Name</span>
              <p className="text-base font-bold text-slate-900">{clinicProfile.name}</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Administrator Contact</span>
              <p className="text-base font-bold text-slate-900">{clinicProfile.primaryContact}</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-2 md:col-span-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Address</span>
              <p className="text-base font-bold text-slate-900">{clinicProfile.address}</p>
            </div>
          </div>
        </div>
      )}

      {/* Users & Roles Sub Tab Content */}
      {activeSubTab === 'Users & Roles' && (
        <RolesAccessTab onShowToast={showToast} />
      )}

      {/* Notifications Sub Tab Content */}
      {activeSubTab === 'Notifications' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Section Header */}
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Notification Settings
            </h3>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Configure how Dr. Ananya Iyer and your clinical team receive critical workspace alerts and patient communications.
            </p>
          </div>

          {/* Card 1: Clinical Alerts */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 hover:shadow-sm transition-shadow">
            {/* Card Header */}
            <div className="flex items-center space-x-4">
              <div className="w-11 h-11 rounded-2xl bg-[#E6F7F5] border border-teal-100 flex items-center justify-center text-[#00A389] shrink-0 shadow-2xs">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Clinical Alerts</h4>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  Critical notifications for Dr. Arjun Mehta and the physiotherapy staff.
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6 space-y-6">
              {/* Row 1: New Appointments */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="space-y-0.5 max-w-md">
                  <h5 className="text-sm font-bold text-slate-900">New Appointments</h5>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Immediate alert when a patient books a session.
                  </p>
                </div>
                <div className="flex items-center space-x-6 shrink-0">
                  <ToggleSwitch
                    label="Email"
                    checked={clinicalAlerts.newAppointments.email}
                    onChange={(val) => {
                      setClinicalAlerts({
                        ...clinicalAlerts,
                        newAppointments: { ...clinicalAlerts.newAppointments, email: val },
                      });
                      showToast('New Appointments email notification updated');
                    }}
                  />
                  <ToggleSwitch
                    label="In-App"
                    checked={clinicalAlerts.newAppointments.inApp}
                    onChange={(val) => {
                      setClinicalAlerts({
                        ...clinicalAlerts,
                        newAppointments: { ...clinicalAlerts.newAppointments, inApp: val },
                      });
                      showToast('New Appointments in-app notification updated');
                    }}
                  />
                  <ToggleSwitch
                    label="SMS"
                    checked={clinicalAlerts.newAppointments.sms}
                    onChange={(val) => {
                      setClinicalAlerts({
                        ...clinicalAlerts,
                        newAppointments: { ...clinicalAlerts.newAppointments, sms: val },
                      });
                      showToast('New Appointments SMS notification updated');
                    }}
                  />
                </div>
              </div>

              {/* Row 2: Emergency Cancellations */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="space-y-0.5 max-w-md">
                  <h5 className="text-sm font-bold text-slate-900">Emergency Cancellations</h5>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Priority alerts for slots cancelled with &lt; 4 hours notice.
                  </p>
                </div>
                <div className="flex items-center space-x-6 shrink-0">
                  <ToggleSwitch
                    label="Email"
                    checked={clinicalAlerts.emergencyCancellations.email}
                    onChange={(val) => {
                      setClinicalAlerts({
                        ...clinicalAlerts,
                        emergencyCancellations: { ...clinicalAlerts.emergencyCancellations, email: val },
                      });
                      showToast('Emergency Cancellations email notification updated');
                    }}
                  />
                  <ToggleSwitch
                    label="In-App"
                    checked={clinicalAlerts.emergencyCancellations.inApp}
                    onChange={(val) => {
                      setClinicalAlerts({
                        ...clinicalAlerts,
                        emergencyCancellations: { ...clinicalAlerts.emergencyCancellations, inApp: val },
                      });
                      showToast('Emergency Cancellations in-app notification updated');
                    }}
                  />
                  <ToggleSwitch
                    label="SMS"
                    checked={clinicalAlerts.emergencyCancellations.sms}
                    onChange={(val) => {
                      setClinicalAlerts({
                        ...clinicalAlerts,
                        emergencyCancellations: { ...clinicalAlerts.emergencyCancellations, sms: val },
                      });
                      showToast('Emergency Cancellations SMS notification updated');
                    }}
                  />
                </div>
              </div>

              {/* Row 3: Critical Patient Notes */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5 max-w-md">
                  <h5 className="text-sm font-bold text-slate-900">Critical Patient Notes</h5>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Alerts for flagged clinical observations or post-op complications.
                  </p>
                </div>
                <div className="flex items-center space-x-6 shrink-0">
                  <ToggleSwitch
                    label="Email"
                    checked={clinicalAlerts.criticalPatientNotes.email}
                    onChange={(val) => {
                      setClinicalAlerts({
                        ...clinicalAlerts,
                        criticalPatientNotes: { ...clinicalAlerts.criticalPatientNotes, email: val },
                      });
                      showToast('Critical Patient Notes email notification updated');
                    }}
                  />
                  <ToggleSwitch
                    label="In-App"
                    checked={clinicalAlerts.criticalPatientNotes.inApp}
                    onChange={(val) => {
                      setClinicalAlerts({
                        ...clinicalAlerts,
                        criticalPatientNotes: { ...clinicalAlerts.criticalPatientNotes, inApp: val },
                      });
                      showToast('Critical Patient Notes in-app notification updated');
                    }}
                  />
                  <ToggleSwitch
                    label="SMS"
                    checked={clinicalAlerts.criticalPatientNotes.sms}
                    onChange={(val) => {
                      setClinicalAlerts({
                        ...clinicalAlerts,
                        criticalPatientNotes: { ...clinicalAlerts.criticalPatientNotes, sms: val },
                      });
                      showToast('Critical Patient Notes SMS notification updated');
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Patient Communications */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 hover:shadow-sm transition-shadow">
            {/* Card Header */}
            <div className="flex items-center space-x-4">
              <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0 shadow-2xs">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Patient Communications</h4>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  Manage touchpoints for recovery programs and automated outreach.
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              {/* Row 1: Recovery Program Updates */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5 max-w-md">
                  <h5 className="text-sm font-bold text-slate-900">Recovery Program Updates</h5>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Weekly progress summaries sent to patients.
                  </p>
                </div>
                <div className="flex items-center space-x-6 shrink-0">
                  <ToggleSwitch
                    label="Email"
                    checked={patientComms.recoveryProgramUpdates.email}
                    onChange={(val) => {
                      setPatientComms({
                        ...patientComms,
                        recoveryProgramUpdates: { ...patientComms.recoveryProgramUpdates, email: val },
                      });
                      showToast('Recovery Program Updates email notification updated');
                    }}
                  />
                  <ToggleSwitch
                    label="In-App"
                    checked={patientComms.recoveryProgramUpdates.inApp}
                    onChange={(val) => {
                      setPatientComms({
                        ...patientComms,
                        recoveryProgramUpdates: { ...patientComms.recoveryProgramUpdates, inApp: val },
                      });
                      showToast('Recovery Program Updates in-app notification updated');
                    }}
                  />
                  <ToggleSwitch
                    label="SMS"
                    checked={patientComms.recoveryProgramUpdates.sms}
                    onChange={(val) => {
                      setPatientComms({
                        ...patientComms,
                        recoveryProgramUpdates: { ...patientComms.recoveryProgramUpdates, sms: val },
                      });
                      showToast('Recovery Program Updates SMS notification updated');
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Global Quiet Hours */}
          <div className="bg-[#F8FAFC] rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-11 h-11 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white shrink-0 shadow-xs">
                  <Moon className="w-5 h-5 text-slate-200" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">Global Quiet Hours</h4>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    Prevent burnout by silencing non-emergency alerts during rest hours.
                  </p>
                </div>
              </div>

              {/* Master Toggle Switch */}
              <ToggleSwitch
                checked={quietHours.enabled}
                onChange={(val) => {
                  setQuietHours({ ...quietHours, enabled: val });
                  showToast(val ? 'Global Quiet Hours enabled' : 'Global Quiet Hours disabled');
                }}
              />
            </div>

            {/* Time Pickers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Start Silence Box */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-2">
                <span className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                  START SILENCE AT
                </span>
                <div className="flex items-center space-x-3 text-slate-700">
                  <Clock className="w-5 h-5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={quietHours.startSilenceAt}
                    onChange={(e) => setQuietHours({ ...quietHours, startSilenceAt: e.target.value })}
                    className="text-sm font-semibold text-slate-800 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 w-full"
                    placeholder="08:00 PM"
                  />
                </div>
              </div>

              {/* End Silence Box */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-2">
                <span className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                  END SILENCE AT
                </span>
                <div className="flex items-center space-x-3 text-slate-700">
                  <Sun className="w-5 h-5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={quietHours.endSilenceAt}
                    onChange={(e) => setQuietHours({ ...quietHours, endSilenceAt: e.target.value })}
                    className="text-sm font-semibold text-slate-800 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 w-full"
                    placeholder="07:00 AM"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Integrations Sub Tab Content */}
      {activeSubTab === 'Integrations' && (
        <IntegrationsTab onShowToast={showToast} />
      )}

      {/* Branding Sub Tab Content */}
      {activeSubTab === 'Branding' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Branding & Portal Styling</h3>
            <p className="text-xs text-slate-500 mt-1">
              Customize logos, color palettes, and invoice branding.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center space-x-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                LOGO
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Clinic Primary Logo</h4>
                <p className="text-xs text-slate-500">PNG or SVG format (Max 5MB)</p>
              </div>
              <button
                onClick={() => showToast('Logo upload dialog opened.')}
                className="ml-auto px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Upload Logo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Sub Tab Content */}
      {activeSubTab === 'Security' && (
        <SecurityTab onShowToast={showToast} />
      )}

      {/* Audit Logs Sub Tab Content */}
      {activeSubTab === 'Audit Logs' && (
        <AuditLogsTab onShowToast={showToast} />
      )}

      {/* Modals */}
      <ClinicProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        profile={clinicProfile}
        onSave={(updated) => setClinicProfile(updated)}
      />

      <InviteUserModal
        isOpen={isInviteUserOpen}
        onClose={() => setIsInviteUserOpen(false)}
        onInviteSent={handleInviteUserSuccess}
      />
    </div>
  );
};

export default SettingsPage;
