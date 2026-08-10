import React, { useState } from 'react';
import {
  ArrowLeft,
  Info,
  Layers,
  Clock,
  Sliders,
  CheckCircle2,
  Circle,
  Plus,
  Minus,
  Check,
  Sparkles,
  Calendar,
  Image as ImageIcon,
  ChevronDown,
  Upload,
  AlertCircle,
} from 'lucide-react';

interface CreateTreatmentPackagePageProps {
  onBack: () => void;
  onSuccess?: () => void;
}

interface ServiceOption {
  id: string;
  name: string;
  categoryTag: 'CLINICAL' | 'PHYSICAL' | 'SPECIALIZED';
  defaultSelected?: boolean;
}

const AVAILABLE_SERVICES: ServiceOption[] = [
  { id: 'initial-assessment', name: 'Initial Assessment', categoryTag: 'CLINICAL', defaultSelected: true },
  { id: 'manual-therapy', name: 'Manual Therapy', categoryTag: 'PHYSICAL', defaultSelected: true },
  { id: 'exercise-therapy', name: 'Exercise Therapy', categoryTag: 'PHYSICAL', defaultSelected: false },
  { id: 'dry-needling', name: 'Dry Needling', categoryTag: 'SPECIALIZED', defaultSelected: false },
];

export const CreateTreatmentPackagePage: React.FC<CreateTreatmentPackagePageProps> = ({
  onBack,
  onSuccess,
}) => {
  // Form State
  const [packageName, setPackageName] = useState('12-Session Lumbar Core Program');
  const [description, setDescription] = useState(
    'Describe the therapeutic goals and target patient profile...'
  );
  const [category, setCategory] = useState('Rehab');
  const [statusActive, setStatusActive] = useState(true);

  // Package Type State ('session' | 'time' | 'hybrid')
  const [packageType, setPackageType] = useState<'session' | 'time' | 'hybrid'>('hybrid');

  // Configuration State
  const [numberOfSessions, setNumberOfSessions] = useState<number>(12);
  const [validityValue, setValidityValue] = useState<number>(6);
  const [validityUnit, setValidityUnit] = useState<string>('Months');

  // Included Services State
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([
    'initial-assessment',
    'manual-therapy',
  ]);

  // Pricing State
  const [basePrice, setBasePrice] = useState<number>(15000);
  const [discountPercent, setDiscountPercent] = useState<number>(10);
  const taxRate = 0.18; // 18% GST

  // Dynamic Pricing Calculations
  const discountAmount = Math.round(basePrice * (discountPercent / 100));
  const priceAfterDiscount = basePrice - discountAmount;
  const taxAmount = Math.round(priceAfterDiscount * taxRate);
  const finalPrice = priceAfterDiscount + taxAmount;
  const originalTotalPrice = Math.round(basePrice * (1 + taxRate));
  const estimatedSavings = originalTotalPrice - finalPrice;

  // Cover Image state
  const [coverImageUrl, setCoverImageUrl] = useState(
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80'
  );

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleService = (id: string) => {
    if (selectedServiceIds.includes(id)) {
      setSelectedServiceIds(selectedServiceIds.filter((item) => item !== id));
    } else {
      setSelectedServiceIds([...selectedServiceIds, id]);
    }
  };

  const handleSaveDraft = () => {
    showToast('Package saved as draft successfully!');
  };

  const handlePublish = () => {
    showToast(`Package "${packageName || 'Treatment Package'}" published successfully!`);
    setTimeout(() => {
      if (onSuccess) onSuccess();
      else onBack();
    }, 1200);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 animate-in fade-in duration-300 max-w-[1500px] mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-bold flex items-center space-x-2 animate-in slide-in-from-top duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors shadow-2xs cursor-pointer shrink-0"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Create Treatment Package
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
              Design a comprehensive health journey for your patients.
            </p>
          </div>
        </div>

        {/* Top Header Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSaveDraft}
            className="px-5 py-2.5 bg-white border-2 border-blue-600 hover:bg-blue-50 text-blue-600 text-xs sm:text-sm font-extrabold rounded-xl transition-all duration-200 cursor-pointer shadow-2xs"
          >
            Save as Draft
          </button>
          <button
            onClick={handlePublish}
            className="px-6 py-2.5 bg-blue-900 hover:bg-blue-950 text-white text-xs sm:text-sm font-extrabold rounded-xl transition-all duration-200 cursor-pointer shadow-md shadow-blue-900/15"
          >
            Publish Package
          </button>
        </div>
      </div>

      {/* Main Grid: Left Form Column (7 Spans) & Right Live Preview Column (5 Spans) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column - Form Sections */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Basic Information */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Info className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Basic Information
              </h2>
            </div>

            {/* Package Name */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Package Name
              </label>
              <input
                type="text"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                placeholder="e.g. 12-Session Lumbar Core Program"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the therapeutic goals and target patient profile..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 transition-all placeholder:text-slate-400 resize-none"
              />
            </div>

            {/* Category & Status Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              {/* Category */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 transition-all appearance-none cursor-pointer pr-10"
                  >
                    <option value="Rehab">Rehab</option>
                    <option value="Sports Injury">Sports Injury</option>
                    <option value="Post-Op Recovery">Post-Op Recovery</option>
                    <option value="Geriatric Care">Geriatric Care</option>
                    <option value="Spine & Core">Spine & Core</option>
                    <option value="Preventive Health">Preventive Health</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Status Active Toggle */}
              <div className="space-y-2 pt-2 sm:pt-6">
                <div
                  onClick={() => setStatusActive(!statusActive)}
                  className="flex items-center space-x-3 cursor-pointer group select-none"
                >
                  <div
                    className={`w-12 h-6 rounded-full transition-colors duration-200 relative p-0.5 ${
                      statusActive ? 'bg-slate-400' : 'bg-slate-200'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform duration-200 ${
                        statusActive ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                    Status: {statusActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Package Type */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Package Type
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Option 1: Session-Based */}
              <div
                onClick={() => setPackageType('session')}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  packageType === 'session'
                    ? 'border-blue-600 bg-white shadow-xs'
                    : 'border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="w-7 h-7 rounded-full border border-blue-600 text-blue-600 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    Session-Based
                  </h3>
                  <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                    Fixed number of visits
                  </p>
                </div>
              </div>

              {/* Option 2: Time-Based */}
              <div
                onClick={() => setPackageType('time')}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  packageType === 'time'
                    ? 'border-blue-600 bg-white shadow-xs'
                    : 'border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="w-7 h-7 rounded-full border border-slate-300 text-slate-600 flex items-center justify-center font-bold text-xs">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    Time-Based
                  </h3>
                  <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                    Unlimited for a period
                  </p>
                </div>
              </div>

              {/* Option 3: Hybrid (Selected in Figma) */}
              <div
                onClick={() => setPackageType('hybrid')}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  packageType === 'hybrid'
                    ? 'border-blue-600 bg-white shadow-xs'
                    : 'border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="w-7 h-7 rounded-full border border-blue-600 text-blue-600 flex items-center justify-center font-bold text-xs">
                  <Sliders className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    Hybrid
                  </h3>
                  <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                    Sessions with validity
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Configuration */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Sliders className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Configuration
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              {/* Number of Sessions Stepper */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Number of Sessions
                </label>
                <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-2xl p-2">
                  <button
                    type="button"
                    onClick={() => setNumberOfSessions(Math.max(1, numberOfSessions - 1))}
                    className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-100 font-bold transition-colors cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-lg font-extrabold text-slate-900 px-4">
                    {numberOfSessions}
                  </span>
                  <button
                    type="button"
                    onClick={() => setNumberOfSessions(numberOfSessions + 1)}
                    className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 font-bold transition-colors shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Validity Period */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Validity Period
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min={1}
                    value={validityValue}
                    onChange={(e) => setValidityValue(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 text-center focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 transition-all"
                  />
                  <div className="relative flex-1">
                    <select
                      value={validityUnit}
                      onChange={(e) => setValidityUnit(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 transition-all appearance-none cursor-pointer pr-8"
                    >
                      <option value="Days">Days</option>
                      <option value="Weeks">Weeks</option>
                      <option value="Months">Months</option>
                      <option value="Years">Years</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Included Services */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Included Services
                </h2>
              </div>
              <button
                type="button"
                onClick={() => showToast('Manage Services drawer opened')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
              >
                Manage Services
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {AVAILABLE_SERVICES.map((srv) => {
                const isChecked = selectedServiceIds.includes(srv.id);
                return (
                  <div
                    key={srv.id}
                    onClick={() => toggleService(srv.id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      isChecked
                        ? 'border-blue-600 bg-blue-50/40'
                        : 'border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                        {srv.name}
                      </h4>
                      <span className="inline-block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                        {srv.categoryTag}
                      </span>
                    </div>

                    <div className="shrink-0">
                      {isChecked ? (
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border border-slate-300 bg-white" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 5: Pricing Structure */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Sliders className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Pricing Structure
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-stretch">
              {/* Left Column: Inputs */}
              <div className="sm:col-span-7 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {/* Base Price */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      Base Price (₹)
                    </label>
                    <input
                      type="number"
                      value={basePrice}
                      onChange={(e) => setBasePrice(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 transition-all"
                    />
                  </div>

                  {/* Discount */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={discountPercent}
                      onChange={(e) =>
                        setDiscountPercent(
                          Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                        )
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 transition-all"
                    />
                  </div>
                </div>

                {/* Tax (GST 18%) */}
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs">
                  <span className="font-bold text-slate-700">Tax (GST 18%)</span>
                  <span className="font-extrabold text-slate-900">
                    ₹ {taxAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Right Column: Final Package Price Card */}
              <div className="sm:col-span-5 bg-blue-950 text-white rounded-2xl p-5 flex flex-col justify-center items-center text-center shadow-lg shadow-blue-950/20 min-h-[140px]">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-200">
                  FINAL PACKAGE PRICE
                </span>
                <div className="text-2xl sm:text-3xl font-black text-white my-1 tracking-tight">
                  ₹ {finalPrice.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] font-semibold text-blue-300">
                  Inclusive of all taxes
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Live Preview & Pro Tip */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
          {/* Live Preview Summary Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 space-y-6 relative overflow-hidden">
            {/* Top Preview Summary Tag */}
            <div className="inline-flex items-center px-3 py-1 bg-blue-950 text-white rounded-lg text-[10px] font-extrabold uppercase tracking-widest shadow-xs">
              PREVIEW SUMMARY
            </div>

            {/* Cover Image Container */}
            <div className="relative rounded-2xl overflow-hidden aspect-21/9 bg-slate-100 group border border-slate-100">
              <img
                src={coverImageUrl}
                alt="Package Cover"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
            </div>

            {/* Dynamic Package Title */}
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
                {packageName || '12-Session Lumbar Core'}
              </h3>
            </div>

            {/* Features List */}
            <div className="space-y-3 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-slate-500 font-semibold">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Total Sessions</span>
                </div>
                <span className="font-extrabold text-slate-900">{numberOfSessions} Visits</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-slate-500 font-semibold">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Validity Period</span>
                </div>
                <span className="font-extrabold text-slate-900">
                  {validityValue} {validityUnit}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-slate-500 font-semibold">
                  <Layers className="w-4 h-4 text-slate-400" />
                  <span>Core Services</span>
                </div>
                <span className="font-extrabold text-slate-900">
                  {selectedServiceIds.length} Included
                </span>
              </div>
            </div>

            {/* Package Value Section */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold text-slate-500">Package Value</span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-xs font-bold text-slate-400 line-through">
                    ₹ {originalTotalPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-lg font-black text-blue-600">
                    ₹ {finalPrice.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Estimated Savings Alert */}
              <div className="bg-sky-50 border border-sky-100 rounded-2xl p-3 flex items-center space-x-2.5 text-sky-900">
                <div className="w-6 h-6 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold">
                  Estimated Savings: ₹ {estimatedSavings > 0 ? estimatedSavings.toLocaleString('en-IN') : '2,500'}
                </span>
              </div>
            </div>

            {/* Change Package Cover Button */}
            <button
              type="button"
              onClick={() => {
                const newUrl = prompt(
                  'Enter image URL for package cover:',
                  coverImageUrl
                );
                if (newUrl) setCoverImageUrl(newUrl);
              }}
              className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30 text-xs font-bold text-slate-700 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <ImageIcon className="w-4 h-4 text-slate-500" />
              <span>Change Package Cover</span>
            </button>
          </div>

          {/* Pro Tip Banner */}
          <div className="bg-blue-50/90 border border-blue-100/90 rounded-3xl p-5 flex items-start space-x-3.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold text-blue-950 leading-relaxed">
              <strong className="font-extrabold text-blue-900">Pro Tip:</strong> Packages with
              more than 10 sessions typically have a 25% higher conversion rate when paired
              with a &quot;Free First Assessment&quot;.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTreatmentPackagePage;
