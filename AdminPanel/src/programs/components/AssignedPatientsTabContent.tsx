import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  UserPlus,
  ChevronDown,
  MoreVertical,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  MessageSquare,
  FileEdit,
  UserMinus,
  ExternalLink,
  ShieldCheck,
  Activity,
  Calendar,
} from 'lucide-react';

export interface PatientAssignment {
  id: string;
  name: string;
  condition: string;
  avatar: string;
  programWeek: string;
  weekNumber: number;
  totalWeeks: number;
  adherence: number;
  lastActivity: string;
  status: 'On Track' | 'Review Needed' | 'Ahead';
  isArchived?: boolean;
  email?: string;
  phone?: string;
  startDate?: string;
}

const MOCK_ASSIGNED_PATIENTS: PatientAssignment[] = [
  {
    id: 'pt-1',
    name: 'Sanya Malhotra',
    condition: 'L4-L5 Disc Bulge',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    programWeek: 'Week 4 of 8',
    weekNumber: 4,
    totalWeeks: 8,
    adherence: 92,
    lastActivity: '2 hours ago',
    status: 'On Track',
    email: 'sanya.m@example.com',
    phone: '+1 (555) 234-5678',
    startDate: 'Jul 12, 2026',
  },
  {
    id: 'pt-2',
    name: 'Kabir Singh',
    condition: 'Chronic Sciatica',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    programWeek: 'Week 2 of 8',
    weekNumber: 2,
    totalWeeks: 8,
    adherence: 45,
    lastActivity: '1 day ago',
    status: 'Review Needed',
    email: 'kabir.s@example.com',
    phone: '+1 (555) 345-6789',
    startDate: 'Jul 26, 2026',
  },
  {
    id: 'pt-3',
    name: 'Rhea Kapoor',
    condition: 'Post-Op Lumbar Fixation',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    programWeek: 'Week 6 of 8',
    weekNumber: 6,
    totalWeeks: 8,
    adherence: 98,
    lastActivity: '10 mins ago',
    status: 'Ahead',
    email: 'rhea.k@example.com',
    phone: '+1 (555) 456-7890',
    startDate: 'Jun 28, 2026',
  },
  {
    id: 'pt-4',
    name: 'Advait Sharma',
    condition: 'Muscle Strain Grade II',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    programWeek: 'Week 1 of 4',
    weekNumber: 1,
    totalWeeks: 4,
    adherence: 85,
    lastActivity: '5 hours ago',
    status: 'On Track',
    email: 'advait.s@example.com',
    phone: '+1 (555) 567-8901',
    startDate: 'Aug 02, 2026',
  },
  {
    id: 'pt-5',
    name: 'Ananya Roy',
    condition: 'Lumbar Spondylolisthesis',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    programWeek: 'Week 3 of 8',
    weekNumber: 3,
    totalWeeks: 8,
    adherence: 88,
    lastActivity: '3 hours ago',
    status: 'On Track',
    email: 'ananya.r@example.com',
    phone: '+1 (555) 678-9012',
    startDate: 'Jul 19, 2026',
  },
  {
    id: 'pt-6',
    name: 'Vikramaditya Mehta',
    condition: 'Acute Lower Back Sprain',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
    programWeek: 'Week 5 of 8',
    weekNumber: 5,
    totalWeeks: 8,
    adherence: 38,
    lastActivity: '2 days ago',
    status: 'Review Needed',
    email: 'vikram.m@example.com',
    phone: '+1 (555) 789-0123',
    startDate: 'Jul 05, 2026',
  },
  {
    id: 'pt-7',
    name: 'Priya Deshmukh',
    condition: 'Disc Degeneration L5-S1',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
    programWeek: 'Week 8 of 8',
    weekNumber: 8,
    totalWeeks: 8,
    adherence: 96,
    lastActivity: '1 hour ago',
    status: 'Ahead',
    email: 'priya.d@example.com',
    phone: '+1 (555) 890-1234',
    startDate: 'Jun 14, 2026',
  },
  {
    id: 'pt-8',
    name: 'Rohan Verma',
    condition: 'Facet Joint Syndrome',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
    programWeek: 'Week 7 of 8',
    weekNumber: 7,
    totalWeeks: 8,
    adherence: 91,
    lastActivity: '4 hours ago',
    status: 'On Track',
    email: 'rohan.v@example.com',
    phone: '+1 (555) 901-2345',
    startDate: 'Jun 21, 2026',
  },
  {
    id: 'pt-9',
    name: 'Meera Nambiar',
    condition: 'Postural Kyphosis & Low Back Discomfort',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=150&q=80',
    programWeek: 'Completed (8/8)',
    weekNumber: 8,
    totalWeeks: 8,
    adherence: 95,
    lastActivity: '1 week ago',
    status: 'On Track',
    isArchived: true,
    email: 'meera.n@example.com',
    phone: '+1 (555) 012-3456',
    startDate: 'May 10, 2026',
  },
  {
    id: 'pt-10',
    name: 'Tariq Al-Mansoor',
    condition: 'Lumbar Strain',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80',
    programWeek: 'Discontinued',
    weekNumber: 2,
    totalWeeks: 8,
    adherence: 22,
    lastActivity: '3 weeks ago',
    status: 'Review Needed',
    isArchived: true,
    email: 'tariq.a@example.com',
    phone: '+1 (555) 123-4567',
    startDate: 'May 01, 2026',
  },
];

interface AssignedPatientsTabContentProps {
  onShowToast?: (msg: string) => void;
  onOpenAssignModal?: () => void;
}

export const AssignedPatientsTabContent: React.FC<AssignedPatientsTabContentProps> = ({
  onShowToast,
  onOpenAssignModal,
}) => {
  const [patientsList, setPatientsList] = useState<PatientAssignment[]>(MOCK_ASSIGNED_PATIENTS);
  const [viewTab, setViewTab] = useState<'current' | 'archived'>('current');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [weekFilter, setWeekFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 4;

  // Selected Patient Details Drawer/Modal
  const [selectedPatient, setSelectedPatient] = useState<PatientAssignment | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [newPatientName, setNewPatientName] = useState<string>('');
  const [newPatientCondition, setNewPatientCondition] = useState<string>('L4-L5 Disc Bulge');

  const handleToast = (msg: string) => {
    if (onShowToast) onShowToast(msg);
  };

  // Filtered logic
  const filteredPatients = useMemo(() => {
    return patientsList.filter((pt) => {
      // Tab filter
      const isArchived = Boolean(pt.isArchived);
      if (viewTab === 'current' && isArchived) return false;
      if (viewTab === 'archived' && !isArchived) return false;

      // Status filter
      if (statusFilter !== 'all' && pt.status !== statusFilter) {
        return false;
      }

      // Week filter
      if (weekFilter !== 'all') {
        if (weekFilter === '1' && pt.weekNumber !== 1) return false;
        if (weekFilter === '2' && pt.weekNumber !== 2) return false;
        if (weekFilter === '3' && pt.weekNumber !== 3) return false;
        if (weekFilter === '4' && pt.weekNumber !== 4) return false;
        if (weekFilter === '5-6' && (pt.weekNumber < 5 || pt.weekNumber > 6)) return false;
        if (weekFilter === '7-8' && (pt.weekNumber < 7 || pt.weekNumber > 8)) return false;
      }

      // Search query
      if (
        searchQuery &&
        !pt.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !pt.condition.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [patientsList, viewTab, statusFilter, weekFilter, searchQuery]);

  // Paginated patients
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage) || 1;
  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPatients.slice(start, start + itemsPerPage);
  }, [filteredPatients, currentPage]);

  // Handle Unassign / Remove
  const handleUnassignPatient = (id: string, name: string) => {
    setPatientsList((prev) => prev.filter((p) => p.id !== id));
    setActiveMenuId(null);
    handleToast(`Unassigned ${name} from this program.`);
  };

  // Handle Toggle Archive
  const handleToggleArchive = (id: string, name: string) => {
    setPatientsList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isArchived: !p.isArchived } : p))
    );
    setActiveMenuId(null);
    handleToast(`Updated status for ${name}`);
  };

  // Add Patient Submit
  const handleAddPatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim()) return;
    const newPt: PatientAssignment = {
      id: `pt-${Date.now()}`,
      name: newPatientName.trim(),
      condition: newPatientCondition,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?auto=format&fit=crop&w=150&q=80`,
      programWeek: 'Week 1 of 8',
      weekNumber: 1,
      totalWeeks: 8,
      adherence: 100,
      lastActivity: 'Just now',
      status: 'On Track',
      email: `${newPatientName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      phone: '+1 (555) 999-0000',
      startDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    };

    setPatientsList([newPt, ...patientsList]);
    setNewPatientName('');
    setIsAssignModalOpen(false);
    handleToast(`Assigned ${newPt.name} to Lower Back Recovery Program`);
  };

  // Adherence Circular Badge Renderer
  const renderAdherenceBadge = (percentage: number) => {
    let strokeColor = '#3b82f6'; // default blue
    let textColor = 'text-blue-600';
    let ringBg = 'stroke-blue-100';

    if (percentage >= 95) {
      strokeColor = '#0d9488'; // teal / green
      textColor = 'text-teal-600';
      ringBg = 'stroke-teal-100';
    } else if (percentage < 60) {
      strokeColor = '#ef4444'; // red
      textColor = 'text-rose-600';
      ringBg = 'stroke-rose-100';
    } else if (percentage >= 90) {
      strokeColor = '#2563eb'; // royal blue
      textColor = 'text-blue-600';
      ringBg = 'stroke-blue-100';
    }

    const radius = 15;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center w-10 h-10">
        <svg className="w-10 h-10 transform -rotate-90">
          <circle
            cx="20"
            cy="20"
            r={radius}
            className={`${ringBg} fill-none`}
            strokeWidth="3"
          />
          <circle
            cx="20"
            cy="20"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <span className={`absolute text-[11px] font-extrabold ${textColor}`}>
          {percentage}%
        </span>
      </div>
    );
  };

  // Status Badge Renderer
  const renderStatusBadge = (status: PatientAssignment['status']) => {
    switch (status) {
      case 'On Track':
        return (
          <span className="inline-flex items-center px-3 py-1 bg-sky-50 text-sky-700 text-xs font-bold rounded-full border border-sky-200/60 shadow-2xs">
            On Track
          </span>
        );
      case 'Review Needed':
        return (
          <span className="inline-flex items-center px-3 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-full border border-rose-200/60 shadow-2xs">
            Review Needed
          </span>
        );
      case 'Ahead':
        return (
          <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200/60 shadow-2xs">
            Ahead
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top 4 Stat Metric Cards (Assigned Patients Summary) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: ACTIVE PATIENTS */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs border-l-4 border-l-blue-600 flex items-center justify-between hover:border-blue-200 transition-all">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
              ACTIVE PATIENTS
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              126
            </div>
          </div>
          <span className="px-2.5 py-1 bg-sky-50 text-sky-600 text-xs font-bold rounded-full border border-sky-200/60 shrink-0">
            +4%
          </span>
        </div>

        {/* Card 2: AVG. ADHERENCE */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs border-l-4 border-l-blue-600 flex items-center justify-between hover:border-blue-200 transition-all">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
              AVG. ADHERENCE
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              94%
            </div>
          </div>
          <span className="px-3 py-1 bg-cyan-50 text-cyan-700 text-xs font-bold rounded-full border border-cyan-200/60 shrink-0">
            Optimal
          </span>
        </div>

        {/* Card 3: RECOVERY RATE */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs border-l-4 border-l-blue-600 flex items-center justify-between hover:border-blue-200 transition-all">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
              RECOVERY RATE
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              87%
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>

        {/* Card 4: RISK ALERTS */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs border-l-4 border-l-rose-500 flex items-center justify-between hover:border-rose-200 transition-all">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
              RISK ALERTS
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              3
            </div>
          </div>
          <span className="px-3 py-1 bg-rose-50 text-rose-600 text-xs font-bold rounded-full border border-rose-200/60 shrink-0">
            Review Needed
          </span>
        </div>
      </div>

      {/* Filter and Control Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Toggle Pills & Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Tabs: Current Patients vs Archived */}
          <div className="inline-flex items-center p-1 bg-slate-200/60 rounded-full border border-slate-200/80">
            <button
              onClick={() => {
                setViewTab('current');
                setCurrentPage(1);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                viewTab === 'current'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Current Patients
            </button>
            <button
              onClick={() => {
                setViewTab('archived');
                setCurrentPage(1);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                viewTab === 'archived'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Archived
            </button>
          </div>

          {/* Dropdown 1: Status */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none pl-3.5 pr-8 py-2 bg-white border border-slate-200/80 rounded-full text-xs font-bold text-slate-700 hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 cursor-pointer shadow-2xs"
            >
              <option value="all">Status: All</option>
              <option value="On Track">Status: On Track</option>
              <option value="Review Needed">Status: Review Needed</option>
              <option value="Ahead">Status: Ahead</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Dropdown 2: Week */}
          <div className="relative">
            <select
              value={weekFilter}
              onChange={(e) => {
                setWeekFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none pl-3.5 pr-8 py-2 bg-white border border-slate-200/80 rounded-full text-xs font-bold text-slate-700 hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 cursor-pointer shadow-2xs"
            >
              <option value="all">Week: All</option>
              <option value="1">Week 1</option>
              <option value="2">Week 2</option>
              <option value="3">Week 3</option>
              <option value="4">Week 4</option>
              <option value="5-6">Week 5 - 6</option>
              <option value="7-8">Week 7 - 8</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Search Bar Input */}
          <div className="relative min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search patient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200/80 rounded-full text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 shadow-2xs"
            />
          </div>
        </div>

        {/* Right Side: Primary Assign Patient Button */}
        <div className="shrink-0">
          <button
            onClick={() => {
              if (onOpenAssignModal) {
                onOpenAssignModal();
              } else {
                setIsAssignModalOpen(true);
              }
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-bold rounded-full transition-all duration-200 shadow-md shadow-blue-600/25 cursor-pointer active:scale-98"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>Assign Patient</span>
          </button>
        </div>
      </div>

      {/* Main Assigned Patients Data Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden relative">
        <div className="overflow-x-auto min-h-[320px]">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200/70 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-4 px-6">Patient</th>
                <th className="py-4 px-6">Program Week</th>
                <th className="py-4 px-6 text-center">Adherence</th>
                <th className="py-4 px-6">Last Activity</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium text-xs">
                    No assigned patients found matching your search or filters.
                  </td>
                </tr>
              ) : (
                paginatedPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => setSelectedPatient(patient)}
                  >
                    {/* Patient Column */}
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3.5">
                        <img
                          src={patient.avatar}
                          alt={patient.name}
                          className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200 shadow-2xs"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {patient.name}
                          </h4>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">
                            {patient.condition}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Program Week Column */}
                    <td className="py-4 px-6 text-sm font-bold text-slate-800">
                      {patient.programWeek}
                    </td>

                    {/* Adherence Column */}
                    <td className="py-4 px-6 text-center">
                      {renderAdherenceBadge(patient.adherence)}
                    </td>

                    {/* Last Activity Column */}
                    <td className="py-4 px-6 text-xs font-semibold text-slate-500">
                      {patient.lastActivity}
                    </td>

                    {/* Status Column */}
                    <td className="py-4 px-6">
                      {renderStatusBadge(patient.status)}
                    </td>

                    {/* Actions Column */}
                    <td
                      className="py-4 px-6 text-right relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() =>
                          setActiveMenuId(activeMenuId === patient.id ? null : patient.id)
                        }
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === patient.id && (
                        <div className="absolute right-6 top-12 z-30 w-48 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 animate-in fade-in zoom-in-95 duration-150 text-left">
                          <button
                            onClick={() => {
                              setSelectedPatient(patient);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center space-x-2 cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                            <span>View Full Profile</span>
                          </button>
                          <button
                            onClick={() => {
                              handleToast(`Message sent to ${patient.name}`);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center space-x-2 cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                            <span>Send Message</span>
                          </button>
                          <button
                            onClick={() => {
                              handleToast(`Modifying protocol for ${patient.name}`);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center space-x-2 cursor-pointer"
                          >
                            <FileEdit className="w-3.5 h-3.5 text-slate-400" />
                            <span>Modify Protocol</span>
                          </button>
                          <div className="my-1 border-t border-slate-100" />
                          <button
                            onClick={() => handleToggleArchive(patient.id, patient.name)}
                            className="w-full px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center space-x-2 cursor-pointer"
                          >
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{patient.isArchived ? 'Unarchive Patient' : 'Archive Record'}</span>
                          </button>
                          <button
                            onClick={() => handleUnassignPatient(patient.id, patient.name)}
                            className="w-full px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center space-x-2 cursor-pointer"
                          >
                            <UserMinus className="w-3.5 h-3.5 text-rose-500" />
                            <span>Unassign Patient</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs font-semibold text-slate-400">
            Showing {paginatedPatients.length} of {filteredPatients.length} patients
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* PATIENT PROFILE DRAWER MODAL */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-6 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedPatient(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Header */}
            <div className="flex items-center space-x-4">
              <img
                src={selectedPatient.avatar}
                alt={selectedPatient.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-blue-500/20 shadow-md"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-extrabold text-slate-900">{selectedPatient.name}</h3>
                  {renderStatusBadge(selectedPatient.status)}
                </div>
                <p className="text-xs font-semibold text-slate-500 mt-1">{selectedPatient.condition}</p>
                <p className="text-[11px] text-slate-400 font-medium">Started: {selectedPatient.startDate || 'Jul 12, 2026'}</p>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  ADHERENCE
                </span>
                <span className="text-lg font-extrabold text-blue-600 mt-1 block">
                  {selectedPatient.adherence}%
                </span>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  CURRENT STAGE
                </span>
                <span className="text-xs font-bold text-slate-800 mt-1.5 block">
                  {selectedPatient.programWeek}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  LAST ACTIVE
                </span>
                <span className="text-xs font-semibold text-slate-600 mt-1.5 block">
                  {selectedPatient.lastActivity}
                </span>
              </div>
            </div>

            {/* Contact details */}
            <div className="space-y-2 text-xs font-medium text-slate-600">
              <div className="flex items-center justify-between p-3 bg-slate-50/60 rounded-xl">
                <span className="text-slate-400 font-bold">Email:</span>
                <span className="text-slate-900 font-semibold">{selectedPatient.email}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50/60 rounded-xl">
                <span className="text-slate-400 font-bold">Phone:</span>
                <span className="text-slate-900 font-semibold">{selectedPatient.phone}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => {
                  handleToast(`Reminder sent to ${selectedPatient.name}`);
                  setSelectedPatient(null);
                }}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer text-center"
              >
                Send Reminder
              </button>
              <button
                onClick={() => setSelectedPatient(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN PATIENT MODAL */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <form
            onSubmit={handleAddPatientSubmit}
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-5 animate-in zoom-in-95 duration-200"
          >
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Assign Patient to Program</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Assign a new patient to Lower Back Recovery Program (v2.1)
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Patient Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikramaditya Sen"
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Primary Medical Condition
                </label>
                <select
                  value={newPatientCondition}
                  onChange={(e) => setNewPatientCondition(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                >
                  <option value="L4-L5 Disc Bulge">L4-L5 Disc Bulge</option>
                  <option value="Chronic Sciatica">Chronic Sciatica</option>
                  <option value="Post-Op Lumbar Fixation">Post-Op Lumbar Fixation</option>
                  <option value="Muscle Strain Grade II">Muscle Strain Grade II</option>
                  <option value="Lumbar Spinal Stenosis">Lumbar Spinal Stenosis</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md shadow-blue-500/20"
              >
                Confirm Assignment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AssignedPatientsTabContent;
