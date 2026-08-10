import React, { useState } from 'react';
import {
  ShieldCheck,
  TrendingDown,
  Star,
  Clock,
  ArrowUpRight,
  ChevronRight,
  X,
  FileText,
  UserCheck,
  Activity,
  Filter,
  CheckCircle2,
  Award
} from 'lucide-react';

interface OutcomesTabContentProps {
  onShowToast: (message: string) => void;
}

interface PerformerLog {
  id: string;
  name: string;
  condition: string;
  weeksProgress: string;
  status: 'Completed' | 'Active';
  painScore: string;
  avatar: string;
  romImprovement: string;
}

export const OutcomesTabContent: React.FC<OutcomesTabContentProps> = ({ onShowToast }) => {
  const [hoveredWeekIndex, setHoveredWeekIndex] = useState<number | null>(4); // Default week 5 active
  const [selectedPerformer, setSelectedPerformer] = useState<PerformerLog | null>(null);
  const [isViewAllLogsOpen, setIsViewAllLogsOpen] = useState(false);
  const [selectedDemographic, setSelectedDemographic] = useState<string | null>(null);

  // Weekly Trend Chart Data
  const weeklyTrendData = [
    { week: 'Week 1', pain: 8.5, rom: 32, label: 'W1', note: 'Initial baseline assessment & acute pain management.' },
    { week: 'Week 2', pain: 7.8, rom: 40, label: 'W2', note: 'Gradual reduction in peripheral nerve tension.' },
    { week: 'Week 3', pain: 6.9, rom: 51, label: 'W3', note: 'Core bracing activation stabilized lumbar spine.' },
    { week: 'Week 4', pain: 5.6, rom: 63, label: 'W4', note: 'Significant flexion/extension mobility gain.' },
    { week: 'Week 5', pain: 4.2, rom: 74, label: 'W5', note: 'Transition to dynamic load and endurance training.' },
    { week: 'Week 6', pain: 2.9, rom: 82, label: 'W6', note: 'Functional movement patterns restored without pain.' },
    { week: 'Week 7', pain: 1.9, rom: 88, label: 'W7', note: 'High compliance & sustained strength improvements.' },
    { week: 'Week 8', pain: 1.4, rom: 94, label: 'W8', note: 'Program completion with max functional recovery.' },
  ];

  // Top Performers List
  const performers: PerformerLog[] = [
    {
      id: 'perf-1',
      name: 'Sarah Jenkins',
      condition: 'Post-Disc Recovery',
      weeksProgress: '10/10 Weeks',
      status: 'Completed',
      painScore: '0/10',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
      romImprovement: '+48° Flexion',
    },
    {
      id: 'perf-2',
      name: 'Marcus Thorne',
      condition: 'Lumbar Strain',
      weeksProgress: '8/10 Weeks',
      status: 'Active',
      painScore: '1/10',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      romImprovement: '+35° Flexion',
    },
    {
      id: 'perf-3',
      name: 'Robert Chen',
      condition: 'General Stiffness',
      weeksProgress: '10/10 Weeks',
      status: 'Completed',
      painScore: '2/10',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      romImprovement: '+42° Flexion',
    },
    {
      id: 'perf-4',
      name: 'Elena Rostova',
      condition: 'Sciatica Neural Tension',
      weeksProgress: '9/10 Weeks',
      status: 'Active',
      painScore: '1/10',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      romImprovement: '+40° Flexion',
    },
    {
      id: 'perf-5',
      name: 'David Miller',
      condition: 'Lumbar Stenosis',
      weeksProgress: '10/10 Weeks',
      status: 'Completed',
      painScore: '1/10',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
      romImprovement: '+38° Flexion',
    },
  ];

  // SVG Chart Dimensions & Helpers
  const svgWidth = 800;
  const svgHeight = 260;
  const paddingX = 40;
  const paddingY = 30;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  // Pain (range 0 to 10 -> map to Y height)
  const getPainY = (val: number) => {
    const norm = (val - 0) / 10;
    return paddingY + (1 - norm) * chartHeight;
  };

  // ROM (range 0 to 100 -> map to Y height)
  const getRomY = (val: number) => {
    const norm = (val - 0) / 100;
    return paddingY + (1 - norm) * chartHeight;
  };

  const getX = (index: number) => {
    return paddingX + (index / (weeklyTrendData.length - 1)) * chartWidth;
  };

  // Build SVG Path string for Pain (red)
  const painPoints = weeklyTrendData.map((d, i) => ({ x: getX(i), y: getPainY(d.pain) }));
  const painPathD = painPoints.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = arr[i - 1];
    const cx1 = prev.x + (pt.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (pt.x - prev.x) / 2;
    const cy2 = pt.y;
    return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${pt.x} ${pt.y}`;
  }, '');

  // Build SVG Path string for ROM (blue)
  const romPoints = weeklyTrendData.map((d, i) => ({ x: getX(i), y: getRomY(d.rom) }));
  const romPathD = romPoints.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = arr[i - 1];
    const cx1 = prev.x + (pt.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (pt.x - prev.x) / 2;
    const cy2 = pt.y;
    return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${pt.x} ${pt.y}`;
  }, '');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. TOP 4 METRIC CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Recovery Success Rate */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-200 transition-all group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center transition-transform group-hover:scale-105">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-0.5 px-2.5 py-1 bg-cyan-50 text-cyan-700 font-extrabold text-xs rounded-full border border-cyan-200/50">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>2.4%</span>
            </span>
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Recovery Success Rate
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
              95%
            </div>
          </div>
        </div>

        {/* Card 2: Avg. Pain Reduction */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-200 transition-all group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center transition-transform group-hover:scale-105">
              <TrendingDown className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold italic text-slate-400">
              vs baseline
            </span>
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Avg. Pain Reduction
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
              -62%
            </div>
            <span className="text-xs font-semibold text-slate-400 mt-1 block">
              VAS Score Improvement
            </span>
          </div>
        </div>

        {/* Card 3: Patient Satisfaction */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-200 transition-all group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center transition-transform group-hover:scale-105">
              <Star className="w-5 h-5 fill-teal-600 text-teal-600" />
            </div>
            <span className="text-xs font-semibold text-slate-400">
              1,248 reviews
            </span>
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Patient Satisfaction
            </span>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                4.9
              </span>
              <span className="text-lg font-extrabold text-slate-400">/5</span>
            </div>
          </div>
        </div>

        {/* Card 4: Avg. Completion */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-200 transition-all group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center transition-transform group-hover:scale-105">
              <Clock className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 font-extrabold text-xs rounded-full border border-blue-200/60">
              On Target
            </span>
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Avg. Completion
            </span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                8.4
              </span>
              <span className="text-lg font-bold text-slate-400">wks</span>
            </div>
            <span className="text-xs font-semibold text-slate-400 mt-1 block">
              Target: 10 weeks
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN CHART CARD: Pain vs. Mobility Trend */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        {/* Header flex */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Pain vs. Mobility Trend
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Weekly aggregate clinical progress across all program phases.
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center space-x-6 text-xs font-bold shrink-0">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 shadow-xs" />
              <span className="text-slate-700">Avg. Pain Level</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-blue-600 shadow-xs" />
              <span className="text-slate-700">Range of Motion</span>
            </div>
          </div>
        </div>

        {/* SVG Curve Chart */}
        <div className="relative pt-4 pb-2">
          <div className="w-full h-64 sm:h-72 relative">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                {/* ROM Gradient */}
                <linearGradient id="romGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                </linearGradient>
                {/* Pain Gradient */}
                <linearGradient id="painGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1={paddingX} y1={paddingY + chartHeight * 0.33} x2={svgWidth - paddingX} y2={paddingY + chartHeight * 0.33} stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1={paddingX} y1={paddingY + chartHeight * 0.66} x2={svgWidth - paddingX} y2={paddingY + chartHeight * 0.66} stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1={paddingX} y1={paddingY + chartHeight} x2={svgWidth - paddingX} y2={paddingY + chartHeight} stroke="#e2e8f0" />

              {/* Vertical Guide Line on Hover */}
              {hoveredWeekIndex !== null && (
                <line
                  x1={getX(hoveredWeekIndex)}
                  y1={paddingY}
                  x2={getX(hoveredWeekIndex)}
                  y2={paddingY + chartHeight}
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
              )}

              {/* Range of Motion Area Fill (Blue) */}
              <path
                d={`${romPathD} L ${getX(weeklyTrendData.length - 1)} ${paddingY + chartHeight} L ${paddingX} ${paddingY + chartHeight} Z`}
                fill="url(#romGradient)"
              />

              {/* Range of Motion Smooth Line (Blue) */}
              <path
                d={romPathD}
                fill="none"
                stroke="#1d4ed8"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Avg. Pain Level Smooth Line (Red) */}
              <path
                d={painPathD}
                fill="none"
                stroke="#ef4444"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Interactive Data Points */}
              {weeklyTrendData.map((d, idx) => {
                const cx = getX(idx);
                const cyPain = getPainY(d.pain);
                const cyRom = getRomY(d.rom);
                const isHovered = hoveredWeekIndex === idx;

                return (
                  <g
                    key={d.week}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredWeekIndex(idx)}
                  >
                    {/* Invisible hover trigger column */}
                    <rect
                      x={cx - 25}
                      y={paddingY}
                      width="50"
                      height={chartHeight}
                      fill="transparent"
                    />

                    {/* ROM point (blue) */}
                    <circle
                      cx={cx}
                      cy={cyRom}
                      r={isHovered ? '7' : '4.5'}
                      fill="#1d4ed8"
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      className="transition-all duration-200"
                    />

                    {/* Pain point (red) */}
                    <circle
                      cx={cx}
                      cy={cyPain}
                      r={isHovered ? '7' : '4.5'}
                      fill="#ef4444"
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      className="transition-all duration-200"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredWeekIndex !== null && (
              <div
                className="absolute bg-slate-900 text-white p-3 rounded-2xl text-xs font-bold shadow-2xl border border-slate-700 pointer-events-none -translate-x-1/2 -translate-y-full mb-3 z-30 transition-all duration-150 min-w-[200px]"
                style={{
                  left: `${(getX(hoveredWeekIndex) / svgWidth) * 100}%`,
                  top: `${Math.min(getPainY(weeklyTrendData[hoveredWeekIndex].pain), getRomY(weeklyTrendData[hoveredWeekIndex].rom)) - 10}px`,
                }}
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
                  <span className="text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                    {weeklyTrendData[hoveredWeekIndex].week}
                  </span>
                  <span className="text-[10px] text-blue-400 font-semibold">Clinical Checkpoint</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-rose-400">
                    <span>Avg Pain Score:</span>
                    <span className="font-extrabold">{weeklyTrendData[hoveredWeekIndex].pain}/10</span>
                  </div>
                  <div className="flex items-center justify-between text-blue-400">
                    <span>Range of Motion:</span>
                    <span className="font-extrabold">{weeklyTrendData[hoveredWeekIndex].rom}%</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-300 font-normal mt-2 pt-1.5 border-t border-slate-800/80 leading-tight">
                  {weeklyTrendData[hoveredWeekIndex].note}
                </p>
              </div>
            )}
          </div>

          {/* X-Axis Labels Row */}
          <div className="flex justify-between items-center text-xs font-bold text-slate-400 pt-3 border-t border-slate-100">
            {weeklyTrendData.map((d, i) => (
              <button
                key={d.week}
                onClick={() => setHoveredWeekIndex(i)}
                className={`transition-colors cursor-pointer ${
                  hoveredWeekIndex === i ? 'text-blue-600 font-extrabold scale-110' : 'hover:text-slate-700'
                }`}
              >
                {d.week}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. BOTTOM TWO COLUMNS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
        {/* LEFT COLUMN: Demographic Efficacy */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Demographic Efficacy
            </h2>
            <button
              onClick={() => onShowToast('Showing detailed clinical cohort segmentation...')}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
              title="Filter Demographics"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>

          {/* Age Group Progress Bars */}
          <div className="space-y-5">
            {/* Bar 1 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700">Age Group: 25-40</span>
                <span className="text-blue-600 font-extrabold">98.2%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-1000"
                  style={{ width: '98.2%' }}
                />
              </div>
            </div>

            {/* Bar 2 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700">Age Group: 41-60</span>
                <span className="text-blue-600 font-extrabold">94.5%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-1000"
                  style={{ width: '94.5%' }}
                />
              </div>
            </div>

            {/* Bar 3 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700">Age Group: 60+</span>
                <span className="text-blue-600 font-extrabold">89.1%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-1000"
                  style={{ width: '89.1%' }}
                />
              </div>
            </div>
          </div>

          {/* Two Sub-Cards for Target Conditions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Card A: Sciatica */}
            <div
              onClick={() => setSelectedDemographic('Sciatica')}
              className="bg-slate-50 hover:bg-blue-50/50 p-4 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all cursor-pointer group"
            >
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block group-hover:text-blue-600">
                SCIATICA
              </span>
              <div className="flex items-baseline space-x-1.5 mt-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-blue-600">
                  92%
                </span>
                <span className="text-xs font-semibold text-slate-500">Success</span>
              </div>
            </div>

            {/* Card B: Disc Herniation */}
            <div
              onClick={() => setSelectedDemographic('Disc Herniation')}
              className="bg-slate-50 hover:bg-blue-50/50 p-4 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all cursor-pointer group"
            >
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block group-hover:text-blue-600">
                DISC HERNIATION
              </span>
              <div className="flex items-baseline space-x-1.5 mt-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-blue-600">
                  87%
                </span>
                <span className="text-xs font-semibold text-slate-500">Success</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Top Performer Logs */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Top Performer Logs
            </h2>
            <button
              onClick={() => setIsViewAllLogsOpen(true)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              View All
            </button>
          </div>

          {/* Performer Item List */}
          <div className="space-y-3">
            {performers.slice(0, 3).map((perf) => (
              <div
                key={perf.id}
                onClick={() => setSelectedPerformer(perf)}
                className="p-3.5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-slate-50/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
              >
                {/* Left side: Avatar + Info */}
                <div className="flex items-center space-x-3 min-w-0">
                  <img
                    src={perf.avatar}
                    alt={perf.name}
                    className="w-11 h-11 rounded-full object-cover shrink-0 border border-slate-200"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                      {perf.name}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                      {perf.condition} • {perf.weeksProgress}
                    </p>
                  </div>
                </div>

                {/* Right side: Status Badge + Pain Score */}
                <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <span
                    className={`px-3 py-1 text-[11px] font-extrabold rounded-full ${
                      perf.status === 'Completed'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200/50'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                    }`}
                  >
                    {perf.status}
                  </span>
                  <span className="text-xs font-bold text-blue-600 mt-1">
                    Pain Score: {perf.painScore}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Export Report Footer CTA */}
          <div className="pt-2">
            <button
              onClick={() => onShowToast('Exporting clinical outcomes summary report (PDF)...')}
              className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-extrabold rounded-2xl border border-slate-200/70 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Export Outcomes Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: VIEW ALL TOP PERFORMER LOGS */}
      {isViewAllLogsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-6 max-h-[85vh] flex flex-col">
            <button
              onClick={() => setIsViewAllLogsOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-extrabold text-slate-900">All Top Performer Logs</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Patients with exemplary adherence & clinical outcomes
              </p>
            </div>

            <div className="space-y-3 overflow-y-auto pr-1 flex-1">
              {performers.map((perf) => (
                <div
                  key={perf.id}
                  onClick={() => {
                    setSelectedPerformer(perf);
                    setIsViewAllLogsOpen(false);
                  }}
                  className="p-4 rounded-2xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/40 transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={perf.avatar}
                      alt={perf.name}
                      className="w-12 h-12 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">{perf.name}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {perf.condition} • {perf.weeksProgress}
                      </p>
                      <span className="text-[11px] font-bold text-slate-400 mt-1 block">
                        ROM Gain: {perf.romImprovement}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`px-3 py-1 text-[11px] font-extrabold rounded-full ${
                        perf.status === 'Completed'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {perf.status}
                    </span>
                    <span className="text-xs font-bold text-blue-600 block mt-1.5">
                      Pain: {perf.painScore}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsViewAllLogsOpen(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: PATIENT OUTCOME DETAIL MODAL */}
      {selectedPerformer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-6">
            <button
              onClick={() => setSelectedPerformer(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-4">
              <img
                src={selectedPerformer.avatar}
                alt={selectedPerformer.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-blue-500/20"
              />
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">{selectedPerformer.name}</h3>
                <p className="text-xs font-semibold text-blue-600">{selectedPerformer.condition}</p>
                <span className="text-[11px] text-slate-400 font-medium">
                  Protocol Progress: {selectedPerformer.weeksProgress}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 bg-slate-50 rounded-2xl">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Final VAS Pain
                </span>
                <span className="text-xl font-extrabold text-slate-900 mt-1 block">
                  {selectedPerformer.painScore}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Mobility Gain
                </span>
                <span className="text-xl font-extrabold text-blue-600 mt-1 block">
                  {selectedPerformer.romImprovement}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-1 text-xs text-slate-600 font-medium">
              <div className="flex items-center space-x-2 text-emerald-600 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Cleared for full unassisted physical activity</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Patient completed all 8 modules with 98% exercise accuracy and reported zero acute flare-ups in the final 3 weeks.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => {
                  setSelectedPerformer(null);
                  onShowToast(`Exported clinical record for ${selectedPerformer.name}`);
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 cursor-pointer"
              >
                Download Patient Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DEMOGRAPHIC COHORT DRILLDOWN */}
      {selectedDemographic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-5">
            <button
              onClick={() => setSelectedDemographic(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center space-x-2 text-blue-600 mb-1">
                <Award className="w-5 h-5" />
                <span className="text-xs font-extrabold uppercase tracking-wider">Cohort Efficacy</span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">{selectedDemographic}</h3>
            </div>

            <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Total Enrolled Cohort:</span>
                <span className="text-xs font-extrabold text-blue-900">84 Patients</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Average Duration:</span>
                <span className="text-xs font-extrabold text-blue-900">7.8 Weeks</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Recurrence Rate:</span>
                <span className="text-xs font-extrabold text-emerald-600">&lt; 3.5%</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedDemographic(null)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutcomesTabContent;
