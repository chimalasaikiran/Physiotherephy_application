import React, { useState } from 'react';
import {
  Users,
  Activity,
  Award,
  ShieldCheck,
  Zap,
  Sparkles,
  ChevronRight,
  MoreVertical,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  FileText,
  User,
  Send,
  Eye,
} from 'lucide-react';

interface PatientsAnalyticsTabProps {
  onNavigateToPatients?: () => void;
  onSelectPatient?: (patientId: string) => void;
}

export const PatientsAnalyticsTab: React.FC<PatientsAnalyticsTabProps> = ({
  onNavigateToPatients,
  onSelectPatient,
}) => {
  // Active hovered bar for Demographics chart
  const [hoveredAgeGroup, setHoveredAgeGroup] = useState<string | null>(null);
  // Active row dropdown menu state
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
  // AI Audit modal/toast notification state
  const [isGeneratingAudit, setIsGeneratingAudit] = useState(false);
  const [auditMessage, setAuditMessage] = useState<string | null>(null);

  const handleGenerateAudit = () => {
    setIsGeneratingAudit(true);
    setTimeout(() => {
      setIsGeneratingAudit(false);
      setAuditMessage('Full AI Clinical Audit report generated and ready for review!');
      setTimeout(() => setAuditMessage(null), 4000);
    }, 1200);
  };

  // Demographics mock data matching Figma grouped bar chart
  const demographicData = [
    { age: 'Under 25', male: 145, female: 195, other: 40, malePct: 45, femalePct: 62, otherPct: 20 },
    { age: '25-40', male: 290, female: 270, other: 60, malePct: 92, femalePct: 84, otherPct: 30 },
    { age: '41-60', male: 220, female: 240, other: 70, malePct: 70, femalePct: 76, otherPct: 35 },
    { age: '60+', male: 165, female: 150, other: 45, malePct: 52, femalePct: 48, otherPct: 22 },
  ];

  // Top conditions mock data
  const topConditions = [
    { name: 'Lower Back Pain', count: '320 pts', percentage: 85, color: 'bg-gradient-to-r from-blue-600 to-blue-500' },
    { name: 'ACL Recovery', count: '215 pts', percentage: 62, color: 'bg-gradient-to-r from-indigo-600 to-blue-600' },
    { name: 'Shoulder Impingement', count: '158 pts', percentage: 45, color: 'bg-gradient-to-r from-purple-600 to-indigo-500' },
    { name: 'Neck Cervical', count: '94 pts', percentage: 28, color: 'bg-gradient-to-r from-teal-500 to-cyan-500' },
  ];

  // Top improving patients table data matching Figma exactly
  const topImprovingPatients = [
    {
      id: '#OM-4421',
      name: 'Arjun Iyer',
      initials: 'AI',
      avatarBg: 'bg-blue-100 text-blue-700',
      program: 'Lumber Spine Rehab',
      initialScore: '34%',
      recoveryDelta: '+42%',
      deltaValue: 42,
      status: 'EXCEPTIONAL',
      statusStyle: 'bg-blue-50 text-blue-700 border border-blue-200/80',
    },
    {
      id: '#OM-9812',
      name: 'Priya Kapoor',
      initials: 'PK',
      avatarBg: 'bg-purple-100 text-purple-700',
      program: 'Post-Op ACL Stage 2',
      initialScore: '12%',
      recoveryDelta: '+38%',
      deltaValue: 38,
      status: 'AHEAD OF SCHEDULE',
      statusStyle: 'bg-sky-50 text-sky-700 border border-sky-200/80',
    },
    {
      id: '#OM-1102',
      name: 'Rohan Deshmukh',
      initials: 'RD',
      avatarBg: 'bg-teal-100 text-teal-700',
      program: 'Cervical Stability',
      initialScore: '58%',
      recoveryDelta: '+29%',
      deltaValue: 29,
      status: 'ON TRACK',
      statusStyle: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    },
    {
      id: '#OM-5598',
      name: 'Sanya Verma',
      initials: 'SV',
      avatarBg: 'bg-indigo-100 text-indigo-700',
      program: 'Shoulder Rotator Cuff',
      initialScore: '20%',
      recoveryDelta: '+24%',
      deltaValue: 24,
      status: 'ON TRACK',
      statusStyle: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 font-sans">
      {/* Audit Toast Notification */}
      {auditMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-800 flex items-center space-x-3 transition-all animate-bounce">
          <Sparkles className="w-5 h-5 text-blue-400" />
          <span className="text-sm font-semibold">{auditMessage}</span>
        </div>
      )}

      {/* Top 4 Sub-Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Patients */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  Total Patients
                </span>
              </div>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[11px] font-extrabold">
                +4.2%
              </span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              1,248
            </div>
          </div>
          <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full w-[78%]" />
          </div>
        </div>

        {/* Card 2: Active in Programs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  Active in Programs
                </span>
              </div>
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[11px] font-extrabold">
                +12%
              </span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              842
            </div>
          </div>
          <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-900 h-full rounded-full w-[68%]" />
          </div>
        </div>

        {/* Card 3: Avg. Recovery Score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                  <Award className="w-4 h-4" />
                </div>
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  Avg. Recovery Score
                </span>
              </div>
              <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full text-[11px] font-extrabold">
                +3.1%
              </span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              82%
            </div>
          </div>
          <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-700 h-full rounded-full w-[82%]" />
          </div>
        </div>

        {/* Card 4: Patient Retention */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  Patient Retention
                </span>
              </div>
              <span className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full text-[11px] font-extrabold">
                Stable
              </span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              94%
            </div>
          </div>
          <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-teal-700 h-full rounded-full w-[94%]" />
          </div>
        </div>
      </div>

      {/* Middle Grid: Demographics & Growth (Left) & Top Conditions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Demographics & Growth (8 Columns) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Demographics & Growth
              </h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                Age distribution breakdown across patient gender identities
              </p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-bold">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                <span className="text-slate-600">Male</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block" />
                <span className="text-slate-600">Female</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
                <span className="text-slate-600">Other</span>
              </div>
            </div>
          </div>

          {/* Grouped Bar Chart Display */}
          <div className="h-64 flex items-end justify-between gap-4 sm:gap-8 px-4 pt-6 pb-2 border-b border-slate-100">
            {demographicData.map((item) => {
              const isHovered = hoveredAgeGroup === item.age;
              return (
                <div
                  key={item.age}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                  onMouseEnter={() => setHoveredAgeGroup(item.age)}
                  onMouseLeave={() => setHoveredAgeGroup(null)}
                >
                  {/* Tooltip on hover */}
                  {isHovered && (
                    <div className="mb-2 bg-slate-900 text-white text-[10px] py-1 px-2.5 rounded-lg shadow-lg font-bold flex space-x-2 z-10 animate-in fade-in zoom-in duration-150">
                      <span>M: {item.male}</span>
                      <span>F: {item.female}</span>
                      <span>O: {item.other}</span>
                    </div>
                  )}

                  <div className="w-full flex items-end justify-center space-x-1 sm:space-x-2 h-full max-h-[190px]">
                    {/* Male Bar */}
                    <div
                      style={{ height: `${item.malePct}%` }}
                      className="w-3.5 sm:w-4 bg-blue-600 rounded-t-md transition-all duration-300 group-hover:brightness-110"
                    />
                    {/* Female Bar */}
                    <div
                      style={{ height: `${item.femalePct}%` }}
                      className="w-3.5 sm:w-4 bg-teal-500 rounded-t-md transition-all duration-300 group-hover:brightness-110"
                    />
                    {/* Other Bar */}
                    <div
                      style={{ height: `${item.otherPct}%` }}
                      className="w-3.5 sm:w-4 bg-slate-300 rounded-t-md transition-all duration-300 group-hover:bg-slate-400"
                    />
                  </div>

                  <span className="text-xs font-bold text-slate-600 mt-4">
                    {item.age}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Conditions (4 Columns) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight mb-6">
              Top Conditions
            </h3>

            <div className="space-y-5">
              {topConditions.map((cond) => (
                <div key={cond.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
                    <span className="text-slate-800">{cond.name}</span>
                    <span className="text-slate-500 font-semibold">{cond.count}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5">
                    <div
                      style={{ width: `${cond.percentage}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${cond.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lower Grid: Recovery Rates by Cohort (Left) & Clinical Insights (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Recovery Rates by Cohort (8 Columns) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Recovery Rates by Cohort
              </h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                Comparing therapeutic progress across age demographics
              </p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-extrabold">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                <span className="text-slate-700 tracking-wider uppercase text-[10px]">
                  ACTUAL
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full border border-teal-500 bg-teal-50 inline-block" />
                <span className="text-slate-500 tracking-wider uppercase text-[10px]">
                  BENCHMARK
                </span>
              </div>
            </div>
          </div>

          {/* Smooth SVG Spline Chart */}
          <div className="relative w-full overflow-x-auto">
            <svg
              viewBox="0 0 650 200"
              className="w-full h-52 overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="actualAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="40" y1="30" x2="610" y2="30" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="80" x2="610" y2="80" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="130" x2="610" y2="130" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="170" x2="610" y2="170" stroke="#f1f5f9" strokeWidth="1" />

              {/* Gradient Area under Actual curve */}
              <path
                d="M 40,150 C 130,140 220,110 310,95 C 400,80 470,45 610,65 L 610,170 L 40,170 Z"
                fill="url(#actualAreaGradient)"
              />

              {/* Benchmark Line (Dashed Teal Curve) */}
              <path
                d="M 40,165 C 130,155 220,135 310,120 C 400,105 470,85 610,95"
                fill="none"
                stroke="#14b8a6"
                strokeWidth="2"
                strokeDasharray="4 4"
              />

              {/* Actual Line (Solid Smooth Blue Spline) */}
              <path
                d="M 40,150 C 130,140 220,110 310,95 C 400,80 470,45 610,65"
                fill="none"
                stroke="#1d4ed8"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Interactive Tooltip Node at Week 12 */}
              <line
                x1="475"
                y1="45"
                x2="475"
                y2="170"
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <circle cx="475" cy="45" r="5" fill="#1d4ed8" stroke="#ffffff" strokeWidth="2.5" />

              {/* Floating Tooltip Pill */}
              <g transform="translate(435, 10)">
                <rect
                  x="0"
                  y="0"
                  width="80"
                  height="26"
                  rx="6"
                  fill="#ffffff"
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))"
                />
                <text
                  x="40"
                  y="17"
                  textAnchor="middle"
                  fill="#0f172a"
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  35-40: 85%
                </text>
              </g>

              {/* X-Axis Labels */}
              <text x="40" y="192" fill="#94a3b8" fontSize="10" fontWeight="bold">
                WEEK 0
              </text>
              <text x="180" y="192" fill="#94a3b8" fontSize="10" fontWeight="bold">
                WEEK 4
              </text>
              <text x="320" y="192" fill="#94a3b8" fontSize="10" fontWeight="bold">
                WEEK 8
              </text>
              <text x="460" y="192" fill="#94a3b8" fontSize="10" fontWeight="bold">
                WEEK 12
              </text>
              <text x="580" y="192" fill="#94a3b8" fontSize="10" fontWeight="bold">
                WEEK 16
              </text>
            </svg>
          </div>
        </div>

        {/* Clinical Insights Card (4 Columns) */}
        <div className="lg:col-span-4 bg-gradient-to-b from-blue-50/70 via-indigo-50/40 to-slate-50 p-6 rounded-3xl border border-blue-100/90 shadow-xs flex flex-col justify-between relative overflow-hidden">
          {/* Watermark Icon */}
          <Zap className="w-32 h-32 text-blue-500/5 absolute -right-6 -bottom-6 pointer-events-none" />

          <div>
            <div className="flex items-center space-x-2 text-blue-700 font-extrabold text-sm mb-4">
              <Zap className="w-4 h-4 fill-blue-600 text-blue-600" />
              <span>Clinical Insights</span>
            </div>

            <div className="space-y-4">
              {/* Insight 1 */}
              <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-blue-100/70 shadow-2xs">
                <h4 className="text-xs font-extrabold text-blue-700 mb-1">
                  Recovery Speedup
                </h4>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Patients aged 25-40 show{' '}
                  <span className="font-extrabold text-blue-600">15% faster recovery</span> in
                  ACL programs compared to Q1 baseline.
                </p>
              </div>

              {/* Insight 2 */}
              <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-blue-100/70 shadow-2xs">
                <h4 className="text-xs font-extrabold text-blue-700 mb-1">
                  Retention Risk
                </h4>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Post-operative patients over 60 have a{' '}
                  <span className="font-extrabold text-rose-600">20% drop-off rate</span> after
                  week 8. Intervention recommended.
                </p>
              </div>

              {/* Insight 3 */}
              <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-blue-100/70 shadow-2xs">
                <h4 className="text-xs font-extrabold text-blue-700 mb-1">Top Modal</h4>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Lower Back Pain patients respond best to combined{' '}
                  <span className="font-extrabold text-blue-700 underline decoration-blue-300 cursor-pointer">
                    Manual + Exercise
                  </span>{' '}
                  protocols.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGenerateAudit}
              disabled={isGeneratingAudit}
              className="w-full py-3 px-4 bg-white hover:bg-blue-50/80 text-blue-700 font-extrabold text-xs rounded-2xl border border-blue-200 transition-all shadow-2xs flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {isGeneratingAudit ? (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-blue-600" />
              )}
              <span>
                {isGeneratingAudit ? 'Analyzing Insights...' : 'Generate Full AI Audit'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Card: Top Improving Patients Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Top Improving Patients
            </h3>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Patients with the highest recovery delta this month
            </p>
          </div>
          {onNavigateToPatients && (
            <button
              onClick={onNavigateToPatients}
              className="text-xs font-extrabold text-blue-600 hover:text-blue-800 flex items-center space-x-1 cursor-pointer"
            >
              <span>View All Patients</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 border-y border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">PATIENT NAME</th>
                <th className="py-3.5 px-4">CURRENT PROGRAM</th>
                <th className="py-3.5 px-4">INITIAL SCORE</th>
                <th className="py-3.5 px-4">RECOVERY DELTA</th>
                <th className="py-3.5 px-4">CLINICAL STATUS</th>
                <th className="py-3.5 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {topImprovingPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50/60 transition-colors">
                  {/* Name & Avatar */}
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-xs ${patient.avatarBg}`}
                      >
                        {patient.initials}
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900 block text-sm">
                          {patient.name}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400">
                          ID: {patient.id}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Current Program */}
                  <td className="py-4 px-4 text-slate-800 font-semibold">
                    {patient.program}
                  </td>

                  {/* Initial Score */}
                  <td className="py-4 px-4 text-slate-500 font-bold">
                    {patient.initialScore}
                  </td>

                  {/* Recovery Delta */}
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-600 font-extrabold text-sm">
                        {patient.recoveryDelta}
                      </span>
                      <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${patient.deltaValue}%` }}
                          className="bg-blue-600 h-full rounded-full"
                        />
                      </div>
                    </div>
                  </td>

                  {/* Clinical Status */}
                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-full font-extrabold text-[10px] uppercase tracking-wider inline-block ${patient.statusStyle}`}
                    >
                      {patient.status}
                    </span>
                  </td>

                  {/* Action Dropdown */}
                  <td className="py-4 px-4 text-right relative">
                    <button
                      onClick={() =>
                        setActiveActionMenu(
                          activeActionMenu === patient.id ? null : patient.id
                        )
                      }
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      aria-label="Actions"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Popover Action Menu */}
                    {activeActionMenu === patient.id && (
                      <div className="absolute right-4 top-12 w-44 bg-white rounded-xl shadow-xl border border-slate-100 z-30 py-1.5 text-left animate-in fade-in zoom-in duration-150">
                        <button
                          onClick={() => {
                            setActiveActionMenu(null);
                            if (onSelectPatient) onSelectPatient(patient.id);
                          }}
                          className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          <span>View Profile</span>
                        </button>
                        <button
                          onClick={() => setActiveActionMenu(null)}
                          className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          <span>Download Report</span>
                        </button>
                        <button
                          onClick={() => setActiveActionMenu(null)}
                          className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                        >
                          <Send className="w-3.5 h-3.5 text-slate-400" />
                          <span>Send Message</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PatientsAnalyticsTab;
