import React, { useState, useEffect, useMemo } from 'react';
import { InitialsAvatar } from '@/components/ui/InitialsAvatar';
import {
  Search,
  CheckCircle2,
  Clock,
  User,
  Stethoscope,
  Calendar as CalendarIcon,
  ArrowRight,
  ArrowLeft,
  Check,
  Star,
  SlidersHorizontal,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Building2,
  Home,
  Video,
  UploadCloud,
  FileText,
  X,
  MapPin,
  Info,
  Send,
  RefreshCw,
  Receipt,
  Briefcase,
  List,
  Wallet,
  Compass,
  AlertCircle,
  CreditCard,
  DollarSign,
} from 'lucide-react';
import { subscribeToPatients } from '@/services/patientService';
import { subscribeToTherapists } from '@/services/therapistService';
import { getTherapistSlotsForDate, createScheduleRecord } from '@/services/scheduleService';
import { calculateAppointmentPricing, type PaymentMethod, type AppointmentType } from '@/utils/appointmentUtils';

interface CreateAppointmentPageProps {
  onBack: () => void;
  onSuccess?: () => void;
  initialStep?: number;
}

interface PatientCardData {
  id: string;
  name: string;
  patientId: string;
  avatar: string;
  condition: string;
  programPhase: string;
  progressPercent: number;
  lastSession: string;
  phone: string;
}

interface TherapistData {
  id: string;
  name: string;
  role: string;
  yearsExp: string;
  specialty: string;
  avatar: string;
  rating: number;
  availability: string;
  isAvailableToday?: boolean;
}

interface DayItem {
  day: string;
  date: string;
  fullDate: string; // YYYY-MM-DD
  formatted: string;
}

const generateWeekDays = (weekOffset: number = 0): DayItem[] => {
  const today = new Date();
  const currentDayIndex = today.getDay();
  const diffToMon = (currentDayIndex === 0 ? -6 : 1 - currentDayIndex) + weekOffset * 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMon);

  const days: DayItem[] = [];
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const fullDate = `${yyyy}-${mm}-${dd}`;
    const dayName = dayNames[d.getDay()];
    const formatted = `${dayName}, ${monthNames[d.getMonth()]} ${d.getDate()}`;
    days.push({
      day: dayName,
      date: String(d.getDate()).padStart(2, '0'),
      fullDate,
      formatted,
    });
  }
  return days;
};

const DEFAULT_MORNING_SLOTS = ['09:00 AM', '09:45 AM', '10:30 AM', '11:15 AM'];
const DEFAULT_AFTERNOON_SLOTS = ['01:00 PM', '01:45 PM', '02:30 PM', '03:15 PM', '04:00 PM', '04:45 PM'];
const DEFAULT_EVENING_SLOTS = ['06:00 PM', '06:45 PM', '07:30 PM', '08:15 PM'];

const STEPS = [
  { number: 1, label: 'Patient' },
  { number: 2, label: 'Therapist' },
  { number: 3, label: 'Schedule' },
  { number: 4, label: 'Session Details' },
  { number: 5, label: 'Confirmation' },
];

export const CreateAppointmentPage: React.FC<CreateAppointmentPageProps> = ({
  onBack,
  onSuccess,
  initialStep = 1,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [patientSearchTerm, setPatientSearchTerm] = useState<string>('');
  const [therapistSearchTerm, setTherapistSearchTerm] = useState<string>('');
  const [weekOffset, setWeekOffset] = useState<number>(0);

  // Firestore real-time state
  const [patients, setPatients] = useState<PatientCardData[]>([]);
  const [therapists, setTherapists] = useState<TherapistData[]>([]);
  const [bookedSlotsSet, setBookedSlotsSet] = useState<Set<string>>(new Set());

  // Dynamic Week Days
  const weekDays = useMemo(() => generateWeekDays(weekOffset), [weekOffset]);

  // Step state
  const [sessionDuration, setSessionDuration] = useState<'30m' | '45m' | '60m'>('45m');
  const [selectedDay, setSelectedDay] = useState<DayItem>(weekDays[2] || weekDays[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('01:45 PM');

  // Selections
  const [selectedPatient, setSelectedPatient] = useState<PatientCardData | null>(null);
  const [selectedTherapist, setSelectedTherapist] = useState<TherapistData | null>(null);
  const [visitType, setVisitType] = useState<'Clinic Visit' | 'Home Visit' | 'Online'>('Clinic Visit');

  // Payment Method Selection
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');

  // Home Visit Location State
  const [patientAddress, setPatientAddress] = useState<string>('Plot 42, 10th Main Rd, Indiranagar, Bengaluru');
  const [patientLat, setPatientLat] = useState<number>(12.9716);
  const [patientLng, setPatientLng] = useState<number>(77.5946);

  // Pricing inputs
  const [baseAmount, setBaseAmount] = useState<number>(1500);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Dynamic Pricing Calculation
  const computedPricing = useMemo(() => {
    return calculateAppointmentPricing({
      appointmentType: visitType,
      baseAmount,
      discount: discountAmount,
      patientLat,
      patientLng,
    });
  }, [visitType, baseAmount, discountAmount, patientLat, patientLng]);

  // Clinical Details
  const [patientInstructions, setPatientInstructions] = useState<string>(
    'Wear comfortable athletic clothing and bring any recent MRI scans for initial assessment.'
  );
  const [internalStaffNotes, setInternalStaffNotes] = useState<string>(
    'Post-op Week 6. Focusing on mobility and weight-bearing exercises. Moderate inflammation reported.'
  );
  const [urgencyPriority, setUrgencyPriority] = useState<'Normal' | 'High Priority'>('Normal');
  const [attachedFiles, setAttachedFiles] = useState<{ id: string; name: string; size: string }[]>([]);

  const [isBookedSuccess, setIsBookedSuccess] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Subscribe to Patients
  useEffect(() => {
    const unsub = subscribeToPatients((pts) => {
      const mapped: PatientCardData[] = pts.map((p) => ({
        id: p.id,
        name: p.name,
        patientId: p.patientId,
        avatar: p.avatarUrl,
        condition: p.condition,
        programPhase: 'Phase 1 - Initial Assessment',
        progressPercent: p.recoveryScore || 70,
        lastSession: p.nextAppointmentDate || 'No past sessions',
        phone: p.phone || '',
      }));
      setPatients(mapped);
      if (mapped.length > 0 && !selectedPatient) {
        setSelectedPatient(mapped[0]);
      }
    });
    return () => unsub();
  }, []);

  // Subscribe to Therapists
  useEffect(() => {
    const unsub = subscribeToTherapists((ths) => {
      const activeThs = ths.filter((t) => t.status === 'ACTIVE' && t.availability !== 'On Leave');
      const mapped: TherapistData[] = activeThs.map((t) => ({
        id: t.id!,
        name: t.name,
        role: t.degree || 'Physiotherapy Specialist',
        yearsExp: t.experience || '5+ Years Exp',
        specialty: t.specializations?.join(', ') || 'Orthopedic Physiotherapy',
        avatar:
          t.avatarUrl ||
          'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
        rating: t.rating || 5.0,
        availability: t.availability || 'Available Today',
        isAvailableToday: t.availability === 'Available Today',
      }));
      setTherapists(mapped);
      if (mapped.length > 0 && !selectedTherapist) {
        setSelectedTherapist(mapped[0]);
      }
    });
    return () => unsub();
  }, []);

  // Fetch booked slots whenever selectedTherapist or selectedDay changes
  useEffect(() => {
    if (selectedTherapist && selectedDay) {
      const allSlots = [...DEFAULT_MORNING_SLOTS, ...DEFAULT_AFTERNOON_SLOTS, ...DEFAULT_EVENING_SLOTS];
      getTherapistSlotsForDate(selectedTherapist.id, selectedDay.fullDate, allSlots).then(
        ({ bookedSlots }) => {
          setBookedSlotsSet(bookedSlots);
        }
      );
    }
  }, [selectedTherapist?.id, selectedDay?.fullDate]);

  useEffect(() => {
    if (weekDays.length > 0 && !weekDays.find((d) => d.fullDate === selectedDay?.fullDate)) {
      setSelectedDay(weekDays[0]);
    }
  }, [weekDays]);

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
      p.patientId.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
      p.condition.toLowerCase().includes(patientSearchTerm.toLowerCase())
  );

  const filteredTherapists = therapists.filter(
    (t) =>
      t.name.toLowerCase().includes(therapistSearchTerm.toLowerCase()) ||
      t.specialty.toLowerCase().includes(therapistSearchTerm.toLowerCase()) ||
      t.role.toLowerCase().includes(therapistSearchTerm.toLowerCase())
  );

  const handleNextStep = async () => {
    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
    } else {
      if (!selectedPatient || !selectedTherapist) {
        setBookingError('Please select both a patient and a therapist before confirming.');
        return;
      }
      setIsSubmitting(true);
      setBookingError(null);

      try {
        await createScheduleRecord({
          patientId: selectedPatient.id,
          patientName: selectedPatient.name,
          patientSubtitle: selectedPatient.condition,
          patientAvatar: selectedPatient.avatar,
          patientPhone: selectedPatient.phone,
          patientCondition: selectedPatient.condition,
          therapistId: selectedTherapist.id,
          therapistName: selectedTherapist.name,
          therapistSubtitle: selectedTherapist.specialty,
          therapistAvatar: selectedTherapist.avatar,
          type: visitType,
          fullDate: selectedDay.fullDate,
          dateLabel: selectedDay.formatted,
          timeSlot: selectedTimeSlot,
          sessionDuration,
          patientInstructions,
          internalStaffNotes,
          urgencyPriority,
          attachedFiles,
          paymentMethod,
          address: patientAddress,
          latitude: patientLat,
          longitude: patientLng,
          baseAmount: computedPricing.baseAmount,
          homeVisitFee: computedPricing.visitFee,
          travelFee: computedPricing.travelFee,
          discount: computedPricing.discount,
          taxRate: 0.05,
        });

        setIsBookedSuccess(true);
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 2000);
        }
      } catch (err: any) {
        console.error('Create appointment error:', err);
        if (err.message === 'SLOT_ALREADY_BOOKED') {
          setBookingError('This time slot was just booked by another user. Please select a different slot.');
        } else {
          setBookingError(err.message || 'Failed to create appointment. Please try again.');
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <button
              onClick={onBack}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Back to Schedule"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Create Appointment
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500 pl-9">
            Book a treatment session by selecting patient, therapist and availability.
          </p>
        </div>

        {/* Action Buttons Top Right */}
        <div className="flex items-center space-x-3 self-end md:self-auto">
          <button
            onClick={onBack}
            className="px-5 py-2.5 rounded-full border border-slate-200 bg-white text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
          >
            Discard Draft
          </button>
          <button
            onClick={handleNextStep}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-full bg-[#003B95] hover:bg-blue-900 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-950/20 transition-all cursor-pointer flex items-center space-x-2 disabled:opacity-50"
          >
            <span>{currentStep === 5 ? (isSubmitting ? 'Booking...' : 'Confirm & Book') : 'Save & Continue'}</span>
          </button>
        </div>
      </div>

      {/* Stepper Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-slate-100 shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[650px] px-2 sm:px-6">
          {STEPS.map((step, idx) => {
            const isCompleted = currentStep > step.number;
            const isActive = currentStep === step.number;

            return (
              <React.Fragment key={step.number}>
                <div
                  onClick={() => setCurrentStep(step.number)}
                  className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer select-none group"
                >
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-extrabold transition-all ${
                      isCompleted
                        ? 'bg-[#003B95] text-white shadow-xs'
                        : isActive
                        ? 'bg-[#003B95] text-white ring-4 ring-blue-100 shadow-md shadow-blue-900/20'
                        : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" /> : step.number}
                  </div>
                  <span
                    className={`text-xs sm:text-sm font-bold transition-colors ${
                      isActive || isCompleted
                        ? 'text-slate-900 font-extrabold'
                        : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {idx < STEPS.length - 1 && (
                  <div
                    className={`flex-1 max-w-[30px] sm:max-w-[70px] mx-2 h-0.5 rounded-full transition-colors ${
                      isCompleted ? 'bg-[#003B95]' : 'bg-slate-100'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* STEP 1: PATIENT SELECTION */}
      {currentStep === 1 && (
        <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Select Patient</h2>
            <span className="text-xs text-slate-400 font-medium">Step 1 of 5</span>
          </div>

          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={patientSearchTerm}
              onChange={(e) => setPatientSearchTerm(e.target.value)}
              placeholder="Search by Name, Phone, or Patient ID..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 placeholder:text-slate-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredPatients.map((patient) => {
              const isSelected = selectedPatient?.id === patient.id;

              return (
                <div
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient)}
                  className={`relative bg-white rounded-2xl p-5 border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-2 border-[#003B95] shadow-lg shadow-blue-900/10 bg-blue-50/10'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-4 right-4 text-[#003B95]">
                      <CheckCircle2 className="w-5 h-5 fill-[#003B95] text-white" />
                    </div>
                  )}

                  <div className="flex items-center space-x-3.5 mb-4">
                    <InitialsAvatar name={patient.name} className="w-12 h-12 text-sm font-bold shrink-0" />
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                        {patient.name}
                      </h3>
                      <p className="text-xs font-semibold text-slate-400">
                        Patient ID: <span className="text-blue-600 font-bold">{patient.patientId}</span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-500 tracking-wider">
                        {patient.condition}
                      </span>
                      <span className="text-[#003B95] font-extrabold">
                        {patient.progressPercent}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#003B95] rounded-full transition-all duration-500"
                        style={{ width: `${patient.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="inline-flex items-center space-x-2 w-full px-3 py-2 bg-slate-50 rounded-xl text-xs font-medium text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Last session:{' '}
                      <strong className="text-slate-800 font-semibold">
                        {patient.lastSession}
                      </strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-3 bg-[#003B95] hover:bg-blue-900 text-white font-bold rounded-full shadow-md text-sm cursor-pointer transition-all flex items-center space-x-2"
            >
              <span>Next: Select Therapist</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: THERAPIST SELECTION */}
      {currentStep === 2 && (
        <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Select Therapist</h2>
            <span className="text-xs text-slate-400 font-medium">Step 2 of 5</span>
          </div>

          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={therapistSearchTerm}
              onChange={(e) => setTherapistSearchTerm(e.target.value)}
              placeholder="Search by Name, Specialization..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 placeholder:text-slate-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="space-y-4">
            {filteredTherapists.map((therapist) => {
              const isSelected = selectedTherapist?.id === therapist.id;

              return (
                <div
                  key={therapist.id}
                  onClick={() => setSelectedTherapist(therapist)}
                  className={`relative bg-white rounded-2xl p-5 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-2 border-[#003B95] bg-blue-50/10 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <InitialsAvatar name={therapist.name} className="w-14 h-14 text-base font-bold shrink-0" />
                    <div className="space-y-1">
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-snug">
                        {therapist.name}
                      </h3>
                      <p className="text-xs sm:text-sm font-bold text-blue-700">
                        {therapist.specialty}
                      </p>
                      <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 pt-0.5">
                        <span className="flex items-center text-amber-500 font-extrabold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                          {therapist.rating}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span
                          className={
                            therapist.isAvailableToday
                              ? 'text-emerald-600 font-bold'
                              : 'text-slate-500'
                          }
                        >
                          {therapist.availability}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTherapist(therapist);
                    }}
                    className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold border transition-all cursor-pointer self-end sm:self-center ${
                      isSelected
                        ? 'bg-[#003B95] text-white border-[#003B95] shadow-md'
                        : 'bg-white text-blue-700 border-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    {isSelected ? 'Selected ✓' : 'Select'}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-6 py-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-full text-sm cursor-pointer transition-all"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="px-6 py-3 bg-[#003B95] hover:bg-blue-900 text-white font-bold rounded-full shadow-md text-sm cursor-pointer transition-all flex items-center space-x-2"
            >
              <span>Next: Select Schedule</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SCHEDULE SELECTION */}
      {currentStep === 3 && (
        <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
              <div className="space-y-2">
                <span className="block text-xs font-bold text-slate-400 tracking-wider uppercase">
                  SELECT SESSION DURATION
                </span>
                <div className="flex items-center space-x-2">
                  {(['30m', '45m', '60m'] as const).map((duration) => {
                    const isSelected = sessionDuration === duration;
                    return (
                      <button
                        key={duration}
                        type="button"
                        onClick={() => setSessionDuration(duration)}
                        className={`px-5 py-2 rounded-full text-xs sm:text-sm font-extrabold transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-white text-blue-950 border-2 border-blue-800 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {duration}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center space-x-3 self-end sm:self-auto">
                <span className="text-xs font-semibold text-slate-500">
                  Timezone: <strong className="text-slate-700">IST (UTC+5:30)</strong>
                </span>
              </div>
            </div>

            {/* Calendar Date Navigation */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <button
                  type="button"
                  onClick={() => setWeekOffset((prev) => prev - 1)}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Previous Week"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  {weekDays[0]?.formatted} – {weekDays[6]?.formatted}
                </h3>
                <button
                  type="button"
                  onClick={() => setWeekOffset((prev) => prev + 1)}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Next Week"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2 sm:gap-3">
                {weekDays.map((dayItem) => {
                  const isSelected = selectedDay.fullDate === dayItem.fullDate;
                  return (
                    <div
                      key={dayItem.fullDate}
                      onClick={() => setSelectedDay(dayItem)}
                      className={`flex flex-col items-center justify-center py-3 sm:py-4 px-1 rounded-2xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-50/80 border-2 border-blue-600 shadow-sm'
                          : 'bg-slate-50/70 border border-slate-100 hover:bg-slate-100'
                      }`}
                    >
                      <span
                        className={`text-[11px] sm:text-xs font-bold uppercase ${
                          isSelected ? 'text-blue-700 font-extrabold' : 'text-slate-400'
                        }`}
                      >
                        {dayItem.day}
                      </span>
                      <span
                        className={`text-lg sm:text-2xl font-black mt-1 ${
                          isSelected ? 'text-blue-900' : 'text-slate-800'
                        }`}
                      >
                        {dayItem.date}
                      </span>
                      <div className="h-2 flex items-center justify-center mt-1">
                        {isSelected && <div className="w-2 h-2 rounded-full bg-blue-600 animate-in zoom-in" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Time Slot Picker */}
            <div className="space-y-6 pt-2">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>MORNING SLOTS</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {DEFAULT_MORNING_SLOTS.map((slotTime) => {
                    const isBooked = bookedSlotsSet.has(slotTime);
                    const isSelected = selectedTimeSlot === slotTime;
                    return (
                      <button
                        key={slotTime}
                        type="button"
                        disabled={isBooked}
                        onClick={() => setSelectedTimeSlot(slotTime)}
                        className={`py-3 px-4 rounded-2xl text-xs sm:text-sm font-extrabold transition-all border relative ${
                          isBooked
                            ? 'bg-slate-50 text-slate-300 border-slate-100 line-through cursor-not-allowed'
                            : isSelected
                            ? 'bg-[#003B95] text-white border-[#003B95] shadow-md shadow-blue-900/20'
                            : 'bg-slate-50/80 text-slate-700 border-slate-100 hover:bg-slate-100 cursor-pointer'
                        }`}
                      >
                        {slotTime}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>AFTERNOON SLOTS</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {DEFAULT_AFTERNOON_SLOTS.map((slotTime) => {
                    const isBooked = bookedSlotsSet.has(slotTime);
                    const isSelected = selectedTimeSlot === slotTime;
                    return (
                      <button
                        key={slotTime}
                        type="button"
                        disabled={isBooked}
                        onClick={() => setSelectedTimeSlot(slotTime)}
                        className={`py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-extrabold transition-all border relative ${
                          isBooked
                            ? 'bg-slate-50/80 text-slate-300 border-slate-100 line-through cursor-not-allowed'
                            : isSelected
                            ? 'bg-[#003B95] text-white border-[#003B95] shadow-lg shadow-blue-950/25 ring-2 ring-blue-600/30'
                            : 'bg-slate-50/80 text-slate-700 border-slate-100 hover:bg-slate-100 cursor-pointer'
                        }`}
                      >
                        {slotTime}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>EVENING SLOTS</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {DEFAULT_EVENING_SLOTS.map((slotTime) => {
                    const isBooked = bookedSlotsSet.has(slotTime);
                    const isSelected = selectedTimeSlot === slotTime;
                    return (
                      <button
                        key={slotTime}
                        type="button"
                        disabled={isBooked}
                        onClick={() => setSelectedTimeSlot(slotTime)}
                        className={`py-3 px-4 rounded-2xl text-xs sm:text-sm font-extrabold transition-all border relative ${
                          isBooked
                            ? 'bg-slate-50 text-slate-300 border-slate-100 line-through cursor-not-allowed'
                            : isSelected
                            ? 'bg-[#003B95] text-white border-[#003B95] shadow-md shadow-blue-900/20'
                            : 'bg-slate-50/80 text-slate-700 border-slate-100 hover:bg-slate-100 cursor-pointer'
                        }`}
                      >
                        {slotTime}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-full text-sm cursor-pointer transition-all"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="px-6 py-3 bg-[#003B95] hover:bg-blue-900 text-white font-bold rounded-full shadow-md text-sm cursor-pointer transition-all flex items-center space-x-2"
            >
              <span>Next: Session Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: SESSION DETAILS FORM */}
      {currentStep === 4 && (
        <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
          {/* Session Type */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs space-y-5">
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Select Session Type
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                onClick={() => setVisitType('Clinic Visit')}
                className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-1.5 ${
                  visitType === 'Clinic Visit'
                    ? 'border-2 border-[#003B95] bg-blue-50/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <h4 className="font-extrabold text-slate-900 text-base">Clinic Visit</h4>
                <p className="text-xs font-medium text-slate-400">At main campus</p>
              </div>

              <div
                onClick={() => setVisitType('Home Visit')}
                className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-1.5 ${
                  visitType === 'Home Visit'
                    ? 'border-2 border-[#003B95] bg-blue-50/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <h4 className="font-extrabold text-slate-900 text-base">Home Visit</h4>
                <p className="text-xs font-medium text-slate-400">Physician travels to location</p>
              </div>

              <div
                onClick={() => setVisitType('Online')}
                className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-1.5 ${
                  visitType === 'Online'
                    ? 'border-2 border-[#003B95] bg-blue-50/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <h4 className="font-extrabold text-slate-900 text-base">Online Consultation</h4>
                <p className="text-xs font-medium text-slate-400">Via Tele-Health</p>
              </div>
            </div>

            {/* Home Visit Specific Location Fields */}
            {visitType === 'Home Visit' && (
              <div className="pt-4 border-t border-slate-100 space-y-4 animate-in fade-in duration-200">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Patient Location Details (Home Visit)
                </h4>
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700">Full Address</label>
                  <input
                    type="text"
                    value={patientAddress}
                    onChange={(e) => setPatientAddress(e.target.value)}
                    placeholder="Enter patient full home address..."
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700">Latitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={patientLat}
                      onChange={(e) => setPatientLat(parseFloat(e.target.value) || 0)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700">Longitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={patientLng}
                      onChange={(e) => setPatientLng(parseFloat(e.target.value) || 0)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Method Selection Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Select Payment Method
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setPaymentMethod('CASH')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center space-x-4 ${
                  paymentMethod === 'CASH'
                    ? 'border-2 border-[#003B95] bg-blue-50/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  paymentMethod === 'CASH' ? 'bg-[#003B95] text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Pay by Cash</h4>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">Payment Pending until collected</p>
                </div>
              </div>

              <div
                onClick={() => setPaymentMethod('ONLINE')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center space-x-4 ${
                  paymentMethod === 'ONLINE'
                    ? 'border-2 border-[#003B95] bg-blue-50/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  paymentMethod === 'ONLINE' ? 'bg-[#003B95] text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Online Gateway (Razorpay/UPI)</h4>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">Verified backend payment order</p>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Notes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-3">
              <label className="block text-sm font-extrabold text-slate-900">Patient Instructions</label>
              <textarea
                rows={3}
                value={patientInstructions}
                onChange={(e) => setPatientInstructions(e.target.value)}
                className="w-full p-4 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-3">
              <label className="block text-sm font-extrabold text-slate-900">Internal Staff Notes</label>
              <textarea
                rows={3}
                value={internalStaffNotes}
                onChange={(e) => setInternalStaffNotes(e.target.value)}
                className="w-full p-4 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Priority Pill */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Urgency Priority</h3>
              <p className="text-xs font-medium text-slate-400 mt-0.5">
                Flags the appointment for prioritized medical triage.
              </p>
            </div>
            <div className="p-1 bg-slate-100 rounded-full inline-flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setUrgencyPriority('Normal')}
                className={`px-5 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                  urgencyPriority === 'Normal' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => setUrgencyPriority('High Priority')}
                className={`px-5 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                  urgencyPriority === 'High Priority' ? 'bg-[#003B95] text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                High Priority
              </button>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-6 py-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-full text-sm cursor-pointer transition-all"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(5)}
              className="px-6 py-3 bg-[#003B95] hover:bg-blue-900 text-white font-bold rounded-full shadow-md text-sm cursor-pointer transition-all flex items-center space-x-2"
            >
              <span>Proceed to Review</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: REVIEW APPOINTMENT */}
      {currentStep === 5 && (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Review Appointment
            </h2>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
              Please double-check all clinical and financial details before finalizing the booking.
            </p>
          </div>

          {bookingError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl shadow-xs flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
              <div className="text-sm font-semibold">{bookingError}</div>
            </div>
          )}

          {isBookedSuccess && (
            <div className="bg-emerald-500 text-white p-6 rounded-3xl shadow-xl space-y-2 text-center animate-in zoom-in-95 duration-300">
              <div className="w-12 h-12 bg-white text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-black">
                ✓
              </div>
              <h3 className="text-xl font-extrabold">Appointment Confirmed Successfully!</h3>
              <p className="text-sm opacity-90">
                Booking confirmed for {selectedPatient?.name || 'Patient'} with {selectedTherapist?.name || 'Dr. Arjun Mehta'} on {selectedDay.formatted} at {selectedTimeSlot}. Redirecting to schedule...
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            <div className="lg:col-span-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* PATIENT Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
                      <User className="w-5 h-5 stroke-[2.3]" />
                    </div>
                    <span className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase">
                      PATIENT DETAILS
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                      {selectedPatient?.name || 'Unassigned Patient'}
                    </h3>
                  </div>

                  <div className="space-y-2 pt-1 border-t border-slate-50">
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-slate-400 font-semibold">Patient ID:</span>
                      <span className="font-extrabold text-[#003B95] font-mono tracking-tight bg-blue-50/80 px-2.5 py-0.5 rounded-lg border border-blue-100">
                        {selectedPatient?.patientId || '#PT-0000'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-slate-400 font-semibold">Primary Case:</span>
                      <span className="font-extrabold text-slate-800">
                        {selectedPatient?.condition || 'General Rehab'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* THERAPIST Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
                      <Briefcase className="w-5 h-5 stroke-[2.3]" />
                    </div>
                    <span className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase">
                      THERAPIST
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                      {selectedTherapist ? selectedTherapist.name : 'Dr. Arjun Mehta'}
                    </h3>
                  </div>

                  <div className="space-y-2 pt-1 border-t border-slate-50">
                    <div className="flex justify-between items-start text-xs sm:text-sm gap-2">
                      <span className="text-slate-400 font-semibold flex-shrink-0">Specialization:</span>
                      <span className="font-extrabold text-slate-800 text-right">
                        {selectedTherapist ? selectedTherapist.role : 'Orthopedic Physiotherapy'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule & Visit Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
                      <CalendarIcon className="w-5 h-5 stroke-[2.3]" />
                    </div>
                    <span className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase">
                      SCHEDULE
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                      {selectedDay.formatted}
                    </h3>
                  </div>
                  <div className="space-y-2 pt-1 border-t border-slate-50">
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-slate-400 font-semibold">Time:</span>
                      <span className="font-extrabold text-slate-800">{selectedTimeSlot}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-slate-400 font-semibold">Duration:</span>
                      <span className="font-extrabold text-slate-800">{sessionDuration}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
                      <MapPin className="w-5 h-5 stroke-[2.3]" />
                    </div>
                    <span className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase">
                      SESSION & PAYMENT TYPE
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                      {visitType} ({paymentMethod})
                    </h3>
                  </div>

                  <p className="text-xs text-slate-500 font-medium leading-relaxed pt-1 border-t border-slate-50">
                    {visitType === 'Home Visit'
                      ? patientAddress
                      : visitType === 'Online'
                      ? 'Tele-Health Video Link will be generated upon confirmation'
                      : 'Spine & Wellness Center, MG Road, Bengaluru'}
                  </p>
                </div>
              </div>

              {/* FINANCIAL SUMMARY Card */}
              <div className="bg-blue-50/30 rounded-3xl p-6 sm:p-7 border border-blue-100/70 shadow-xs space-y-4">
                <div className="flex items-center space-x-2">
                  <Wallet className="w-4 h-4 text-blue-700 stroke-[2.5]" />
                  <h3 className="text-xs font-extrabold text-blue-950 tracking-wider uppercase">
                    FINANCIAL PRICING BREAKDOWN
                  </h3>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="flex justify-between items-center text-xs sm:text-sm font-semibold text-slate-600">
                    <span>Base Session Amount</span>
                    <span className="text-slate-900 font-extrabold">₹{computedPricing.baseAmount.toLocaleString('en-IN')}</span>
                  </div>

                  {visitType === 'Home Visit' && (
                    <>
                      <div className="flex justify-between items-center text-xs sm:text-sm font-semibold text-slate-600">
                        <span>Home Visit Fee</span>
                        <span className="text-slate-900 font-extrabold">₹{computedPricing.visitFee.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs sm:text-sm font-semibold text-slate-600">
                        <span>Travel / Distance Fee</span>
                        <span className="text-slate-900 font-extrabold">₹{computedPricing.travelFee.toLocaleString('en-IN')}</span>
                      </div>
                    </>
                  )}

                  {computedPricing.discount > 0 && (
                    <div className="flex justify-between items-center text-xs sm:text-sm font-semibold">
                      <span className="text-slate-600">Discount</span>
                      <span className="text-emerald-600 font-extrabold">-₹{computedPricing.discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs sm:text-sm font-semibold text-slate-600">
                    <span>Tax (5%)</span>
                    <span className="text-slate-900 font-extrabold">₹{computedPricing.tax.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="pt-3 border-t border-blue-100 flex justify-between items-center">
                    <span className="text-sm font-extrabold text-slate-900">Final Total Amount ({paymentMethod})</span>
                    <span className="text-lg sm:text-xl font-black text-blue-900 tracking-tight">
                      ₹{computedPricing.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="flex items-center justify-between gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-3 rounded-full border border-slate-200 bg-white text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-50 transition-all cursor-pointer flex items-center space-x-2 shadow-2xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Edit</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={isSubmitting}
                  className="px-7 py-3 rounded-full bg-[#003B95] hover:bg-blue-900 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-950/20 transition-all cursor-pointer flex items-center space-x-2 disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Confirming...' : 'Confirm & Book Appointment'}</span>
                  <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center ml-1">
                    <Check className="w-3 h-3 text-white stroke-[3]" />
                  </div>
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-blue-50/40 rounded-3xl p-6 border border-blue-100/70 shadow-xs space-y-5">
                <h3 className="text-xs font-black text-blue-800 tracking-widest uppercase">
                  NEXT STEPS
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3.5">
                    <div className="w-8 h-8 rounded-full bg-[#003B95] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                      <Send className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                        Instant Confirmation
                      </h4>
                      <p className="text-xs font-medium text-slate-500 mt-0.5 leading-relaxed">
                        Patient notification will be sent via SMS/Email immediately.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3.5">
                    <div className="w-8 h-8 rounded-full bg-[#003B95] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                      <RefreshCw className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                        Sync to Calendar
                      </h4>
                      <p className="text-xs font-medium text-slate-500 mt-0.5 leading-relaxed">
                        The appointment will be synced with therapist schedule.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateAppointmentPage;
