import React, { useState } from 'react';
import { Search, Plus, Bell, HelpCircle, Menu } from 'lucide-react';
import doctorAvatar from '@/assets/sarah-chen.png';

interface TopHeaderProps {
  onMenuToggle: () => void;
  onOpenNewAppointment: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onMenuToggle,
  onOpenNewAppointment,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

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

        {/* Mobile New Appointment Icon */}
        <button
          onClick={onOpenNewAppointment}
          className="sm:hidden w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-xs"
          title="New Appointment"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Notifications Icon Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full relative transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-slate-50 flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-sm">Notifications</h4>
                <span className="text-xs text-blue-600 font-semibold cursor-pointer">Mark all as read</span>
              </div>
              <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
                <div className="p-3 hover:bg-slate-50 text-xs">
                  <p className="font-medium text-slate-800">New patient registration</p>
                  <p className="text-slate-400 mt-0.5">Kabir Singh joined 10 mins ago</p>
                </div>
                <div className="p-3 hover:bg-slate-50 text-xs">
                  <p className="font-medium text-slate-800">Appointment rescheduled</p>
                  <p className="text-slate-400 mt-0.5">Dr. Emily Watson moved meeting to 11:30</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Support/Help Icon */}
        <button
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors hidden sm:block"
          title="Support & Help"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Vertical Separator */}
        <div className="h-7 w-[1px] bg-slate-200 hidden sm:block" />

        {/* Profile Card */}
        <div className="flex items-center space-x-3 pl-1">
          <div className="text-right hidden md:block">
            <h3 className="font-bold text-sm text-slate-900 leading-none">Dr. Sarah Chen</h3>
            <p className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase mt-1">
              Clinic Admin
            </p>
          </div>
          <div className="relative">
            <img
              src={doctorAvatar}
              alt="Dr. Sarah Chen"
              className="w-10 h-10 rounded-full object-cover border-2 border-blue-100 shadow-xs"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
          </div>
        </div>
      </div>
    </header>
  );
};
