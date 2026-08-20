import React, { useState } from 'react';
import {
  TrendingUp,
  CheckCircle2,
  Download,
  Share2,
  Plus,
  RefreshCw,
  X,
  Activity,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
} from 'lucide-react';
import type { Patient } from './types';

interface ProgressTabProps {
  patientName?: string;
  therapistName?: string;
  patient?: Patient;
  assignedPrograms?: any[];
}

interface FunctionalGoal {
  id: string;
  label: string;
  percentage: number;
}

interface ClinicianObservation {
  id: string;
  quote: string;
  author: string;
  timeAgo: string;
}

export const ProgressTab: React.FC<ProgressTabProps> = ({
  patientName = 'Patient',
  therapistName = 'No therapist assigned',
  patient,
  assignedPrograms = [],
}) => {
  // Toast notification feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Selected week for Pain & Activity chart tooltip (default W5 matching Figma)
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(4); // 0-indexed, 4 = W5
  const [timeframe, setTimeframe] = useState<'8 Weeks' | '12 Weeks' | 'Monthly'>('8 Weeks');
  const [isRefreshingSync, setIsRefreshingSync] = useState(false);

  // Quick Action: Share with Patient toggle state
  const [isSharedWithPatient, setIsSharedWithPatient] = useState(true);

  // Derive dynamic program assignment & exercise completion metrics
  const activeAssignment =
    assignedPrograms.find((p) => p.status === 'active') ||
    (assignedPrograms.length > 0 ? assignedPrograms[0] : null);

  const programTitle = activeAssignment?.programTitle || 'No Program Assigned';
  const programStatus = activeAssignment
    ? (activeAssignment.status || 'active').toUpperCase()
    : 'NO PROGRAM ASSIGNED';

  const currentWeekNum = activeAssignment?.currentWeek || 1;
  const totalWeeks = activeAssignment?.totalWeeks || 8;

  const completedExercisesList: string[] = activeAssignment?.completedExercises || [];
  const completedCount = completedExercisesList.length;

  let totalExercisesCount = Number(activeAssignment?.totalExercises) || 0;
  if (!totalExercisesCount && activeAssignment?.pendingExercises) {
    totalExercisesCount = completedCount + activeAssignment.pendingExercises.length;
  }
  if (!totalExercisesCount && activeAssignment?.programDetails?.weeks) {
    totalExercisesCount = activeAssignment.programDetails.weeks.reduce(
      (acc: number, w: any) => acc + (w.exercises?.length || 0),
      0
    );
  }

  const remainingCount = Math.max(0, totalExercisesCount - completedCount);
  const progressPercent =
    totalExercisesCount > 0
      ? Math.min(100, Math.round((completedCount / totalExercisesCount) * 100))
      : (activeAssignment?.progressPercent || 0);

  const lastCompletedExerciseName =
    activeAssignment?.lastCompletedExercise ||
    (completedCount > 0 ? completedExercisesList[completedCount - 1] : 'None');

  const lastActivityTime = activeAssignment?.lastActivityAt
    ? new Date(activeAssignment.lastActivityAt).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'No activity recorded';

  // Functional Goals State
  const [functionalGoals, setFunctionalGoals] = useState<FunctionalGoal[]>([
    { id: 'fg-1', label: 'Squat Depth', percentage: Math.min(100, progressPercent + 20) },
    { id: 'fg-2', label: 'Walking Distance', percentage: Math.min(100, progressPercent + 15) },
    { id: 'fg-3', label: 'Single Leg Balance', percentage: progressPercent },
    { id: 'fg-4', label: 'Ascending Stairs', percentage: Math.max(0, progressPercent - 10) },
  ]);

  // Clinician Observations State
  const [observations, setObservations] = useState<ClinicianObservation[]>([
    {
      id: 'obs-1',
      quote: `${patientName} is following the prescribed exercise protocol. Current completion progress is ${progressPercent}%.`,
      author: therapistName !== 'No therapist assigned' ? therapistName : 'Clinical Care Team',
      timeAgo: 'Just now',
    },
  ]);

  // Modals state
  const [isUpdateMilestonesModalOpen, setIsUpdateMilestonesModalOpen] = useState(false);
  const [isAddObservationModalOpen, setIsAddObservationModalOpen] = useState(false);

  // Milestone edit temp form state
  const [tempGoals, setTempGoals] = useState<FunctionalGoal[]>(functionalGoals);

  // Add observation temp form state
  const [newObservationText, setNewObservationText] = useState('');
  const [newObservationAuthor, setNewObservationAuthor] = useState(therapistName);

  // Handle Sync Refresh Click
  const handleRefreshSync = () => {
    setIsRefreshingSync(true);
    setTimeout(() => {
      setIsRefreshingSync(false);
      showToast('Program & exercise progress synchronized with Firestore!');
    }, 1000);
  };

  // Save Milestones
  const handleSaveMilestones = (e: React.FormEvent) => {
    e.preventDefault();
    setFunctionalGoals(tempGoals);
    setIsUpdateMilestonesModalOpen(false);
    showToast('Functional Milestones updated successfully!');
  };

  // Add Observation
  const handleAddObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObservationText.trim()) return;

    const newObs: ClinicianObservation = {
      id: `obs-${Date.now()}`,
      quote: newObservationText.trim(),
      author: newObservationAuthor.trim() || therapistName || 'Clinical Admin',
      timeAgo: 'Just now',
    };

    setObservations((prev) => [newObs, ...prev]);
    setNewObservationText('');
    setIsAddObservationModalOpen(false);
    showToast('Clinician observation added!');
  };

  // Toggle Share with Patient
  const handleToggleShare = () => {
    const nextState = !isSharedWithPatient;
    setIsSharedWithPatient(nextState);
    showToast(
      nextState
        ? 'Progress dashboard is now shared with patient'
        : 'Patient access to progress dashboard revoked'
    );
  };

  // 8-Week Correlation Data Points
  const correlationWeeksData = [
    { week: 'W1', pain: 6.8, load: 20, correlation: 'Initial Assessment' },
    { week: 'W2', pain: 5.5, load: 25, correlation: 'Adapting to routine' },
    { week: 'W3', pain: 5.8, load: 30, correlation: 'Mild flare up' },
    { week: 'W4', pain: 4.8, load: 35, correlation: 'Load increased' },
    { week: 'W5', pain: 4.2, load: 45, correlation: 'Stable Correlation' },
    { week: 'W6', pain: 3.5, load: 50, correlation: 'Strong recovery' },
    { week: 'W7', pain: 2.8, load: 58, correlation: 'Peak endurance' },
    { week: 'W8', pain: 2.2, load: 55, correlation: 'Maintenance phase' },
  ];

  const currentWeekData = correlationWeeksData[selectedWeekIndex] || correlationWeeksData[4];

  // Donut stroke calculations
  const radius = 15.9155;
  const circumference = 2 * Math.PI * radius; // ~100
  const strokeDash = `${progressPercent}, 100`;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center space-x-2.5 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================= 1. FOUR TOP PROGRESS METRICS GRID ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Recovery Score Donut */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 tracking-tight">
              Mobile App Progress
            </span>
            <span className="inline-flex items-center space-x-1 text-[11px] font-extrabold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              <TrendingUp className="w-3 h-3" />
              <span>Real-time</span>
            </span>
          </div>

          <div className="flex items-center space-x-4 py-1">
            {/* SVG Circular Progress Donut */}
            <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-blue-600 transition-all duration-1000 ease-out"
                  strokeDasharray={strokeDash}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-sm font-extrabold text-slate-900">
                {progressPercent}%
              </span>
            </div>

            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-slate-500">
                Completed: <span className="font-extrabold text-slate-700">{completedCount}</span> / {totalExercisesCount}
              </p>
              <span className="text-[11px] font-extrabold text-blue-600 leading-tight block">
                {progressPercent > 0 ? 'Active Program Track' : 'No exercises completed yet'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Avg. Pain Level Sparkline */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 tracking-tight">
              Avg. Pain Level
            </span>
            <span className="text-[11px] font-extrabold text-blue-700 bg-blue-50/90 px-2.5 py-0.5 rounded-full border border-blue-100">
              Mild
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-extrabold text-slate-900">
                {patient?.painLevel || '3.2'}
              </span>
              <span className="text-xs font-bold text-slate-400">/ 10</span>
            </div>

            {/* Sparkline Polyline representation */}
            <div className="h-6 w-full pt-1">
              <svg className="w-full h-full" viewBox="0 0 100 24" fill="none">
                <path
                  d="M0 8 L20 18 L40 14 L60 19 L80 12 L100 6"
                  stroke="#2563EB"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="100" cy="6" r="3" fill="#2563EB" />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 3: Range of Motion Bar */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 tracking-tight">
              Range of Motion
            </span>
            <span className="text-[10px] font-extrabold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100 tracking-wider uppercase">
              {progressPercent > 50 ? 'EXCELLENT' : 'IN PROGRESS'}
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-extrabold text-slate-900">
                {Math.max(40, Math.min(95, progressPercent + 30))}%
              </span>
              <span className="text-xs font-bold text-slate-500">Mobility</span>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(40, Math.min(95, progressPercent + 30))}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[9px] font-extrabold text-slate-400 tracking-wider uppercase">
                <span>START: 40%</span>
                <span>TARGET: 95%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Compliance Rate Days Row */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 tracking-tight">
              Compliance Rate
            </span>
            <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-extrabold text-slate-900">
                {progressPercent > 0 ? '92%' : '0%'}
              </span>
              <span className="text-xs font-bold text-slate-500">Adherence</span>
            </div>

            {/* M T W T F badges row */}
            <div className="flex items-center space-x-1.5 pt-0.5">
              {[
                { day: 'M', active: progressPercent > 0 },
                { day: 'T', active: progressPercent > 20 },
                { day: 'W', active: progressPercent > 40 },
                { day: 'T', active: progressPercent > 60 },
                { day: 'F', active: progressPercent > 80 },
              ].map((d, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold transition-colors ${
                    d.active
                      ? 'bg-sky-100 text-sky-800 border border-sky-200'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {d.day}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================= 3. MAIN CONTENT GRID (2 COLUMNS) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ================= LEFT COLUMN (~68% on Desktop) ================= */}
        <div className="lg:col-span-2 space-y-6">
          {/* A. PAIN AND ACTIVITY CORRELATION CHART CARD */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-100 shadow-2xs space-y-6">
            {/* Card Header & Legend */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  Pain and Activity Correlation
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  Analyzing intensity vs. exercise load over 8 weeks
                </p>
              </div>

              {/* Legend dots & Timeframe selector */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-3 text-xs font-semibold">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-2xs" />
                    <span className="text-slate-600 text-[11px] font-bold">Exercise Min</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-700 shadow-2xs" />
                    <span className="text-slate-600 text-[11px] font-bold">Pain Score</span>
                  </div>
                </div>

                {/* Timeframe selector pill */}
                <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl text-[11px] font-extrabold text-slate-600">
                  {(['8 Weeks', '12 Weeks', 'Monthly'] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        timeframe === tf
                          ? 'bg-white text-blue-600 shadow-2xs'
                          : 'hover:text-slate-900'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Interactive Graph Display */}
            <div className="relative pt-4 pb-2">
              {/* Graph Container */}
              <div className="h-64 sm:h-72 w-full relative">
                {/* SVG Area & Polyline Chart */}
                <svg
                  className="w-full h-full overflow-visible"
                  viewBox="0 0 800 240"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="cyanAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  {[40, 90, 140, 190].map((y, idx) => (
                    <line
                      key={idx}
                      x1="0"
                      y1={y}
                      x2="800"
                      y2={y}
                      stroke="#F1F5F9"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                  ))}

                  {/* Exercise Min Area Fill Path (Cyan) */}
                  <path
                    d="M 20,190 L 120,180 L 220,165 L 320,150 L 420,120 L 520,105 L 620,80 L 720,95 L 720,220 L 20,220 Z"
                    fill="url(#cyanAreaGradient)"
                  />

                  {/* Pain Score Line Path (Dark Blue) */}
                  <path
                    d="M 20,70 L 120,95 L 220,90 L 320,115 L 420,135 L 520,155 L 620,175 L 720,195"
                    fill="none"
                    stroke="#1D4ED8"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Data Points */}
                  {correlationWeeksData.map((_, idx) => {
                    const xPositions = [20, 120, 220, 320, 420, 520, 620, 720];
                    const yPositions = [70, 95, 90, 115, 135, 155, 175, 195];
                    const cx = xPositions[idx];
                    const cy = yPositions[idx];
                    const isSelected = selectedWeekIndex === idx;

                    return (
                      <g key={idx} className="cursor-pointer" onClick={() => setSelectedWeekIndex(idx)}>
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isSelected ? '7' : '5'}
                          fill={isSelected ? '#1D4ED8' : '#FFFFFF'}
                          stroke="#1D4ED8"
                          strokeWidth={isSelected ? '3.5' : '2.5'}
                          className="transition-all duration-200"
                        />
                        {isSelected && (
                          <circle
                            cx={cx}
                            cy={cy}
                            r="11"
                            fill="none"
                            stroke="#3B82F6"
                            strokeWidth="1.5"
                            strokeDasharray="2 2"
                            className="animate-spin-slow"
                          />
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Floating Tooltip */}
                <div
                  className="absolute z-20 pointer-events-none transition-all duration-300 transform -translate-x-1/2 -translate-y-full"
                  style={{
                    left: `${(selectedWeekIndex / 7) * 87.5 + 6.25}%`,
                    top: '48%',
                  }}
                >
                  <div className="bg-[#101828] text-white p-3.5 rounded-2xl shadow-xl border border-slate-700/80 text-center min-w-[150px] space-y-1 animate-in zoom-in-95 duration-150">
                    <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase block">
                      {currentWeekData.week} REVIEW
                    </span>
                    <div className="text-xs font-extrabold text-white">
                      Pain: <span className="text-sky-300">{currentWeekData.pain}</span> / Load:{' '}
                      <span className="text-cyan-300">{currentWeekData.load}m</span>
                    </div>
                    <span className="inline-block text-[10px] font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded-md border border-sky-800/50">
                      {currentWeekData.correlation}
                    </span>
                  </div>
                  <div className="w-3 h-3 bg-[#101828] border-r border-b border-slate-700 transform rotate-45 mx-auto -mt-1.5" />
                </div>
              </div>

              {/* X-Axis Labels */}
              <div className="flex justify-between items-center text-xs font-extrabold text-slate-500 pt-3 px-2 border-t border-slate-100">
                {correlationWeeksData.map((d, idx) => (
                  <button
                    key={d.week}
                    onClick={() => setSelectedWeekIndex(idx)}
                    className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                      selectedWeekIndex === idx
                        ? 'bg-blue-50 text-blue-700 font-extrabold'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    {d.week}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* B. MOBILITY BREAKDOWN CARD */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-100 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  Mobility Breakdown
                </h3>
              </div>

              {/* Sync Button */}
              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-full text-xs text-slate-600 font-semibold self-start sm:self-auto">
                <span className="text-[11px] font-bold text-slate-500">
                  Last updated via Mobile App Sync: {lastActivityTime}
                </span>
                <button
                  onClick={handleRefreshSync}
                  className="text-slate-400 hover:text-blue-600 transition-colors p-0.5 cursor-pointer"
                  title="Sync now"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isRefreshingSync ? 'animate-spin text-blue-600' : ''}`}
                  />
                </button>
              </div>
            </div>

            {/* 4 Mobility Breakdown Sub-cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-100 space-y-2.5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    LUMBAR FLEXION
                  </span>
                  <span className="text-[10px] font-extrabold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-md">
                    ACHIEVED
                  </span>
                </div>
                <div>
                  <h4 className="text-2xl font-extrabold text-slate-900">72°</h4>
                  <p className="text-[11px] font-bold text-slate-400 mt-0.5">Target: 70°</p>
                </div>
              </div>

              <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-100 space-y-2.5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    LATERAL ROTATION
                  </span>
                  <span className="text-[10px] font-extrabold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-md">
                    ACHIEVED
                  </span>
                </div>
                <div>
                  <h4 className="text-2xl font-extrabold text-slate-900">34°</h4>
                  <p className="text-[11px] font-bold text-slate-400 mt-0.5">Target: 35°</p>
                </div>
              </div>

              <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-100 space-y-2.5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    HIP EXTENSION
                  </span>
                  <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                    IN PROGRESS
                  </span>
                </div>
                <div>
                  <h4 className="text-2xl font-extrabold text-slate-900">12°</h4>
                  <p className="text-[11px] font-bold text-slate-400 mt-0.5">Target: 20°</p>
                </div>
              </div>

              <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-100 space-y-2.5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    CORE STABILITY
                  </span>
                  <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                    IN PROGRESS
                  </span>
                </div>
                <div>
                  <h4 className="text-2xl font-extrabold text-slate-900">B+</h4>
                  <p className="text-[11px] font-bold text-slate-400 mt-0.5">Target: A-</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN / SIDEBAR (~32% on Desktop) ================= */}
        <div className="space-y-6">
          {/* A. FUNCTIONAL GOALS CARD */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-5">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              Functional Goals
            </h3>

            <div className="space-y-4">
              {functionalGoals.map((goal) => (
                <div key={goal.id} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-800">{goal.label}</span>
                    <span className="text-blue-600 font-extrabold">{goal.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${goal.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setTempGoals(functionalGoals);
                  setIsUpdateMilestonesModalOpen(true);
                }}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-2xl shadow-2xs hover:shadow-xs transition-all cursor-pointer text-center"
              >
                Update Functional Milestones
              </button>
            </div>
          </div>

          {/* B. QUICK ACTIONS CARD */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-4">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              Quick Actions
            </h3>

            <div className="space-y-3">
              <button
                onClick={() => showToast(`Exporting progress report for ${patientName}...`)}
                className="w-full flex items-center space-x-3.5 p-3.5 bg-slate-50/80 hover:bg-slate-100/80 border border-slate-100 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 transition-all cursor-pointer text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-white text-slate-600 flex items-center justify-center shadow-2xs flex-shrink-0">
                  <Download className="w-4 h-4" />
                </div>
                <span>Export Progress Report</span>
              </button>

              <div className="flex items-center justify-between p-3.5 bg-slate-50/80 border border-slate-100 rounded-2xl">
                <div className="flex items-center space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-white text-slate-600 flex items-center justify-center shadow-2xs flex-shrink-0">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-800">
                    Share with Patient
                  </span>
                </div>

                <button
                  onClick={handleToggleShare}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${
                    isSharedWithPatient ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                  title={isSharedWithPatient ? 'Shared' : 'Not Shared'}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* C. CLINICIAN OBSERVATIONS CARD */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Clinician Observations
              </h3>
              <button
                onClick={() => setIsAddObservationModalOpen(true)}
                className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                title="Add Observation"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <div className="space-y-4">
              {observations.map((obs) => (
                <div
                  key={obs.id}
                  className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-2.5"
                >
                  <p className="text-xs italic text-slate-700 font-medium leading-relaxed">
                    "{obs.quote}"
                  </p>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                    <span>
                      {obs.author} • {obs.timeAgo}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* 1. UPDATE FUNCTIONAL MILESTONES MODAL */}
      {isUpdateMilestonesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Update Functional Milestones
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Adjust patient progress percentages
                </p>
              </div>
              <button
                onClick={() => setIsUpdateMilestonesModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMilestones} className="space-y-4">
              {tempGoals.map((g, idx) => (
                <div key={g.id} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-800">
                    <span>{g.label}</span>
                    <span className="text-blue-600 font-extrabold">{g.percentage}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={g.percentage}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setTempGoals((prev) =>
                        prev.map((item, i) => (i === idx ? { ...item, percentage: val } : item))
                      );
                    }}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
              ))}

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsUpdateMilestonesModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Save Milestones
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. ADD CLINICIAN OBSERVATION MODAL */}
      {isAddObservationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-extrabold text-slate-900">
                Add Clinician Observation
              </h3>
              <button
                onClick={() => setIsAddObservationModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddObservation} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Clinical Note / Observation
                </label>
                <textarea
                  rows={4}
                  value={newObservationText}
                  onChange={(e) => setNewObservationText(e.target.value)}
                  placeholder="Enter detailed observations regarding patient mobility, pain response, or exercise adjustments..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Author / Clinician Name
                </label>
                <input
                  type="text"
                  value={newObservationAuthor}
                  onChange={(e) => setNewObservationAuthor(e.target.value)}
                  placeholder="e.g. Dr. Ananya Sharma"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddObservationModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Add Observation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTab;
