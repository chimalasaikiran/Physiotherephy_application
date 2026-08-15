import React, { useState } from 'react';
import {
  Wallet,
  Banknote,
  CalendarCheck,
  TrendingUp,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  X,
  Search,
  Filter,
  Download,
  CreditCard,
  Building2,
  ShieldCheck,
  Clock,
  ArrowUpRight,
  RefreshCw,
  SlidersHorizontal,
  FileText,
  AlertCircle,
} from 'lucide-react';
import type { Therapist } from './types';

interface Transaction {
  id: string;
  patientInitials: string;
  patientName: string;
  avatarBg: string;
  avatarColor: string;
  date: string;
  serviceType: string;
  serviceCategory: string;
  amount: number;
  status: 'Paid' | 'Processing' | 'Pending';
  paymentMethod: string;
  referenceId: string;
}

interface TherapistRevenueTabProps {
  therapist?: Therapist | null;
}

export const TherapistRevenueTab: React.FC<TherapistRevenueTabProps> = ({ therapist }) => {
  const therapistName = therapist?.name || 'Dr. Ananya Iyer';

  // Filters & State
  const [timeframe, setTimeframe] = useState('Last 30 Days');
  const [isTimeframeOpen, setIsTimeframeOpen] = useState(false);
  const [activeChartPoint, setActiveChartPoint] = useState<number | null>(3); // Default index 3 (OCT 22)

  // Modals & Drawers
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isProcessingPayout, setIsProcessingPayout] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // History Drawer Search & Filters
  const [historySearch, setHistorySearch] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<'All' | 'Paid' | 'Processing' | 'Pending'>('All');

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Transactions Data
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'tx-101',
      patientInitials: 'SM',
      patientName: 'Sanya Malhotra',
      avatarBg: 'bg-blue-600',
      avatarColor: 'text-white',
      date: 'Oct 24, 2023',
      serviceType: 'Post-Op Rehab',
      serviceCategory: 'ORTHOPEDIC',
      amount: 1500,
      status: 'Paid',
      paymentMethod: 'UPI / GPay',
      referenceId: 'TXN-98420194',
    },
    {
      id: 'tx-102',
      patientInitials: 'AK',
      patientName: 'Arjun Kapoor',
      avatarBg: 'bg-cyan-500',
      avatarColor: 'text-white',
      date: 'Oct 24, 2023',
      serviceType: 'ACL Consultation',
      serviceCategory: 'SPORTS MED',
      amount: 1200,
      status: 'Processing',
      paymentMethod: 'Credit Card (HDFC)',
      referenceId: 'TXN-87410293',
    },
    {
      id: 'tx-103',
      patientInitials: 'VS',
      patientName: 'Vikrant Singh',
      avatarBg: 'bg-purple-600',
      avatarColor: 'text-white',
      date: 'Oct 23, 2023',
      serviceType: 'Lower Back Physio',
      serviceCategory: 'SPINE CARE',
      amount: 1200,
      status: 'Paid',
      paymentMethod: 'Net Banking',
      referenceId: 'TXN-76104928',
    },
    {
      id: 'tx-104',
      patientInitials: 'RS',
      patientName: 'Rohan Shah',
      avatarBg: 'bg-indigo-600',
      avatarColor: 'text-white',
      date: 'Oct 22, 2023',
      serviceType: 'Sports Massage',
      serviceCategory: 'SPORTS MED',
      amount: 1800,
      status: 'Paid',
      paymentMethod: 'UPI / PhonePe',
      referenceId: 'TXN-65192847',
    },
    {
      id: 'tx-105',
      patientInitials: 'PS',
      patientName: 'Priya Sharma',
      avatarBg: 'bg-emerald-600',
      avatarColor: 'text-white',
      date: 'Oct 20, 2023',
      serviceType: 'Shoulder Impingement',
      serviceCategory: 'UPPER LIMB',
      amount: 1500,
      status: 'Paid',
      paymentMethod: 'Debit Card',
      referenceId: 'TXN-54192834',
    },
    {
      id: 'tx-106',
      patientInitials: 'RM',
      patientName: 'Rahul Verma',
      avatarBg: 'bg-amber-600',
      avatarColor: 'text-white',
      date: 'Oct 18, 2023',
      serviceType: 'Cervical Spine Traction',
      serviceCategory: 'SPINE CARE',
      amount: 1400,
      status: 'Paid',
      paymentMethod: 'UPI / Paytm',
      referenceId: 'TXN-43192812',
    },
  ]);

  // Handle Process Payout confirmation
  const handleConfirmPayout = () => {
    setIsProcessingPayout(true);
    setTimeout(() => {
      setIsProcessingPayout(false);
      setIsPayoutModalOpen(false);
      showToast('Payout of ₹42,000 processed successfully to Dr. Ananya Iyer.');
    }, 1200);
  };

  // Filtered transactions for drawer
  const filteredHistory = transactions.filter((tx) => {
    const matchesSearch =
      tx.patientName.toLowerCase().includes(historySearch.toLowerCase()) ||
      tx.serviceType.toLowerCase().includes(historySearch.toLowerCase()) ||
      tx.referenceId.toLowerCase().includes(historySearch.toLowerCase());

    const matchesStatus =
      historyStatusFilter === 'All' || tx.status === historyStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Revenue Trends Graph Data Points
  const trendPoints = [
    { label: 'OCT 01', val: '₹1.1L', x: 20, y: 130, rawVal: 110000, sessions: 9 },
    { label: 'OCT 08', val: '₹1.3L', x: 140, y: 125, rawVal: 130000, sessions: 11 },
    { label: 'OCT 15', val: '₹1.2L', x: 260, y: 145, rawVal: 120000, sessions: 10 },
    { label: 'OCT 22', val: '₹1.8L', x: 380, y: 40, rawVal: 180000, sessions: 15 },
    { label: 'OCT 30', val: '₹1.6L', x: 500, y: 80, rawVal: 160000, sessions: 13 },
  ];

  const totalEarningsDisplay = therapist?.totalRevenue ? `₹${therapist.totalRevenue.toLocaleString()}` : '₹1.8L';
  const feeDisplay = therapist?.consultationFee ? `₹${therapist.consultationFee.toLocaleString()}` : '₹1,200';
  const completedSessionsDisplay = therapist?.completedSessionsCount !== undefined ? therapist.completedSessionsCount.toString() : '164';

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center space-x-2 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Stat Cards Row (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Stat Card 1: Total Earnings (MTD) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100/80">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100/80 rounded-full text-xs font-extrabold">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <span>Live Sync</span>
            </span>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-400">Total Revenue</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
              {totalEarningsDisplay}
            </h3>
          </div>

          {/* Cyan/Teal Progress Accent Line */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full w-[78%]" />
          </div>
        </div>

        {/* Stat Card 2: Session Fee */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/80">
              <Banknote className="w-5 h-5" />
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-400">Session Charge</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
              {feeDisplay}
            </h3>
            <p className="text-[11px] font-medium text-slate-400 mt-1">Per consultation / session</p>
          </div>
        </div>

        {/* Stat Card 3: Completed Sessions */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100/80">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-400">Completed Sessions</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
              {completedSessionsDisplay}
            </h3>
            <p className="text-[11px] font-bold text-emerald-600 mt-1">Confirmed & completed</p>
          </div>
        </div>

        {/* Stat Card 4: Active Appointments */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100/80">
              <Wallet className="w-5 h-5" />
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-400">Active / Current Bookings</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
              {therapist?.activeAppointmentsCount ?? 5}
            </h3>

            <button
              onClick={() => setIsPayoutModalOpen(true)}
              className="inline-flex items-center space-x-1 text-xs font-extrabold text-blue-600 hover:text-blue-700 transition-colors mt-2 cursor-pointer group"
            >
              <span>Process Payout</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Charts Section (2 Columns: Revenue Trends & Revenue Source) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Left Card: Revenue Trends (2 Columns on Desktop) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-2xs flex flex-col justify-between space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">Revenue Trends</h3>
              <p className="text-xs font-medium text-slate-400 mt-0.5">
                Daily earnings over the last 30 days
              </p>
            </div>

            {/* Timeframe Dropdown */}
            <div className="relative self-start sm:self-auto">
              <button
                onClick={() => setIsTimeframeOpen(!isTimeframeOpen)}
                className="flex items-center space-x-2 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-xs font-extrabold text-slate-700 transition-all cursor-pointer"
              >
                <span>{timeframe}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isTimeframeOpen && (
                <div className="absolute right-0 mt-1.5 w-40 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-30 space-y-0.5 animate-in fade-in duration-100">
                  {['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'This Year'].map((tf) => (
                    <button
                      key={tf}
                      onClick={() => {
                        setTimeframe(tf);
                        setIsTimeframeOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                        timeframe === tf
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SVG Smooth Wave Area Chart */}
          <div className="relative pt-6 pb-2">
            <div className="w-full h-52 sm:h-60">
              <svg viewBox="0 0 520 200" className="w-full h-full overflow-visible">
                <defs>
                  {/* Linear Gradient for Green Area Fill matching Figma design */}
                  <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                    <stop offset="60%" stopColor="#34D399" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#A7F3D0" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Light horizontal grid lines */}
                <line x1="0" y1="40" x2="520" y2="40" stroke="#F1F5F9" strokeDasharray="4 4" strokeWidth="1.5" />
                <line x1="0" y1="100" x2="520" y2="100" stroke="#F1F5F9" strokeDasharray="4 4" strokeWidth="1.5" />
                <line x1="0" y1="160" x2="520" y2="160" stroke="#F1F5F9" strokeDasharray="4 4" strokeWidth="1.5" />

                {/* Filled Smooth Area Curve */}
                <path
                  d="M 20 130 Q 80 120 140 125 T 260 145 T 380 40 T 500 80 L 500 180 L 20 180 Z"
                  fill="url(#emeraldGradient)"
                />

                {/* Emerald Wave Stroke Line */}
                <path
                  d="M 20 130 Q 80 120 140 125 T 260 145 T 380 40 T 500 80"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Nodes */}
                {trendPoints.map((pt, idx) => {
                  const isActive = activeChartPoint === idx;
                  return (
                    <g key={idx} className="cursor-pointer group" onClick={() => setActiveChartPoint(idx)}>
                      {/* Active Ring */}
                      {isActive && (
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="9"
                          fill="#10B981"
                          fillOpacity="0.2"
                          className="animate-ping"
                        />
                      )}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isActive ? '6' : '4'}
                        fill={isActive ? '#10B981' : '#FFFFFF'}
                        stroke="#10B981"
                        strokeWidth="2.5"
                        className="transition-all duration-200 group-hover:r-6"
                      />

                      {/* Tooltip on Active Point */}
                      {isActive && (
                        <g transform={`translate(${pt.x - 45}, ${pt.y - 42})`}>
                          <rect
                            width="90"
                            height="30"
                            rx="10"
                            fill="#0F172A"
                            className="shadow-lg"
                          />
                          <text
                            x="45"
                            y="19"
                            textAnchor="middle"
                            fill="#FFFFFF"
                            fontSize="11"
                            fontWeight="bold"
                          >
                            {pt.val} ({pt.sessions} ssn)
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* X-Axis Date Labels Row */}
            <div className="flex items-center justify-between text-xs font-extrabold text-slate-400 pt-3 border-t border-slate-100">
              {trendPoints.map((pt, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveChartPoint(idx)}
                  className={`hover:text-emerald-600 transition-colors cursor-pointer ${
                    activeChartPoint === idx ? 'text-emerald-600 font-extrabold scale-105' : ''
                  }`}
                >
                  {pt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Card: Revenue Source (1 Column on Desktop) */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-2xs flex flex-col justify-between space-y-6">
          {/* Header */}
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">Revenue Source</h3>
            <p className="text-xs font-medium text-slate-400 mt-0.5">
              Breakdown by session type
            </p>
          </div>

          {/* SVG Donut Chart with Center Text */}
          <div className="flex items-center justify-center my-2 relative">
            <div className="relative w-48 h-48 sm:w-52 sm:h-52">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#F1F5F9"
                  strokeWidth="14"
                  fill="transparent"
                />

                {/* Segment 1: Clinic Visits (60%) -> 60% of circumference 238.76 = 143.2 */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#0C3E6D"
                  strokeWidth="14"
                  strokeDasharray="143.2 238.76"
                  strokeDashoffset="0"
                  fill="transparent"
                  className="transition-all duration-300 hover:opacity-90 cursor-pointer"
                />

                {/* Segment 2: Home Visits (25%) -> 25% of circumference = 59.7 */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#0D9488"
                  strokeWidth="14"
                  strokeDasharray="59.7 238.76"
                  strokeDashoffset="-146"
                  fill="transparent"
                  className="transition-all duration-300 hover:opacity-90 cursor-pointer"
                />

                {/* Segment 3: Online Consults (15%) -> 15% of circumference = 35.8 */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#7C3AED"
                  strokeWidth="14"
                  strokeDasharray="35.8 238.76"
                  strokeDashoffset="-208"
                  fill="transparent"
                  className="transition-all duration-300 hover:opacity-90 cursor-pointer"
                />
              </svg>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
                  100%
                </span>
                <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase mt-1">
                  VOLUME
                </span>
              </div>
            </div>
          </div>

          {/* Donut Chart Legend List */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            {/* Legend Item 1 */}
            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center space-x-2.5">
                <span className="w-3 h-3 rounded-full bg-[#0C3E6D]" />
                <span className="text-slate-700">Clinic Visits</span>
              </div>
              <span className="text-slate-900 font-extrabold">60%</span>
            </div>

            {/* Legend Item 2 */}
            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center space-x-2.5">
                <span className="w-3 h-3 rounded-full bg-[#0D9488]" />
                <span className="text-slate-700">Home Visits</span>
              </div>
              <span className="text-slate-900 font-extrabold">25%</span>
            </div>

            {/* Legend Item 3 */}
            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center space-x-2.5">
                <span className="w-3 h-3 rounded-full bg-[#7C3AED]" />
                <span className="text-slate-700">Online Consults</span>
              </div>
              <span className="text-slate-900 font-extrabold">15%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Table: Recent Transactions Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xs overflow-hidden">
        {/* Table Card Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
            Recent Transactions
          </h3>

          <button
            onClick={() => setIsHistoryDrawerOpen(true)}
            className="inline-flex items-center space-x-1.5 text-xs font-extrabold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer group"
          >
            <span>View All History</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">PATIENT NAME</th>
                <th className="py-4 px-4">DATE</th>
                <th className="py-4 px-4">SERVICE TYPE</th>
                <th className="py-4 px-4">AMOUNT</th>
                <th className="py-4 px-6 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-medium">
              {transactions.slice(0, 4).map((tx) => (
                <tr
                  key={tx.id}
                  onClick={() => setSelectedTransaction(tx)}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                >
                  {/* Patient Name with Avatar */}
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-9 h-9 rounded-full ${tx.avatarBg} ${tx.avatarColor} flex items-center justify-center font-extrabold text-xs shadow-2xs group-hover:scale-105 transition-transform`}
                      >
                        {tx.patientInitials}
                      </div>
                      <span className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {tx.patientName}
                      </span>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="py-4 px-4">
                    <span className="text-slate-600 font-semibold">{tx.date}</span>
                  </td>

                  {/* Service Type Tag */}
                  <td className="py-4 px-4">
                    <span className="inline-block px-3 py-1 bg-slate-100/90 text-slate-700 rounded-lg text-xs font-bold">
                      {tx.serviceType}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="py-4 px-4">
                    <span className="font-extrabold text-slate-900">
                      ₹{tx.amount.toLocaleString()}
                    </span>
                  </td>

                  {/* Status Pill Badge */}
                  <td className="py-4 px-6 text-right">
                    {tx.status === 'Paid' ? (
                      <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-xs font-extrabold">
                        Paid
                      </span>
                    ) : (
                      <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-xs font-extrabold">
                        Processing
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL 1: PROCESS PAYOUT MODAL ================= */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-6 sm:p-7 space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2.5 text-[#0C3E6D]">
                <Wallet className="w-6 h-6" />
                <h3 className="text-lg font-extrabold text-slate-900">Process Payout</h3>
              </div>
              <button
                onClick={() => setIsPayoutModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl space-y-2">
                <span className="text-[11px] font-extrabold text-blue-700 uppercase tracking-wider block">
                  Pending Payout Balance
                </span>
                <h2 className="text-3xl font-extrabold text-slate-900">₹42,000</h2>
                <p className="text-xs font-medium text-slate-500">
                  Performance payout for October 2023 cycle.
                </p>
              </div>

              {/* Bank Account Details */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 text-xs">
                <div className="flex items-center justify-between text-slate-500 font-semibold">
                  <span className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span>Bank Name</span>
                  </span>
                  <span className="font-extrabold text-slate-800">HDFC Bank Ltd.</span>
                </div>

                <div className="flex items-center justify-between text-slate-500 font-semibold">
                  <span className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    <span>Account Number</span>
                  </span>
                  <span className="font-extrabold text-slate-800">•••• •••• 6789</span>
                </div>

                <div className="flex items-center justify-between text-slate-500 font-semibold">
                  <span className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    <span>IFSC Code</span>
                  </span>
                  <span className="font-extrabold text-slate-800">HDFC0001234</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsPayoutModalOpen(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPayout}
                disabled={isProcessingPayout}
                className="flex items-center space-x-2 px-6 py-2.5 bg-[#0C3E6D] hover:bg-[#092e52] text-white text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessingPayout ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Release</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: FULL TRANSACTION HISTORY DRAWER ================= */}
      {isHistoryDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white max-w-2xl w-full h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-250">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Transaction History</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Complete ledger of earnings & payouts for {therapistName}
                </p>
              </div>
              <button
                onClick={() => setIsHistoryDrawerOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Filter Bar */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 space-y-4">
              <div className="flex items-center space-x-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Search by patient name or reference ID..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={historyStatusFilter}
                  onChange={(e) =>
                    setHistoryStatusFilter(e.target.value as 'All' | 'Paid' | 'Processing' | 'Pending')
                  }
                  className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-extrabold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Paid">Paid</option>
                  <option value="Processing">Processing</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 divide-y divide-slate-100">
              {filteredHistory.map((tx) => (
                <div
                  key={tx.id}
                  onClick={() => setSelectedTransaction(tx)}
                  className="pt-3 first:pt-0 flex items-center justify-between hover:bg-slate-50 p-3 rounded-2xl transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-3.5">
                    <div
                      className={`w-10 h-10 rounded-2xl ${tx.avatarBg} ${tx.avatarColor} flex items-center justify-center font-extrabold text-xs shadow-2xs`}
                    >
                      {tx.patientInitials}
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">{tx.patientName}</h4>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        {tx.serviceType} • {tx.date}
                      </p>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="text-sm font-extrabold text-slate-900 block">
                      ₹{tx.amount.toLocaleString()}
                    </span>
                    {tx.status === 'Paid' ? (
                      <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-extrabold">
                        Paid
                      </span>
                    ) : (
                      <span className="inline-block px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-md text-[10px] font-extrabold">
                        Processing
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-white flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">
                Showing {filteredHistory.length} transactions
              </span>
              <button
                onClick={() => {
                  showToast('Exported transaction log CSV.');
                  setIsHistoryDrawerOpen(false);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: TRANSACTION DETAIL RECEIPT MODAL ================= */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2 text-[#0C3E6D]">
                <FileText className="w-5 h-5" />
                <h3 className="text-base font-extrabold text-slate-900">Transaction Receipt</h3>
              </div>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-2 space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Total Amount
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900">
                ₹{selectedTransaction.amount.toLocaleString()}
              </h2>
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-xs font-extrabold mt-1">
                {selectedTransaction.status}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Patient Name:</span>
                <span className="font-extrabold text-slate-900">
                  {selectedTransaction.patientName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Service Type:</span>
                <span className="font-bold text-slate-800">
                  {selectedTransaction.serviceType}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Transaction Date:</span>
                <span className="font-bold text-slate-800">{selectedTransaction.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Payment Method:</span>
                <span className="font-bold text-slate-800">
                  {selectedTransaction.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Reference ID:</span>
                <span className="font-mono font-bold text-slate-700">
                  {selectedTransaction.referenceId}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedTransaction(null)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistRevenueTab;
