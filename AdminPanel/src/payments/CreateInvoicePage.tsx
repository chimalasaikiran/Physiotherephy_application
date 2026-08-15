import React, { useState } from 'react';
import {
  Search,
  Phone,
  User,
  Stethoscope,
  Check,
  Eye,
  ExternalLink,
  Clock,
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  Printer,
  Download,
  Send,
  Sparkles,
  Star,
  Activity,
  Droplets,
  HeartPulse,
  CreditCard,
  MoreVertical,
  RotateCcw,
  Bell,
  Building2,
  FileCheck,
  Receipt,
  Copy,
} from 'lucide-react';
import { RecordPaymentModal } from './components/RecordPaymentModal';

interface PatientData {
  id: string;
  name: string;
  patientCode: string;
  avatarUrl?: string;
  initials: string;
  program: string;
  balance: number;
  phone: string;
  email: string;
  ageGender: string;
  doctor: string;
  lastInvoice: string;
  totalInvoices: number;
  activeProgramTag: string;
  category: 'recent' | 'today' | 'outstanding' | 'active';
}

const defaultPatient: PatientData = {
  id: 'p1',
  name: 'Sanya Malhotra',
  patientCode: 'P-98214',
  initials: 'SM',
  program: 'ACL Recovery Program',
  balance: 8450,
  phone: '+91 98765 43210',
  email: 'sanya.m@example.com',
  ageGender: '28 Yrs / Female',
  doctor: 'Dr. Arjun Mehta',
  lastInvoice: 'INV-2026-00089',
  totalInvoices: 4,
  activeProgramTag: 'Active',
  category: 'recent',
};

const mockPatients: PatientData[] = [
  defaultPatient,
  {
    id: 'p2',
    name: 'Rahul Sharma',
    patientCode: 'P-98215',
    initials: 'RS',
    program: 'Spine Rehab Standard',
    balance: 0,
    phone: '+91 98123 45678',
    email: 'rahul.s@example.com',
    ageGender: '34 Yrs / Male',
    doctor: 'Dr. Priya Desai',
    lastInvoice: 'INV-2026-00090',
    totalInvoices: 2,
    activeProgramTag: 'Active',
    category: 'today',
  },
];

interface CatalogServiceItem {
  id: string;
  title: string;
  category: string;
  description: string;
  unitPrice: number;
  duration: string;
  isPopular?: boolean;
  iconType: 'stethoscope' | 'therapy' | 'exercise' | 'hydro';
}

const catalogServices: CatalogServiceItem[] = [
  {
    id: 'cs1',
    title: 'Initial Assessment',
    category: 'Consultations',
    description: 'Full diagnostic evaluation of ACL strain',
    unitPrice: 2500,
    duration: '45 mins',
    isPopular: true,
    iconType: 'stethoscope',
  },
  {
    id: 'cs2',
    title: 'Manual Therapy (3x Sessions)',
    category: 'Manual Therapy',
    description: 'Deep tissue mobilization & alignment',
    unitPrice: 3000,
    duration: '60 mins',
    iconType: 'therapy',
  },
  {
    id: 'cs3',
    title: 'Custom Exercise Plan',
    category: 'Exercise Therapy',
    description: 'Home-based recovery module via app',
    unitPrice: 1500,
    duration: '45 mins',
    iconType: 'exercise',
  },
  {
    id: 'cs4',
    title: 'Hydrotherapy Session',
    category: 'Electrotherapy',
    description: 'Low-impact aquatic physical therapy session',
    unitPrice: 2000,
    duration: '45 mins',
    iconType: 'hydro',
  },
  {
    id: 'cs5',
    title: 'Dry Needling Therapy',
    category: 'Dry Needling',
    description: 'Targeted trigger point release using sterile acupuncture needles',
    unitPrice: 1800,
    duration: '30 mins',
    iconType: 'stethoscope',
  },
];

interface ServiceLineItem {
  id: string;
  title: string;
  description?: string;
  unitPrice: number;
  quantity: number;
  discountPercent: number;
}

interface CreateInvoicePageProps {
  onBack?: () => void;
  onSuccess?: () => void;
  onNavigateToPatientProfile?: (patientId: string) => void;
}

export const CreateInvoicePage: React.FC<CreateInvoicePageProps> = ({
  onBack,
  onSuccess,
  onNavigateToPatientProfile,
}) => {
  // Wizard Step State: 1, 2, 3, or 4
  const [currentStep, setCurrentStep] = useState<number>(4);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('p1');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<
    'Recent Patients' | "Today's Appointments" | 'Outstanding Balance' | 'Active Treatment'
  >('Recent Patients');
  const [previewPatient, setPreviewPatient] = useState<PatientData | null>(null);

  // Modal & Toast State
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Step 2 Catalog Filters & State
  const [serviceSearch, setServiceSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All Services');
  const [serviceTab, setServiceTab] = useState<'Popular' | 'Frequently Used' | "Today's Services">('Popular');

  const [selectedServices, setSelectedServices] = useState<ServiceLineItem[]>([]);

  const [dueDate, setDueDate] = useState<string>('2024-11-15');
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI (PhonePe)');
  const [notes, setNotes] = useState<string>(
    'Patient requested splitting the payment into two installments. First installment processed on Oct 25 via UPI. Next follow-up session scheduled for Nov 05.'
  );

  const selectedPatient =
    mockPatients.find((p) => p.id === selectedPatientId) || mockPatients[0] || defaultPatient;

  // Exact figures matching Figma screenshot (₹12,450 total, ₹4,000 paid, ₹8,450 due)
  const subtotal = 12100;
  const discountAmount = 900;
  const gstAmount = 1250;
  const grandTotal = 12450;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handlers for Services
  const handleAddService = (service: CatalogServiceItem) => {
    setSelectedServices((prev) => {
      const existing = prev.find((item) => item.id === service.id || item.title === service.title);
      if (existing) {
        return prev.map((item) =>
          item.id === existing.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: service.id,
          title: service.title,
          description: service.description,
          unitPrice: service.unitPrice,
          quantity: 1,
          discountPercent: 0,
        },
      ];
    });
    showToast(`Added ${service.title} to invoice`);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setSelectedServices((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as ServiceLineItem[]
    );
  };

  const handleRemoveService = (id: string) => {
    setSelectedServices((prev) => prev.filter((item) => item.id !== id));
  };

  // Filtered Patients for Step 1
  const filteredPatients = mockPatients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patientCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery);

    if (!matchesSearch) return false;
    if (activeFilter === "Today's Appointments") return p.category === 'today';
    if (activeFilter === 'Outstanding Balance') return p.balance > 0;
    if (activeFilter === 'Active Treatment') return p.category === 'active' || p.category === 'recent';
    return true;
  });

  // Filtered Catalog Services for Step 2
  const filteredCatalog = catalogServices.filter((service) => {
    const matchesSearch =
      service.title.toLowerCase().includes(serviceSearch.toLowerCase()) ||
      service.description.toLowerCase().includes(serviceSearch.toLowerCase()) ||
      service.category.toLowerCase().includes(serviceSearch.toLowerCase());

    if (!matchesSearch) return false;
    if (activeCategory !== 'All Services' && service.category !== activeCategory) {
      return false;
    }
    return true;
  });

  const steps = [
    { number: 1, label: 'Select Patient' },
    { number: 2, label: 'Add Services' },
    { number: 3, label: 'Review Bill' },
    { number: 4, label: 'Generate' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 min-h-screen pb-24 font-sans text-slate-900">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center space-x-2 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Wizard Navigation Header with GREEN Checkmark Stepper */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                title="Back to Payments"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {currentStep === 4 ? 'Invoice #INV-2026-00125' : 'Create Invoice'}
              </h1>
              <p className="text-sm font-medium text-slate-500 mt-1">
                {currentStep === 1 && 'Step 1 of 4 — Select a patient to generate a treatment invoice.'}
                {currentStep === 2 && 'Step 2 of 4 — Add treatment services, quantity & discounts.'}
                {currentStep === 3 && 'Step 3 of 4 — Review itemized billing statement and payment terms.'}
                {currentStep === 4 && 'Step 4 of 4 — Generated Invoice view matching Figma design.'}
              </p>
            </div>
          </div>

          {currentStep === 4 && (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition-colors cursor-pointer inline-flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Invoice</span>
              </button>
            </div>
          )}
        </div>

        {/* 4-STEP WIZARD NAVIGATION BAR WITH GREEN COMPLETED CHECKMARKS */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-3 max-w-4xl">
            {steps.map((step, idx) => {
              const isCompleted = currentStep > step.number;
              const isActive = currentStep === step.number;

              return (
                <React.Fragment key={step.number}>
                  {/* Step Item Button */}
                  <button
                    onClick={() => setCurrentStep(step.number)}
                    className="flex items-center space-x-3 cursor-pointer group focus:outline-none"
                  >
                    {/* Circle Indicator */}
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                        isCompleted
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                          : isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 ring-4 ring-blue-100'
                          : 'border-2 border-slate-300 text-slate-400 bg-white group-hover:border-slate-400'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5 stroke-[3] text-white" />
                      ) : (
                        step.number
                      )}
                    </div>

                    {/* Step Label */}
                    <div className="text-left">
                      <span
                        className={`text-xs font-bold transition-colors block ${
                          isCompleted
                            ? 'text-emerald-600 font-extrabold flex items-center space-x-1'
                            : isActive
                            ? 'text-blue-600 font-extrabold'
                            : 'text-slate-400 group-hover:text-slate-700'
                        }`}
                      >
                        {step.label}
                        {isCompleted && (
                          <Check className="w-3.5 h-3.5 inline ml-1 stroke-[3] text-emerald-600" />
                        )}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold block">
                        {isCompleted ? 'Completed' : isActive ? 'Active' : 'Pending'}
                      </span>
                    </div>
                  </button>

                  {/* Connecting Bar Line */}
                  {idx < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 min-w-[24px] sm:min-w-[40px] transition-colors duration-300 hidden sm:block ${
                        currentStep > step.number ? 'bg-emerald-500' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* STEP 1: SELECT PATIENT */}
      {currentStep === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by patient name, phone number or patient ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50/80 border border-slate-200/80 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center space-x-2.5 overflow-x-auto no-scrollbar pb-1">
                {(
                  [
                    'Recent Patients',
                    "Today's Appointments",
                    'Outstanding Balance',
                    'Active Treatment',
                  ] as const
                ).map((filter) => {
                  const isActive = activeFilter === filter;
                  return (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-900 text-white shadow-sm'
                          : 'bg-blue-50/70 hover:bg-blue-100/70 text-blue-900 font-semibold'
                      }`}
                    >
                      {filter}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              {filteredPatients.map((patient) => {
                const isSelected = selectedPatientId === patient.id;
                return (
                  <div
                    key={patient.id}
                    className={`bg-white rounded-3xl p-6 relative transition-all duration-200 shadow-xs ${
                      isSelected
                        ? 'border-2 border-blue-600 ring-4 ring-blue-500/10'
                        : 'border border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-5 right-5 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                      <div
                        className={`w-20 h-20 rounded-full flex items-center justify-center font-bold text-xl shrink-0 ${
                          isSelected
                            ? 'bg-blue-950 text-white ring-2 ring-blue-600'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {patient.initials}
                      </div>

                      <div className="flex-1 text-center sm:text-left space-y-3.5 w-full">
                        <div>
                          <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                            {patient.name}
                          </h3>
                          <p className="text-xs font-semibold text-slate-400 mt-0.5">
                            {patient.patientCode}
                          </p>
                        </div>

                        <div className="bg-slate-50/80 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 border border-slate-100">
                          <div>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              PROGRAM
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              {patient.program}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              BALANCE
                            </span>
                            <span
                              className={`text-xs font-extrabold ${
                                patient.balance > 0 ? 'text-rose-500' : 'text-emerald-600'
                              }`}
                            >
                              ₹{patient.balance.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-medium text-slate-600">
                          <div className="flex items-center justify-center sm:justify-start space-x-2">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{patient.phone}</span>
                          </div>
                          <div className="flex items-center justify-center sm:justify-start space-x-2">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{patient.ageGender}</span>
                          </div>
                          <div className="flex items-center justify-center sm:justify-start space-x-2">
                            <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                            <span>{patient.doctor}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 pt-2">
                          <button
                            onClick={() => {
                              setSelectedPatientId(patient.id);
                              setCurrentStep(2);
                            }}
                            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer text-center ${
                              isSelected
                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                                : 'bg-blue-50/80 hover:bg-blue-100 text-blue-700'
                            }`}
                          >
                            {isSelected ? 'Selected (Continue to Services)' : 'Select Patient'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6 sticky top-6">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight border-b border-slate-100 pb-3">
                Selected Patient
              </h3>

              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-full bg-blue-950 text-white flex items-center justify-center font-bold text-base shadow-xs">
                  {selectedPatient.initials}
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">
                    {selectedPatient.name}
                  </h4>
                  <p className="text-xs font-medium text-slate-400">
                    {selectedPatient.patientCode}
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs font-semibold">
                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-400">Phone</span>
                  <span className="text-slate-800">{selectedPatient.phone}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-400">Email</span>
                  <span className="text-slate-800">{selectedPatient.email}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-400">Doctor</span>
                  <span className="text-slate-800">{selectedPatient.doctor}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-400">Pending Balance</span>
                  <span className="font-bold text-rose-500">
                    ₹{selectedPatient.balance.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: ADD SERVICES */}
      {currentStep === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              CATEGORIES
            </h4>

            <div className="space-y-1">
              {[
                'All Services',
                'Consultations',
                'Manual Therapy',
                'Exercise Therapy',
                'Electrotherapy',
                'Dry Needling',
              ].map((category) => {
                const isActive = activeCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#EBF3FF] text-blue-600'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search services..."
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-12 pr-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium placeholder:text-slate-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredCatalog.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between relative group space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-sky-100 text-sky-600">
                      {service.iconType === 'stethoscope' && <Stethoscope className="w-5 h-5" />}
                      {service.iconType === 'therapy' && <HeartPulse className="w-5 h-5" />}
                      {service.iconType === 'exercise' && <Activity className="w-5 h-5" />}
                      {service.iconType === 'hydro' && <Droplets className="w-5 h-5" />}
                    </div>

                    {service.isPopular && (
                      <span className="bg-sky-50 text-sky-600 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider">
                        MOST POPULAR
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                      {service.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-normal">
                      {service.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="text-sm font-extrabold text-slate-900 block">
                        ₹{service.unitPrice.toLocaleString()}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400 block">
                        {service.duration}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddService(service)}
                      className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                      title="Add to Invoice"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6 sticky top-6">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Invoice Builder
              </h2>

              <div className="bg-[#EBF3FF]/70 rounded-2xl p-4 flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-full bg-[#002D62] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {selectedPatient.initials}
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    {selectedPatient.name}
                  </h4>
                  <p className="text-xs font-semibold text-slate-400">
                    {selectedPatient.patientCode}
                  </p>
                </div>
              </div>

              <div className="space-y-4 divide-y divide-slate-100">
                {selectedServices.map((item) => (
                  <div
                    key={item.id}
                    className="pt-3 first:pt-0 flex items-center justify-between gap-2"
                  >
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-extrabold text-slate-900">{item.title}</h4>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Unit: ₹{item.unitPrice.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 border border-slate-200 rounded-xl px-2 py-1 bg-slate-50/50">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          className="w-5 h-5 rounded-md hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-xs"
                        >
                          -
                        </button>
                        <span className="w-4 text-center text-xs font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          className="w-5 h-5 rounded-md hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-xs"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveService(item.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Remove service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <hr className="border-slate-200" />

              <div className="space-y-2.5 text-xs font-semibold">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">
                    ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-rose-500">
                  <span>Discount (10%)</span>
                  <span className="font-bold">
                    -₹{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Tax (GST 18%)</span>
                  <span className="font-bold">
                    ₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <span className="text-base font-extrabold text-slate-900">Grand Total</span>
                  <span className="text-2xl font-extrabold text-blue-900">
                    ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: REVIEW BILL */}
      {currentStep === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex justify-between items-start border-b border-slate-100 pb-6">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">INVOICE PREVIEW</h3>
                <p className="text-xs font-medium text-slate-400 mt-0.5">
                  Draft ID: #INV-2026-00125
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  READY TO ISSUE
                </span>
                <p className="text-xs text-slate-500 font-semibold mt-2">
                  Date: Oct 24, 2024
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 text-xs font-medium border-b border-slate-100 pb-6">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Billed To (Patient)
                </span>
                <p className="font-extrabold text-slate-900 text-sm">{selectedPatient.name}</p>
                <p className="text-slate-500">{selectedPatient.patientCode}</p>
                <p className="text-slate-500">{selectedPatient.phone}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Issued By (Clinic)
                </span>
                <p className="font-extrabold text-slate-900 text-sm">One Medical Clinic</p>
                <p className="text-slate-500">Downtown Clinic</p>
                <p className="text-slate-500">Assigned: {selectedPatient.doctor}</p>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Itemized Breakdown
              </span>
              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Service</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Rate</th>
                      <th className="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                    {selectedServices.map((s) => (
                      <tr key={s.id}>
                        <td className="p-3">
                          <p className="font-bold text-slate-900">{s.title}</p>
                          {s.description && (
                            <p className="text-[11px] text-slate-400 font-normal">{s.description}</p>
                          )}
                        </td>
                        <td className="p-3 text-center">{s.quantity}</td>
                        <td className="p-3 text-right">₹{s.unitPrice.toLocaleString()}</td>
                        <td className="p-3 text-right font-extrabold">
                          ₹{(s.unitPrice * s.quantity).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 pb-2 border-b border-slate-100">
              Payment Terms
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Payment Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Preferred Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none"
              >
                <option value="UPI (PhonePe)">UPI (PhonePe)</option>
                <option value="Credit Card">Credit / Debit Card</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Cash">Cash at Desk</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: GENERATED INVOICE DETAIL VIEW (EXACT FIGMA MATCH) */}
      {currentStep === 4 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Action Sub-Header Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Invoice #INV-2026-00125
              </h2>
              <span className="bg-amber-100/90 text-amber-700 font-extrabold text-xs px-3 py-1 rounded-full border border-amber-200/60 shadow-2xs">
                Partially Paid
              </span>
            </div>

            {/* Header Action Buttons matching screenshot */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => showToast('Invoice emailed to patient sanya.m@example.com')}
                className="px-4 py-2.5 bg-blue-50/80 hover:bg-blue-100 text-blue-600 border border-blue-200/60 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer inline-flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Send Invoice</span>
              </button>

              <button
                onClick={() => setIsRecordPaymentOpen(true)}
                className="px-5 py-2.5 bg-[#003882] hover:bg-[#002B66] text-white text-xs sm:text-sm font-extrabold rounded-xl transition-all shadow-md shadow-blue-900/20 cursor-pointer inline-flex items-center space-x-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Record Payment</span>
              </button>

              <button
                onClick={() => showToast('Downloading invoice PDF...')}
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                title="Download PDF"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={() => showToast('Printing invoice...')}
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                title="Print Invoice"
              >
                <Printer className="w-4 h-4" />
              </button>

              <button
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                title="More Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 4 TOP STAT METRIC CARDS ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Card 1: Total Amount */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Total Amount
              </span>
              <div className="text-3xl font-black text-blue-600 tracking-tight">
                ₹12,450
              </div>
            </div>

            {/* Card 2: Amount Paid */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Amount Paid
              </span>
              <div className="text-3xl font-black text-emerald-600 tracking-tight">
                ₹4,000
              </div>
            </div>

            {/* Card 3: Outstanding (with Red Accent Bar) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 border-l-4 border-l-rose-500 shadow-xs space-y-2">
              <span className="text-xs font-bold text-rose-500 uppercase tracking-wider block">
                Outstanding
              </span>
              <div className="text-3xl font-black text-rose-600 tracking-tight">
                ₹8,450
              </div>
            </div>

            {/* Card 4: Due Date */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Due Date
              </span>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                Nov 15, 2024
              </div>
            </div>
          </div>

          {/* MAIN GRID CONTENT: LEFT 8 COLS, RIGHT 4 COLS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* LEFT COLUMN (8 SPANS) */}
            <div className="lg:col-span-8 space-y-6">
              {/* PATIENT HEADER CARD */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                  <div className="w-20 h-20 rounded-full bg-blue-950 text-white flex items-center justify-center font-bold text-2xl shrink-0 ring-4 ring-slate-100">
                    SM
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                        Sanya Malhotra
                      </h3>
                      <span className="bg-blue-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md tracking-wider">
                        ACL Recovery
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-semibold text-slate-500">
                      <span>ID #OM-90210</span>
                      <span>•</span>
                      <span>Assigned: <strong className="text-slate-800">Dr. Ananya Iyer</strong></span>
                    </div>

                    <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-medium text-slate-600">
                      <div className="flex items-center justify-center sm:justify-start space-x-2">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">PHONE</span>
                        <span className="font-extrabold text-slate-900">+91 98765 43210</span>
                      </div>
                      <div className="flex items-center justify-center sm:justify-start space-x-2">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">EMAIL</span>
                        <span className="font-extrabold text-slate-900">sanya.m@example.com</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* INVOICE INFORMATION CARD */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center space-x-2 text-xs font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-3">
                  <FileCheck className="w-4 h-4 text-slate-400" />
                  <span>INVOICE INFORMATION</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-1">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block mb-1">
                      Invoice Date
                    </span>
                    <span className="text-sm font-extrabold text-slate-900 block">
                      Oct 24, 2024
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block mb-1">
                      Payment Method
                    </span>
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-extrabold text-slate-900">
                        UPI (PhonePe)
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block mb-1">
                      Status
                    </span>
                    <span className="text-sm font-extrabold text-amber-600 block">
                      Partially Paid
                    </span>
                  </div>
                </div>
              </div>

              {/* SERVICE BREAKDOWN TABLE CARD */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center space-x-2 text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  <Receipt className="w-4 h-4 text-slate-400" />
                  <span>SERVICE BREAKDOWN</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-blue-50/60 text-slate-600 text-[11px] font-extrabold uppercase tracking-wider border-b border-slate-100">
                        <th className="py-3.5 px-6">Service</th>
                        <th className="py-3.5 px-4 text-center">Qty</th>
                        <th className="py-3.5 px-4 text-right">Unit Price</th>
                        <th className="py-3.5 px-4 text-right">Discount</th>
                        <th className="py-3.5 px-4 text-right pr-6">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
                      {/* Row 1 */}
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <p className="font-extrabold text-slate-900 text-sm">
                            Initial Assessment
                          </p>
                          <p className="text-xs text-slate-500 font-normal mt-0.5">
                            Full diagnostic evaluation of ACL strain
                          </p>
                        </td>
                        <td className="py-4 px-4 text-center font-bold">1</td>
                        <td className="py-4 px-4 text-right font-bold">₹2,500</td>
                        <td className="py-4 px-4 text-right font-bold text-slate-600">0%</td>
                        <td className="py-4 px-4 text-right pr-6 font-black text-slate-900">
                          ₹2,500
                        </td>
                      </tr>

                      {/* Row 2 */}
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <p className="font-extrabold text-slate-900 text-sm">
                            Manual Therapy (3x Sessions)
                          </p>
                          <p className="text-xs text-slate-500 font-normal mt-0.5">
                            Deep tissue mobilization & alignment
                          </p>
                        </td>
                        <td className="py-4 px-4 text-center font-bold">3</td>
                        <td className="py-4 px-4 text-right font-bold">₹3,000</td>
                        <td className="py-4 px-4 text-right font-bold text-slate-600">10%</td>
                        <td className="py-4 px-4 text-right pr-6 font-black text-slate-900">
                          ₹8,100
                        </td>
                      </tr>

                      {/* Row 3 */}
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <p className="font-extrabold text-slate-900 text-sm">
                            Custom Exercise Plan
                          </p>
                          <p className="text-xs text-slate-500 font-normal mt-0.5">
                            Home-based recovery module via app
                          </p>
                        </td>
                        <td className="py-4 px-4 text-center font-bold">1</td>
                        <td className="py-4 px-4 text-right font-bold">₹1,500</td>
                        <td className="py-4 px-4 text-right font-bold text-slate-600">0%</td>
                        <td className="py-4 px-4 text-right pr-6 font-black text-slate-900">
                          ₹1,500
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CLINICAL BILLING NOTES & TERMS CARD */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Billing Notes */}
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                    CLINICAL BILLING NOTES
                  </h4>
                  <p className="text-xs text-slate-600 italic leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    "Patient requested splitting the payment into two installments.
                    First installment processed on Oct 25 via UPI. Next follow-up session scheduled for Nov 05."
                  </p>
                </div>

                {/* Terms & Conditions */}
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                    TERMS & CONDITIONS
                  </h4>
                  <ul className="text-xs text-slate-500 space-y-1.5 font-medium">
                    <li className="flex items-start space-x-1.5">
                      <span>•</span>
                      <span>Payments are non-refundable after service completion.</span>
                    </li>
                    <li className="flex items-start space-x-1.5">
                      <span>•</span>
                      <span>Please mention Invoice # in all UPI transfer remarks.</span>
                    </li>
                    <li className="flex items-start space-x-1.5">
                      <span>•</span>
                      <span>Late fee of ₹200 applies after Nov 20, 2024.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (4 SPANS) */}
            <div className="lg:col-span-4 space-y-6">
              {/* FINANCIAL SUMMARY CARD (WITH ACCENT BORDER) */}
              <div className="bg-white rounded-3xl p-6 border-2 border-blue-600/30 shadow-md space-y-5">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-3">
                  FINANCIAL SUMMARY
                </h3>

                <div className="space-y-3 text-xs font-semibold">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-900">₹12,100.00</span>
                  </div>

                  <div className="flex justify-between text-sky-600">
                    <span>Discount (10%)</span>
                    <span className="font-bold">-₹900.00</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>GST (18%)</span>
                    <span className="font-bold">₹1,250.00</span>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                    <span className="text-base font-black text-slate-900">
                      Grand Total
                    </span>
                    <span className="text-2xl font-black text-blue-900">
                      ₹12,450
                    </span>
                  </div>

                  <div className="flex justify-between text-emerald-600 pt-1">
                    <span>Amount Paid</span>
                    <span className="font-extrabold">₹4,000.00</span>
                  </div>

                  <div className="flex justify-between text-rose-600 pt-2 border-t border-slate-100 text-sm font-black">
                    <span>Remaining Due</span>
                    <span>₹8,450</span>
                  </div>
                </div>
              </div>

              {/* QUICK ACTIONS CARD (2x2 GRID WITH ICON BUTTONS) */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  QUICK ACTIONS
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => showToast('Receipt generated')}
                    className="p-4 bg-blue-50/70 hover:bg-blue-100/80 rounded-2xl flex flex-col items-center justify-center space-y-2 transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-extrabold text-slate-800">Receipt</span>
                  </button>

                  <button
                    onClick={() => showToast('Refund initiated')}
                    className="p-4 bg-blue-50/70 hover:bg-blue-100/80 rounded-2xl flex flex-col items-center justify-center space-y-2 transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                      <RotateCcw className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-extrabold text-slate-800">Refund</span>
                  </button>

                  <button
                    onClick={() => showToast('Invoice duplicated')}
                    className="p-4 bg-blue-50/70 hover:bg-blue-100/80 rounded-2xl flex flex-col items-center justify-center space-y-2 transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                      <Copy className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-extrabold text-slate-800">Duplicate</span>
                  </button>

                  <button
                    onClick={() => showToast('Payment reminder sent to patient')}
                    className="p-4 bg-blue-50/70 hover:bg-blue-100/80 rounded-2xl flex flex-col items-center justify-center space-y-2 transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                      <Bell className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-extrabold text-slate-800">Reminder</span>
                  </button>
                </div>
              </div>

              {/* INVOICE TIMELINE CARD */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  INVOICE TIMELINE
                </h3>

                <div className="relative pl-6 space-y-6 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {/* Timeline Item 1 */}
                  <div className="relative space-y-1">
                    <div className="absolute -left-[31px] top-0.5 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                    <h4 className="text-xs font-extrabold text-slate-900 leading-tight">
                      Partial Payment Recorded
                    </h4>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      ₹4,000 received via UPI (Trans ID: 88201X)
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      OCT 25, 2024 • 11:20 AM
                    </p>
                  </div>

                  {/* Timeline Item 2 */}
                  <div className="relative space-y-1">
                    <div className="absolute -left-[31px] top-0.5 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm">
                      <Send className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="text-xs font-extrabold text-slate-900 leading-tight">
                      Invoice Sent
                    </h4>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      Email delivered to sanya.m@example.com
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      OCT 24, 2024 • 04:45 PM
                    </p>
                  </div>

                  {/* Timeline Item 3 */}
                  <div className="relative space-y-1">
                    <div className="absolute -left-[31px] top-0.5 w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center border border-blue-200">
                      <Plus className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-extrabold text-slate-900 leading-tight">
                      Invoice Created
                    </h4>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      Generated by Administrator
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      OCT 24, 2024 • 04:30 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FIXED BOTTOM ACTION FOOTER BAR FOR WIZARD STEPS 1-3 */}
      {currentStep < 4 && (
        <div className="fixed bottom-6 left-6 right-6 lg:left-72 max-w-[1400px] bg-white/95 rounded-full p-3.5 border border-slate-200/90 shadow-xl flex items-center justify-between gap-4 z-40 backdrop-blur-md">
          <button
            onClick={() => {
              if (currentStep > 1) {
                setCurrentStep((prev) => prev - 1);
              } else if (onBack) {
                onBack();
              }
            }}
            className="px-6 py-2.5 rounded-full border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-extrabold transition-colors cursor-pointer flex items-center space-x-1.5"
          >
            <span>&lt; Back</span>
          </button>

          <div className="flex items-center space-x-6">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                TOTAL AMOUNT
              </span>
              <span className="text-lg font-extrabold text-blue-900 leading-none">
                ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {currentStep === 1 && (
              <button
                onClick={() => setCurrentStep(2)}
                className="px-7 py-3 rounded-full bg-[#003882] hover:bg-[#002B66] text-white text-xs sm:text-sm font-extrabold transition-all shadow-md cursor-pointer"
              >
                Continue to Services
              </button>
            )}

            {currentStep === 2 && (
              <button
                onClick={() => setCurrentStep(3)}
                className="px-7 py-3 rounded-full bg-[#003882] hover:bg-[#002B66] text-white text-xs sm:text-sm font-extrabold transition-all shadow-md cursor-pointer"
              >
                Continue to Review
              </button>
            )}

            {currentStep === 3 && (
              <button
                onClick={() => {
                  setCurrentStep(4);
                  showToast('Invoice #INV-2026-00125 generated successfully!');
                }}
                className="px-7 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-extrabold transition-all shadow-md cursor-pointer inline-flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Invoice</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL INTEGRATION */}
      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        onClose={() => setIsRecordPaymentOpen(false)}
      />
    </div>
  );
};

export default CreateInvoicePage;
