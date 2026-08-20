import React from 'react';
import { Search, Calendar, User, Tag, ChevronDown, List, LayoutGrid, CheckCircle2 } from 'lucide-react';

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
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-xs">
      {/* Left side: Search & Filter Dropdowns */}
      <div className="flex flex-1 flex-wrap items-center gap-2.5 min-w-0">
        {/* Search input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter list..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/80 focus:bg-white focus:border-blue-500 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 outline-hidden transition-all"
          />
        </div>

        {/* Timeframe Filter Dropdown */}
        <div className="relative">
          <select
            value={selectedTimeframe}
            onChange={(e) => onTimeframeChange(e.target.value)}
            className="appearance-none bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 text-slate-700 text-sm font-semibold pl-9 pr-8 py-2 rounded-xl cursor-pointer transition-colors outline-hidden"
          >
            <option value="All">All Dates</option>
            <option value="Today">Today</option>
            <option value="Yesterday">Yesterday</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
            <option value="This Year">This Year</option>
          </select>
          <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Status Filter Dropdown */}
        {onStatusChangeFilter && (
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChangeFilter(e.target.value)}
              className="appearance-none bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 text-slate-700 text-sm font-semibold pl-9 pr-8 py-2 rounded-xl cursor-pointer transition-colors outline-hidden"
            >
              <option value="All">All Statuses</option>
              <option value="Confirmed">Confirmed / Active</option>
              <option value="Completed">Completed</option>
              <option value="Expired">Expired</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <CheckCircle2 className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}

        {/* Therapist Filter Dropdown */}
        <div className="relative">
          <select
            value={selectedTherapist}
            onChange={(e) => onTherapistChange(e.target.value)}
            className="appearance-none bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 text-slate-700 text-sm font-semibold pl-9 pr-8 py-2 rounded-xl cursor-pointer transition-colors outline-hidden"
          >
            <option value="All">All Therapists</option>
            <option value="Dr. PriyaSharma">Dr. PriyaSharma</option>
            <option value="Dr. Rohan Gupta">Dr. Rohan Gupta</option>
            <option value="Dr. Ananya Roy">Dr. Ananya Roy</option>
          </select>
          <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Type Filter Dropdown */}
        <div className="relative">
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="appearance-none bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 text-slate-700 text-sm font-semibold pl-9 pr-8 py-2 rounded-xl cursor-pointer transition-colors outline-hidden"
          >
            <option value="All">All Types</option>
            <option value="Clinic Visit">Clinic Visit</option>
            <option value="Online">Online</option>
            <option value="Home Visit">Home Visit</option>
          </select>
          <Tag className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Right side: View Mode Toggle */}
      <div className="flex items-center justify-end border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-100 gap-1">
        <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-400 hover:text-slate-600'
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-400 hover:text-slate-600'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

