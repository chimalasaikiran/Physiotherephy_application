import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Info,
  ArrowLeft,
  CheckCircle2,
  X,
  AlertCircle
} from 'lucide-react';

interface RescheduleAppointmentPageProps {
  onBack?: () => void;
  onSuccess?: () => void;
}

interface TimeSlot {
  time: string;
  displayTime: string;
}

const TIME_SLOTS: TimeSlot[] = [
  { time: '09:00', displayTime: '09:00 AM' },
  { time: '10:00', displayTime: '10:00 AM' },
  { time: '11:00', displayTime: '11:00 AM' },
  { time: '12:00', displayTime: '12:00 PM' },
  { time: '13:00', displayTime: '01:00 PM' },
  { time: '14:00', displayTime: '02:00 PM' },
  { time: '15:00', displayTime: '03:00 PM' },
  { time: '16:00', displayTime: '04:00 PM' },
];

interface DayConfig {
  dateStr: string; // e.g. "2024-10-27"
  dayName: string; // "MON"
  dayNum: string;  // "27"
  fullLabel: string; // "Monday, Oct 27, 2024"
  isOnLeave?: boolean;
}

const DAYS: DayConfig[] = [
  { dateStr: '2024-10-27', dayName: 'MON', dayNum: '27', fullLabel: 'Monday, Oct 27, 2024' },
  { dateStr: '2024-10-28', dayName: 'TUE', dayNum: '28', fullLabel: 'Tuesday, Oct 28, 2024' },
  { dateStr: '2024-10-29', dayName: 'WED', dayNum: '29', fullLabel: 'Wednesday, Oct 29, 2024', isOnLeave: true },
  { dateStr: '2024-10-30', dayName: 'THU', dayNum: '30', fullLabel: 'Thursday, Oct 30, 2024', isOnLeave: true },
  { dateStr: '2024-10-31', dayName: 'FRI', dayNum: '31', fullLabel: 'Friday, Oct 31, 2024' },
  { dateStr: '2024-11-01', dayName: 'SAT', dayNum: '01', fullLabel: 'Saturday, Nov 01, 2024' },
  { dateStr: '2024-11-02', dayName: 'SUN', dayNum: '02', fullLabel: 'Sunday, Nov 02, 2024' },
];

// Booked slots mock data (dateStr + time)
const BOOKED_SLOTS = new Set([
  '2024-10-27-09:00',
  '2024-10-27-11:00',
  '2024-10-28-10:00',
  '2024-10-28-12:00',
  '2024-10-28-13:00',
  '2024-10-31-09:00',
  '2024-10-31-12:00',
  '2024-11-01-14:00',
  '2024-11-02-10:00',
]);

export const RescheduleAppointmentPage: React.FC<RescheduleAppointmentPageProps> = ({
  onBack,
  onSuccess,
}) => {
  // Currently selected date & time slot
  const [selectedDate, setSelectedDate] = useState<string>('2024-10-27');
  const [selectedTime, setSelectedTime] = useState<string>('14:00');
  const [rescheduleReason, setRescheduleReason] = useState<string>('Patient Request');
  const [internalNotes, setInternalNotes] = useState<string>('');
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Helper for current selected day label
  const currentDayConfig = DAYS.find((d) => d.dateStr === selectedDate) || DAYS[0];
  const currentSlotConfig = TIME_SLOTS.find((t) => t.time === selectedTime) || TIME_SLOTS[5];

  // Helper to format slot end time (+1 hour)
  const getEndTimeLabel = (timeStr: string) => {
    const slotIndex = TIME_SLOTS.findIndex((t) => t.time === timeStr);
    if (slotIndex >= 0 && slotIndex < TIME_SLOTS.length - 1) {
      return TIME_SLOTS[slotIndex + 1].displayTime;
    }
    return '05:00 PM';
  };

  const handleSelectSlot = (dateStr: string, timeStr: string, isOnLeave?: boolean) => {
    if (isOnLeave) return;
    const key = `${dateStr}-${timeStr}`;
    if (BOOKED_SLOTS.has(key)) return;

    setSelectedDate(dateStr);
    setSelectedTime(timeStr);
  };

  const handleConfirmReschedule = () => {
    setToastMessage(
      `Appointment rescheduled to ${currentDayConfig.fullLabel} at ${currentSlotConfig.displayTime}!`
    );
    setTimeout(() => {
      onSuccess ? onSuccess() : onBack ? onBack() : null;
    }, 1800);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-16 relative font-sans text-slate-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce border border-slate-700">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1 ml-2 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header Section */}
      <div>
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 mb-3 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Schedule
          </button>
        )}

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Reschedule Appointment
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Move an appointment while preserving treatment continuity.
          </p>
        </div>
      </div>

      {/* Current Schedule Summary Banner (Top Wide Card) */}
      <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-slate-50 border border-blue-100/80 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-8 w-full md:w-auto">
          {/* Patient Info */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[11px] font-extrabold text-slate-400 tracking-wider uppercase">
                PATIENT
              </span>
              <div className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-1.5 flex-wrap">
                <span>Sanya Malhotra</span>
                <span className="text-xs font-semibold text-slate-400">#OM-90210</span>
              </div>
            </div>
          </div>

          {/* Therapist Info */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 shadow-xs">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[11px] font-extrabold text-slate-400 tracking-wider uppercase">
                THERAPIST
              </span>
              <div className="text-sm sm:text-base font-extrabold text-slate-900">
                Dr. Arjun Mehta
              </div>
            </div>
          </div>

          {/* Current Schedule Info */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 shadow-xs">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[11px] font-extrabold text-slate-400 tracking-wider uppercase">
                CURRENT SCHEDULE
              </span>
              <div className="text-sm sm:text-base font-extrabold text-slate-900">
                Oct 23, 2024 • 01:45 PM
              </div>
            </div>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100/90 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Confirmed
          </span>
          <span className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full border border-slate-200">
            Clinic Visit
          </span>
        </div>
      </div>

      {/* Main Content Grid (Weekly Availability + Right Details Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
        {/* Left Column: Weekly Availability Grid (2 Spans) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-100 shadow-xs space-y-6">
            {/* Header & Week Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Weekly Availability
              </h2>

              <div className="flex items-center gap-3 self-start sm:self-auto">
                <button
                  onClick={() => setWeekOffset((prev) => prev - 1)}
                  className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                  title="Previous Week"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-extrabold text-slate-800 tracking-tight">
                  Oct 27 - Nov 02, 2024
                </span>
                <button
                  onClick={() => setWeekOffset((prev) => prev + 1)}
                  className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                  title="Next Week"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Interactive Grid Table */}
            <div className="overflow-x-auto pb-2 -mx-2 px-2">
              <div className="min-w-[620px]">
                {/* Table Header: Days of the Week */}
                <div className="grid grid-cols-8 gap-2 border-b border-slate-100 pb-3 text-center">
                  {/* Time Axis Empty Corner */}
                  <div className="text-[11px] font-bold text-slate-400 uppercase self-end text-left pl-1">
                    Time
                  </div>
                  {DAYS.map((day) => (
                    <div
                      key={day.dateStr}
                      className={`p-2 rounded-xl text-center ${
                        day.isOnLeave ? 'bg-rose-50/50' : ''
                      }`}
                    >
                      <span
                        className={`block text-[11px] font-extrabold tracking-wider ${
                          day.isOnLeave ? 'text-rose-600' : 'text-slate-400'
                        }`}
                      >
                        {day.dayName}
                      </span>
                      <span
                        className={`block text-base font-extrabold leading-tight mt-0.5 ${
                          day.isOnLeave ? 'text-rose-600' : 'text-slate-900'
                        }`}
                      >
                        {day.dayNum}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Table Body: Time Rows & Cells */}
                <div className="relative pt-3">
                  {/* Background Overlay for Therapist on Leave (WED 29 & THU 30) */}
                  <div className="grid grid-cols-8 gap-2 absolute inset-0 pt-3 pointer-events-none">
                    <div className="col-start-4 col-span-2 h-full rounded-2xl bg-rose-50/30 border border-dashed border-rose-200/80 flex items-center justify-center overflow-hidden">
                      <span className="text-xs sm:text-sm font-black tracking-widest text-slate-300 uppercase select-none rotate-[-90deg] sm:rotate-0 whitespace-nowrap opacity-70">
                        THERAPIST ON LEAVE
                      </span>
                    </div>
                  </div>

                  {/* Foreground Time Slot Rows */}
                  <div className="space-y-2.5 relative z-10">
                    {TIME_SLOTS.map((slot) => (
                      <div key={slot.time} className="grid grid-cols-8 gap-2 items-center">
                        {/* Time Label Column */}
                        <div className="text-[11px] font-bold text-slate-400 text-left pr-1 whitespace-nowrap">
                          {slot.displayTime}
                        </div>

                        {/* Day Slot Cells */}
                        {DAYS.map((day) => {
                          const isBlockedLeave = day.isOnLeave;
                          const slotKey = `${day.dateStr}-${slot.time}`;
                          const isBooked = BOOKED_SLOTS.has(slotKey);
                          const isSelected =
                            selectedDate === day.dateStr && selectedTime === slot.time;

                          if (isBlockedLeave) {
                            return (
                              <div
                                key={slotKey}
                                className="h-10 rounded-xl bg-slate-50/40 border border-slate-100 flex items-center justify-center opacity-30 cursor-not-allowed"
                              />
                            );
                          }

                          if (isSelected) {
                            return (
                              <button
                                key={slotKey}
                                onClick={() => handleSelectSlot(day.dateStr, slot.time)}
                                className="h-10 rounded-xl bg-blue-700 text-white font-extrabold text-[11px] tracking-wide uppercase flex items-center justify-center shadow-md shadow-blue-600/30 transition-transform scale-105 cursor-pointer ring-2 ring-blue-600 ring-offset-1"
                              >
                                SELECTED
                              </button>
                            );
                          }

                          if (isBooked) {
                            return (
                              <div
                                key={slotKey}
                                className="h-10 rounded-xl bg-slate-100/80 border border-slate-200/60 flex items-center justify-center cursor-not-allowed"
                                title="Booked slot"
                              />
                            );
                          }

                          return (
                            <button
                              key={slotKey}
                              onClick={() => handleSelectSlot(day.dateStr, slot.time)}
                              className="h-10 rounded-xl bg-white border border-slate-200/90 hover:border-blue-500 hover:bg-blue-50/40 transition-all cursor-pointer shadow-2xs group"
                              title={`Select ${day.dayName} ${day.dayNum} at ${slot.displayTime}`}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar Legend Footer */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-md bg-white border border-slate-300 shadow-2xs"></span>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-md bg-slate-100 border border-slate-200"></span>
                <span>Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-md bg-blue-700"></span>
                <span className="text-slate-900 font-bold">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-md bg-slate-100 border border-dashed border-rose-300 opacity-60"></span>
                <span>Blocked</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: New Slot Selection & Form Details (1 Span) */}
        <div className="space-y-6">
          {/* Card 1: NEW SLOT SELECTION */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs space-y-6">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              NEW SLOT SELECTION
            </h3>

            {/* Selected Therapist Header Card */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3.5">
              <img
                src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200"
                alt="Dr. Arjun Mehta"
                className="w-12 h-12 rounded-full object-cover border border-white shadow-2xs shrink-0"
              />
              <div>
                <h4 className="text-base font-extrabold text-slate-900 leading-tight">
                  Dr. Arjun Mehta
                </h4>
                <p className="text-xs font-medium text-slate-500">Lead Psychotherapist</p>
              </div>
            </div>

            {/* Slot Details List */}
            <div className="space-y-4 pt-1">
              {/* Selected Date */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <CalendarIcon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                    SELECTED DATE
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 block mt-0.5">
                    {currentDayConfig.fullLabel}
                  </span>
                </div>
              </div>

              {/* Selected Time */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                    SELECTED TIME
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 block mt-0.5">
                    {currentSlotConfig.displayTime} – {getEndTimeLabel(selectedTime)}
                  </span>
                </div>
              </div>
            </div>

            {/* Info Notes Alert Box */}
            <div className="bg-sky-50/60 border border-sky-100 rounded-2xl p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                <strong className="font-extrabold text-slate-900">Availability Notes:</strong>{' '}
                High demand on this day. 15- min buffer included for sanitization and notes.
              </p>
            </div>
          </div>

          {/* Card 2: ADDITIONAL DETAILS */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs space-y-5">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              ADDITIONAL DETAILS
            </h3>

            {/* Reschedule Reason Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Reschedule Reason
              </label>
              <select
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50/80 border border-slate-200/90 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all cursor-pointer"
              >
                <option value="Patient Request">Patient Request</option>
                <option value="Therapist Unavailable">Therapist Unavailable</option>
                <option value="Schedule Conflict">Schedule Conflict</option>
                <option value="Emergency">Emergency</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Internal Notes Textarea */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Internal Notes (Optional)
              </label>
              <textarea
                rows={3}
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Add any specific context for the clinical team..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-50/80 border border-slate-200/90 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleConfirmReschedule}
              className="w-full py-3.5 px-6 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-sm shadow-md shadow-blue-600/20 hover:shadow-lg transition-all cursor-pointer text-center"
            >
              Confirm Reschedule
            </button>
            <button
              onClick={onBack}
              className="w-full py-3 px-6 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-sm transition-all cursor-pointer text-center"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RescheduleAppointmentPage;
