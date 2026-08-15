import React, { useState, useEffect, useCallback } from 'react';
import { InitialsAvatar } from '@/components/ui/InitialsAvatar';
import {
  ArrowLeft,
  Calendar,
  Dumbbell,
  Users,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Copy,
  UserPlus,
  FileText,
  Archive,
  Check,
  Lock,
  Sun,
  Activity,
  Edit3,
  Search,
  Download,
  Clock,
  Sparkles,
  ShieldCheck,
  X,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import type { Program } from './types';
import WeeksTabContent from './components/WeeksTabContent';
import ExercisesTabContent from './components/ExercisesTabContent';
import AssignedPatientsTabContent from './components/AssignedPatientsTabContent';
import OutcomesTabContent from './components/OutcomesTabContent';
import { assignPatientsToProgram, subscribeToAssignedPatients } from '@/services/programService';
import { subscribeToPatients } from '@/services/patientService';
import type { Patient } from '@/patients/types';


interface ProgramDetailsPageProps {
  program?: Program | null;
  onBack?: () => void;
  initialTab?: 'overview' | 'weeks' | 'exercises' | 'patients' | 'outcomes' | 'history';
}

export const ProgramDetailsPage: React.FC<ProgramDetailsPageProps> = ({
  program,
  onBack,
  initialTab = 'overview',
}) => {
  // Active Tab State
  const [activeTab, setActiveTab] = useState<
    'overview' | 'weeks' | 'exercises' | 'patients' | 'outcomes' | 'history'
  >(initialTab);

  // Modals & Toast State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isAuditLogModalOpen, setIsAuditLogModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hoveredChartPoint, setHoveredChartPoint] = useState<number | null>(null);

  // Selected Patients for Modal
  const [selectedPatientIds, setSelectedPatientIds] = useState<string[]>([]);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');

  // Real patients from Firestore (for Assign modal)
  const [realPatients, setRealPatients] = useState<Patient[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(false);

  // Already-assigned patient IDs for duplicate prevention
  const [assignedPatientIds, setAssignedPatientIds] = useState<Set<string>>(new Set());

  // Assigning state
  const [isAssigning, setIsAssigning] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Program details fallback or props
  const programTitle = program?.title || 'Lower Back Recovery Program';
  const programVersion = 'v2.1';
  const programStatus = program?.status || 'published';
  const programDescription =
    program?.description ||
    'A comprehensive 8-week structured protocol designed for patients recovering from acute disc herniation and chronic lumbar instability.';

  const durationWeeks = program?.duration || '8 Weeks';
  const totalExercises = program?.exercisesCount || 42;
  const assignedPatientsCount =
    typeof program?.activePatients === 'number'
      ? program.activePatients
      : program?.activePatients && program.activePatients !== '--'
      ? program.activePatients
      : 0;
  const completionRate = program?.completionRate && program.completionRate !== 'N/A'
    ? program.completionRate
    : '0%';

  // Parse total weeks from program duration string (e.g. "8 Weeks" → 8)
  const parsedTotalWeeks = (() => {
    const match = String(durationWeeks).match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 8;
  })();

  // ─── Load real patients from Firestore when modal opens ───
  useEffect(() => {
    if (!isAssignModalOpen) return;
    setPatientsLoading(true);
    const unsub = subscribeToPatients(
      (patients) => {
        setRealPatients(patients);
        setPatientsLoading(false);
      },
      (err) => {
        console.warn('Failed to load patients for assignment modal:', err);
        setPatientsLoading(false);
      }
    );
    return () => unsub();
  }, [isAssignModalOpen]);

  // ─── Track already-assigned patients for duplicate prevention ───
  useEffect(() => {
    if (!program?.id) return;
    const unsub = subscribeToAssignedPatients(
      program.id,
      (assignments) => {
        setAssignedPatientIds(new Set(assignments.map((a) => a.patientId)));
      }
    );
    return () => unsub();
  }, [program?.id]);

  // ─── Filtered patients for modal (exclude already-assigned) ───
  const filteredPatients = realPatients.filter(
    (p) =>
      !assignedPatientIds.has(p.id) &&
      (
        p.name.toLowerCase().includes(patientSearchQuery.toLowerCase()) ||
        p.condition.toLowerCase().includes(patientSearchQuery.toLowerCase())
      )
  );

  const togglePatientSelection = (id: string) => {
    setSelectedPatientIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Sample data for Chart
  const chartPoints = [
    { week: 'W1', mobility: 32, painReduction: 25 },
    { week: 'W2', mobility: 45, painReduction: 40 },
    { week: 'W3', mobility: 58, painReduction: 55 },
    { week: 'W4', mobility: 72, painReduction: 70 },
    { week: 'W5', mobility: 84, painReduction: 82 },
    { week: 'W6', mobility: 92, painReduction: 89 },
  ];

  return (
    <div className="w-full space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-bold flex items-center space-x-2 animate-in slide-in-from-top duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Title Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          {/* Back Navigation Link */}
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-slate-900 group cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to Programs</span>
            </button>
          )}

          {/* Title + Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              {programTitle}
            </h1>
            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg border border-slate-200/60">
              {programVersion}
            </span>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200/60 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>Published</span>
            </span>
          </div>

          {/* Subtitle Description */}
          <p className="text-sm font-medium text-slate-500 max-w-3xl leading-relaxed">
            {programDescription}
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="shrink-0">
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-full transition-all duration-200 shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Assign Patients</span>
          </button>
        </div>
      </div>

      {/* Top 4 Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Stat Card 1: Duration */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Duration
            </span>
            <div className="w-9 h-9 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              {durationWeeks}
            </div>
            <span className="inline-block mt-2 px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-md">
              Standard Protocol
            </span>
          </div>
        </div>

        {/* Stat Card 2: Exercises */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Exercises
            </span>
            <div className="w-9 h-9 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center">
              <Dumbbell className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              {totalExercises}
            </div>
            <span className="text-xs font-semibold text-slate-400 mt-2 block">
              +3 since v2.0
            </span>
          </div>
        </div>

        {/* Stat Card 3: Assigned Patients */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Assigned Patients
            </span>
            <div className="w-9 h-9 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              {assignedPatientsCount}
            </div>
            <span className="text-xs font-semibold text-slate-400 mt-2 block">
              Across 4 Clinics
            </span>
          </div>
        </div>

        {/* Stat Card 4: Completion Rate */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Completion Rate
            </span>
            <div className="w-9 h-9 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              {completionRate}
            </div>
            {/* Progress Bar Track */}
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-1000"
                style={{ width: completionRate }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs Bar */}
      <div className="border-b border-slate-200/80 overflow-x-auto no-scrollbar">
        <div className="flex items-center space-x-1 sm:space-x-2 pb-px min-w-max">
          {(
            [
              { id: 'overview', label: 'Overview' },
              { id: 'weeks', label: 'Weeks' },
              { id: 'exercises', label: 'Exercises' },
              { id: 'patients', label: 'Assigned Patients' },
              { id: 'outcomes', label: 'Outcomes' },
              { id: 'history', label: 'Version History' },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 sm:px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-blue-600 shadow-xs border border-slate-200/80'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TABS CONTENT */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
          {/* LEFT COLUMN: Main Overview Details (2 Spans) */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Card 1: Program Overview */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Program Overview
              </h2>

              {/* Goals */}
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
                  GOALS
                </span>
                <p className="text-sm text-slate-700 font-medium leading-relaxed">
                  Restore lumbar mobility, strengthen core stabilizers, and manage pain through graded exposure and neural mobilization.
                </p>
              </div>

              {/* Target Conditions */}
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2.5">
                  TARGET CONDITIONS
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {['Sciatica', 'Disc Herniation', 'Spinal Stenosis'].map((tag) => (
                    <span
                      key={tag}
                      className="px-3.5 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Focus Areas */}
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-3">
                  FOCUS AREAS
                </span>
                <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">Lumbar Spine</h4>
                    <p className="text-xs text-slate-500 font-medium">Primary anatomical focus</p>
                  </div>
                </div>

                {/* Difficulty & Success Rate Stats */}
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                      DIFFICULTY
                    </span>
                    <span className="text-sm font-bold text-slate-900 mt-1 block">
                      Intermediate
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                      SUCCESS RATE
                    </span>
                    <span className="text-sm font-extrabold text-blue-600 mt-1 block">
                      92%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Recovery Journey (Interactive Stepper) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Recovery Journey
                </h2>
                <button
                  onClick={() => setActiveTab('weeks')}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  <span>Full Timeline</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Journey Stepper Horizontal Layout */}
              <div className="relative pt-4 pb-2">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative z-10">
                  {/* Step 1 */}
                  <div className="flex sm:flex-col items-start space-x-4 sm:space-x-0 relative">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20 mb-3">
                      <Check className="w-5 h-5 stroke-[3]" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Week 1-2</span>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Pain Management & Mobilization
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex sm:flex-col items-start space-x-4 sm:space-x-0 relative">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20 mb-3">
                      <Check className="w-5 h-5 stroke-[3]" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Week 3-4</span>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Foundational Stability
                      </p>
                    </div>
                  </div>

                  {/* Step 3 (Active) */}
                  <div className="flex sm:flex-col items-start space-x-4 sm:space-x-0 relative">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 ring-4 ring-blue-100 shadow-md shadow-blue-500/20 mb-3">
                      <Sun className="w-5 h-5 animate-spin-slow" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-blue-600 block">Week 5-6</span>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Strength & Dynamic Control
                      </p>
                    </div>
                  </div>

                  {/* Step 4 (Locked) */}
                  <div className="flex sm:flex-col items-start space-x-4 sm:space-x-0 relative">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 mb-3 border border-slate-200">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-400 block">Week 7-8</span>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        Functional Integration
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Program Statistics (Interactive Area & Line Chart) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Program Statistics
                </h2>
                <div className="flex items-center space-x-4 text-xs font-bold">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-900" />
                    <span className="text-slate-600">Avg Mobility Score</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="text-slate-600">Pain Reduction (%)</span>
                  </div>
                </div>
              </div>

              {/* Interactive SVG Graph Area */}
              <div className="relative pt-6">
                <div className="h-64 w-full relative">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200">
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid lines */}
                    <line x1="0" y1="40" x2="500" y2="40" stroke="#f1f5f9" strokeDasharray="4 4" />
                    <line x1="0" y1="90" x2="500" y2="90" stroke="#f1f5f9" strokeDasharray="4 4" />
                    <line x1="0" y1="140" x2="500" y2="140" stroke="#f1f5f9" strokeDasharray="4 4" />

                    {/* Area Fill for Pain Reduction */}
                    <path
                      d="M 0 160 Q 100 130, 200 95 T 400 45 L 500 30 L 500 190 L 0 190 Z"
                      fill="url(#areaGradient)"
                    />

                    {/* Line 1: Pain Reduction (%) */}
                    <path
                      d="M 0 160 Q 100 130, 200 95 T 400 45 L 500 30"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />

                    {/* Line 2: Avg Mobility Score */}
                    <path
                      d="M 0 175 Q 100 145, 200 110 T 400 65 L 500 50"
                      fill="none"
                      stroke="#1e3a8a"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />

                    {/* Data Points */}
                    {chartPoints.map((pt, idx) => {
                      const cx = idx * 100;
                      const cy1 = 190 - pt.painReduction * 1.6;
                      const isHovered = hoveredChartPoint === idx;

                      return (
                        <g key={idx} className="cursor-pointer">
                          <circle
                            cx={cx}
                            cy={cy1}
                            r={isHovered ? '6' : '4'}
                            fill="#3b82f6"
                            stroke="#ffffff"
                            strokeWidth="2"
                            onMouseEnter={() => setHoveredChartPoint(idx)}
                            onMouseLeave={() => setHoveredChartPoint(null)}
                            className="transition-all"
                          />
                        </g>
                      );
                    })}
                  </svg>

                  {/* Tooltip Overlay */}
                  {hoveredChartPoint !== null && (
                    <div
                      className="absolute bg-slate-900 text-white p-2.5 rounded-xl text-[11px] font-bold shadow-xl border border-slate-700 pointer-events-none -translate-x-1/2 -translate-y-full mb-2 z-20"
                      style={{
                        left: `${(hoveredChartPoint / 5) * 100}%`,
                        top: `${190 - chartPoints[hoveredChartPoint].painReduction * 1.6 - 10}px`,
                      }}
                    >
                      <div className="text-slate-400 uppercase tracking-wider mb-1">
                        {chartPoints[hoveredChartPoint].week}
                      </div>
                      <div>Mobility: {chartPoints[hoveredChartPoint].mobility}/100</div>
                      <div className="text-blue-400">
                        Pain Reduction: {chartPoints[hoveredChartPoint].painReduction}%
                      </div>
                    </div>
                  )}
                </div>

                {/* X-Axis Labels */}
                <div className="flex justify-between items-center text-xs font-bold text-slate-400 pt-2 border-t border-slate-100">
                  {chartPoints.map((p) => (
                    <span key={p.week}>{p.week}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Quick Actions & Recent Activity (1 Span) */}
          <div className="space-y-6 sm:space-y-8">
            {/* Card 1: QUICK ACTIONS */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
                QUICK ACTIONS
              </span>

              <div className="space-y-1.5">
                <button
                  onClick={() => showToast('Program duplicated successfully')}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer text-xs font-bold group"
                >
                  <div className="flex items-center space-x-3">
                    <Copy className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                    <span>Duplicate Program</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => setIsAssignModalOpen(true)}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer text-xs font-bold group"
                >
                  <div className="flex items-center space-x-3">
                    <UserPlus className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                    <span>Bulk Assign</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => showToast('Exporting Clinical Protocol PDF...')}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer text-xs font-bold group"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                    <span>Export Clinical PDF</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => showToast('Program archived')}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer text-xs font-bold group"
                >
                  <div className="flex items-center space-x-3">
                    <Archive className="w-4 h-4 text-rose-500" />
                    <span>Archive Program</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* Card 2: RECENT ACTIVITY */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
                RECENT ACTIVITY
              </span>

              <div className="space-y-4">
                {/* Activity Item 1 */}
                <div className="flex items-start space-x-3">
                  <InitialsAvatar name="Dr. Sarah Chen" className="w-9 h-9 text-xs font-bold shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 leading-tight">
                      Dr. Sarah Chen updated 3 exercises in Week 4
                    </p>
                    <span className="text-[11px] text-slate-400 font-medium block mt-1">
                      2 hours ago
                    </span>
                  </div>
                </div>

                {/* Activity Item 2 */}
                <div className="flex items-start space-x-3">
                  <InitialsAvatar name="Marcus Reed" className="w-9 h-9 text-xs font-bold shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 leading-tight">
                      Marcus Reed published v2.1 of the program
                    </p>
                    <span className="text-[11px] text-slate-400 font-medium block mt-1">
                      Yesterday at 4:32 PM
                    </span>
                  </div>
                </div>

                {/* Activity Item 3 */}
                <div className="flex items-start space-x-3">
                  <InitialsAvatar name="Dr. James Wilson" className="w-9 h-9 text-xs font-bold shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 leading-tight">
                      Dr. James Wilson added internal clinical notes
                    </p>
                    <span className="text-[11px] text-slate-400 font-medium block mt-1">
                      Oct 24, 2023
                    </span>
                  </div>
                </div>
              </div>

              {/* View Audit Log Button */}
              <button
                onClick={() => setIsAuditLogModalOpen(true)}
                className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-full transition-colors cursor-pointer text-center block mt-4"
              >
                View Full Audit Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WEEKS TAB CONTENT */}
      {activeTab === 'weeks' && (
        <WeeksTabContent onShowToast={showToast} />
      )}

      {/* EXERCISES TAB CONTENT */}
      {activeTab === 'exercises' && (
        <ExercisesTabContent onShowToast={showToast} />
      )}

      {/* ASSIGNED PATIENTS TAB CONTENT */}
      {activeTab === 'patients' && (
        <AssignedPatientsTabContent
          onShowToast={showToast}
          onOpenAssignModal={() => setIsAssignModalOpen(true)}
          programId={program?.id}
        />
      )}

      {/* OUTCOMES TAB CONTENT */}
      {activeTab === 'outcomes' && (
        <OutcomesTabContent onShowToast={showToast} />
      )}

      {/* VERSION HISTORY TAB CONTENT */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <h2 className="text-xl font-extrabold text-slate-900">Protocol Revision History</h2>
          <div className="space-y-4">
            {[
              { version: 'v2.1 (Current)', date: 'Yesterday at 4:32 PM', author: 'Marcus Reed', notes: 'Added neural flossing exercises to Week 2 & updated difficulty rating.' },
              { version: 'v2.0 Major Update', date: 'Aug 1, 2023', author: 'Dr. Sarah Chen', notes: 'Expanded duration from 6 to 8 weeks with advanced functional integration stage.' },
              { version: 'v1.0 Initial Protocol', date: 'Jan 15, 2023', author: 'Dr. James Wilson', notes: 'Initial clinical publication of Lower Back Recovery Program.' },
            ].map((ver, idx) => (
              <div key={idx} className="p-4 border border-slate-200/70 rounded-2xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-slate-900">{ver.version}</span>
                  <span className="text-xs font-medium text-slate-400">{ver.date}</span>
                </div>
                <p className="text-xs text-slate-600 font-medium">{ver.notes}</p>
                <span className="text-[11px] text-slate-400 font-semibold block">Author: {ver.author}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ASSIGN PATIENTS MODAL */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-6">
            <button
              onClick={() => {
                setIsAssignModalOpen(false);
                setSelectedPatientIds([]);
                setPatientSearchQuery('');
              }}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Assign Patients to Program</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Select patients to assign to &ldquo;{programTitle}&rdquo;
              </p>
              {assignedPatientIds.size > 0 && (
                <p className="text-[11px] text-blue-600 font-medium mt-1">
                  {assignedPatientIds.size} patient{assignedPatientIds.size > 1 ? 's' : ''} already assigned (hidden)
                </p>
              )}
            </div>

            {/* Search input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient name or condition..."
                value={patientSearchQuery}
                onChange={(e) => setPatientSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            {/* Patient List checkboxes */}
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {patientsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                  <span className="ml-2 text-xs font-medium text-slate-500">Loading patients…</span>
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="py-8 text-center">
                  <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-500">
                    {realPatients.length === 0
                      ? 'No patients found in the system.'
                      : patientSearchQuery
                      ? 'No patients match your search.'
                      : 'All patients are already assigned to this program.'}
                  </p>
                </div>
              ) : (
                filteredPatients.map((pt) => {
                  const isChecked = selectedPatientIds.includes(pt.id);
                  return (
                    <div
                      key={pt.id}
                      onClick={() => togglePatientSelection(pt.id)}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-blue-50/60 border-blue-300'
                          : 'bg-white border-slate-200/70 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <InitialsAvatar name={pt.name} className="w-9 h-9 text-xs font-bold shrink-0" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{pt.name}</h4>
                          <p className="text-[11px] text-slate-500">{pt.condition}</p>
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 ${
                          isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-bold text-slate-400">
                {selectedPatientIds.length > 0 ? `${selectedPatientIds.length} selected` : 'None selected'}
              </span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    setIsAssignModalOpen(false);
                    setSelectedPatientIds([]);
                    setPatientSearchQuery('');
                  }}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  disabled={selectedPatientIds.length === 0 || isAssigning}
                  onClick={async () => {
                    if (!program?.id || selectedPatientIds.length === 0) return;
                    setIsAssigning(true);
                    try {
                      const selectedPatients = realPatients
                        .filter((p) => selectedPatientIds.includes(p.id))
                        .map((p) => ({
                          id: p.id,
                          name: p.name,
                          avatar: p.avatarUrl,
                          condition: p.condition,
                          email: p.email,
                          phone: p.phone,
                        }));

                      const results = await assignPatientsToProgram(
                        program.id,
                        programTitle,
                        selectedPatients,
                        parsedTotalWeeks
                      );

                      const newAssignments = results.filter((r) => r.isNew).length;
                      const duplicates = results.filter((r) => !r.isNew).length;

                      setIsAssignModalOpen(false);
                      setSelectedPatientIds([]);
                      setPatientSearchQuery('');

                      if (duplicates > 0 && newAssignments === 0) {
                        showToast(`All selected patients are already assigned to this program.`);
                      } else if (duplicates > 0) {
                        showToast(`Assigned ${newAssignments} patient(s). ${duplicates} were already assigned.`);
                      } else {
                        showToast(`Successfully assigned ${newAssignments} patient(s) to ${programTitle}!`);
                      }
                    } catch (err: any) {
                      console.error('Error assigning patients:', err);
                      showToast(`Assignment failed: ${err.message || 'Unknown error'}`);
                    } finally {
                      setIsAssigning(false);
                    }
                  }}
                  className="inline-flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl cursor-pointer shadow-md shadow-blue-500/20 transition-all"
                >
                  {isAssigning && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isAssigning ? 'Assigning…' : 'Confirm Assignment'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL AUDIT LOG MODAL */}
      {isAuditLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-6">
            <button
              onClick={() => setIsAuditLogModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Program Audit Log</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Full chronological activity history for {programTitle}
              </p>
            </div>

            <div className="space-y-4 max-h-80 overflow-y-auto pr-1 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-900">Dr. Sarah Chen updated 3 exercises in Week 4</span>
                <p className="text-slate-500">Today at 3:15 PM • IP: 192.168.1.42</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-900">Marcus Reed published version v2.1</span>
                <p className="text-slate-500">Yesterday at 4:32 PM • IP: 192.168.1.18</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-900">Dr. James Wilson added clinical notes</span>
                <p className="text-slate-500">Oct 24, 2023 at 11:20 AM • IP: 192.168.1.10</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-900">Program assigned to 14 new patients</span>
                <p className="text-slate-500">Oct 18, 2023 at 09:45 AM • Auto-trigger</p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setIsAuditLogModalOpen(false)}
                className="px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Close Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramDetailsPage;
