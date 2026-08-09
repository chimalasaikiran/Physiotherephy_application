import React, { useState } from 'react';
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
} from 'lucide-react';

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
  fullDate: string;
  formatted: string;
}

interface TimeSlotItem {
  time: string;
  status: 'available' | 'booked';
}

const MOCK_PATIENTS: PatientCardData[] = [
  {
    id: 'p-1',
    name: 'Sanya Malhotra',
    patientId: '#OM-90210',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    condition: 'ACL RECOVERY',
    programPhase: 'ACL Recovery • Phase 3',
    progressPercent: 75,
    lastSession: 'Oct 12, 2024',
    phone: '+1 (555) 234-5678',
  },
  {
    id: 'p-2',
    name: 'Marcus Thorne',
    patientId: '#OM-88432',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    condition: 'LUMBAR STRAIN',
    programPhase: 'Lumbar Spine Rehab • Phase 2',
    progressPercent: 40,
    lastSession: 'Oct 05, 2024',
    phone: '+1 (555) 876-5432',
  },
  {
    id: 'p-3',
    name: 'Arjun Reddy',
    patientId: '#OM-91045',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    condition: 'ROTATOR CUFF',
    programPhase: 'Shoulder Mobility • Phase 1',
    progressPercent: 60,
    lastSession: 'Oct 14, 2024',
    phone: '+1 (555) 345-6789',
  },
  {
    id: 'p-4',
    name: 'Ananya Verma',
    patientId: '#OM-87219',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    condition: 'POST-OP KNEE',
    programPhase: 'Knee Strengthening • Phase 4',
    progressPercent: 85,
    lastSession: 'Oct 10, 2024',
    phone: '+1 (555) 987-6543',
  },
];

const MOCK_THERAPISTS: TherapistData[] = [
  {
    id: 't-1',
    name: 'Dr. Arjun Mehta',
    role: 'Orthopedic Physiotherapy',
    yearsExp: '12 years exp',
    specialty: 'Orthopedic Physiotherapy • 12 years exp',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
    rating: 4.9,
    availability: 'Available Today',
    isAvailableToday: true,
  },
  {
    id: 't-2',
    name: 'Dr. Ananya Iyer',
    role: 'Senior MSK Physiotherapist',
    yearsExp: '8 years exp',
    specialty: 'Senior MSK Physiotherapist • 8 years exp',
    avatar: 'https://images.unsplash.com/photo-1594824813566-88855ce78c00?auto=format&fit=crop&q=80&w=200',
    rating: 4.8,
    availability: 'Next Available: Tomorrow',
    isAvailableToday: false,
  },
  {
    id: 't-3',
    name: 'Dr. Priya Sharma',
    role: 'Neurological Specialist',
    yearsExp: '10 years exp',
    specialty: 'Neurological Specialist • 10 years exp',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200',
    rating: 4.9,
    availability: 'Next Available: Wednesday',
    isAvailableToday: false,
  },
  {
    id: 't-4',
    name: 'Dr. Rohan Gupta',
    role: 'Spine & Joint Specialist',
    yearsExp: '14 years exp',
    specialty: 'Spine & Joint Specialist • 14 years exp',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200',
    rating: 4.95,
    availability: 'Available Today',
    isAvailableToday: true,
  },
];

const WEEK_DAYS: DayItem[] = [
  { day: 'MON', date: '21', fullDate: '2024-10-21', formatted: 'Mon, Oct 21' },
  { day: 'TUE', date: '22', fullDate: '2024-10-22', formatted: 'Tue, Oct 22' },
  { day: 'WED', date: '23', fullDate: '2024-10-23', formatted: 'Wed, Oct 23' },
  { day: 'THU', date: '24', fullDate: '2024-10-24', formatted: 'Thu, Oct 24' },
  { day: 'FRI', date: '25', fullDate: '2024-10-25', formatted: 'Fri, Oct 25' },
  { day: 'SAT', date: '26', fullDate: '2024-10-26', formatted: 'Sat, Oct 26' },
  { day: 'SUN', date: '27', fullDate: '2024-10-27', formatted: 'Sun, Oct 27' },
];

const MORNING_SLOTS: TimeSlotItem[] = [
  { time: '09:00 AM', status: 'available' },
  { time: '09:45 AM', status: 'available' },
  { time: '10:30 AM', status: 'booked' },
  { time: '11:15 AM', status: 'available' },
];

const AFTERNOON_SLOTS: TimeSlotItem[] = [
  { time: '01:00 PM', status: 'booked' },
  { time: '01:45 PM', status: 'available' },
  { time: '02:30 PM', status: 'available' },
  { time: '03:15 PM', status: 'available' },
  { time: '04:00 PM', status: 'available' },
  { time: '04:45 PM', status: 'available' },
];

const EVENING_SLOTS: TimeSlotItem[] = [
  { time: '06:00 PM', status: 'available' },
  { time: '06:45 PM', status: 'available' },
  { time: '07:30 PM', status: 'available' },
  { time: '08:15 PM', status: 'booked' },
];

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
  initialStep = 3,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [patientSearchTerm, setPatientSearchTerm] = useState<string>('');
  const [therapistSearchTerm, setTherapistSearchTerm] = useState<string>('');

  // Step state
  const [sessionDuration, setSessionDuration] = useState<'30m' | '45m' | '60m'>('45m');
  const [selectedDay, setSelectedDay] = useState<DayItem>(WEEK_DAYS[2]); // Default Wed, Oct 23
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('01:45 PM'); // Default 01:45 PM

  // Selections
  const [selectedPatient, setSelectedPatient] = useState<PatientCardData>(MOCK_PATIENTS[0]);
  const [selectedTherapist, setSelectedTherapist] = useState<TherapistData | null>(MOCK_THERAPISTS[0]);
  const [visitType, setVisitType] = useState<'Clinic Visit' | 'Home Visit' | 'Online'>('Clinic Visit');

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

  // Financial values matching Figma exact node 36-6208 (₹1500 + ₹300 - ₹1200 = ₹600)
  const sessionFee = 1500.0;
  const facilityCharges = 300.0;
  const insuranceCoverage = 1200.0;
  const totalPayable = sessionFee + facilityCharges - insuranceCoverage;

  const filteredPatients = MOCK_PATIENTS.filter(
    (p) =>
      p.name.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
      p.patientId.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
      p.condition.toLowerCase().includes(patientSearchTerm.toLowerCase())
  );

  const filteredTherapists = MOCK_THERAPISTS.filter(
    (t) =>
      t.name.toLowerCase().includes(therapistSearchTerm.toLowerCase()) ||
      t.specialty.toLowerCase().includes(therapistSearchTerm.toLowerCase()) ||
      t.role.toLowerCase().includes(therapistSearchTerm.toLowerCase())
  );

  const handleNextStep = () => {
    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsBookedSuccess(true);
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2200);
      }
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Top Header Row matching Figma Navbar */}
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
            className="px-6 py-2.5 rounded-full bg-[#003B95] hover:bg-blue-900 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-950/20 transition-all cursor-pointer flex items-center space-x-2"
          >
            <span>{currentStep === 5 ? 'Confirm & Book' : 'Save & Continue'}</span>
          </button>
        </div>
      </div>

      {/* Stepper Card matching Figma Node 36-6208 (Pill track) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-slate-100 shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[650px] px-2 sm:px-6">
          {STEPS.map((step, idx) => {
            // Check stepper state matching Figma: Step 1 & 2 completed, Step 3 active (or current step)
            const isCompleted = currentStep > step.number || (currentStep === 3 && step.number <= 2) || (currentStep === 5 && step.number <= 2);
            const isActive = currentStep === step.number || (currentStep === 3 && step.number === 3);

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

      {/* VIEW RENDERER BASED ON CURRENT STEP */}
      {currentStep === 1 && (
        /* STEP 1: PATIENT SELECTION */
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
              const isSelected = selectedPatient.id === patient.id;

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
                    <img
                      src={patient.avatar}
                      alt={patient.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 shadow-xs"
                    />
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

      {currentStep === 2 && (
        /* STEP 2: THERAPIST SELECTION */
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
                    <img
                      src={therapist.avatar}
                      alt={therapist.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-slate-100 shadow-xs flex-shrink-0"
                    />
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

      {currentStep === 3 && (
        /* STEP 3: SCHEDULE SELECTION */
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
                <button
                  type="button"
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                  <span>Filter</span>
                </button>
              </div>
            </div>

            {/* Calendar Date Navigation */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <button
                  type="button"
                  className="p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  October 21 – 27, 2024
                </h3>
                <button
                  type="button"
                  className="p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2 sm:gap-3">
                {WEEK_DAYS.map((dayItem) => {
                  const isSelected = selectedDay.date === dayItem.date;
                  return (
                    <div
                      key={dayItem.date}
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
                  {MORNING_SLOTS.map((slot) => {
                    const isBooked = slot.status === 'booked';
                    const isSelected = selectedTimeSlot === slot.time;
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={isBooked}
                        onClick={() => setSelectedTimeSlot(slot.time)}
                        className={`py-3 px-4 rounded-2xl text-xs sm:text-sm font-extrabold transition-all border relative ${
                          isBooked
                            ? 'bg-slate-50 text-slate-300 border-slate-100 line-through cursor-not-allowed'
                            : isSelected
                            ? 'bg-[#003B95] text-white border-[#003B95] shadow-md shadow-blue-900/20'
                            : 'bg-slate-50/80 text-slate-700 border-slate-100 hover:bg-slate-100 cursor-pointer'
                        }`}
                      >
                        {slot.time}
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
                  {AFTERNOON_SLOTS.map((slot) => {
                    const isBooked = slot.status === 'booked';
                    const isSelected = selectedTimeSlot === slot.time;
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={isBooked}
                        onClick={() => setSelectedTimeSlot(slot.time)}
                        className={`py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-extrabold transition-all border relative ${
                          isBooked
                            ? 'bg-slate-50/80 text-slate-300 border-slate-100 line-through cursor-not-allowed'
                            : isSelected
                            ? 'bg-[#003B95] text-white border-[#003B95] shadow-lg shadow-blue-950/25 ring-2 ring-blue-600/30'
                            : 'bg-slate-50/80 text-slate-700 border-slate-100 hover:bg-slate-100 cursor-pointer'
                        }`}
                      >
                        {slot.time}
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
                  {EVENING_SLOTS.map((slot) => {
                    const isBooked = slot.status === 'booked';
                    const isSelected = selectedTimeSlot === slot.time;
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={isBooked}
                        onClick={() => setSelectedTimeSlot(slot.time)}
                        className={`py-3 px-4 rounded-2xl text-xs sm:text-sm font-extrabold transition-all border relative ${
                          isBooked
                            ? 'bg-slate-50 text-slate-300 border-slate-100 line-through cursor-not-allowed'
                            : isSelected
                            ? 'bg-[#003B95] text-white border-[#003B95] shadow-md shadow-blue-900/20'
                            : 'bg-slate-50/80 text-slate-700 border-slate-100 hover:bg-slate-100 cursor-pointer'
                        }`}
                      >
                        {slot.time}
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
              onClick={() => setCurrentStep(5)}
              className="px-6 py-3 bg-[#003B95] hover:bg-blue-900 text-white font-bold rounded-full shadow-md text-sm cursor-pointer transition-all flex items-center space-x-2"
            >
              <span>Review Appointment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {currentStep === 4 && (
        /* STEP 4: SESSION DETAILS FORM */
        <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
          {/* Session Type */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs space-y-5">
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Select Session Type
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                onClick={() => setVisitType('Clinic Visit')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center space-y-3 ${
                  visitType === 'Clinic Visit'
                    ? 'border-2 border-[#003B95] bg-blue-50/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  visitType === 'Clinic Visit' ? 'bg-[#003B95] text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Building2 className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Clinic Visit</h4>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">At main campus</p>
                </div>
              </div>

              <div
                onClick={() => setVisitType('Home Visit')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center space-y-3 ${
                  visitType === 'Home Visit'
                    ? 'border-2 border-[#003B95] bg-blue-50/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  visitType === 'Home Visit' ? 'bg-[#003B95] text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Home className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Home Visit</h4>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">Physician travels</p>
                </div>
              </div>

              <div
                onClick={() => setVisitType('Online')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center space-y-3 ${
                  visitType === 'Online'
                    ? 'border-2 border-[#003B95] bg-blue-50/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  visitType === 'Online' ? 'bg-[#003B95] text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Video className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Online Consultation</h4>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">Via Tele-Health</p>
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

          {/* Attachments Upload */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900">Attachments</h3>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  const newFiles = Array.from(e.dataTransfer.files).map((file, idx) => ({
                    id: `file-${Date.now()}-${idx}`,
                    name: file.name,
                    size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                  }));
                  setAttachedFiles((prev) => [...prev, ...newFiles]);
                }
              }}
              className="relative border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50/20 rounded-2xl p-6 text-center flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-50/40"
            >
              <input
                type="file"
                multiple
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    const newFiles = Array.from(e.target.files).map((file, idx) => ({
                      id: `file-${Date.now()}-${idx}`,
                      name: file.name,
                      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                    }));
                    setAttachedFiles((prev) => [...prev, ...newFiles]);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="w-7 h-7 text-blue-600 mb-2" />
              <p className="text-xs font-bold text-slate-800">Click to upload or drag & drop</p>
              <p className="text-[11px] font-semibold text-slate-400 mt-0.5">Medical Reports, Prescriptions, or ID Proof</p>
            </div>

            {attachedFiles.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Attached Documents ({attachedFiles.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {attachedFiles.map((f) => (
                    <div key={f.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold">
                      <div className="flex items-center space-x-2 truncate">
                        <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="truncate text-slate-800 font-bold">{f.name}</span>
                        <span className="text-slate-400">({f.size})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAttachedFiles((prev) => prev.filter((file) => file.id !== f.id))}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-200/50 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

      {currentStep === 5 && (
        /* STEP 5: REVIEW APPOINTMENT - EXACT FIGMA DESIGN NODE 36-6208 */
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
          {/* Main Review Section Header */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Review Appointment
            </h2>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
              Please double-check all clinical and financial details before finalizing the booking.
            </p>
          </div>

          {/* Success Banner Overlay when confirmed */}
          {isBookedSuccess && (
            <div className="bg-emerald-500 text-white p-6 rounded-3xl shadow-xl space-y-2 text-center animate-in zoom-in-95 duration-300">
              <div className="w-12 h-12 bg-white text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-black">
                ✓
              </div>
              <h3 className="text-xl font-extrabold">Appointment Confirmed Successfully!</h3>
              <p className="text-sm opacity-90">
                Booking confirmed for {selectedPatient.name} with {selectedTherapist?.name || 'Dr. Arjun Mehta'} on {selectedDay.formatted} at {selectedTimeSlot}. Redirecting to schedule...
              </p>
            </div>
          )}

          {/* Main Content Grid: 2 Columns on Large Screens (Left Review Cards ~68% / Right Next Steps ~32%) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* LEFT COLUMN: Clinical & Financial Cards (8 cols on lg) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Row 1: Patient Details & Therapist Cards Side-by-Side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* PATIENT DETAILS Card */}
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
                      {selectedPatient.name}
                    </h3>
                  </div>

                  <div className="space-y-2 pt-1 border-t border-slate-50">
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-slate-400 font-semibold">Patient ID:</span>
                      <span className="font-extrabold text-[#003B95] font-mono tracking-tight bg-blue-50/80 px-2.5 py-0.5 rounded-lg border border-blue-100">
                        {selectedPatient.patientId}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-slate-400 font-semibold">Primary Case:</span>
                      <span className="font-extrabold text-slate-800">
                        {selectedPatient.condition === 'ACL RECOVERY' ? 'ACL Recovery' : selectedPatient.condition}
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
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-slate-400 font-semibold">Rating:</span>
                      <span className="font-extrabold text-amber-500 flex items-center">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                        {selectedTherapist ? selectedTherapist.rating : '4.9'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Schedule & Session Type Cards Side-by-Side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* SCHEDULE Card */}
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
                      <span className="font-extrabold text-slate-800">
                        {sessionDuration === '30m' ? '30 mins' : sessionDuration === '45m' ? '45 mins' : '60 mins'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SESSION TYPE Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
                      <MapPin className="w-5 h-5 stroke-[2.3]" />
                    </div>
                    <span className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase">
                      SESSION TYPE
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                      {visitType}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-500 font-medium leading-relaxed pt-1 border-t border-slate-50">
                    One Medical Hub, Ground Floor, MG Road, Bangalore
                  </p>
                </div>
              </div>

              {/* Row 3: CLINICAL METADATA Card (Full width left side) */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs space-y-4">
                <div className="flex items-center space-x-2">
                  <List className="w-4 h-4 text-blue-600 stroke-[2.5]" />
                  <h3 className="text-xs font-extrabold text-slate-900 tracking-wider uppercase">
                    CLINICAL METADATA
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* Patient Instructions Box */}
                  <div className="space-y-2">
                    <span className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                      PATIENT INSTRUCTIONS
                    </span>
                    <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-100 text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed min-h-[90px]">
                      {patientInstructions}
                    </div>
                  </div>

                  {/* Staff Notes Summary Box */}
                  <div className="space-y-2">
                    <span className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                      STAFF NOTES SUMMARY
                    </span>
                    <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-100 text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed min-h-[90px]">
                      {internalStaffNotes}
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 4: FINANCIAL SUMMARY Card (Full width left side) */}
              <div className="bg-blue-50/30 rounded-3xl p-6 sm:p-7 border border-blue-100/70 shadow-xs space-y-4">
                <div className="flex items-center space-x-2">
                  <Wallet className="w-4 h-4 text-blue-700 stroke-[2.5]" />
                  <h3 className="text-xs font-extrabold text-blue-950 tracking-wider uppercase">
                    FINANCIAL SUMMARY
                  </h3>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="flex justify-between items-center text-xs sm:text-sm font-semibold text-slate-600">
                    <span>Session Fee (Individual Therapy)</span>
                    <span className="text-slate-900 font-extrabold">₹{sessionFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs sm:text-sm font-semibold text-slate-600">
                    <span>Facility Charges & Clinical Supplies</span>
                    <span className="text-slate-900 font-extrabold">₹{facilityCharges.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs sm:text-sm font-semibold">
                    <span className="text-slate-600">Insurance Coverage</span>
                    <span className="text-blue-600 font-extrabold">-₹{insuranceCoverage.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="pt-3 border-t border-blue-100 flex justify-between items-center">
                    <span className="text-sm font-extrabold text-slate-900">Total Amount Payable</span>
                    <span className="text-lg sm:text-xl font-black text-blue-900 tracking-tight">
                      ₹{totalPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
                  className="px-7 py-3 rounded-full bg-[#003B95] hover:bg-blue-900 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-950/20 transition-all cursor-pointer flex items-center space-x-2"
                >
                  <span>Confirm & Book Appointment</span>
                  <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center ml-1">
                    <Check className="w-3 h-3 text-white stroke-[3]" />
                  </div>
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: NEXT STEPS, BOOKING POLICY, & LOCATION MAP (4 cols on lg) */}
            <div className="lg:col-span-4 space-y-6">
              {/* NEXT STEPS Card */}
              <div className="bg-blue-50/40 rounded-3xl p-6 border border-blue-100/70 shadow-xs space-y-5">
                <h3 className="text-xs font-black text-blue-800 tracking-widest uppercase">
                  NEXT STEPS
                </h3>

                <div className="space-y-4">
                  {/* Step 1 */}
                  <div className="flex items-start space-x-3.5">
                    <div className="w-8 h-8 rounded-full bg-[#003B95] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                      <Send className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                        Instant Confirmation
                      </h4>
                      <p className="text-xs font-medium text-slate-500 mt-0.5 leading-relaxed">
                        Patient notification will be sent via SMS/Email immediately after booking.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start space-x-3.5">
                    <div className="w-8 h-8 rounded-full bg-[#003B95] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                      <RefreshCw className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                        Sync to Calendar
                      </h4>
                      <p className="text-xs font-medium text-slate-500 mt-0.5 leading-relaxed">
                        The appointment will be automatically synced with Dr. Arjun Mehta's clinical calendar.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start space-x-3.5">
                    <div className="w-8 h-8 rounded-full bg-[#003B95] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                        Invoice Generation
                      </h4>
                      <p className="text-xs font-medium text-slate-500 mt-0.5 leading-relaxed">
                        A digital invoice will be generated and available in the patient portal.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOOKING POLICY Card */}
              <div className="bg-indigo-50/30 rounded-3xl p-5 border border-indigo-100/60 shadow-xs space-y-2">
                <div className="flex items-center space-x-1.5 text-xs font-extrabold text-indigo-900 tracking-wider uppercase">
                  <Info className="w-4 h-4 text-indigo-600" />
                  <span>BOOKING POLICY</span>
                </div>
                <p className="text-xs font-medium text-slate-600 leading-relaxed">
                  Cancellations made less than 24 hours before the appointment may be subject to a ₹500 cancellation fee. By confirming, you acknowledge that the therapist has been verified for this specific clinical case.
                </p>
              </div>

              {/* LOCATION MAP CARD */}
              <div className="bg-white rounded-3xl border border-slate-100 p-1.5 shadow-xs overflow-hidden group">
                <div className="relative h-48 sm:h-52 w-full rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center">
                  {/* Stylized vector map background SVG */}
                  <svg className="absolute inset-0 w-full h-full object-cover opacity-80" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Water Body */}
                    <path d="M0 160C100 150 200 180 400 140V200H0V160Z" fill="#E0F2FE" />
                    {/* Park Area */}
                    <rect x="260" y="20" width="120" height="80" rx="16" fill="#DCFCE7" />
                    {/* Main Roads */}
                    <path d="M-20 80H420" stroke="#FFFFFF" strokeWidth="16" />
                    <path d="M-20 80H420" stroke="#E2E8F0" strokeWidth="8" />
                    <path d="M140 -20V220" stroke="#FFFFFF" strokeWidth="18" />
                    <path d="M140 -20V220" stroke="#E2E8F0" strokeWidth="10" />
                    {/* Secondary streets */}
                    <path d="M50 0V200" stroke="#F1F5F9" strokeWidth="5" />
                    <path d="M280 0V200" stroke="#F1F5F9" strokeWidth="5" />
                    <path d="M0 130H400" stroke="#F1F5F9" strokeWidth="5" />
                    {/* Buildings blocks */}
                    <rect x="20" y="20" width="80" height="40" rx="4" fill="#F8FAFC" stroke="#E2E8F0" />
                    <rect x="170" y="20" width="70" height="45" rx="4" fill="#F8FAFC" stroke="#E2E8F0" />
                    <rect x="20" y="105" width="90" height="45" rx="4" fill="#F8FAFC" stroke="#E2E8F0" />
                    <rect x="170" y="115" width="75" height="35" rx="4" fill="#F8FAFC" stroke="#E2E8F0" />
                  </svg>

                  {/* Pulsing Map Marker */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="relative flex items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-10 w-10 rounded-full bg-cyan-400 opacity-75" />
                      <div className="w-10 h-10 rounded-full bg-[#003B95] text-white flex items-center justify-center shadow-lg border-2 border-white">
                        <Compass className="w-5 h-5 stroke-[2.5]" />
                      </div>
                    </div>
                  </div>

                  {/* Floating Pill Tag at Bottom */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20">
                    <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] font-extrabold text-slate-800 shadow-md border border-slate-200/80 flex items-center space-x-1.5 whitespace-nowrap">
                      <span className="text-[#003B95] text-xs">▲</span>
                      <span>ONE MEDICAL HUB • MG ROAD</span>
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
