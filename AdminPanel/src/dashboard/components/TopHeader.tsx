import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Bell, HelpCircle, Menu, LogOut, Shield, Settings } from 'lucide-react';
import { useAuth } from '@/auth';
import { InitialsAvatar } from '@/components/ui/InitialsAvatar';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface TopHeaderProps {
  onMenuToggle: () => void;
  onOpenNewAppointment: () => void;
  onOpenRealtimeGuide?: () => void;
  onLogout?: () => void;
  onNavigateToSettings?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onMenuToggle,
  onOpenNewAppointment,
  onOpenRealtimeGuide,
  onLogout,
  onNavigateToSettings,
}) => {
  const { adminProfile, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const adminName = adminProfile?.fullName || 'System Administrator';
  const adminEmail = adminProfile?.email || 'admin@physiotherapy.com';
  const adminRole = adminProfile?.role
    ? adminProfile.role.charAt(0).toUpperCase() + adminProfile.role.slice(1)
    : 'Superadmin';

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Click-outside handler to close the admin profile dropdown menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    setIsProfileOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      await logout();
    }
  };

  return (
    <header className="h-20 bg-white border-b border-slate-100 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center space-x-4 flex-1 max-w-2xl">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onMenuToggle}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl lg:hidden focus:outline-none"
          aria-label="Open navigation menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Search Input */}
        <div className="relative w-full max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patients, doctors, or records (⌘+K)"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-full text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-500 transition-all duration-200"
          />
        </div>
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center space-x-3 sm:space-x-4">

        {/* New Appointment Button */}
        <button
          onClick={onOpenNewAppointment}
          className="hidden sm:flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-full text-sm font-semibold shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Appointment</span>
        </button>

        {/* Notifications Icon Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full relative transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-88 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-slate-50 flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                  <span>Live System Alerts</span>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px]">
                    {notifications.length}
                  </span>
                </h4>
                <button
                  onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
                  className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                >
                  Mark as read
                </button>
              </div>
              <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 hover:bg-slate-50 text-xs transition-colors ${
                        !n.read ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-900">{n.title}</p>
                        <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                      </div>
                      <p className="text-slate-600 mt-1 leading-snug">{n.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    No recent notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Support/Help Icon */}
        <button
          onClick={onOpenRealtimeGuide}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors hidden sm:block cursor-pointer"
          title="Real-Time System Guide"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Vertical Separator */}
        <div className="h-7 w-[1px] bg-slate-200 hidden sm:block" />

        {/* Admin Profile Dropdown Container */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-3 p-1.5 rounded-2xl hover:bg-slate-100/80 transition-colors cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            aria-expanded={isProfileOpen}
            aria-haspopup="true"
            title="Click for Admin Profile & Sign Out"
          >
            <div className="text-right hidden sm:block">
              <h3 className="font-bold text-sm text-slate-900 leading-none">{adminName}</h3>
              <p className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase mt-1">
                {adminRole}
              </p>
            </div>
            <div className="relative">
              <InitialsAvatar name={adminName} className="w-10 h-10 text-sm font-bold" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
            </div>
          </button>

          {/* Admin Profile Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center space-x-3">
                <InitialsAvatar name={adminName} className="w-11 h-11 text-base font-bold" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-900 text-sm truncate">{adminName}</p>
                  <p className="text-xs text-slate-500 truncate">{adminEmail}</p>
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700">
                    <Shield className="w-3 h-3" />
                    {adminRole}
                  </span>
                </div>
              </div>

              <div className="p-1 space-y-1">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    if (onNavigateToSettings) onNavigateToSettings();
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-colors cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-slate-500 hover:text-blue-600" />
                  <span>Settings & Profile</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};


