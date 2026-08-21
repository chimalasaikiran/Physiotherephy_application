import React from 'react';
import { Search, Calendar, User, Tag, ChevronDown, List, LayoutGrid, CheckCircle2, CreditCard, DollarSign } from 'lucide-react';

interface ScheduleFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedTimeframe: string;
  onTimeframeChange: (value: string) => void;
  selectedTherapist: string;
  onTherapistChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (value: string) => void;
  selectedStatus?: string;
  onStatusChangeFilter?: (value: string) => void;
  selectedPaymentMethod?: string;
  onPaymentMethodChange?: (value: string) => void;
  selectedPaymentStatus?: string;
  onPaymentStatusChange?: (value: string) => void;
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
}

export const ScheduleFilters: React.FC<ScheduleFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedTimeframe,
  onTimeframeChange,
  selectedTherapist,
  onTherapistChange,
  selectedType,
  onTypeChange,
  selectedStatus = 'All',
  onStatusChangeFilter,
  selectedPaymentMethod = 'All',
  onPaymentMethodChange,
  selectedPaymentStatus = 'All',
  onPaymentStatusChange,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="px-4 py-3.5 bg-white/70 rounded-2xl shadow-[0px_4px_24px_-1px_rgba(0,104,123,0.05)] outline outline-1 outline-offset-[-1px] outline-white/40 backdrop-blur-[10px] flex flex-wrap items-center justify-between gap-3 overflow-hidden">
      {/* Left side: Search & Filter Dropdowns */}
      <div className="flex flex-1 flex-wrap items-center gap-3 min-w-0">
        {/* Search input */}
        <div className="flex-1 min-w-[240px] px-3.5 py-2 bg-white rounded-[48px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-1px] outline-slate-300/30 flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-500 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter list..."
            className="w-full bg-transparent text-slate-900 placeholder-gray-500 text-xs font-normal font-['Inter'] outline-none"
          />
        </div>

        {/* Timeframe Filter Dropdown */}
        <div className="relative">
          <select
            value={selectedTimeframe}
            onChange={(e) => onTimeframeChange(e.target.value)}
            className="appearance-none bg-white rounded-[48px] outline outline-1 outline-offset-[-1px] outline-slate-300/30 text-slate-900 text-xs font-semibold font-['Inter'] pl-9 pr-8 py-2 cursor-pointer transition-colors"
          >
            <option value="All">All Dates</option>
            <option value="Today">Today</option>
            <option value="Yesterday">Yesterday</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
            <option value="This Year">This Year</option>
          </select>
          <Calendar className="w-3.5 h-3.5 text-slate-900 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Therapist Filter Dropdown */}
        <div className="relative">
          <select
            value={selectedTherapist}
            onChange={(e) => onTherapistChange(e.target.value)}
            className="appearance-none bg-white rounded-[48px] outline outline-1 outline-offset-[-1px] outline-slate-300/30 text-slate-900 text-xs font-semibold font-['Inter'] pl-9 pr-8 py-2 cursor-pointer transition-colors"
          >
            <option value="All">Therapist</option>
            <option value="Dr. Priya Sharma">Dr. Priya Sharma</option>
            <option value="Dr. Rohan Gupta">Dr. Rohan Gupta</option>
            <option value="Dr. Ananya Roy">Dr. Ananya Roy</option>
            <option value="Dr. Arjun Mehta">Dr. Arjun Mehta</option>
          </select>
          <User className="w-3.5 h-3.5 text-slate-900 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Appointment Type Filter Dropdown */}
        <div className="relative">
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="appearance-none bg-white rounded-[48px] outline outline-1 outline-offset-[-1px] outline-slate-300/30 text-slate-900 text-xs font-semibold font-['Inter'] pl-9 pr-8 py-2 cursor-pointer transition-colors"
          >
            <option value="All">Type</option>
            <option value="Clinic Visit">Clinic Visit</option>
            <option value="Online">Online</option>
            <option value="Home Visit">Home Visit</option>
          </select>
          <Tag className="w-3.5 h-3.5 text-slate-900 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Appointment Status Filter Dropdown */}
        {onStatusChangeFilter && (
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChangeFilter(e.target.value)}
              className="appearance-none bg-white rounded-[48px] outline outline-1 outline-offset-[-1px] outline-slate-300/30 text-slate-900 text-xs font-semibold font-['Inter'] pl-9 pr-8 py-2 cursor-pointer transition-colors"
            >
              <option value="All">Status</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-900 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Right side: View Mode Toggle */}
      <div className="flex items-center justify-end">
        <div className="p-1 bg-indigo-50 rounded-[48px] outline outline-1 outline-offset-[-1px] outline-slate-300/30 inline-flex items-center gap-1">
          <button
            onClick={() => onViewModeChange('list')}
            className={`px-3 py-1.5 rounded-[32px] inline-flex items-center justify-center transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] text-blue-900'
                : 'text-slate-400 hover:text-slate-600'
            }`}
            title="List View"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onViewModeChange('grid')}
            className={`px-3 py-1.5 rounded-[32px] inline-flex items-center justify-center transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] text-blue-900'
                : 'text-slate-400 hover:text-slate-600'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
