import React, { useState, useEffect } from 'react';
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
  Save,
  AlertCircle,
} from 'lucide-react';
import type { Therapist, ScheduleSlot } from './types';
import { updateTherapistRecord } from '@/services/therapistService';

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

const DEFAULT_SLOTS: ScheduleSlot[] = [
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
    label: 'Online Consult',
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
];

export const AvailabilityTab: React.FC<AvailabilityTabProps> = ({ therapist }) => {
  const doctorName = therapist?.name || 'Dr. Ananya Iyer';

  // State for view mode: 'week' or 'list'
  const [viewMode, setViewMode] = useState<'week' | 'list'>('week');

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

  // Modal states for Leave Exception
  const [isAddLeaveOpen, setIsAddLeaveOpen] = useState(false);
  const [newLeaveTitle, setNewLeaveTitle] = useState('');
  const [newLeaveStart, setNewLeaveStart] = useState('');
  const [newLeaveEnd, setNewLeaveEnd] = useState('');

  // Weekly Schedule Slots state initialized from therapist prop or defaults
  const [slots, setSlots] = useState<ScheduleSlot[]>(
    therapist?.weeklySchedule && therapist.weeklySchedule.length > 0
      ? therapist.weeklySchedule
      : DEFAULT_SLOTS
  );

  // Sync state if therapist prop changes
  useEffect(() => {
    if (therapist?.weeklySchedule && therapist.weeklySchedule.length > 0) {
      setSlots(therapist.weeklySchedule);
    }
  }, [therapist?.weeklySchedule]);

  // Selected slot for Edit / Detail modal
  const [selectedSlot, setSelectedSlot] = useState<ScheduleSlot | null>(null);
  const [isEditingSlot, setIsEditingSlot] = useState(false);

  // Edit slot form state
  const [editDay, setEditDay] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'>('Mon');
  const [editStartTime, setEditStartTime] = useState('09:00');
  const [editEndTime, setEditEndTime] = useState('10:00');
  const [editType, setEditType] = useState<'clinic' | 'home' | 'online'>('clinic');
  const [editLabel, setEditLabel] = useState('');
  const [editLocation, setEditLocation] = useState('');

  // Add new slot modal state
  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);
  const [addDay, setAddDay] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'>('Mon');
  const [addStartTime, setAddStartTime] = useState('09:00 AM');
  const [addEndTime, setAddEndTime] = useState('10:00 AM');
  const [addType, setAddType] = useState<'clinic' | 'home' | 'online'>('clinic');
  const [addLabel, setAddLabel] = useState('');
  const [addLocation, setAddLocation] = useState('');

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper to persist schedule to Firestore if therapist id exists
  const persistSchedule = async (updatedSlots: ScheduleSlot[]) => {
    if (therapist?.id) {
      try {
        await updateTherapistRecord(therapist.id, { weeklySchedule: updatedSlots });
      } catch (err) {
        console.error('Failed to sync weekly schedule to Firestore:', err);
      }
    }
  };

  // ── Handlers for Weekly Schedule Slots ──────────────────────────────────

  // Open Edit Form for a slot
  const handleOpenEditSlot = (slot: ScheduleSlot) => {
    setSelectedSlot(slot);
    setEditDay(slot.day);
    setEditStartTime(slot.startTime);
    setEditEndTime(slot.endTime);
    setEditType(slot.type);
    setEditLabel(slot.label);
    setEditLocation(slot.locationDetails || '');
    setIsEditingSlot(true);
  };

  // Submit Slot Edit / Update
  const handleSaveSlotUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    const updatedSlot: ScheduleSlot = {
      ...selectedSlot,
      day: editDay,
      startTime: editStartTime,
      endTime: editEndTime,
      type: editType,
      label: editLabel || (editType === 'clinic' ? 'Clinic Visit' : editType === 'home' ? 'Home Visit' : 'Online Consult'),
      locationDetails: editLocation,
    };

    const newSlots = slots.map((s) => (s.id === selectedSlot.id ? updatedSlot : s));
    setSlots(newSlots);
    await persistSchedule(newSlots);

    setSelectedSlot(null);
    setIsEditingSlot(false);
    showToast(`Schedule slot "${updatedSlot.label}" updated successfully.`);
  };

  // Delete Schedule Slot
  const handleDeleteSlot = async (slotId: string) => {
    const slotToDelete = slots.find((s) => s.id === slotId);
    const newSlots = slots.filter((s) => s.id !== slotId);
    setSlots(newSlots);
    await persistSchedule(newSlots);

    if (selectedSlot?.id === slotId) {
      setSelectedSlot(null);
      setIsEditingSlot(false);
    }
    showToast(`Schedule slot "${slotToDelete?.label || 'Slot'}" removed.`);
  };

  // Add New Schedule Slot Submit
  const handleAddSlotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newSlot: ScheduleSlot = {
      id: `slot-${Date.now()}`,
      day: addDay,
      startTime: addStartTime,
      endTime: addEndTime,
      type: addType,
      label: addLabel.trim() || (addType === 'clinic' ? 'Clinic Session' : addType === 'home' ? 'Home Visit' : 'Online Session'),
      locationDetails: addLocation,
    };

    const newSlots = [...slots, newSlot];
    setSlots(newSlots);
    await persistSchedule(newSlots);

    setIsAddSlotOpen(false);
    setAddLabel('');
    setAddLocation('');
    showToast(`New weekly slot "${newSlot.label}" added for ${newSlot.day}.`);
  };

  // ── Leave & Exceptions Handlers ──────────────────────────────────────────

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

  const handleDeleteLeave = (id: string) => {
    const item = leaveExceptions.find((ex) => ex.id === id);
    setLeaveExceptions((prev) => prev.filter((ex) => ex.id !== id));
    if (item) showToast(`Leave exception "${item.title}" removed.`);
  };

  // Styling helper for slot type
  const getSlotStyle = (type: 'clinic' | 'home' | 'online') => {
    switch (type) {
      case 'clinic':
        return {
          bg: 'bg-blue-50/90 hover:bg-blue-100/90 text-blue-950 border-l-4 border-blue-600',
          timeText: 'text-blue-900 font-extrabold',
          labelText: 'text-blue-900 font-bold',
          badgeBg: 'bg-blue-600 text-white',
        };
      case 'home':
        return {
          bg: 'bg-teal-50/90 hover:bg-teal-100/90 text-teal-950 border-l-4 border-teal-500',
          timeText: 'text-teal-900 font-extrabold',
          labelText: 'text-teal-900 font-bold',
          badgeBg: 'bg-teal-500 text-white',
        };
      case 'online':
        return {
          bg: 'bg-purple-50/90 hover:bg-purple-100/90 text-purple-950 border-l-4 border-purple-600',
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

  const daysList: Array<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'> = [
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
    'Sun',
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
                      onClick={() => showToast(`Editing exception for ${ex.title}`)}
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
              {leaveExceptions.length === 0 && (
                <div className="p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 flex items-center space-x-3 text-slate-400">
                  <Calendar className="w-5 h-5 text-slate-300 flex-shrink-0" />
                  <span className="text-xs font-medium text-slate-500">
                    No leave exceptions scheduled.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN (WEEKLY SCHEDULE RECURRING) ================= */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-2xs space-y-6">
            {/* Header Controls Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center space-x-3">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Weekly Schedule (Recurring)
                </h3>
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-extrabold">
                  {slots.length} Slots Total
                </span>
              </div>

              {/* Actions: Add Slot & View Switcher */}
              <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                <button
                  onClick={() => setIsAddSlotOpen(true)}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Schedule Slot</span>
                </button>

                {/* View Switcher Toggle: Week View vs List View */}
                <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/50">
                  <button
                    onClick={() => setViewMode('week')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                      viewMode === 'week'
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Week View
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                      viewMode === 'list'
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    List View
                  </button>
                </div>
              </div>
            </div>

            {/* Content View: Week View Grid OR List View */}
            {viewMode === 'week' ? (
              <div className="overflow-x-auto no-scrollbar scroll-smooth">
                <div className="min-w-[700px] border border-slate-100 rounded-2xl overflow-hidden">
                  {/* Grid Table Header Row */}
                  <div className="grid grid-cols-7 bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-700 uppercase tracking-wider text-center divide-x divide-slate-200/60">
                    {daysList.map((day) => {
                      const daySlotCount = slots.filter((s) => s.day === day).length;
                      return (
                        <div key={day} className="py-3 px-2">
                          <span className="block font-extrabold text-slate-900">{day}</span>
                          <span className="text-[10px] font-semibold text-slate-400">
                            {daySlotCount > 0 ? `${daySlotCount} slots` : 'Off'}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Grid Columns for Each Day */}
                  <div className="grid grid-cols-7 min-h-[340px] divide-x divide-slate-100 bg-white">
                    {daysList.map((day) => {
                      const daySlots = slots.filter((s) => s.day === day);
                      return (
                        <div key={day} className="p-2 space-y-2.5 bg-slate-50/20">
                          {daySlots.length > 0 ? (
                            daySlots.map((slot) => {
                              const style = getSlotStyle(slot.type);
                              return (
                                <div
                                  key={slot.id}
                                  className={`w-full p-2.5 rounded-2xl ${style.bg} transition-all shadow-2xs hover:shadow-xs text-left cursor-pointer space-y-1 group relative`}
                                  onClick={() => setSelectedSlot(slot)}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className={`text-[10px] ${style.timeText}`}>
                                      {slot.startTime} - {slot.endTime}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenEditSlot(slot);
                                      }}
                                      className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-500 hover:text-blue-600 transition-opacity"
                                      title="Edit slot"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <div className={`text-[11px] leading-tight ${style.labelText}`}>
                                    {slot.label}
                                  </div>
                                  {slot.locationDetails && (
                                    <p className="text-[10px] text-slate-500 line-clamp-1 font-medium">
                                      {slot.locationDetails}
                                    </p>
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <div className="h-full min-h-[80px] flex items-center justify-center text-[10px] font-semibold text-slate-300 italic">
                              No slots
                            </div>
                          )}
                        </div>
                      );
                    })}
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
                            : day === 'Sat'
                            ? 'Saturday'
                            : 'Sunday'}
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
                                className={`p-4 rounded-2xl ${style.bg} transition-all shadow-2xs hover:shadow-xs space-y-2 flex flex-col justify-between`}
                              >
                                <div className="space-y-1">
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
                                    <div className="text-[11px] text-slate-500 font-medium flex items-center space-x-1">
                                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                      <span className="line-clamp-1">{slot.locationDetails}</span>
                                    </div>
                                  )}
                                </div>

                                <div className="pt-2 border-t border-slate-200/40 flex items-center justify-end space-x-3 text-xs font-bold">
                                  <button
                                    onClick={() => handleOpenEditSlot(slot)}
                                    className="text-blue-600 hover:text-blue-700 flex items-center space-x-1 cursor-pointer"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSlot(slot.id)}
                                    className="text-rose-600 hover:text-rose-700 flex items-center space-x-1 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete</span>
                                  </button>
                                </div>
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

            {/* Bottom Footer Indicators */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 text-xs font-bold text-slate-500 pt-2 border-t border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>Total Weekly Capacity: {slots.length * 3} Hours</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                <span>Buffer Time: 15 mins between slots</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL 1: ADD LEAVE EXCEPTION MODAL ================= */}
      {isAddLeaveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-extrabold text-slate-900">Add Leave Exception</h3>
              <button
                onClick={() => setIsAddLeaveOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
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
                  placeholder="e.g. Annual Leave, Medical Conference"
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

      {/* ================= MODAL 2: ADD NEW SCHEDULE SLOT MODAL ================= */}
      {isAddSlotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2 text-blue-600">
                <Clock className="w-5 h-5" />
                <h3 className="text-lg font-extrabold text-slate-900">Add Weekly Schedule Slot</h3>
              </div>
              <button
                onClick={() => setIsAddSlotOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSlotSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">Day *</label>
                  <select
                    value={addDay}
                    onChange={(e) => setAddDay(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    {daysList.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">Start Time *</label>
                  <input
                    type="text"
                    required
                    value={addStartTime}
                    onChange={(e) => setAddStartTime(e.target.value)}
                    placeholder="09:00 AM"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">End Time *</label>
                  <input
                    type="text"
                    required
                    value={addEndTime}
                    onChange={(e) => setAddEndTime(e.target.value)}
                    placeholder="10:30 AM"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Consultation Type *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'clinic', label: 'Clinic Visit', icon: Building2 },
                    { id: 'home', label: 'Home Visit', icon: Home },
                    { id: 'online', label: 'Online Consult', icon: Video },
                  ].map((t) => {
                    const IconComp = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setAddType(t.id as any)}
                        className={`p-2.5 rounded-xl border text-center font-bold flex flex-col items-center justify-center space-y-1 cursor-pointer transition-all ${
                          addType === t.id
                            ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                        <span className="text-[10px]">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Slot Label / Title</label>
                <input
                  type="text"
                  value={addLabel}
                  onChange={(e) => setAddLabel(e.target.value)}
                  placeholder="e.g. Clinic (Mumbai), Home Visit (SoBo), Video Portal"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Location / Notes</label>
                <input
                  type="text"
                  value={addLocation}
                  onChange={(e) => setAddLocation(e.target.value)}
                  placeholder="e.g. Room 4, Main Pod, South Bombay Cluster"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddSlotOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md cursor-pointer"
                >
                  Add Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: VIEW / EDIT / DELETE SLOT DETAILS MODAL ================= */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-extrabold text-slate-900">
                  {isEditingSlot ? 'Edit Schedule Slot' : 'Slot Details'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedSlot(null);
                  setIsEditingSlot(false);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isEditingSlot ? (
              /* EDIT FORM MODE */
              <form onSubmit={handleSaveSlotUpdate} className="space-y-4 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">Day *</label>
                    <select
                      value={editDay}
                      onChange={(e) => setEditDay(e.target.value as any)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      {daysList.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">Start Time *</label>
                    <input
                      type="text"
                      required
                      value={editStartTime}
                      onChange={(e) => setEditStartTime(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">End Time *</label>
                    <input
                      type="text"
                      required
                      value={editEndTime}
                      onChange={(e) => setEditEndTime(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">Consultation Type *</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="clinic">Clinic Visit</option>
                    <option value="home">Home Visit</option>
                    <option value="online">Online Consult</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">Slot Label / Description</label>
                  <input
                    type="text"
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">Location / Room Details</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleDeleteSlot(selectedSlot.id)}
                    className="flex items-center space-x-1 px-3.5 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl font-bold transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingSlot(false)}
                      className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex items-center space-x-1.5 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* VIEW DETAILS MODE */
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

                <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                  <button
                    onClick={() => handleDeleteSlot(selectedSlot.id)}
                    className="flex items-center space-x-1 px-3.5 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl font-bold transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Slot</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenEditSlot(selectedSlot)}
                      className="flex items-center space-x-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit Slot</span>
                    </button>
                    <button
                      onClick={() => setSelectedSlot(null)}
                      className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 cursor-pointer shadow-md"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityTab;
