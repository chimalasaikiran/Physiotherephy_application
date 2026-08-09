import React, { useState } from 'react';
import {
  Info,
  Globe,
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  Video,
  Home,
  Building2,
  X,
  CheckCircle2,
  Trash2,
  Edit3,
} from 'lucide-react';
import type { Therapist } from './types';

interface AvailabilityTabProps {
  therapist?: Therapist | null;
}

export interface LeaveException {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: 'UNAVAILABLE' | 'PARTIAL';
}

export interface ScheduleSlot {
  id: string;
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
  startTime: string;
  endTime: string;
  type: 'clinic' | 'home' | 'online';
  label: string;
  locationDetails?: string;
}

export const AvailabilityTab: React.FC<AvailabilityTabProps> = ({ therapist }) => {
  const doctorName = therapist?.name || 'Dr. Ananya Iyer';

  // State for view mode: 'week' or 'list'
  const [viewMode, setViewMode] = useState<'week' | 'list'>('week');

  // State for current week navigation text
  const [currentWeekLabel, setCurrentWeekLabel] = useState('Weekly Schedule (Recurring)');

  // Leave & Exceptions state
  const [leaveExceptions, setLeaveExceptions] = useState<LeaveException[]>([
    {
      id: 'ex-1',
      title: 'Diwali Break',
      startDate: 'Oct 31',
      endDate: 'Nov 3, 2024',
      status: 'UNAVAILABLE',
    },
  ]);

  // Modal states
  const [isAddLeaveOpen, setIsAddLeaveOpen] = useState(false);
  const [newLeaveTitle, setNewLeaveTitle] = useState('');
  const [newLeaveStart, setNewLeaveStart] = useState('');
  const [newLeaveEnd, setNewLeaveEnd] = useState('');

  // Selected slot for detail modal
  const [selectedSlot, setSelectedSlot] = useState<ScheduleSlot | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Pre-defined recurring slots matching Figma design exact timing
  const [slots, setSlots] = useState<ScheduleSlot[]>([
    {
      id: 'slot-1',
      day: 'Mon',
      startTime: '08:30',
      endTime: '11:00',
      type: 'clinic',
      label: 'Clinic (Mumbai)',
      locationDetails: 'Mumbai HQ Clinic Room 4',
    },
    {
      id: 'slot-2',
      day: 'Mon',
      startTime: '11:00',
      endTime: '01:00',
      type: 'home',
      label: 'Home Visit',
      locationDetails: 'South Mumbai Residence Area',
    },
    {
      id: 'slot-3',
      day: 'Mon',
      startTime: '02:00',
      endTime: '03:00',
      type: 'online',
      label: 'Online',
      locationDetails: 'Video Tele-Health Portal',
    },
    {
      id: 'slot-4',
      day: 'Tue',
      startTime: '08:30',
      endTime: '12:00',
      type: 'home',
      label: 'Home Visits (SoBo)',
      locationDetails: 'South Bombay Cluster',
    },
    {
      id: 'slot-5',
      day: 'Wed',
      startTime: '08:30',
      endTime: '10:30',
      type: 'clinic',
      label: 'Clinic',
      locationDetails: 'Mumbai HQ Main Pod',
    },
    {
      id: 'slot-6',
      day: 'Sat',
      startTime: '02:00',
      endTime: '03:00',
      type: 'online',
      label: 'Tele-Physio Intensive',
      locationDetails: 'Video Portal Channel 2',
    },
  ]);

  // Handle adding leave exception
  const handleAddLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeaveTitle || !newLeaveStart || !newLeaveEnd) return;

    const newEx: LeaveException = {
      id: `ex-${Date.now()}`,
      title: newLeaveTitle,
      startDate: newLeaveStart,
      endDate: newLeaveEnd,
      status: 'UNAVAILABLE',
    };

    setLeaveExceptions((prev) => [...prev, newEx]);
    setIsAddLeaveOpen(false);
    setNewLeaveTitle('');
    setNewLeaveStart('');
    setNewLeaveEnd('');
    showToast(`Leave exception "${newLeaveTitle}" added successfully.`);
  };

  // Handle deleting leave exception
  const handleDeleteLeave = (id: string) => {
    const item = leaveExceptions.find((ex) => ex.id === id);
    setLeaveExceptions((prev) => prev.filter((ex) => ex.id !== id));
    if (item) showToast(`Leave exception "${item.title}" removed.`);
  };

  // Helper for slot type styling
  const getSlotStyle = (type: 'clinic' | 'home' | 'online') => {
    switch (type) {
      case 'clinic':
        return {
          bg: 'bg-blue-50/90 hover:bg-blue-100/80 text-blue-950 border-l-4 border-blue-600',
          timeText: 'text-blue-900 font-extrabold',
          labelText: 'text-blue-900 font-bold',
          badgeBg: 'bg-blue-600 text-white',
        };
      case 'home':
        return {
          bg: 'bg-teal-50/90 hover:bg-teal-100/80 text-teal-950 border-l-4 border-teal-500',
          timeText: 'text-teal-900 font-extrabold',
          labelText: 'text-teal-900 font-bold',
          badgeBg: 'bg-teal-500 text-white',
        };
      case 'online':
        return {
          bg: 'bg-purple-50/90 hover:bg-purple-100/80 text-purple-950 border-l-4 border-purple-600',
          timeText: 'text-purple-900 font-extrabold',
          labelText: 'text-purple-900 font-bold',
          badgeBg: 'bg-purple-600 text-white',
        };
      default:
        return {
          bg: 'bg-slate-50 border-l-4 border-slate-400 text-slate-900',
          timeText: 'text-slate-800 font-bold',
          labelText: 'text-slate-800 font-medium',
          badgeBg: 'bg-slate-500 text-white',
        };
    }
  };

  const daysList: Array<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'> = [
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center space-x-2 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Two-Column Layout (Left Column 1/3, Right Column 2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ================= LEFT COLUMN ================= */}
        <div className="space-y-6">
          {/* 1. Schedule Legend Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-5">
            <div className="flex items-center space-x-2 text-slate-800">
              <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <Info className="w-4 h-4" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Schedule Legend</h3>
            </div>

            <div className="space-y-3 pt-1">
              {/* Item 1: Clinic Visits */}
              <div className="flex items-center justify-between p-3 bg-slate-50/80 rounded-2xl border border-slate-100/80">
                <div className="flex items-center space-x-3">
                  <span className="w-3 h-3 rounded-full bg-blue-600 flex-shrink-0" />
                  <span className="text-xs font-bold text-slate-800">Clinic Visits</span>
                </div>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[11px] font-extrabold">
                  Mumbai HQ
                </span>
              </div>

              {/* Item 2: Home Visits */}
              <div className="flex items-center justify-between p-3 bg-slate-50/80 rounded-2xl border border-slate-100/80">
                <div className="flex items-center space-x-3">
                  <span className="w-3 h-3 rounded-full bg-teal-500 flex-shrink-0" />
                  <span className="text-xs font-bold text-slate-800">Home Visits</span>
                </div>
                <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-[11px] font-extrabold">
                  South Mumbai
                </span>
              </div>

              {/* Item 3: Online Consult */}
              <div className="flex items-center justify-between p-3 bg-slate-50/80 rounded-2xl border border-slate-100/80">
                <div className="flex items-center space-x-3">
                  <span className="w-3 h-3 rounded-full bg-purple-600 flex-shrink-0" />
                  <span className="text-xs font-bold text-slate-800">Online Consult</span>
                </div>
                <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-[11px] font-extrabold">
                  Video Portal
                </span>
              </div>
            </div>

            {/* Current Timezone Block */}
            <div className="pt-4 border-t border-slate-100 space-y-1.5">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Current Timezone
              </span>
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                <Globe className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>Asia/Kolkata (IST, UTC +5:30)</span>
              </div>
            </div>
          </div>

          {/* 2. Leave & Exceptions Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">Leave & Exceptions</h3>
              <button
                onClick={() => setIsAddLeaveOpen(true)}
                className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                title="Add Leave Exception"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <div className="space-y-3">
              {leaveExceptions.map((ex) => (
                <div
                  key={ex.id}
                  className="p-4 bg-white rounded-2xl border border-slate-100 shadow-2xs hover:border-slate-200 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">{ex.title}</h4>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">
                        {ex.startDate} - {ex.endDate}
                      </p>
                    </div>

                    <span className="px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-full text-[10px] font-extrabold tracking-wide uppercase">
                      {ex.status}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 pt-1 text-xs font-bold">
                    <button
                      onClick={() => showToast(`Edit exception for ${ex.title}`)}
                      className="text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      Modify
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      onClick={() => handleDeleteLeave(ex.id)}
                      className="text-slate-500 hover:text-rose-600 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {/* Placeholder Card for Empty Exception Slot */}
              <div className="p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 flex items-center space-x-3 text-slate-400">
                <Calendar className="w-5 h-5 text-slate-300 flex-shrink-0" />
                <span className="text-xs font-medium text-slate-500">
                  No other exceptions scheduled.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN (WEEKLY SCHEDULE RECURRING) ================= */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-2xs space-y-6">
            {/* Header Controls Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              {/* Pagination Controls */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => showToast('Navigated to previous week')}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  {currentWeekLabel}
                </h3>

                <button
                  onClick={() => showToast('Navigated to next week')}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* View Switcher Toggle: Week View vs List View */}
              <div className="flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200/50 self-start sm:self-center">
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    viewMode === 'week'
                      ? 'bg-white text-emerald-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Week View
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white text-emerald-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  List View
                </button>
              </div>
            </div>

            {/* Content View: Week View Grid OR List View */}
            {viewMode === 'week' ? (
              <div className="overflow-x-auto no-scrollbar scroll-smooth">
                <div className="min-w-[650px] border border-slate-100 rounded-2xl overflow-hidden">
                  {/* Grid Table Header Row */}
                  <div className="grid grid-cols-7 bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider text-center">
                    <div className="py-3 px-2 border-r border-slate-200/80 text-left pl-4 font-bold text-slate-400">
                      Time
                    </div>
                    <div className="py-3 px-2 border-r border-slate-200/80 text-slate-900">Mon</div>
                    <div className="py-3 px-2 border-r border-slate-200/80 text-slate-900">Tue</div>
                    <div className="py-3 px-2 border-r border-slate-200/80 text-slate-900">Wed</div>
                    <div className="py-3 px-2 border-r border-slate-200/80 text-slate-900">Thu</div>
                    <div className="py-3 px-2 border-r border-slate-200/80 text-slate-900">Fri</div>
                    <div className="py-3 px-2 text-slate-900">Sat</div>
                  </div>

                  {/* Grid Hourly Rows Container */}
                  <div className="divide-y divide-slate-100 text-xs relative">
                    {/* Row 08 AM */}
                    <div className="grid grid-cols-7 min-h-[72px]">
                      <div className="p-2 border-r border-slate-100 font-bold text-slate-400 text-[11px]">
                        08 AM
                      </div>

                      {/* Mon: 08:30 - 11:00 Clinic */}
                      <div className="p-1 border-r border-slate-100 relative">
                        <button
                          onClick={() => setSelectedSlot(slots[0])}
                          className={`w-full p-2.5 rounded-xl ${getSlotStyle('clinic').bg} transition-all shadow-2xs hover:shadow-xs text-left cursor-pointer space-y-0.5`}
                        >
                          <div className={`text-[10px] ${getSlotStyle('clinic').timeText}`}>
                            08:30 - 11:00
                          </div>
                          <div className={`text-[11px] ${getSlotStyle('clinic').labelText}`}>
                            Clinic (Mumbai)
                          </div>
                        </button>
                      </div>

                      {/* Tue: 08:30 - 12:00 Home Visits */}
                      <div className="p-1 border-r border-slate-100 relative">
                        <button
                          onClick={() => setSelectedSlot(slots[3])}
                          className={`w-full p-2.5 rounded-xl ${getSlotStyle('home').bg} transition-all shadow-2xs hover:shadow-xs text-left cursor-pointer space-y-0.5`}
                        >
                          <div className={`text-[10px] ${getSlotStyle('home').timeText}`}>
                            08:30 - 12:00
                          </div>
                          <div className={`text-[11px] ${getSlotStyle('home').labelText}`}>
                            Home Visits (SoBo)
                          </div>
                        </button>
                      </div>

                      {/* Wed: 08:30 - 10:30 Clinic */}
                      <div className="p-1 border-r border-slate-100 relative">
                        <button
                          onClick={() => setSelectedSlot(slots[4])}
                          className={`w-full p-2.5 rounded-xl ${getSlotStyle('clinic').bg} transition-all shadow-2xs hover:shadow-xs text-left cursor-pointer space-y-0.5`}
                        >
                          <div className={`text-[10px] ${getSlotStyle('clinic').timeText}`}>
                            08:30 - 10:30
                          </div>
                          <div className={`text-[11px] ${getSlotStyle('clinic').labelText}`}>
                            Clinic
                          </div>
                        </button>
                      </div>

                      {/* Thu */}
                      <div className="p-1 border-r border-slate-100" />
                      {/* Fri */}
                      <div className="p-1 border-r border-slate-100" />
                      {/* Sat */}
                      <div className="p-1" />
                    </div>

                    {/* Row 09 AM */}
                    <div className="grid grid-cols-7 min-h-[56px]">
                      <div className="p-2 border-r border-slate-100 font-bold text-slate-400 text-[11px]">
                        09 AM
                      </div>
                      <div className="p-1 border-r border-slate-100" />
                      <div className="p-1 border-r border-slate-100" />
                      <div className="p-1 border-r border-slate-100" />
                      <div className="p-1 border-r border-slate-100" />
                      <div className="p-1 border-r border-slate-100" />
                      <div className="p-1" />
                    </div>

                    {/* Row 10 AM */}
                    <div className="grid grid-cols-7 min-h-[56px]">
                      <div className="p-2 border-r border-slate-100 font-bold text-slate-400 text-[11px]">
                        10 AM
                      </div>
                      <div className="p-1 border-r border-slate-100" />
                      <div className="p-1 border-r border-slate-100" />
                      <div className="p-1 border-r border-slate-100" />
                      <div className="p-1 border-r border-slate-100" />
                      <div className="p-1 border-r border-slate-100" />
                      <div className="p-1" />
                    </div>

                    {/* Row 11 AM */}
                    <div className="grid grid-cols-7 min-h-[72px]">
                      <div className="p-2 border-r border-slate-100 font-bold text-slate-400 text-[11px]">
                        11 AM
                      </div>

                      {/* Mon: 11:00 - 01:00 Home Visit */}
                      <div className="p-1 border-r border-slate-100 relative">
                        <button
                          onClick={() => setSelectedSlot(slots[1])}
                          className={`w-full p-2.5 rounded-xl ${getSlotStyle('home').bg} transition-all shadow-2xs hover:shadow-xs text-left cursor-pointer space-y-0.5`}
                        >
                          <div className={`text-[10px] ${getSlotStyle('home').timeText}`}>
                            11:00 - 01:00
                          </div>
                          <div className={`text-[11px] ${getSlotStyle('home').labelText}`}>
                            Home Visit
                          </div>
                        </button>
                      </div>

                      <div className="p-1 border-r border-slate-100" />
                      <div className="p-1 border-r border-slate-100" />
                      <div className="p-1 border-r border-slate-100" />
                      <div className="p-1 border-r border-slate-100" />
                      <div className="p-1" />
                    </div>

                    {/* Row 12 PM */}
                    <div className="grid grid-cols-7 min-h-[56px]">
                      <div className="p-2 border-r border-slate-100 font-bold text-slate-400 text-[11px]">
                        12 PM
                      </div>
                      <div className="p-1 border-r border-slate-100" />
                      <div className="p-1 border-r border-slate-100" />
                      <div className="p-1 border-r border-slate-100" />
                      <div className="p-1 border-r border-slate-100" />
                      <div className="p-1 border-r border-slate-100" />
                      <div className="p-1" />
                    </div>

                    {/* Row 01 PM: Scheduled Break / Lunch Bar */}
                    <div className="grid grid-cols-7 min-h-[44px] bg-slate-100/70 border-y border-slate-200/60">
                      <div className="p-2 border-r border-slate-200/60 font-bold text-slate-400 text-[11px]">
                        01 PM
                      </div>
                      <div className="col-span-6 flex items-center justify-center text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
                        SCHEDULED BREAK / LUNCH
                      </div>
                    </div>

                    {/* Row 02 PM */}
                    <div className="grid grid-cols-7 min-h-[72px]">
                      <div className="p-2 border-r border-slate-100 font-bold text-slate-400 text-[11px]">
                        02 PM
                      </div>

                      {/* Mon: 02:00 - 03:00 Online */}
                      <div className="p-1 border-r border-slate-100 relative">
                        <button
                          onClick={() => setSelectedSlot(slots[2])}
                          className={`w-full p-2 rounded-xl ${getSlotStyle('online').bg} transition-all shadow-2xs hover:shadow-xs text-left cursor-pointer space-y-0.5`}
                        >
                          <div className={`text-[10px] ${getSlotStyle('online').timeText}`}>
                            02:00 - 03:00
                          </div>
                          <div className={`text-[11px] ${getSlotStyle('online').labelText}`}>
                            Online
                          </div>
                        </button>
                      </div>

                      <div className="p-1 border-r border-slate-100" />
                      <div className="p-1 border-r border-slate-100" />
                      <div className="p-1 border-r border-slate-100" />
                      <div className="p-1 border-r border-slate-100" />

                      {/* Sat: 02:00 - 03:00 Tele-Physio Intensive */}
                      <div className="p-1 relative">
                        <button
                          onClick={() => setSelectedSlot(slots[5])}
                          className={`w-full p-2 rounded-xl ${getSlotStyle('online').bg} transition-all shadow-2xs hover:shadow-xs text-left cursor-pointer space-y-0.5`}
                        >
                          <div className={`text-[10px] ${getSlotStyle('online').timeText}`}>
                            02:00 - 03:00
                          </div>
                          <div className={`text-[11px] ${getSlotStyle('online').labelText}`}>
                            Tele-Physio Intensive
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* List View Mode */
              <div className="space-y-4">
                {daysList.map((day) => {
                  const daySlots = slots.filter((s) => s.day === day);
                  return (
                    <div
                      key={day}
                      className="p-4 bg-slate-50/60 rounded-2xl border border-slate-100 space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200/50 pb-2">
                        <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                          {day === 'Mon'
                            ? 'Monday'
                            : day === 'Tue'
                            ? 'Tuesday'
                            : day === 'Wed'
                            ? 'Wednesday'
                            : day === 'Thu'
                            ? 'Thursday'
                            : day === 'Fri'
                            ? 'Friday'
                            : 'Saturday'}
                        </h4>
                        <span className="text-[11px] font-bold text-slate-400">
                          {daySlots.length} {daySlots.length === 1 ? 'Slot' : 'Slots'} Scheduled
                        </span>
                      </div>

                      {daySlots.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {daySlots.map((slot) => {
                            const style = getSlotStyle(slot.type);
                            return (
                              <div
                                key={slot.id}
                                onClick={() => setSelectedSlot(slot)}
                                className={`p-3 rounded-xl ${style.bg} cursor-pointer transition-all shadow-2xs hover:shadow-xs space-y-1`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className={`text-xs ${style.timeText}`}>
                                    {slot.startTime} - {slot.endTime}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${style.badgeBg}`}>
                                    {slot.type.toUpperCase()}
                                  </span>
                                </div>
                                <div className={`text-xs ${style.labelText}`}>{slot.label}</div>
                                {slot.locationDetails && (
                                  <div className="text-[11px] text-slate-500 font-medium">
                                    {slot.locationDetails}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs font-medium text-slate-400 italic">
                          No recurring slots scheduled for this day.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Footer Indicators below grid */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 text-xs font-bold text-slate-500 pt-2 border-t border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span>Average Weekly Capacity: 38 Hours</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                <span>Buffer Time: 15 mins between slots</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= ADD LEAVE EXCEPTION MODAL ================= */}
      {isAddLeaveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-extrabold text-slate-900">Add Leave Exception</h3>
              <button
                onClick={() => setIsAddLeaveOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddLeave} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Exception Title / Reason</label>
                <input
                  type="text"
                  required
                  value={newLeaveTitle}
                  onChange={(e) => setNewLeaveTitle(e.target.value)}
                  placeholder="e.g. Annual Leave, Diwali Break, Medical Conference"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Start Date</label>
                  <input
                    type="text"
                    required
                    value={newLeaveStart}
                    onChange={(e) => setNewLeaveStart(e.target.value)}
                    placeholder="Oct 31"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">End Date</label>
                  <input
                    type="text"
                    required
                    value={newLeaveEnd}
                    onChange={(e) => setNewLeaveEnd(e.target.value)}
                    placeholder="Nov 3, 2024"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddLeaveOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md cursor-pointer"
                >
                  Save Exception
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= SLOT DETAILS MODAL ================= */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-extrabold text-slate-900">Schedule Slot Details</h3>
              </div>
              <button
                onClick={() => setSelectedSlot(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold">
              <div className="p-4 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 uppercase text-[10px] font-extrabold">
                    Session Label
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      selectedSlot.type === 'clinic'
                        ? 'bg-blue-100 text-blue-700'
                        : selectedSlot.type === 'home'
                        ? 'bg-teal-100 text-teal-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {selectedSlot.type.toUpperCase()}
                  </span>
                </div>
                <div className="text-base font-extrabold text-slate-900">{selectedSlot.label}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase block">
                    Day & Time
                  </span>
                  <span className="text-slate-800 font-extrabold text-xs">
                    {selectedSlot.day} ({selectedSlot.startTime} - {selectedSlot.endTime})
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase block">
                    Therapist
                  </span>
                  <span className="text-slate-800 font-extrabold text-xs">{doctorName}</span>
                </div>
              </div>

              {selectedSlot.locationDetails && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase block">
                      Location / Notes
                    </span>
                    <span className="text-slate-700 font-semibold">{selectedSlot.locationDetails}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setSelectedSlot(null);
                  showToast('Slot edit request initialized.');
                }}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 cursor-pointer text-xs"
              >
                Modify Slot
              </button>
              <button
                onClick={() => setSelectedSlot(null)}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 cursor-pointer text-xs shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityTab;
