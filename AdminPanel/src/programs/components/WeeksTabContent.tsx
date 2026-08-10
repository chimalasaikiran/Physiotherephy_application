import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Plus,
  PlusCircle,
  Calendar,
  Dumbbell,
  Brain,
  ShieldCheck,
  Check,
  X,
  FileText,
  Sparkles,
  Info,
  HelpCircle
} from 'lucide-react';

interface WeeksTabContentProps {
  onShowToast: (message: string) => void;
}

interface ExerciseItem {
  id: string;
  name: string;
  dosage: string;
  image: string;
}

interface WeekPhase {
  id: number;
  title: string;
  description: string;
  sessionsPerWeek: string;
  exerciseCountText: string;
  clinicalFocus: string;
  exercises: ExerciseItem[];
}

export const WeeksTabContent: React.FC<WeeksTabContentProps> = ({ onShowToast }) => {
  // Expanded phase state (default to Week 1 expanded)
  const [expandedPhaseId, setExpandedPhaseId] = useState<number | null>(1);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Modal States
  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);
  const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false);
  const [isEditConfigModalOpen, setIsEditConfigModalOpen] = useState(false);
  const [isProtocolsModalOpen, setIsProtocolsModalOpen] = useState(false);

  // New Exercise Form State
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseSetsReps, setNewExerciseSetsReps] = useState('3 sets × 10 reps');
  const [newExerciseRest, setNewExerciseRest] = useState('Rest: 30s');

  // Week phases data
  const [phases, setPhases] = useState<WeekPhase[]>([
    {
      id: 1,
      title: 'Pain Management & Mobilization',
      description: 'Focus on reducing acute inflammation and restoring basic range of motion.',
      sessionsPerWeek: '3 per week',
      exerciseCountText: '6 exercises',
      clinicalFocus: 'Neural desensitization',
      exercises: [
        {
          id: 'ex-1',
          name: 'Pelvic Tilts',
          dosage: '3 sets × 12 reps • Rest: 30s',
          image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=300&q=80',
        },
        {
          id: 'ex-2',
          name: 'Knee-to-Chest',
          dosage: '2 sets × 30s hold • Rest: 15s',
          image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=300&q=80',
        },
        {
          id: 'ex-3',
          name: 'Cat-Cow',
          dosage: '3 sets × 10 reps • Rest: 30s',
          image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=300&q=80',
        },
      ],
    },
    {
      id: 2,
      title: 'Foundational Stability',
      description: 'Core engagement and proprioceptive awareness building.',
      sessionsPerWeek: '4 per week',
      exerciseCountText: '5 exercises',
      clinicalFocus: 'Core stabilizer activation',
      exercises: [
        {
          id: 'ex-4',
          name: 'Bird-Dog Quadruped',
          dosage: '3 sets × 10 reps each side • Rest: 30s',
          image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=300&q=80',
        },
        {
          id: 'ex-5',
          name: 'Dead Bug Bracing',
          dosage: '3 sets × 12 reps • Rest: 30s',
          image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=300&q=80',
        },
      ],
    },
    {
      id: 3,
      title: 'Strength & Dynamic Control',
      description: 'Progressive loading of posterior chain and trunk musculature.',
      sessionsPerWeek: '4 per week',
      exerciseCountText: '8 exercises',
      clinicalFocus: 'Posterior chain hypertrophy',
      exercises: [
        {
          id: 'ex-6',
          name: 'Glute Bridge with Band',
          dosage: '3 sets × 15 reps • Rest: 45s',
          image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=300&q=80',
        },
      ],
    },
    {
      id: 4,
      title: 'Functional Integration',
      description: 'Bridging rehabilitation to daily functional movements.',
      sessionsPerWeek: '3 per week',
      exerciseCountText: '6 exercises',
      clinicalFocus: 'Biomechanical endurance',
      exercises: [
        {
          id: 'ex-7',
          name: 'Supported Goblet Squat',
          dosage: '3 sets × 10 reps • Rest: 60s',
          image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=300&q=80',
        },
      ],
    },
  ]);

  const togglePhase = (id: number) => {
    setExpandedPhaseId((prev) => (prev === id ? null : id));
  };

  const handleAddExerciseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExerciseName.trim()) return;

    const newEx: ExerciseItem = {
      id: `ex-${Date.now()}`,
      name: newExerciseName,
      dosage: `${newExerciseSetsReps} • ${newExerciseRest}`,
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=300&q=80',
    };

    setPhases((prev) =>
      prev.map((p) =>
        p.id === (expandedPhaseId || 1)
          ? { ...p, exercises: [...p.exercises, newEx] }
          : p
      )
    );

    setNewExerciseName('');
    setIsAddExerciseModalOpen(false);
    onShowToast(`Added "${newExerciseName}" to Phase ${expandedPhaseId || 1}`);
  };

  // Bar chart load values for Weeks 1 to 8
  const programLoadData = [
    { week: 'W1', value: 20, color: 'from-emerald-300 to-teal-400' },
    { week: 'W2', value: 32, color: 'from-teal-400 to-teal-500' },
    { week: 'W3', value: 45, color: 'from-teal-500 to-cyan-500' },
    { week: 'W4', value: 60, color: 'from-cyan-500 to-sky-500' },
    { week: 'W5', value: 74, color: 'from-sky-500 to-blue-500' },
    { week: 'W6', value: 85, color: 'from-blue-500 to-blue-600' },
    { week: 'W7', value: 94, color: 'from-blue-600 to-indigo-600' },
    { week: 'W8', value: 100, color: 'from-indigo-600 to-blue-900' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start animate-in fade-in duration-300">
      {/* LEFT COLUMN: Accordion Cards (7 or 8 Spans in 12 Grid) */}
      <div className="lg:col-span-8 space-y-4">
        {phases.map((phase) => {
          const isExpanded = expandedPhaseId === phase.id;

          return (
            <div
              key={phase.id}
              className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden ${
                isExpanded
                  ? 'border-blue-200 shadow-md shadow-blue-500/5 ring-1 ring-blue-100'
                  : 'border-slate-200/80 shadow-xs hover:border-slate-300'
              }`}
            >
              {/* Accordion Header */}
              <div
                onClick={() => togglePhase(phase.id)}
                className="p-5 sm:p-6 flex items-start sm:items-center justify-between cursor-pointer select-none group"
              >
                <div className="flex items-start sm:items-center space-x-4 pr-2">
                  {/* Number Badge */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0 transition-colors ${
                      isExpanded
                        ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/30'
                        : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                    }`}
                  >
                    {phase.id}
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                      {phase.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 max-w-xl line-clamp-2 sm:line-clamp-1">
                      {phase.description}
                    </p>
                  </div>
                </div>

                {/* Right Side Indicator (Badge when collapsed, arrow always) */}
                <div className="flex items-center space-x-3 shrink-0 ml-2">
                  {!isExpanded && phase.id === 2 && (
                    <span className="hidden sm:inline-block px-2.5 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-lg uppercase tracking-wider">
                      5 EXERCISES
                    </span>
                  )}
                  <div className="p-1 rounded-full text-slate-400 group-hover:text-slate-700 transition-colors">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-blue-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </div>

              {/* Accordion Content Body (If Expanded) */}
              {isExpanded && (
                <div className="px-5 sm:px-6 pb-6 pt-2 space-y-6 border-t border-slate-100">
                  {/* Sub-Metrics Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    {/* Metric 1 */}
                    <div className="flex items-center space-x-3 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100">
                      <div className="w-8 h-8 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                          Sessions
                        </span>
                        <span className="text-xs font-extrabold text-slate-900">
                          {phase.sessionsPerWeek}
                        </span>
                      </div>
                    </div>

                    {/* Metric 2 */}
                    <div className="flex items-center space-x-3 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100">
                      <div className="w-8 h-8 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0">
                        <Dumbbell className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                          Exercises
                        </span>
                        <span className="text-xs font-extrabold text-slate-900">
                          {phase.exercises.length} exercises
                        </span>
                      </div>
                    </div>

                    {/* Metric 3 */}
                    <div className="flex items-center space-x-3 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100">
                      <div className="w-8 h-8 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0">
                        <Brain className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                          Clinical Focus
                        </span>
                        <span className="text-xs font-extrabold text-slate-900 truncate block max-w-[140px]">
                          {phase.clinicalFocus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* EXERCISE SEQUENCE Section */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                        EXERCISE SEQUENCE
                      </span>
                      <button
                        onClick={() => setIsAddExerciseModalOpen(true)}
                        className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Exercise</span>
                      </button>
                    </div>

                    {/* Exercise Cards Stack */}
                    <div className="space-y-2.5">
                      {phase.exercises.map((ex) => (
                        <div
                          key={ex.id}
                          className="group p-3.5 bg-white border border-slate-200/90 hover:border-blue-300 rounded-2xl flex items-center justify-between shadow-2xs hover:shadow-xs transition-all"
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            {/* Drag Handle Icon */}
                            <div className="text-slate-300 group-hover:text-slate-400 cursor-grab active:cursor-grabbing p-1 shrink-0">
                              <GripVertical className="w-4 h-4" />
                            </div>

                            {/* Thumbnail Image */}
                            <img
                              src={ex.image}
                              alt={ex.name}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                            />

                            {/* Exercise Details */}
                            <div className="min-w-0">
                              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                                {ex.name}
                              </h4>
                              <p className="text-xs text-slate-500 font-medium mt-0.5">
                                {ex.dosage}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions Footer Bar inside Expanded Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => setIsEditConfigModalOpen(true)}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors text-left cursor-pointer py-1"
                    >
                      Edit Week Configuration
                    </button>

                    <button
                      onClick={() => setIsAddSessionModalOpen(true)}
                      className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200/60 transition-colors cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4 text-blue-600" />
                      <span>Add Training Session</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Footer Banner Text */}
        <div className="py-6 flex items-center justify-center space-x-4">
          <div className="h-px bg-slate-200 flex-1 max-w-[120px]" />
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 text-center">
            WEEKS 5 - 8 AVAILABLE IN FULL VIEW
          </span>
          <div className="h-px bg-slate-200 flex-1 max-w-[120px]" />
        </div>
      </div>

      {/* RIGHT COLUMN: Sidebar Widgets (4 Spans in 12 Grid) */}
      <div className="lg:col-span-4 space-y-6 sm:space-y-8">
        {/* Widget 1: SELECTED WEEK INSIGHTS */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
            SELECTED WEEK INSIGHTS
          </span>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Weekly Progress Target</span>
              <span className="text-lg font-extrabold text-blue-600">100%</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full w-full" />
            </div>
          </div>

          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Most patients complete this week in 7.2 days on average. Success rate for neural desensitization targets is 84%.
          </p>
        </div>

        {/* Widget 2: CUMULATIVE PROGRAM LOAD */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
            CUMULATIVE PROGRAM LOAD
          </span>

          {/* Bar Chart Visualization */}
          <div className="pt-4 pb-2 relative">
            <div className="h-40 flex items-end justify-between gap-1.5 sm:gap-2 px-1">
              {programLoadData.map((item, idx) => {
                const isHovered = hoveredBarIndex === idx;
                return (
                  <div
                    key={item.week}
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                    className="flex-1 flex flex-col items-center group relative cursor-pointer"
                  >
                    {/* Hover Tooltip */}
                    {isHovered && (
                      <div className="absolute -top-10 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg z-20 whitespace-nowrap animate-in fade-in duration-150">
                        {item.week}: {item.value}% Load
                      </div>
                    )}

                    {/* Bar */}
                    <div
                      className={`w-full rounded-t-lg bg-gradient-to-t ${item.color} transition-all duration-300 group-hover:brightness-110`}
                      style={{ height: `${item.value}%` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* X-Axis Labels */}
            <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-400 uppercase tracking-wider pt-3 border-t border-slate-100">
              <span>WEEK 1</span>
              <span>WEEK 8</span>
            </div>
          </div>
        </div>

        {/* Widget 3: PHASE I GUIDELINES */}
        <div className="bg-blue-50/60 rounded-3xl p-6 border border-blue-100 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-blue-900">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-900">
              PHASE I GUIDELINES
            </h4>
          </div>

          <ul className="space-y-3 text-xs text-slate-600 font-medium leading-relaxed">
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
              <span>Avoid end-range lumbar flexion during acute symptomatic presentation.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
              <span>Emphasize abdominal bracing without breath-holding (Valsalva).</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
              <span>Target VAS pain reduction of 30% before advancing to Week 3.</span>
            </li>
          </ul>

          <div className="pt-2">
            <button
              onClick={() => setIsProtocolsModalOpen(true)}
              className="text-xs font-extrabold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer inline-flex items-center space-x-1"
            >
              <span>View Full Clinical Protocols</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: ADD EXERCISE MODAL */}
      {isAddExerciseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-5">
            <button
              onClick={() => setIsAddExerciseModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Add Prescribed Exercise</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Add an exercise to Phase {expandedPhaseId || 1}
              </p>
            </div>

            <form onSubmit={handleAddExerciseSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Exercise Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lumbar Extension Mobilization"
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">
                    Sets & Reps
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="3 sets × 10 reps"
                    value={newExerciseSetsReps}
                    onChange={(e) => setNewExerciseSetsReps(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">
                    Rest Duration
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Rest: 30s"
                    value={newExerciseRest}
                    onChange={(e) => setNewExerciseRest(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddExerciseModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  Add Exercise
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD TRAINING SESSION MODAL */}
      {isAddSessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-5">
            <button
              onClick={() => setIsAddSessionModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Add Training Session</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Configure additional clinical session slot for Phase {expandedPhaseId || 1}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                  Session Type
                </label>
                <select className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium">
                  <option>Supervised In-Clinic Session</option>
                  <option>Guided Home Exercise Protocol</option>
                  <option>Tele-rehab Consultation</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                  Frequency
                </label>
                <input
                  type="text"
                  defaultValue="3 Sessions per week"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setIsAddSessionModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsAddSessionModalOpen(false);
                  onShowToast('Training session added to protocol configuration!');
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Save Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT WEEK CONFIGURATION MODAL */}
      {isEditConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-5">
            <button
              onClick={() => setIsEditConfigModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Edit Week Configuration</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Update clinical targets for Phase {expandedPhaseId || 1}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                  Phase Title
                </label>
                <input
                  type="text"
                  defaultValue={phases.find((p) => p.id === expandedPhaseId)?.title || ''}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                  Clinical Focus
                </label>
                <input
                  type="text"
                  defaultValue={phases.find((p) => p.id === expandedPhaseId)?.clinicalFocus || ''}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setIsEditConfigModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsEditConfigModalOpen(false);
                  onShowToast('Week configuration saved successfully!');
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: FULL CLINICAL PROTOCOLS MODAL */}
      {isProtocolsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-5">
            <button
              onClick={() => setIsProtocolsModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Clinical Guidelines & Protocols</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Full evidence-based guidelines for Lower Back Recovery Program
              </p>
            </div>

            <div className="space-y-4 max-h-72 overflow-y-auto pr-1 text-xs text-slate-600 font-medium">
              <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-1">
                <span className="font-extrabold text-blue-900 block">Phase 1 Safety Precautions</span>
                <p>Ensure patient remains within pain tolerance (VAS score &lt; 4/10) during all neural mobilization drills.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                <span className="font-extrabold text-slate-900 block">Progression Criteria</span>
                <p>Patients must demonstrate 30% reduction in VAS pain and complete 3 consecutive pain-free sessions before moving to Phase 2.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                <span className="font-extrabold text-slate-900 block">Contraindications</span>
                <p>Discontinue neural flossing if acute distal radiating symptoms intensify down the leg.</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsProtocolsModalOpen(false)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Close Protocol View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeksTabContent;
