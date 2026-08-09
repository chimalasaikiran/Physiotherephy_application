import React, { useState } from 'react';
import {
  User,
  Check,
  Plus,
  Bold,
  Italic,
  List,
  Link as LinkIcon,
  RotateCcw,
  Sparkles,
  Save,
  FileText,
  Bell,
  CheckCircle2,
  X,
  ArrowLeft,
  ChevronDown,
  Activity,
  ClipboardList,
  LineChart,
  Calendar,
  Clock,
  Send,
  Download
} from 'lucide-react';

interface SessionSummaryPageProps {
  onBack?: () => void;
  onNavigateToPatient?: () => void;
  onNavigateToTherapist?: () => void;
  onNavigateToSchedule?: () => void;
}

export const SessionSummaryPage: React.FC<SessionSummaryPageProps> = ({
  onBack,
  onNavigateToPatient,
  onNavigateToTherapist,
  onNavigateToSchedule,
}) => {
  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Treatment Performed tags state
  const [treatments, setTreatments] = useState<Array<{ id: string; label: string; selected: boolean }>>([
    { id: 'manual', label: 'Manual Therapy', selected: true },
    { id: 'stretching', label: 'Stretching', selected: true },
    { id: 'strength', label: 'Strength Training', selected: false },
    { id: 'mobility', label: 'Mobility Exercises', selected: true },
    { id: 'electro', label: 'Electrotherapy', selected: false },
    { id: 'dry_needling', label: 'Dry Needling', selected: false },
    { id: 'soft_tissue', label: 'Soft Tissue Release', selected: false },
  ]);

  const [showAddTreatmentModal, setShowAddTreatmentModal] = useState(false);
  const [newTreatmentName, setNewTreatmentName] = useState('');

  const toggleTreatment = (id: string) => {
    setTreatments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleAddTreatment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTreatmentName.trim()) return;
    const newId = `custom_${Date.now()}`;
    setTreatments((prev) => [
      ...prev,
      { id: newId, label: newTreatmentName.trim(), selected: true },
    ]);
    setNewTreatmentName('');
    setShowAddTreatmentModal(false);
    triggerToast(`Added treatment: "${newTreatmentName.trim()}"`);
  };

  // Clinical Notes state
  const [clinicalNotes, setClinicalNotes] = useState(
    'Begin typing clinical observations and objective findings here...'
  );
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  // Patient Response state
  const [beforePain, setBeforePain] = useState(7);
  const [afterPain, setAfterPain] = useState(3);
  const [mobilityImprovement, setMobilityImprovement] = useState<'None' | 'Minor' | 'Significant'>('Significant');
  const [strengthResponse, setStrengthResponse] = useState<'Decreased' | 'Stable' | 'Improved'>('Stable');

  // Next Treatment Plan state
  const [exercises, setExercises] = useState([
    { id: '1', name: 'Scapular retractions', desc: '3 sets of 12 reps, focus on slow eccentric phase.' },
  ]);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExDesc, setNewExDesc] = useState('');

  const [homeInstructions, setHomeInstructions] = useState(
    'Apply ice for 15 mins post-workout. Avoid heavy lifting'
  );
  const [programModifications, setProgramModifications] = useState(
    "Adjusting load for next session based on today's feedback..."
  );

  const handleAddExerciseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName.trim()) return;
    setExercises((prev) => [
      ...prev,
      { id: Date.now().toString(), name: newExName.trim(), desc: newExDesc.trim() },
    ]);
    setNewExName('');
    setNewExDesc('');
    setShowAddExerciseModal(false);
    triggerToast('New exercise added to treatment plan.');
  };

  // Follow-up Checklist state
  const [checklist, setChecklist] = useState([
    { id: 'hep', label: 'Assign Home Program (HEP)', checked: true },
    { id: 'upload', label: 'Upload Report', checked: false },
    { id: 'schedule', label: 'Schedule Next Session', checked: false },
    { id: 'share', label: 'Share Instructions', checked: false },
  ]);

  const toggleChecklist = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  // Session completion state
  const [isCompleted, setIsCompleted] = useState(false);

  return (
    <div className="space-y-6 sm:space-y-8 pb-20 relative font-sans">
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

      {/* Top Breadcrumb & Page Header */}
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Session Summary
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Document today's treatment and prepare the next recovery steps.
            </p>
          </div>
        </div>
      </div>

      {/* Patient / Session Info Header Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-12 h-12 rounded-2xl bg-blue-100/80 text-blue-600 flex items-center justify-center shrink-0">
            <User className="w-6 h-6" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-y-3 gap-x-6 flex-1 items-center">
            <div>
              <h3
                onClick={onNavigateToPatient}
                className="text-base font-extrabold text-slate-900 leading-snug hover:text-blue-600 cursor-pointer"
              >
                Sanya Malhotra
              </h3>
              <p className="text-xs font-bold text-slate-400">Patient ID: #3M-98212</p>
            </div>

            <div>
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                THERAPIST
              </span>
              <span
                onClick={onNavigateToTherapist}
                className="text-sm font-extrabold text-slate-900 hover:text-blue-600 cursor-pointer block truncate"
              >
                Mr. Arjun Mehta
              </span>
            </div>

            <div>
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                SESSION TYPE
              </span>
              <span className="text-sm font-extrabold text-slate-900 block">Clinic Visit</span>
            </div>

            <div>
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                DURATION
              </span>
              <span className="text-sm font-extrabold text-slate-900 block">45 mins</span>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                DATE & TIME
              </span>
              <span className="text-sm font-extrabold text-slate-900 block truncate">
                Oct 23, 2024 • 02:30 PM
              </span>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex items-center">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            {isCompleted ? 'Completed' : 'In Progress'}
          </span>
        </div>
      </div>

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
        {/* Left Column (2 Spans) */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          {/* Card 1: Treatment Performed */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Treatment Performed
              </h2>
            </div>

            {/* Chips / Pills List */}
            <div className="flex flex-wrap items-center gap-2.5">
              {treatments.map((t) => (
                <button
                  key={t.id}
                  onClick={() => toggleTreatment(t.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                    t.selected
                      ? 'bg-blue-50/70 border-blue-600 text-blue-600 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                  }`}
                >
                  <span>{t.label}</span>
                  {t.selected && <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />}
                </button>
              ))}

              <button
                onClick={() => setShowAddTreatmentModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-bold border border-dashed border-slate-300 text-slate-500 hover:border-blue-500 hover:text-blue-600 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Other</span>
              </button>
            </div>
          </div>

          {/* Card 2: Clinical Notes */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  Clinical Notes
                </h2>
              </div>
              <button
                onClick={() => triggerToast('AI polished clinical notes format.')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Assistant</span>
              </button>
            </div>

            {/* Rich Editor Toolbar & Textarea */}
            <div className="border border-slate-200/80 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-transparent transition-all">
              {/* Toolbar */}
              <div className="bg-slate-50/80 border-b border-slate-200/60 p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsBold(!isBold)}
                    className={`p-1.5 rounded-lg text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer ${
                      isBold ? 'bg-slate-200 text-slate-900 font-bold' : ''
                    }`}
                    title="Bold"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsItalic(!isItalic)}
                    className={`p-1.5 rounded-lg text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer ${
                      isItalic ? 'bg-slate-200 text-slate-900 italic' : ''
                    }`}
                    title="Italic"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => triggerToast('Bullet list mode enabled.')}
                    className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer"
                    title="List"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <div className="w-[1px] h-4 bg-slate-200 mx-1"></div>
                  <button
                    onClick={() => triggerToast('Inserted reference link.')}
                    className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer"
                    title="Add Link"
                  >
                    <LinkIcon className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    setClinicalNotes('Begin typing clinical observations and objective findings here...');
                    triggerToast('Notes reset to initial state.');
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
                  title="Reset"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Textarea */}
              <textarea
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                rows={5}
                className={`w-full p-4 text-sm font-medium text-slate-800 bg-white focus:outline-none resize-y min-h-[130px] ${
                  isBold ? 'font-bold' : ''
                } ${isItalic ? 'italic' : ''}`}
                placeholder="Begin typing clinical observations and objective findings here..."
              />
            </div>
          </div>

          {/* Card 3: Patient Response */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <LineChart className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Patient Response
              </h2>
            </div>

            {/* Pain Level VAS Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-sm font-extrabold text-slate-900">Pain Level (VAS)</span>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-100">
                    Before: <span className="font-extrabold">{beforePain}/10</span>
                  </span>
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">
                    After: <span className="font-extrabold">{afterPain}/10</span>
                  </span>
                </div>
              </div>

              {/* Range Track with Custom Slider */}
              <div className="pt-2 pb-1 space-y-2">
                <div className="relative flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={afterPain}
                    onChange={(e) => setAfterPain(Number(e.target.value))}
                    className="w-full h-2.5 bg-gradient-to-r from-blue-200 via-indigo-300 to-rose-300 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
                  />
                </div>
                <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  <span>0 (No Pain)</span>
                  <span>5 (Moderate)</span>
                  <span>10 (Severe)</span>
                </div>
              </div>
            </div>

            {/* Mobility & Strength 2 Column Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
              {/* Mobility Improvement */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-2.5">
                  Mobility Improvement
                </label>
                <div className="inline-flex p-1 bg-slate-100/80 rounded-2xl w-full">
                  {(['None', 'Minor', 'Significant'] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setMobilityImprovement(option)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        mobilityImprovement === option
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Strength Response */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-2.5">
                  Strength Response
                </label>
                <div className="inline-flex p-1 bg-slate-100/80 rounded-2xl w-full">
                  {(['Decreased', 'Stable', 'Improved'] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setStrengthResponse(option)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        strengthResponse === option
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Next Treatment Plan */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Next Treatment Plan
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recommended Exercises Column */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-900">
                  Recommended Exercises
                </label>
                <div className="space-y-2.5">
                  {exercises.map((ex) => (
                    <div
                      key={ex.id}
                      className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 space-y-1"
                    >
                      <h4 className="text-sm font-bold text-slate-900">{ex.name}</h4>
                      <p className="text-xs font-medium text-slate-600 leading-relaxed">
                        {ex.desc}
                      </p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowAddExerciseModal(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer pt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Exercise</span>
                </button>
              </div>

              {/* Home Instructions Column */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-900">
                  Home Instructions
                </label>
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 min-h-[100px]">
                  <textarea
                    value={homeInstructions}
                    onChange={(e) => setHomeInstructions(e.target.value)}
                    rows={3}
                    className="w-full bg-transparent text-xs font-medium text-slate-700 leading-relaxed focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Program Modifications Section */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-900">
                Program Modifications
              </label>
              <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3.5">
                <input
                  type="text"
                  value={programModifications}
                  onChange={(e) => setProgramModifications(e.target.value)}
                  className="w-full bg-transparent text-xs font-medium text-slate-700 focus:outline-none"
                  placeholder="Adjusting load for next session based on today's feedback..."
                />
              </div>
            </div>
          </div>

          {/* Bottom Action Footer Bar (Left Column) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span className="w-2 h-2 rounded-full bg-slate-300"></span>
              <span>Auto-saved 2 mins ago</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => triggerToast('Draft saved successfully!')}
                className="flex-1 sm:flex-initial px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 text-sm font-bold rounded-full transition-all cursor-pointer shadow-2xs text-center"
              >
                Save Draft
              </button>
              <button
                onClick={() => {
                  setIsCompleted(true);
                  triggerToast('Session completed and saved!');
                }}
                className="flex-1 sm:flex-initial px-7 py-2.5 bg-blue-900 hover:bg-blue-950 text-white text-sm font-bold rounded-full shadow-md transition-all cursor-pointer text-center"
              >
                Complete Session
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (1 Span) */}
        <div className="space-y-6 sm:space-y-8">
          {/* Card 1: RECOVERY SNAPSHOT */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs space-y-6">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              RECOVERY SNAPSHOT
            </h3>

            {/* Circular Gauge Score */}
            <div className="flex flex-col items-center justify-center py-2">
              <div className="relative w-36 h-36 flex items-center justify-center">
                {/* SVG Donut Circle */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Ring */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#E2E8F0"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  {/* Progress Ring */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#1E3A8A"
                    strokeWidth="10"
                    strokeDasharray={`${78 * 2.513} 251.3`}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    78%
                  </span>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mt-0.5">
                    RECOVERY SCORE
                  </span>
                </div>
              </div>
            </div>

            {/* Pain Trend Bar Chart & Metric */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Pain Trend</span>
                <span className="text-xs font-extrabold text-blue-600">-12% vs last wk</span>
              </div>

              {/* 8 Vertical Rounded Bars Chart */}
              <div className="h-16 flex items-end justify-between gap-1.5 pt-2 px-1">
                {[75, 65, 80, 50, 45, 40, 35, 25].map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 group relative flex flex-col items-center"
                  >
                    <div
                      className={`w-full rounded-t-md transition-all duration-300 ${
                        i === 7 ? 'bg-blue-900' : 'bg-blue-200/80 group-hover:bg-blue-400'
                      }`}
                      style={{ height: `${height}%` }}
                    ></div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-slate-600">Session Completion</span>
                <span className="text-xs font-extrabold text-slate-900">100%</span>
              </div>
            </div>
          </div>

          {/* Card 2: FOLLOW-UP CHECKLIST */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              FOLLOW-UP CHECKLIST
            </h3>

            <div className="space-y-3">
              {checklist.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleChecklist(item.id)}
                  className="w-full flex items-center gap-3 text-left group cursor-pointer"
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      item.checked
                        ? 'bg-blue-600 text-white'
                        : 'border-2 border-slate-300 group-hover:border-blue-500'
                    }`}
                  >
                    {item.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <span
                    className={`text-xs sm:text-sm font-bold ${
                      item.checked ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column Stack of Primary Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => triggerToast('Summary saved to patient profile.')}
              className="w-full py-3 px-5 rounded-2xl bg-blue-100/70 hover:bg-blue-100 text-blue-900 text-sm font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-2xs"
            >
              <Save className="w-4 h-4 text-blue-800" />
              <span>Save Summary</span>
            </button>

            <button
              onClick={() => triggerToast('Generating session PDF report...')}
              className="w-full py-3 px-5 rounded-2xl bg-blue-100/70 hover:bg-blue-100 text-blue-900 text-sm font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-2xs"
            >
              <FileText className="w-4 h-4 text-blue-800" />
              <span>Generate Report</span>
            </button>

            <button
              onClick={() => triggerToast('Notification sent to patient Sanya Malhotra via SMS.')}
              className="w-full py-3 px-5 rounded-2xl bg-blue-100/70 hover:bg-blue-100 text-blue-900 text-sm font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-2xs"
            >
              <Bell className="w-4 h-4 text-blue-800" />
              <span>Notify Patient</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Treatment Tag Modal */}
      {showAddTreatmentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 border border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900">Add Treatment</h3>
              <button
                onClick={() => setShowAddTreatmentModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTreatment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Treatment Name
                </label>
                <input
                  type="text"
                  value={newTreatmentName}
                  onChange={(e) => setNewTreatmentName(e.target.value)}
                  placeholder="e.g. Ultrasound Therapy, Cupping"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTreatmentModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Add Tag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Exercise Modal */}
      {showAddExerciseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 border border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900">Add Exercise</h3>
              <button
                onClick={() => setShowAddExerciseModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExerciseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Exercise Name
                </label>
                <input
                  type="text"
                  value={newExName}
                  onChange={(e) => setNewExName(e.target.value)}
                  placeholder="e.g. Wall Slides"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Reps / Sets / Description
                </label>
                <textarea
                  value={newExDesc}
                  onChange={(e) => setNewExDesc(e.target.value)}
                  placeholder="e.g. 2 sets of 10 reps, slow controlled movement."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddExerciseModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save Exercise
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionSummaryPage;
