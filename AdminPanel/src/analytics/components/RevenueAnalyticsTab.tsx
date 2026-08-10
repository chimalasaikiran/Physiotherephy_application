import React, { useState } from 'react';
import {
  TrendingUp,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Check,
  X,
  Activity,
  Zap,
  UserCheck,
  Sliders,
} from 'lucide-react';

interface RevenueAnalyticsTabProps {
  onShowToast?: (message: string) => void;
}

export const RevenueAnalyticsTab: React.FC<RevenueAnalyticsTabProps> = ({
  onShowToast,
}) => {
  const [isAutomationEnabled, setIsAutomationEnabled] = useState(false);
  const [isCapacityModalOpen, setIsCapacityModalOpen] = useState(false);
  const [capacitySlotIncrease, setCapacitySlotIncrease] = useState(15);
  const [activeMonthHover, setActiveMonthHover] = useState<string | null>('OCTOBER');

  const triggerToast = (msg: string) => {
    if (onShowToast) {
      onShowToast(msg);
    }
  };

  const handleToggleAutomation = () => {
    const newState = !isAutomationEnabled;
    setIsAutomationEnabled(newState);
    if (newState) {
      triggerToast('Automated AR follow-up reminders activated successfully!');
    } else {
      triggerToast('Automated reminders paused.');
    }
  };

  const handleApplyCapacityPlan = () => {
    setIsCapacityModalOpen(false);
    triggerToast(
      `Capacity plan updated! Added +${capacitySlotIncrease}% slots for Home Physio.`
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 font-sans">
      {/* 1. Top Row: 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: TOTAL REVENUE (MTD) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden group min-h-[140px]">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              TOTAL REVENUE (MTD)
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
              ₹1,80,000
            </div>
            <div className="flex items-center space-x-1.5 mt-1 text-xs font-bold text-teal-600">
              <span className="text-sm">↗</span>
              <span>+12% vs last month</span>
            </div>
          </div>

          {/* Mini Wave Graphic at Bottom */}
          <div className="mt-3 relative h-10 w-full overflow-hidden">
            <svg
              className="w-full h-full"
              viewBox="0 0 200 40"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0,30 C 40,25 70,35 100,18 C 130,5 170,22 200,12 L 200,40 L 0,40 Z"
                fill="url(#waveGrad)"
              />
              <path
                d="M 0,30 C 40,25 70,35 100,18 C 130,5 170,22 200,12"
                fill="none"
                stroke="#0EA5E9"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Card 2: AVG. SESSION FEE */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-all min-h-[140px]">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              AVG. SESSION FEE
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
              ₹1,200
            </div>
            <div className="text-xs font-semibold text-slate-400 mt-1">
              Stable based on 150 sessions
            </div>
          </div>

          {/* Mini Bar Graphic */}
          <div className="mt-3 flex items-end justify-center space-x-1.5 h-8">
            {[40, 60, 50, 85, 65, 75].map((val, idx) => (
              <div
                key={idx}
                className={`w-2.5 rounded-t-sm transition-all ${
                  idx === 3
                    ? 'bg-blue-600 shadow-xs shadow-blue-500/40'
                    : 'bg-blue-100 hover:bg-blue-300'
                }`}
                style={{ height: `${val}%` }}
              />
            ))}
          </div>
        </div>

        {/* Card 3: OUTSTANDING INVOICES */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-all min-h-[140px]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                OUTSTANDING INVOICES
              </span>
              <span className="px-2 py-0.5 bg-rose-100 text-rose-600 font-black text-[9px] rounded-full uppercase tracking-wider">
                9 OVERDUE
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
              ₹42,000
            </div>
            <div className="text-xs font-bold text-rose-500 mt-1 flex items-center space-x-1">
              <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Requires Attention</span>
            </div>
          </div>

          {/* Red Progress Indicator Bar */}
          <div className="mt-4">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-rose-400 to-rose-600 h-full rounded-full"
                style={{ width: '65%' }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: INSURANCE SUCCESS */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-all min-h-[140px]">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                INSURANCE SUCCESS
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                94.2%
              </div>
              <div className="flex items-center space-x-1.5 mt-1.5">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-extrabold text-[10px] rounded-full uppercase tracking-wider border border-blue-100">
                  Top Tier
                </span>
                <span className="text-xs font-bold text-slate-500">
                  +4% speed
                </span>
              </div>
            </div>

            {/* Circular Progress Gauge */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-teal-500"
                  strokeDasharray="94, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[10px] font-extrabold text-slate-800">
                94%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Row: Revenue Growth Trend Chart */}
      <div className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-6 shadow-xs space-y-4">
        {/* Header with Title & Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-50">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Revenue Growth Trend
            </h3>
            <p className="text-xs font-medium text-slate-400 mt-0.5">
              Current 6-month period vs. Previous Year
            </p>
          </div>

          <div className="flex items-center space-x-5 text-xs font-extrabold text-slate-600">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-700 inline-block" />
              <span>2024 (Current)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
              <span>2023 (Previous)</span>
            </div>
          </div>
        </div>

        {/* Large SVG Curve Chart */}
        <div className="relative pt-4 pb-2 h-64 sm:h-72 w-full flex items-end">
          <svg
            className="w-full h-full overflow-visible"
            viewBox="0 0 600 220"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="revenueGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Line accents */}
            <line x1="0" y1="50" x2="600" y2="50" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="110" x2="600" y2="110" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="170" x2="600" y2="170" stroke="#F1F5F9" strokeWidth="1" opacity="0.6" />

            {/* Previous Year (2023) Light Line */}
            <path
              d="M 20,160 Q 120,175 220,150 T 420,130 T 580,140"
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="2.5"
              strokeDasharray="5 4"
            />

            {/* Current Year (2024) Gradient Area */}
            <path
              d="M 20,140 Q 120,120 220,110 T 420,70 T 580,35 L 580,200 L 20,200 Z"
              fill="url(#revenueGrowthGrad)"
            />

            {/* Current Year (2024) Solid Stroke */}
            <path
              d="M 20,140 Q 120,120 220,110 T 420,70 T 580,35"
              fill="none"
              stroke="#1D4ED8"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Peak Point on October (x=475, y=58 or x=580, y=35) */}
            <circle cx="475" cy="58" r="5" fill="#1D4ED8" className="animate-ping opacity-75" />
            <circle cx="475" cy="58" r="6" fill="#1D4ED8" stroke="#FFFFFF" strokeWidth="2.5" />
          </svg>

          {/* Interactive Tooltip callout over October (matching Figma) */}
          <div className="absolute top-4 right-16 sm:right-24 bg-white/95 backdrop-blur-xs rounded-2xl border border-slate-200/90 p-3 shadow-xl flex flex-col items-center pointer-events-none transform transition-transform animate-bounce">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              OCTOBER 2024
            </span>
            <div className="text-sm font-extrabold text-blue-700 tracking-tight mt-0.5">
              ₹2.4L
            </div>
            <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">
              +18%
            </span>
          </div>

          {/* Month Labels on X-axis */}
          <div className="absolute bottom-0 inset-x-0 flex justify-between text-[11px] font-extrabold text-slate-400 px-2 pt-2 border-t border-slate-100">
            {['MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT'].map((m) => (
              <span
                key={m}
                onClick={() => setActiveMonthHover(m)}
                className={`cursor-pointer transition-colors ${
                  activeMonthHover === m
                    ? 'text-blue-600 font-black scale-110'
                    : 'hover:text-slate-700'
                }`}
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Row 3: Revenue Source & Payer Reimbursements (2 Column Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Left Card: Revenue Source Donut Chart */}
        <div className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            Revenue Source
          </h3>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
            {/* Donut Chart Visualizer */}
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Clinic Visits 60% (Blue) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="16"
                  strokeDasharray="143 238"
                  strokeDashoffset="0"
                />
                {/* Home Physio 25% (Cyan) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#0EA5E9"
                  strokeWidth="16"
                  strokeDasharray="60 238"
                  strokeDashoffset="-143"
                />
                {/* Online Consult 15% (Purple) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#8B5CF6"
                  strokeWidth="16"
                  strokeDasharray="35 238"
                  strokeDashoffset="-203"
                />
              </svg>
              {/* Inner Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-tight">
                <span className="text-[11px] font-black text-slate-800 tracking-tight">
                  Income
                </span>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase">
                  Mode
                </span>
              </div>
            </div>

            {/* Breakdown Legend List */}
            <div className="space-y-3.5 w-full sm:w-auto">
              <div className="flex items-center justify-between space-x-6 text-xs">
                <div className="flex items-center space-x-2.5">
                  <span className="w-3 h-3 rounded-md bg-blue-600 shadow-xs" />
                  <span className="font-extrabold text-slate-700">Clinic Visits</span>
                </div>
                <span className="font-extrabold text-slate-900">60%</span>
              </div>

              <div className="flex items-center justify-between space-x-6 text-xs">
                <div className="flex items-center space-x-2.5">
                  <span className="w-3 h-3 rounded-md bg-sky-500 shadow-xs" />
                  <span className="font-extrabold text-slate-700">Home Physio</span>
                </div>
                <span className="font-extrabold text-slate-900">25%</span>
              </div>

              <div className="flex items-center justify-between space-x-6 text-xs">
                <div className="flex items-center space-x-2.5">
                  <span className="w-3 h-3 rounded-md bg-purple-500 shadow-xs" />
                  <span className="font-extrabold text-slate-700">Online Consult</span>
                </div>
                <span className="font-extrabold text-slate-900">15%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Payer Reimbursement (Avg Days) */}
        <div className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            Payer Reimbursement (Avg Days)
          </h3>

          <div className="space-y-5 py-1">
            {/* Insurer 1: HDFC ERGO */}
            <div>
              <div className="flex justify-between text-xs font-extrabold text-slate-800 mb-1.5">
                <span>HDFC ERGO</span>
                <span className="text-slate-900 font-extrabold">12 Days</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-sky-400 h-full rounded-full transition-all duration-500"
                  style={{ width: '40%' }}
                />
              </div>
            </div>

            {/* Insurer 2: Star Health */}
            <div>
              <div className="flex justify-between text-xs font-extrabold text-slate-800 mb-1.5">
                <span>Star Health</span>
                <span className="text-slate-900 font-extrabold">18 Days</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: '60%' }}
                />
              </div>
            </div>

            {/* Insurer 3: ICICI Lombard */}
            <div>
              <div className="flex justify-between text-xs font-extrabold text-slate-800 mb-1.5">
                <span>ICICI Lombard</span>
                <span className="text-slate-900 font-extrabold">24 Days</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all duration-500"
                  style={{ width: '80%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Row 4: AI FINANCIAL INSIGHTS */}
      <div className="bg-slate-50/80 sm:bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-blue-50/60 rounded-3xl p-5 sm:p-7 border border-indigo-100/80 shadow-xs space-y-5">
        {/* Header */}
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4 fill-white" />
          </div>
          <h3 className="text-xs sm:text-sm font-black text-indigo-950 uppercase tracking-widest">
            AI FINANCIAL INSIGHTS
          </h3>
        </div>

        {/* Insight Cards Container */}
        <div className="space-y-4">
          {/* Item 1: High-Margin Alert */}
          <div className="bg-white/90 backdrop-blur-xs p-4 sm:p-5 rounded-2xl border border-indigo-100/60 shadow-2xs space-y-1">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 stroke-[2.5]" />
              <h4 className="text-xs font-extrabold text-slate-900">
                High-Margin Alert
              </h4>
            </div>
            <p className="text-xs font-medium text-slate-600 pl-6 leading-relaxed">
              <strong className="text-slate-900 font-extrabold">Post-Op ACL Rehab</strong> is currently your most profitable program with a{' '}
              <span className="text-teal-700 font-extrabold bg-teal-50 px-1.5 py-0.5 rounded">
                +22% ROI
              </span>{' '}
              compared to baseline orthopedic care.
            </p>
          </div>

          {/* Item 2: Leakage Warning */}
          <div className="bg-white/90 backdrop-blur-xs p-4 sm:p-5 rounded-2xl border border-rose-100/80 shadow-2xs space-y-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 stroke-[2.5]" />
              <h4 className="text-xs font-extrabold text-rose-900">
                Leakage Warning
              </h4>
            </div>
            <p className="text-xs font-medium text-slate-600 pl-6 leading-relaxed">
              Detected potential leakage in AR. Automated follow-up reminders could recover{' '}
              <strong className="text-slate-900 font-extrabold">₹42k</strong> in outstanding balances within 7 business days.
            </p>
            <div className="pl-6">
              <button
                onClick={handleToggleAutomation}
                className={`w-full sm:w-auto px-6 py-2.5 text-xs font-extrabold rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center space-x-2 ${
                  isAutomationEnabled
                    ? 'bg-emerald-500 text-white'
                    : 'bg-rose-100/80 hover:bg-rose-200 text-rose-700 border border-rose-200/60'
                }`}
              >
                {isAutomationEnabled ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>AUTOMATION ENABLED</span>
                  </>
                ) : (
                  <span>ENABLE AUTOMATION</span>
                )}
              </button>
            </div>
          </div>

          {/* Item 3: Strategic Action */}
          <div className="bg-white/90 backdrop-blur-xs p-4 sm:p-5 rounded-2xl border border-indigo-100/60 shadow-2xs space-y-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-indigo-600 shrink-0 stroke-[2.5]" />
              <h4 className="text-xs font-extrabold text-slate-900">
                Strategic Action
              </h4>
            </div>
            <p className="text-xs font-medium text-slate-600 pl-6 leading-relaxed">
              Home Physiotherapy demand is outstripping capacity. Increasing slots by{' '}
              <strong className="text-slate-900">15%</strong> could yield an extra{' '}
              <strong className="text-slate-900">₹35k monthly revenue</strong> with zero overhead increase.
            </p>
            <div className="pl-6">
              <button
                onClick={() => setIsCapacityModalOpen(true)}
                className="w-full py-3 px-5 bg-[#5B46F6] hover:bg-[#4a36e0] text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-900/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>REVIEW CAPACITY PLAN</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Row 5: REVENUE BY PROGRAM */}
      <div className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
          REVENUE BY PROGRAM
        </h3>

        <div className="space-y-4 pt-1">
          {/* Program 1: Ortho Rehab */}
          <div className="flex items-center space-x-4">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between text-xs font-extrabold text-slate-900">
                <span>Ortho Rehab</span>
                <span>₹94k</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '75%' }} />
              </div>
            </div>
          </div>

          {/* Program 2: Geriatric Care */}
          <div className="flex items-center space-x-4">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between text-xs font-extrabold text-slate-900">
                <span>Geriatric Care</span>
                <span>₹52k</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-teal-500 h-full rounded-full" style={{ width: '50%' }} />
              </div>
            </div>
          </div>

          {/* Program 3: Sports Med */}
          <div className="flex items-center space-x-4">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between text-xs font-extrabold text-slate-900">
                <span>Sports Med</span>
                <span>₹44k</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full rounded-full" style={{ width: '42%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Capacity Review Interactive Modal */}
      {isCapacityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Home Physio Capacity Plan
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Adjust slot allocations to capture untapped demand
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCapacityModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 space-y-2">
                <div className="flex justify-between text-xs font-extrabold text-indigo-950">
                  <span>Slot Capacity Increase:</span>
                  <span className="text-indigo-600 font-black text-sm">+{capacitySlotIncrease}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="5"
                  value={capacitySlotIncrease}
                  onChange={(e) => setCapacitySlotIncrease(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-extrabold text-slate-400">
                  <span>+5% (+₹12k)</span>
                  <span>+15% (+₹35k)</span>
                  <span>+30% (+₹68k)</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between font-semibold">
                  <span>Estimated Additional Monthly Revenue:</span>
                  <strong className="text-emerald-600 font-extrabold">
                    +₹{(capacitySlotIncrease * 2.33).toFixed(0)}k / mo
                  </strong>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Estimated Therapist Allocation Needed:</span>
                  <strong className="text-slate-900 font-bold">2 Hybrid Specialists</strong>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end space-x-3">
              <button
                onClick={() => setIsCapacityModalOpen(false)}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 text-xs font-extrabold rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCapacityPlan}
                className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-extrabold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-900/20 cursor-pointer"
              >
                Confirm Capacity Expansion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueAnalyticsTab;
