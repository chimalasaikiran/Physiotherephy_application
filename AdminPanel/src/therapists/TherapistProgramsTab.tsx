import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  ArrowRight,
  ChevronDown,
  TrendingUp,
  Award,
  Calendar,
  Users,
  Clock,
  Zap,
  X,
  CheckCircle2,
  Edit3,
  Copy,
  Archive,
  Trash2,
  Layers,
  FileText,
  Activity,
} from 'lucide-react';
import type { Therapist } from './types';

interface ProgramItem {
  id: string;
  title: string;
  category: string;
  categoryTag: string;
  description: string;
  patientsCount: number;
  duration: string;
  intensity: 'High' | 'Medium' | 'Low';
  patientAvatars: string[];
  extraPatients: number;
  completionRate?: number;
}

interface TherapistProgramsTabProps {
  therapist?: Therapist | null;
}

export const TherapistProgramsTab: React.FC<TherapistProgramsTabProps> = ({
  therapist,
}) => {
  const therapistName = therapist?.name || 'Dr. Ananya Iyer';

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [timeframe, setTimeframe] = useState('Last 30 Days');
  const [isTimeframeOpen, setIsTimeframeOpen] = useState(false);

  // Active Menu Dropdown ID for Card 3-dots
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Selected Program for Details Modal
  const [selectedProgram, setSelectedProgram] = useState<ProgramItem | null>(null);

  // Create Program Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProgramTitle, setNewProgramTitle] = useState('');
  const [newProgramCategory, setNewProgramCategory] = useState('ORTHOPEDIC');
  const [newProgramDuration, setNewProgramDuration] = useState('8 Weeks');
  const [newProgramIntensity, setNewProgramIntensity] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [newProgramDesc, setNewProgramDesc] = useState('');

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Initial Program List from Figma Design
  const [programs, setPrograms] = useState<ProgramItem[]>([
    {
      id: 'prog-1',
      title: 'Post-Op ACL Recovery',
      category: 'ORTHOPEDIC',
      categoryTag: 'ORTHOPEDIC',
      description: 'Intensive phase-based rehabilitation protocol.',
      patientsCount: 12,
      duration: '12 Weeks',
      intensity: 'High',
      patientAvatars: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      ],
      extraPatients: 10,
      completionRate: 88,
    },
    {
      id: 'prog-2',
      title: 'Lumbar Spine Stabilization',
      category: 'SPINE CARE',
      categoryTag: 'SPINE CARE',
      description: 'Core integration and postural correction series.',
      patientsCount: 24,
      duration: '8 Weeks',
      intensity: 'Medium',
      patientAvatars: [
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
      ],
      extraPatients: 23,
      completionRate: 92,
    },
    {
      id: 'prog-3',
      title: 'Rotator Cuff Strengthening',
      category: 'UPPER LIMB',
      categoryTag: 'UPPER LIMB',
      description: 'Scapular mechanics and resistance protocols.',
      patientsCount: 6,
      duration: '6 Weeks',
      intensity: 'Low',
      patientAvatars: [
        'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
      ],
      extraPatients: 5,
      completionRate: 85,
    },
  ]);

  // Velocity Bar Chart Data (Heights in percentage & values)
  const velocityData = [
    { label: 'W1', value: 45, count: 12, height: 'h-[45%]' },
    { label: 'W2', value: 65, count: 15, height: 'h-[65%]' },
    { label: 'W3', value: 50, count: 14, height: 'h-[50%]' },
    { label: 'W4', value: 85, count: 18, height: 'h-[85%]' },
    { label: 'W5', value: 60, count: 16, height: 'h-[60%]' },
    { label: 'W6', value: 75, count: 17, height: 'h-[75%]' },
    { label: 'W7', value: 40, count: 11, height: 'h-[40%]' },
    { label: 'W8', value: 70, count: 16, height: 'h-[70%]' },
    { label: 'W9', value: 80, count: 19, height: 'h-[80%]' },
    { label: 'W10', value: 95, count: 24, height: 'h-[95%]' },
  ];

  // Category list for filter
  const categories = ['All', 'ORTHOPEDIC', 'SPINE CARE', 'UPPER LIMB'];

  // Filtered Programs
  const filteredPrograms = programs.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categoryTag.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategoryFilter === 'All' ||
      p.categoryTag.toUpperCase() === selectedCategoryFilter.toUpperCase();

    return matchesSearch && matchesCategory;
  });

  // Handle Create Program
  const handleCreateProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgramTitle.trim()) return;

    const newProg: ProgramItem = {
      id: `prog-${Date.now()}`,
      title: newProgramTitle,
      category: newProgramCategory,
      categoryTag: newProgramCategory,
      description: newProgramDesc || 'Custom tailored rehabilitation protocol.',
      patientsCount: 1,
      duration: newProgramDuration || '8 Weeks',
      intensity: newProgramIntensity,
      patientAvatars: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      ],
      extraPatients: 0,
      completionRate: 100,
    };

    setPrograms([newProg, ...programs]);
    setIsCreateModalOpen(false);
    setNewProgramTitle('');
    setNewProgramDesc('');
    showToast(`New program "${newProg.title}" created successfully.`);
  };

  // Intensity Pill Badge Styling Helper
  const getIntensityBadge = (intensity: 'High' | 'Medium' | 'Low') => {
    switch (intensity) {
      case 'High':
        return (
          <span className="px-2.5 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-md font-extrabold text-xs">
            High
          </span>
        );
      case 'Medium':
        return (
          <span className="px-2.5 py-0.5 bg-sky-50 text-sky-600 border border-sky-100 rounded-md font-extrabold text-xs">
            Medium
          </span>
        );
      case 'Low':
        return (
          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200/80 rounded-md font-extrabold text-xs">
            Low
          </span>
        );
    }
  };

  // Tag Badge Styling Helper
  const getCategoryBadge = (tag: string) => {
    const formatted = tag.toUpperCase();
    if (formatted.includes('ORTHO')) {
      return (
        <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100/80 rounded-md text-[10px] font-extrabold tracking-wider uppercase">
          {formatted}
        </span>
      );
    }
    if (formatted.includes('SPINE')) {
      return (
        <span className="px-3 py-1 bg-teal-50 text-teal-700 border border-teal-100/80 rounded-md text-[10px] font-extrabold tracking-wider uppercase">
          {formatted}
        </span>
      );
    }
    if (formatted.includes('UPPER') || formatted.includes('LIMB')) {
      return (
        <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-100/80 rounded-md text-[10px] font-extrabold tracking-wider uppercase">
          {formatted}
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-[10px] font-extrabold tracking-wider uppercase">
        {formatted}
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center space-x-2 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Action & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by program name or patient..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 shadow-2xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Action Buttons: Filter & Create Program */}
        <div className="flex items-center space-x-3">
          {/* Filters Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className="flex items-center space-x-2 px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 text-xs sm:text-sm font-extrabold rounded-2xl shadow-2xs transition-all cursor-pointer"
            >
              <Filter className="w-4 h-4 text-slate-500" />
              <span>Filters</span>
              {selectedCategoryFilter !== 'All' && (
                <span className="w-2 h-2 rounded-full bg-blue-600" />
              )}
            </button>

            {isFilterDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-30 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Filter by Category
                </div>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategoryFilter(cat);
                      setIsFilterDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                      selectedCategoryFilter === cat
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat}</span>
                    {selectedCategoryFilter === cat && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Create New Program Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 px-5 py-3 bg-[#0C3E6D] hover:bg-[#092e52] text-white text-xs sm:text-sm font-extrabold rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer whitespace-nowrap"
          >
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <Plus className="w-3.5 h-3.5 text-white" />
            </div>
            <span>Create New Program</span>
          </button>
        </div>
      </div>

      {/* 2. Program Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPrograms.map((prog) => (
          <div
            key={prog.id}
            className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-5 relative group"
          >
            {/* Top Row: Category Tag & 3-Dots Menu */}
            <div className="flex items-center justify-between">
              {getCategoryBadge(prog.categoryTag)}

              <div className="relative">
                <button
                  onClick={() => setActiveMenuId(activeMenuId === prog.id ? null : prog.id)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  title="Options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {activeMenuId === prog.id && (
                  <div className="absolute right-0 mt-1 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-20 space-y-0.5 animate-in fade-in duration-100">
                    <button
                      onClick={() => {
                        setSelectedProgram(prog);
                        setActiveMenuId(null);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center space-x-2 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>View Details</span>
                    </button>
                    <button
                      onClick={() => {
                        showToast(`Editing "${prog.title}"`);
                        setActiveMenuId(null);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center space-x-2 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Edit Program</span>
                    </button>
                    <button
                      onClick={() => {
                        showToast(`Duplicated "${prog.title}"`);
                        setActiveMenuId(null);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center space-x-2 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Duplicate</span>
                    </button>
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      onClick={() => {
                        setPrograms(programs.filter((p) => p.id !== prog.id));
                        showToast(`Archived "${prog.title}"`);
                        setActiveMenuId(null);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center space-x-2 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      <span>Archive Program</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5">
              <h3 className="text-lg font-extrabold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                {prog.title}
              </h3>
              <p className="text-xs font-medium text-slate-500 line-clamp-2 leading-relaxed">
                {prog.description}
              </p>
            </div>

            {/* Metrics Breakdown Box */}
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 grid grid-cols-3 gap-2 text-center divide-x divide-slate-200/60">
              {/* Metric 1: Patients */}
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Patients
                </span>
                <p className="text-base font-extrabold text-slate-900">{prog.patientsCount}</p>
              </div>

              {/* Metric 2: Duration */}
              <div className="space-y-1 pl-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Duration
                </span>
                <p className="text-base font-extrabold text-slate-900">{prog.duration}</p>
              </div>

              {/* Metric 3: Intensity */}
              <div className="space-y-1 pl-1 flex flex-col items-center justify-center">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Intensity
                </span>
                {getIntensityBadge(prog.intensity)}
              </div>
            </div>

            {/* Bottom Footer Row: Avatars & View Details Link */}
            <div className="flex items-center justify-between pt-2">
              {/* Avatars Stack */}
              <div className="flex items-center -space-x-2">
                {prog.patientAvatars.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt="Patient avatar"
                    className="w-7 h-7 rounded-full border-2 border-white object-cover shadow-2xs"
                  />
                ))}
                {prog.extraPatients > 0 && (
                  <span className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-extrabold text-slate-600 shadow-2xs">
                    +{prog.extraPatients}
                  </span>
                )}
              </div>

              {/* View Details Action Link */}
              <button
                onClick={() => setSelectedProgram(prog)}
                className="flex items-center space-x-1 text-xs font-extrabold text-blue-600 hover:text-blue-700 transition-all cursor-pointer group-hover:translate-x-0.5"
              >
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {/* Card 4: Build Custom Protocol (Add Action Card) */}
        <div
          onClick={() => setIsCreateModalOpen(true)}
          className="border-2 border-dashed border-slate-200/90 hover:border-blue-400 bg-slate-50/40 hover:bg-blue-50/30 transition-all rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer min-h-[240px] group"
        >
          <div className="w-12 h-12 rounded-full bg-blue-100/70 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-2xs">
            <Plus className="w-6 h-6" />
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
            Build Custom Protocol
          </h3>
          <p className="text-xs font-medium text-slate-500 mt-1 max-w-[200px]">
            Tailor exercises for unique patient needs
          </p>
        </div>
      </div>

      {/* 3. Program Insights Section */}
      <div className="space-y-4 pt-2">
        <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
          Program Insights
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Left Card: Patient Progress Velocity (2 Columns) */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs flex flex-col justify-between space-y-6">
            {/* Header with Title & Timeframe Filter Dropdown */}
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">
                Patient Progress Velocity
              </h3>

              <div className="relative">
                <button
                  onClick={() => setIsTimeframeOpen(!isTimeframeOpen)}
                  className="flex items-center space-x-1.5 text-xs font-extrabold text-slate-600 hover:text-slate-900 py-1.5 px-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/80 transition-all cursor-pointer"
                >
                  <span>{timeframe}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isTimeframeOpen && (
                  <div className="absolute right-0 mt-1 w-36 bg-white rounded-2xl shadow-xl border border-slate-100 p-1 z-20 space-y-0.5 animate-in fade-in duration-100">
                    {['Last 7 Days', 'Last 30 Days', 'Last 3 Months', 'This Year'].map((tf) => (
                      <button
                        key={tf}
                        onClick={() => {
                          setTimeframe(tf);
                          setIsTimeframeOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
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

            {/* Interactive Bar Chart Visual */}
            <div className="pt-4 pb-2">
              <div className="h-44 w-full flex items-end justify-between gap-2 px-2 border-b border-slate-100">
                {velocityData.map((d, i) => (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                  >
                    {/* Hover Tooltip */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all duration-150 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg pointer-events-none whitespace-nowrap shadow-lg z-10">
                      {d.value}% velocity ({d.count} patients)
                    </div>

                    {/* Bar Pillar */}
                    <div
                      className={`w-full max-w-[28px] ${d.height} rounded-t-xl transition-all duration-300 group-hover:opacity-90 ${
                        i % 3 === 0
                          ? 'bg-[#0C3E6D]'
                          : i % 2 === 0
                          ? 'bg-blue-500/80'
                          : 'bg-blue-300/80'
                      }`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-400 px-2 pt-3">
                <span>Week 1</span>
                <span>Week 5</span>
                <span>Week 10</span>
              </div>
            </div>
          </div>

          {/* Right Card: Most Successful (1 Column) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs flex flex-col justify-between space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 mb-4">
                Most Successful
              </h3>

              {/* Highlight Banner */}
              <div className="bg-teal-50/70 border border-teal-100 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                      Lumbar Stabilization
                    </h4>
                    <span className="text-[11px] font-semibold text-teal-700">Highest Engagement</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100/80 text-emerald-800 rounded-full text-[11px] font-extrabold">
                  92% Completion
                </span>
              </div>
            </div>

            {/* Quote Block */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <p className="text-xs sm:text-sm font-medium text-slate-600 italic leading-relaxed">
                "{therapistName}'s protocols have seen a 14% improvement in engagement since the mobile app rollout."
              </p>
              <span className="text-xs font-bold text-slate-400 block">— Clinic Admin Insight</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL 1: CREATE NEW PROGRAM ================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2.5 text-[#0C3E6D]">
                <Layers className="w-6 h-6" />
                <h3 className="text-lg font-extrabold text-slate-900">Create New Program</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProgram} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Program Title *
                </label>
                <input
                  type="text"
                  required
                  value={newProgramTitle}
                  onChange={(e) => setNewProgramTitle(e.target.value)}
                  placeholder="e.g., Cervical Spine Rehab"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                    Category Tag
                  </label>
                  <select
                    value={newProgramCategory}
                    onChange={(e) => setNewProgramCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="ORTHOPEDIC">ORTHOPEDIC</option>
                    <option value="SPINE CARE">SPINE CARE</option>
                    <option value="UPPER LIMB">UPPER LIMB</option>
                    <option value="LOWER LIMB">LOWER LIMB</option>
                    <option value="NEUROLOGICAL">NEUROLOGICAL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                    Duration
                  </label>
                  <select
                    value={newProgramDuration}
                    onChange={(e) => setNewProgramDuration(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="4 Weeks">4 Weeks</option>
                    <option value="6 Weeks">6 Weeks</option>
                    <option value="8 Weeks">8 Weeks</option>
                    <option value="12 Weeks">12 Weeks</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Intensity Level
                </label>
                <div className="flex space-x-3">
                  {(['Low', 'Medium', 'High'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setNewProgramIntensity(lvl)}
                      className={`flex-1 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                        newProgramIntensity === lvl
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Protocol Overview
                </label>
                <textarea
                  rows={3}
                  value={newProgramDesc}
                  onChange={(e) => setNewProgramDesc(e.target.value)}
                  placeholder="Describe key rehab objectives and milestone phases..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0C3E6D] hover:bg-[#092e52] text-white text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Save & Publish Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: PROGRAM DETAILS MODAL ================= */}
      {selectedProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-xl w-full p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  {getCategoryBadge(selectedProgram.categoryTag)}
                  {getIntensityBadge(selectedProgram.intensity)}
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 pt-1">
                  {selectedProgram.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProgram(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4 text-xs sm:text-sm text-slate-600">
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-slate-400 mb-1">
                  Protocol Description
                </h4>
                <p className="leading-relaxed font-medium">{selectedProgram.description}</p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Enrolled</span>
                  <span className="text-base font-extrabold text-slate-900">{selectedProgram.patientsCount} Patients</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Duration</span>
                  <span className="text-base font-extrabold text-slate-900">{selectedProgram.duration}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Success Rate</span>
                  <span className="text-base font-extrabold text-emerald-600">{selectedProgram.completionRate || 90}%</span>
                </div>
              </div>

              {/* Program Milestone Phases */}
              <div className="space-y-2 pt-2">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-slate-400">
                  Protocol Milestone Phases
                </h4>
                <div className="space-y-2">
                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-slate-900 block text-xs">Phase 1: Pain & Inflammation Reduction</span>
                      <span className="text-[11px] text-slate-500 font-medium">Weeks 1 - 2 • Passive Range of Motion</span>
                    </div>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-extrabold text-[10px] rounded-md">Active</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-slate-900 block text-xs">Phase 2: Strength & Load Tolerance</span>
                      <span className="text-[11px] text-slate-500 font-medium">Weeks 3 - 6 • Isometric & Isotonic Exercises</span>
                    </div>
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-600 font-extrabold text-[10px] rounded-md">Upcoming</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-slate-900 block text-xs">Phase 3: Functional Return to Sport</span>
                      <span className="text-[11px] text-slate-500 font-medium">Weeks 7 - 12 • Agility & Plyometrics</span>
                    </div>
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-600 font-extrabold text-[10px] rounded-md">Upcoming</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  showToast(`Assigned "${selectedProgram.title}" to patient.`);
                  setSelectedProgram(null);
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer"
              >
                Assign to Patient
              </button>
              <button
                onClick={() => setSelectedProgram(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistProgramsTab;
