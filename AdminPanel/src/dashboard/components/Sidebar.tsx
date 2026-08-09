import React from 'react';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Calendar,
  Layers,
  CreditCard,
  BarChart3,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  X,
  Cross
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onLogout,
  isOpen,
  onClose,
}) => {
  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'therapists', label: 'Therapists', icon: Stethoscope },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'programs', label: 'Programs', icon: Layers },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const bottomNavItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'support', label: 'Support', icon: HelpCircle },
  ];

  const isItemActive = (itemId: string, currentTab: string) => {
    if (currentTab === itemId) return true;
    if (itemId === 'therapists') {
      return (
        currentTab === 'therapist-profile' ||
        currentTab === 'add-therapist' ||
        currentTab.startsWith('therapist') ||
        currentTab.startsWith('add-therapist')
      );
    }
    if (itemId === 'patients') {
      return (
        currentTab === 'patient-profile' ||
        currentTab === 'add-patient' ||
        currentTab.startsWith('patient') ||
        currentTab.startsWith('add-patient')
      );
    }
    if (itemId === 'schedule') {
      return (
        currentTab === 'schedule' ||
        currentTab === 'create-appointment' ||
        currentTab === 'session-details' ||
        currentTab === 'appointment-details' ||
        currentTab === 'reschedule-appointment' ||
        currentTab.startsWith('schedule') ||
        currentTab.startsWith('create-appointment') ||
        currentTab.startsWith('session-details') ||
        currentTab.startsWith('reschedule')
      );
    }
    return currentTab.startsWith(itemId);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-white border-r border-slate-100 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-20 px-6 flex items-center justify-between border-b border-slate-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Cross className="w-5 h-5 fill-white stroke-blue-600" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 text-lg leading-tight tracking-tight">
                  One Medical
                </h1>
                <p className="text-xs text-slate-400 font-medium">Downtown Clinic</p>
              </div>
            </div>
            {/* Close Button on Mobile */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg lg:hidden"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-220px)]">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item.id, activeTab);

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50/80 text-blue-600 shadow-xs'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-5 bg-blue-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Menu Section */}
        <div className="p-4 border-t border-slate-100 space-y-1.5">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = isItemActive(item.id, activeTab);
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center space-x-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="w-5 h-5 text-slate-400" />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-50 transition-all duration-200"
          >
            <LogOut className="w-5 h-5 text-rose-500" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
