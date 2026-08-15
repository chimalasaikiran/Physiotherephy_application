import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Dumbbell,
  Play,
  List,
  BarChart2,
  CheckCircle2,
  Square,
  Plus,
  Sparkles,
  Flag,
  Eye,
  Bell,
  X,
  RefreshCw,
  Video,
  Activity,
} from 'lucide-react';
import type { Patient } from './types';
import type { ProgramAssignment } from '@/programs/types';

interface ProgramsTabProps {
  patientName?: string;
  therapistName?: string;
  patient?: Patient;
  assignedPrograms?: ProgramAssignment[];
  onAssignProgram?: (programId: string, programTitle: string, totalWeeks?: number) => Promise<any>;
}

export const ProgramsTab: React.FC<ProgramsTabProps> = ({
  patientName = 'Sanya Malhotra',
  therapistName = 'Dr. Ananya Iyer',
  patient,
  assignedPrograms = [],
  onAssignProgram,
}) => {
  // Toast notification feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Exercise completion state
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({
    'ex-1': false,
    'ex-2': true,
  });

  const toggleExercise = (id: string) => {
    setCompletedExercises((prev) => {
      const nextState = !prev[id];
      showToast(nextState ? 'Exercise marked as complete!' : 'Exercise marked incomplete');
      return { ...prev, [id]: nextState };
    });
  };

  // Modal states
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeVideoTitle, setActiveVideoTitle] = useState('');
  const [isExerciseListModalOpen, setIsExerciseListModalOpen] = useState(false);
  const [isAIAnalysisModalOpen, setIsAIAnalysisModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);

  // Form input for Assign Exercise Modal
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseCategory, setNewExerciseCategory] = useState('MOBILITY');
  const [newExerciseSets, setNewExerciseSets] = useState('3');
  const [newExerciseReps, setNewExerciseReps] = useState('12');

  const openVideo = (title: string) => {
    setActiveVideoTitle(title);
    setIsVideoModalOpen(true);
  };

  const handleRunAIAnalysis = () => {
    setIsAnalyzingAI(true);
    setIsAIAnalysisModalOpen(true);
    setTimeout(() => {
      setIsAnalyzingAI(false);
    }, 1800);
  };

  const handleAssignExerciseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExerciseName.trim()) return;
    setIsAssignModalOpen(false);
    showToast(`Successfully assigned "${newExerciseName}" to ${patientName}!`);
    setNewExerciseName('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center space-x-2.5 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Grid: Left Column (~68%) and Right Column (~32%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ================= LEFT COLUMN ================= */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. ACTIVE PROGRAMS SECTION */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Active Programs
                </h2>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
                  Ongoing physical therapy protocols prescribed by {therapistName}
                </p>
              </div>
              <span className="self-start sm:self-auto px-3.5 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-bold">
                1 Active Protocol
              </span>
            </div>

            {/* Active Protocol Card (Figma Lumbar Spine Stabilization Card) */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-2xs space-y-6 relative overflow-hidden">
              {/* Card Header Row */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-[11px] font-extrabold tracking-wider uppercase">
                    HIGH PRIORITY
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Assigned by {therapistName}
                  </span>
                </div>

                {/* Compliance Percentage */}
                <div className="text-right">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-blue-600">80%</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                    Overall Compliance
                  </span>
                </div>
              </div>

              {/* Program Title */}
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Lumbar Spine Stabilization
                </h3>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-500 shadow-xs"
                    style={{ width: '80%' }}
                  />
                </div>
              </div>

              {/* Metadata Grid (Schedule, Duration, Exercises) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 border-t border-slate-50">
                {/* Metric 1: Schedule */}
                <div className="flex items-center space-x-3 p-3 bg-slate-50/70 rounded-2xl border border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      SCHEDULE
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                      Mon, Wed, Fri
                    </span>
                  </div>
                </div>

                {/* Metric 2: Duration */}
                <div className="flex items-center space-x-3 p-3 bg-slate-50/70 rounded-2xl border border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      DURATION
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                      Week 9 of 12
                    </span>
                  </div>
                </div>

                {/* Metric 3: Exercises */}
                <div className="flex items-center space-x-3 p-3 bg-slate-50/70 rounded-2xl border border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      EXERCISES
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                      8 Routine Items
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => openVideo('Lumbar Spine Stabilization Tutorial')}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-[#0F4C81] hover:bg-blue-800 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Video Tutorial access</span>
                </button>

                <button
                  onClick={() => setIsExerciseListModalOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs sm:text-sm font-bold rounded-2xl transition-all cursor-pointer"
                >
                  <List className="w-4 h-4 text-slate-500" />
                  <span>Exercise List</span>
                </button>

                <button
                  onClick={() => showToast('Displaying compliance history analytics...')}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-600 rounded-2xl transition-all cursor-pointer"
                  title="Compliance Analytics"
                >
                  <BarChart2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 2. TODAY'S PRESCRIBED EXERCISES SECTION */}
          <div className="space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Today's Prescribed Exercises
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Exercise Card 1: Pelvic Tilts */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-2xs overflow-hidden flex flex-col justify-between group">
                {/* Image Container */}
                <div className="relative h-48 sm:h-52 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80"
                    alt="Pelvic Tilts"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Top Right Checkbox Button */}
                  <button
                    onClick={() => toggleExercise('ex-1')}
                    className={`absolute top-3 right-3 p-1.5 rounded-xl backdrop-blur-md transition-all cursor-pointer ${
                      completedExercises['ex-1']
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'bg-white/80 text-slate-600 hover:bg-white'
                    }`}
                    title={completedExercises['ex-1'] ? 'Completed' : 'Mark Complete'}
                  >
                    {completedExercises['ex-1'] ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Square className="w-5 h-5" strokeWidth={1.5} />
                    )}
                  </button>

                  {/* Gradient Overlay & Text */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-4 text-white">
                    <span className="px-2.5 py-0.5 bg-black/40 backdrop-blur-md text-white border border-white/20 rounded-md text-[10px] font-extrabold uppercase tracking-wider w-fit mb-1">
                      MOBILITY
                    </span>
                    <h4 className="text-lg font-extrabold text-white">Pelvic Tilts</h4>
                  </div>
                </div>

                {/* Bottom Details Row */}
                <div className="p-4 bg-white flex items-center justify-between border-t border-slate-100">
                  <div className="flex items-center space-x-4 text-xs font-bold">
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        SETS
                      </span>
                      <span className="text-base text-slate-900 font-extrabold">3</span>
                    </div>
                    <div className="h-6 w-px bg-slate-100" />
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        REPS
                      </span>
                      <span className="text-base text-slate-900 font-extrabold">12</span>
                    </div>
                  </div>

                  <button
                    onClick={() => openVideo('Pelvic Tilts Exercise Guide')}
                    className="w-10 h-10 rounded-full border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                    title="Play Exercise Video"
                  >
                    <Play className="w-4 h-4 ml-0.5 fill-current" />
                  </button>
                </div>
              </div>

              {/* Exercise Card 2: Cat-Cow Stretch */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-2xs overflow-hidden flex flex-col justify-between group">
                {/* Image Container */}
                <div className="relative h-48 sm:h-52 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80"
                    alt="Cat-Cow Stretch"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Top Right Checkbox Button */}
                  <button
                    onClick={() => toggleExercise('ex-2')}
                    className={`absolute top-3 right-3 p-1.5 rounded-xl backdrop-blur-md transition-all cursor-pointer ${
                      completedExercises['ex-2']
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'bg-white/80 text-slate-600 hover:bg-white'
                    }`}
                    title={completedExercises['ex-2'] ? 'Completed' : 'Mark Complete'}
                  >
                    {completedExercises['ex-2'] ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Square className="w-5 h-5" strokeWidth={1.5} />
                    )}
                  </button>

                  {/* Gradient Overlay & Text */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-4 text-white">
                    <span className="px-2.5 py-0.5 bg-black/40 backdrop-blur-md text-white border border-white/20 rounded-md text-[10px] font-extrabold uppercase tracking-wider w-fit mb-1">
                      FLEXIBILITY
                    </span>
                    <h4 className="text-lg font-extrabold text-white">Cat-Cow Stretch</h4>
                  </div>
                </div>

                {/* Bottom Details Row */}
                <div className="p-4 bg-white flex items-center justify-between border-t border-slate-100">
                  <div className="flex items-center space-x-4 text-xs font-bold">
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        DURATION
                      </span>
                      <span className="text-base text-slate-900 font-extrabold">2m</span>
                    </div>
                    <div className="h-6 w-px bg-slate-100" />
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        INTENSITY
                      </span>
                      <span className="text-base text-slate-900 font-extrabold">Low</span>
                    </div>
                  </div>

                  <button
                    onClick={() => openVideo('Cat-Cow Stretch Tutorial')}
                    className="w-10 h-10 rounded-full border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                    title="Play Exercise Video"
                  >
                    <Play className="w-4 h-4 ml-0.5 fill-current" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3. RECOMMENDED SUPPLEMENTARY CARE SECTION */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Recommended Supplementary Care
              </h3>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
                Programs that align with {patientName}'s recovery trajectory
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Program Card 1 */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-2xs overflow-hidden flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80"
                      alt="Core Strength & Conditioning"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 px-3 py-1 bg-[#10534E] text-white rounded-full text-[10px] font-extrabold tracking-wider uppercase shadow-xs">
                      HIGHLY RECOMMENDED
                    </span>
                  </div>

                  <div className="p-5 pb-0 space-y-1.5">
                    <h4 className="text-base font-extrabold text-slate-900">
                      Core Strength & Conditioning
                    </h4>
                    <p className="text-xs font-medium text-slate-500 leading-relaxed">
                      Enhance spinal support by building deep abdominal stability.
                    </p>
                  </div>
                </div>

                <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-700">
                    6 Weeks • Intermediate
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openVideo('Core Strength & Conditioning Preview')}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 cursor-pointer"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() =>
                        showToast('Core Strength & Conditioning program assigned successfully!')
                      }
                      className="px-4 py-2 bg-[#0C3E6D] hover:bg-[#082a4a] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
                    >
                      Assign
                    </button>
                  </div>
                </div>
              </div>

              {/* Program Card 2 */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-2xs overflow-hidden flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop&q=80"
                      alt="Mobility Flow for Desk Workers"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-5 pb-0 space-y-1.5">
                    <h4 className="text-base font-extrabold text-slate-900">
                      Mobility Flow for Desk Workers
                    </h4>
                    <p className="text-xs font-medium text-slate-500 leading-relaxed">
                      Targeted movements to alleviate postural stress from prolonged...
                    </p>
                  </div>
                </div>

                <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-700">
                    4 Weeks • Beginner
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openVideo('Mobility Flow Preview')}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 cursor-pointer"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() =>
                        showToast('Mobility Flow program assigned successfully!')
                      }
                      className="px-4 py-2 bg-[#0C3E6D] hover:bg-[#082a4a] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
                    >
                      Assign
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN (Sidebar) ================= */}
        <div className="space-y-6">
          {/* 1. CURRENT GOALS CARD */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-5">
            <div className="flex items-center space-x-2.5">
              <Flag className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-extrabold text-slate-900">Current Goals</h3>
            </div>

            <div className="space-y-4">
              {/* Goal 1: Pain Reduction */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-800">Pain Reduction</span>
                  <span className="text-blue-600">70%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '70%' }} />
                </div>
              </div>

              {/* Goal 2: Mobility */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-800">Mobility</span>
                  <span className="text-teal-600">45%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-teal-500 h-full rounded-full" style={{ width: '45%' }} />
                </div>
              </div>

              {/* Goal 3: Strength */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-800">Strength</span>
                  <span className="text-purple-600">30%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full" style={{ width: '30%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* 2. UPCOMING MILESTONES CARD */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Upcoming Milestones</h3>

            <div className="space-y-3">
              {/* Milestone 1 */}
              <div className="flex items-center space-x-3.5 p-3 bg-slate-50/70 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Next Review
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                    28 Oct, 2023
                  </span>
                </div>
              </div>

              {/* Milestone 2 */}
              <div className="flex items-center space-x-3.5 p-3 bg-slate-50/70 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Next Session
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                    Tomorrow, 10:30 AM
                  </span>
                </div>
              </div>

              {/* Milestone 3 */}
              <div className="flex items-center space-x-3.5 p-3 bg-slate-50/70 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Flag className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Est. Completion
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                    15 Nov, 2023
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. QUICK ACTIONS CARD */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-4">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
              QUICK ACTIONS
            </span>

            <div className="space-y-2.5">
              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="w-full flex items-center space-x-3 p-3 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 transition-all cursor-pointer text-left shadow-2xs"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </div>
                <span>Assign Exercise</span>
              </button>

              <button
                onClick={() => showToast('Opening program customization editor...')}
                className="w-full flex items-center space-x-3 p-3 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 transition-all cursor-pointer text-left shadow-2xs"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                  <List className="w-4 h-4" />
                </div>
                <span>Modify Program</span>
              </button>

              <button
                onClick={() => showToast('Schedule Review request sent.')}
                className="w-full flex items-center space-x-3 p-3 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 transition-all cursor-pointer text-left shadow-2xs"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <span>Schedule Review</span>
              </button>

              <button
                onClick={() => showToast('Notification reminder sent to patient!')}
                className="w-full flex items-center space-x-3 p-3 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 transition-all cursor-pointer text-left shadow-2xs"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <span>Send Reminder</span>
              </button>
            </div>
          </div>

          {/* 4. PATIENT HISTORY SUMMARY CARD */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-4">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
              PATIENT HISTORY SUMMARY
            </span>

            <p className="text-xs font-medium text-slate-600 leading-relaxed pl-3 border-l-2 border-blue-500 italic">
              "Lumbar stabilization has shown 12% improvement in mobility range since last
              assessment."
            </p>

            <button
              onClick={() => showToast('Opening full clinical notes history...')}
              className="inline-flex items-center space-x-2 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer pt-1"
            >
              <Eye className="w-4 h-4 text-blue-600" />
              <span>View full clinical notes</span>
            </button>
          </div>

          {/* 5. PHYSIO ASSISTANT AI CARD */}
          <div className="bg-gradient-to-br from-[#DCEAFC] via-[#E8F2FE] to-[#E5EDFD] rounded-3xl p-6 border border-blue-100 shadow-2xs space-y-4 relative overflow-hidden">
            <div className="space-y-1.5 relative z-10">
              <h4 className="text-base sm:text-lg font-extrabold text-[#0C3E6D]">
                Physio Assistant AI
              </h4>
              <p className="text-xs font-medium text-slate-600 leading-relaxed max-w-[240px]">
                Analyze Sanya's performance and get auto-adjustments for her next program.
              </p>
            </div>

            <div className="pt-1 relative z-10">
              <button
                onClick={handleRunAIAnalysis}
                className="px-5 py-2.5 bg-[#0F4C81] hover:bg-[#0A365C] text-white text-xs font-bold rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-sky-300" />
                <span>Launch Analysis</span>
              </button>
            </div>

            {/* Decorative background watermark graphic */}
            <div className="absolute -bottom-4 -right-4 w-28 h-28 text-blue-400/20 pointer-events-none">
              <Sparkles className="w-full h-full" />
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* 1. Video Tutorial Access Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-slate-900 text-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  {activeVideoTitle}
                </h3>
              </div>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mock Video Container */}
            <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center group border border-slate-800">
              <img
                src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1000&auto=format&fit=crop&q=80"
                alt="Video thumbnail"
                className="w-full h-full object-cover opacity-60"
              />
              <button
                onClick={() => showToast('Playing HD instructional video')}
                className="absolute w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform cursor-pointer"
              >
                <Play className="w-7 h-7 ml-1 fill-white" />
              </button>
              <span className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/70 rounded-lg text-xs font-mono font-bold">
                04:25
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Prescribed by {therapistName}</span>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close Video Player
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Exercise List Drawer / Modal */}
      {isExerciseListModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Lumbar Spine Stabilization
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  8 Prescribed Routine Items
                </p>
              </div>
              <button
                onClick={() => setIsExerciseListModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {[
                { name: 'Pelvic Tilts', reps: '3 Sets • 12 Reps', tag: 'MOBILITY' },
                { name: 'Cat-Cow Stretch', reps: '2 Minutes • Low Intensity', tag: 'FLEXIBILITY' },
                { name: 'Bird-Dog Hold', reps: '3 Sets • 10 Reps per side', tag: 'STABILITY' },
                { name: 'Bridge Pose with Band', reps: '3 Sets • 15 Reps', tag: 'STRENGTH' },
                { name: 'Prone Cobra Extension', reps: '2 Sets • 10 Holds', tag: 'POSTURE' },
                { name: 'Side Plank Iso-Holds', reps: '3 Sets • 30 Secs', tag: 'CORE' },
                { name: 'Knee-to-Chest Stretch', reps: '2 Sets • 45 Secs', tag: 'FLEXIBILITY' },
                { name: 'Diaphragmatic Breathing', reps: '5 Minutes', tag: 'RECOVERY' },
              ].map((ex, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                        {ex.name}
                      </h4>
                      <p className="text-[11px] font-semibold text-slate-500">{ex.reps}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-600">
                    {ex.tag}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                onClick={() => setIsExerciseListModalOpen(false)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Physio Assistant AI Analysis Modal */}
      {isAIAnalysisModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Physio Assistant AI</h3>
                  <p className="text-xs text-slate-500 font-medium">Automated Protocol Insights</p>
                </div>
              </div>
              <button
                onClick={() => setIsAIAnalysisModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isAnalyzingAI ? (
              <div className="py-12 text-center space-y-4">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-600">
                  Analyzing {patientName}'s compliance & session progress...
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-xs font-medium text-slate-700">
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800 space-y-1">
                  <h4 className="font-extrabold flex items-center space-x-1.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Positive Compliance Trend</span>
                  </h4>
                  <p>
                    {patientName} has maintained an 80% completion rate over the last 3 weeks.
                    Mobility in lumbar rotation has improved by 14%.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-blue-900 space-y-2">
                  <h4 className="font-extrabold text-sm">Recommended Auto-Adjustments</h4>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Increase Cat-Cow duration from 2m to 3m</li>
                    <li>Add 1 set to Pelvic Tilts starting Week 10</li>
                    <li>Introduce Core Strength & Conditioning as supplementary care</li>
                  </ul>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setIsAIAnalysisModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => {
                      setIsAIAnalysisModalOpen(false);
                      showToast('AI Recommendations applied to Sanya’s program!');
                    }}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Apply Adjustments
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Assign Exercise Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-extrabold text-slate-900">Assign Exercise</h3>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignExerciseSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Exercise Name
                </label>
                <input
                  type="text"
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                  placeholder="e.g. Thoracic Rotation Stretch"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Category
                </label>
                <select
                  value={newExerciseCategory}
                  onChange={(e) => setNewExerciseCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MOBILITY">MOBILITY</option>
                  <option value="FLEXIBILITY">FLEXIBILITY</option>
                  <option value="STRENGTH">STRENGTH</option>
                  <option value="STABILITY">STABILITY</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Sets
                  </label>
                  <input
                    type="text"
                    value={newExerciseSets}
                    onChange={(e) => setNewExerciseSets(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Reps / Duration
                  </label>
                  <input
                    type="text"
                    value={newExerciseReps}
                    onChange={(e) => setNewExerciseReps(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl cursor-pointer"
                >
                  Assign Exercise
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramsTab;
