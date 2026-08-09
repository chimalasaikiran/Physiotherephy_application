import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  FileText,
  CreditCard,
  ClipboardList,
  BarChart2,
  TrendingUp,
  Filter,
  ShieldCheck,
  RotateCcw,
  Download,
  Plus,
  Search,
  CheckCircle2,
  ChevronDown,
  X,
  Activity,
  ArrowRight,
} from 'lucide-react';

interface HistoryTabProps {
  patientName?: string;
  therapistName?: string;
}

export interface ActivityLogItem {
  id: string;
  dateGroup: string; // e.g. "Today, Oct 25"
  time: string;
  category: 'CLINICAL UPDATE' | 'BILLING' | 'SCHEDULING' | 'DOCUMENTS' | 'CARE PLAN';
  title: string;
  author: string;
  quote?: string;
  badgeText?: string;
  badgeType?: 'success' | 'info' | 'warning';
  rescheduleFrom?: string;
  rescheduleTo?: string;
  fileName?: string;
  fileSize?: string;
  assignedProgram?: string;
  iconType: 'note' | 'billing' | 'calendar' | 'document' | 'program';
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  patientName = 'Sanya Malhotra',
  therapistName = 'Dr. Ananya Iyer',
}) => {
  // Toast notification feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Activity items state
  const [activities, setActivities] = useState<ActivityLogItem[]>([
    {
      id: 'act-1',
      dateGroup: 'Today, Oct 25',
      time: '11:45 AM',
      category: 'CLINICAL UPDATE',
      title: 'Dr. Ananya Iyer added a clinical note',
      author: 'Dr. Ananya Iyer',
      quote:
        'Patient showing 15% increase in knee flexion. Pain levels reported at 2/10 during extension exercises.',
      iconType: 'note',
    },
    {
      id: 'act-2',
      dateGroup: 'Today, Oct 25',
      time: '09:15 AM',
      category: 'BILLING',
      title: 'Payment Success • Session Fee',
      author: 'System / Stripe Billing',
      badgeText: '₹1,200 RECEIVED',
      badgeType: 'success',
      iconType: 'billing',
    },
    {
      id: 'act-3',
      dateGroup: 'Monday, Oct 23',
      time: '04:30 PM',
      category: 'SCHEDULING',
      title: 'Admin (Priya S.) rescheduled an appointment',
      author: 'Priya S.',
      rescheduleFrom: 'Oct 24, 4:00 PM',
      rescheduleTo: 'Oct 26, 11:00 AM',
      iconType: 'calendar',
    },
    {
      id: 'act-4',
      dateGroup: 'Monday, Oct 23',
      time: '10:05 AM',
      category: 'DOCUMENTS',
      title: 'Patient Portal • MRI Report Uploaded',
      author: 'Sanya Malhotra (Patient Portal)',
      fileName: 'Sanya_Malhotra_Knee_MRI_Oct23.pdf',
      fileSize: '4.2 MB',
      iconType: 'document',
    },
    {
      id: 'act-5',
      dateGroup: 'Oct 18',
      time: '03:20 PM',
      category: 'CARE PLAN',
      title: 'Dr. Rahul Sharma assigned new Program Module',
      author: 'Dr. Rahul Sharma',
      assignedProgram: 'Phase 2: Progressive Loading & Stability',
      iconType: 'program',
    },
  ]);

  // Loaded older items flag
  const [hasLoadedOlder, setHasLoadedOlder] = useState(false);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('All Activities');
  const [selectedStaff, setSelectedStaff] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('Oct 1, 2023 - Oct 25, 2023');

  // Modal states
  const [isDateRangeModalOpen, setIsDateRangeModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState<boolean>(false);

  // New activity form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<
    'CLINICAL UPDATE' | 'BILLING' | 'SCHEDULING' | 'DOCUMENTS' | 'CARE PLAN'
  >('CLINICAL UPDATE');
  const [newAuthor, setNewAuthor] = useState(therapistName);
  const [newQuote, setNewQuote] = useState('');

  // Handle load older activities
  const handleLoadOlder = () => {
    if (hasLoadedOlder) {
      showToast('All historical activity logs are currently loaded.');
      return;
    }

    const olderItems: ActivityLogItem[] = [
      {
        id: 'act-6',
        dateGroup: 'Oct 12',
        time: '02:15 PM',
        category: 'CLINICAL UPDATE',
        title: 'Initial Assessment & Baseline ROM Scan Recorded',
        author: 'Dr. Ananya Iyer',
        quote: 'Baseline lumbar flexion range measured at 45 degrees. Pain score Vas 6/10.',
        iconType: 'note',
      },
      {
        id: 'act-7',
        dateGroup: 'Oct 05',
        time: '11:00 AM',
        category: 'BILLING',
        title: 'Package Purchased • 10 Session Rehab Bundle',
        author: 'Priya S.',
        badgeText: '₹12,000 PAID',
        badgeType: 'success',
        iconType: 'billing',
      },
    ];

    setActivities((prev) => [...prev, ...olderItems]);
    setHasLoadedOlder(true);
    showToast('Loaded 2 older activity items from October!');
  };

  // Reset filters handler
  const handleResetFilters = () => {
    setSelectedCategory('All Activities');
    setSelectedStaff('All');
    setSearchQuery('');
    setSelectedDateRange('Oct 1, 2023 - Oct 25, 2023');
    showToast('History filters have been reset to default.');
  };

  // Add new activity submission
  const handleAddActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast('Please enter an action title.');
      return;
    }

    const newAct: ActivityLogItem = {
      id: `act-${Date.now()}`,
      dateGroup: 'Today, Oct 25',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: newCategory,
      title: newTitle.trim(),
      author: newAuthor.trim() || therapistName,
      quote: newQuote.trim() || undefined,
      iconType:
        newCategory === 'CLINICAL UPDATE'
          ? 'note'
          : newCategory === 'BILLING'
          ? 'billing'
          : newCategory === 'SCHEDULING'
          ? 'calendar'
          : newCategory === 'DOCUMENTS'
          ? 'document'
          : 'program',
    };

    setActivities((prev) => [newAct, ...prev]);
    setIsAddActivityModalOpen(false);
    setNewTitle('');
    setNewQuote('');
    showToast(`New audit log entry "${newAct.title}" added successfully!`);
  };

  // Filter activities
  const filteredActivities = activities.filter((item) => {
    // Category Filter
    if (selectedCategory !== 'All Activities') {
      const matchCat =
        (selectedCategory === 'Clinical Updates' && item.category === 'CLINICAL UPDATE') ||
        (selectedCategory === 'Billing' && item.category === 'BILLING') ||
        (selectedCategory === 'Scheduling' && item.category === 'SCHEDULING') ||
        (selectedCategory === 'Documents' && item.category === 'DOCUMENTS') ||
        (selectedCategory === 'Care Plan' && item.category === 'CARE PLAN');
      if (!matchCat) return false;
    }

    // Staff Filter
    if (selectedStaff !== 'All') {
      if (selectedStaff === 'Dr. Sharma' && !item.author.includes('Sharma')) return false;
      if (selectedStaff === 'Dr. Iyer' && !item.author.includes('Iyer')) return false;
      if (selectedStaff === 'Priya S.' && !item.author.includes('Priya')) return false;
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchAuthor = item.author.toLowerCase().includes(q);
      const matchQuote = item.quote?.toLowerCase().includes(q);
      const matchCategory = item.category.toLowerCase().includes(q);
      if (!matchTitle && !matchAuthor && !matchQuote && !matchCategory) return false;
    }

    return true;
  });

  // Group activities by dateGroup
  const groupedMap: { [key: string]: ActivityLogItem[] } = {};
  filteredActivities.forEach((act) => {
    if (!groupedMap[act.dateGroup]) {
      groupedMap[act.dateGroup] = [];
    }
    groupedMap[act.dateGroup].push(act);
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center space-x-2.5 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================= TOP TOOLBAR & CONTROLS ================= */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Search + Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative min-w-[200px] sm:min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history logs..."
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Date Range Picker Trigger */}
          <button
            onClick={() => setIsDateRangeModalOpen(true)}
            className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>{selectedDateRange}</span>
          </button>
        </div>

        {/* Right Side: Quick Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-bold rounded-2xl shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center space-x-2"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Log</span>
          </button>

          <button
            onClick={() => setIsAddActivityModalOpen(true)}
            className="px-5 py-2.5 bg-[#0C3E6D] hover:bg-[#092e52] text-white text-xs sm:text-sm font-extrabold rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center space-x-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Log Entry</span>
          </button>
        </div>
      </div>

      {/* ================= MAIN CONTENT GRID (2 COLUMNS: ~65% LEFT, ~35% RIGHT) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ================= LEFT COLUMN: ACTIVITY LOG TIMELINE (~65% width) ================= */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section Card Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Activity Log
            </h2>

            {/* Date Range Badge (Figma Style) */}
            <button
              onClick={() => setIsDateRangeModalOpen(true)}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-600 transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{selectedDateRange}</span>
            </button>
          </div>

          {/* Timeline Feed Container */}
          {Object.keys(groupedMap).length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-slate-100 text-center space-y-4 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Activity className="w-6 h-6" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900">No activity logs found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No activity log records match your filter criteria or search query. Try resetting your filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="relative pl-6 space-y-8">
              {/* Vertical Timeline Line */}
              <div className="absolute left-[11px] top-3 bottom-4 w-0.5 bg-slate-200/80" />

              {Object.entries(groupedMap).map(([dateGroup, items], groupIdx) => (
                <div key={dateGroup} className="space-y-4 relative">
                  {/* Timeline Date Header & Dot */}
                  <div className="flex items-center space-x-3 -ml-[23px] relative z-10">
                    {/* Node Circle */}
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-2xs ${
                        groupIdx === 0 ? 'bg-blue-600 ring-4 ring-blue-50' : 'bg-slate-300'
                      }`}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>

                    <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                      {dateGroup}
                    </h3>
                  </div>

                  {/* List of Cards under Date Group */}
                  <div className="space-y-3.5 pl-2">
                    {items.map((item) => {
                      // Styling based on iconType / category
                      let iconBg = 'bg-teal-50 text-teal-600';
                      let IconComponent = FileText;

                      if (item.iconType === 'note') {
                        iconBg = 'bg-teal-50 text-teal-600';
                        IconComponent = FileText;
                      } else if (item.iconType === 'billing') {
                        iconBg = 'bg-purple-50 text-purple-600';
                        IconComponent = CreditCard;
                      } else if (item.iconType === 'calendar') {
                        iconBg = 'bg-blue-50 text-blue-600';
                        IconComponent = Calendar;
                      } else if (item.iconType === 'document') {
                        iconBg = 'bg-rose-50 text-rose-600';
                        IconComponent = FileText;
                      } else if (item.iconType === 'program') {
                        iconBg = 'bg-teal-50 text-teal-600';
                        IconComponent = ClipboardList;
                      }

                      return (
                        <div
                          key={item.id}
                          className="bg-white rounded-3xl p-5 border border-slate-100 shadow-2xs hover:shadow-xs transition-all space-y-3.5 group"
                        >
                          {/* Card Header: Icon + Title + Badge */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start space-x-3.5 min-w-0">
                              {/* Circle Icon Badge */}
                              <div
                                className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0 shadow-2xs mt-0.5`}
                              >
                                <IconComponent className="w-5 h-5" />
                              </div>

                              {/* Action Title */}
                              <div>
                                <h4 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                                  {item.title}
                                </h4>

                                {/* Quote / Description Details */}
                                {item.quote && (
                                  <p className="text-xs italic text-slate-600 font-medium leading-relaxed mt-1.5 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                                    "{item.quote}"
                                  </p>
                                )}

                                {/* Reschedule Pill Display */}
                                {item.rescheduleFrom && item.rescheduleTo && (
                                  <div className="flex flex-wrap items-center gap-2 mt-2">
                                    <span className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-500 text-xs font-semibold rounded-xl line-through">
                                      {item.rescheduleFrom}
                                    </span>
                                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="px-3 py-1 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold rounded-xl">
                                      {item.rescheduleTo}
                                    </span>
                                  </div>
                                )}

                                {/* File Attachment Info */}
                                {item.fileName && (
                                  <div className="pt-1.5 text-xs font-semibold text-slate-600">
                                    <span className="text-slate-800">{item.fileName}</span>{' '}
                                    <span className="text-slate-400">({item.fileSize})</span>
                                  </div>
                                )}

                                {/* Assigned Program Link */}
                                {item.assignedProgram && (
                                  <div className="pt-1.5 text-xs font-bold text-slate-600">
                                    Assigned:{' '}
                                    <span className="text-blue-600 hover:underline cursor-pointer">
                                      {item.assignedProgram}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Badge Pill (e.g. ₹1,200 RECEIVED) */}
                            {item.badgeText && (
                              <span className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-extrabold flex-shrink-0">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{item.badgeText}</span>
                              </span>
                            )}
                          </div>

                          {/* Footer Meta Row */}
                          <div className="pt-2 border-t border-slate-100 flex items-center space-x-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                            <span>{item.time}</span>
                            <span>•</span>
                            <span className="text-slate-500">{item.category}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Centered Button: Load Older Activities */}
          <div className="pt-4 text-center">
            <button
              onClick={handleLoadOlder}
              className="px-6 py-3 bg-white hover:bg-slate-50 border border-dashed border-slate-300 text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-extrabold rounded-2xl shadow-2xs hover:shadow-xs transition-all cursor-pointer inline-flex items-center space-x-2"
            >
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Load Older Activities</span>
            </button>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: SIDEBAR WIDGETS (~35% width) ================= */}
        <div className="space-y-6">
          {/* ================= WIDGET 1: AUDIT SUMMARY ================= */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-5">
            {/* Header */}
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <BarChart2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Audit Summary
              </h3>
            </div>

            {/* Total Actions Metric */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  TOTAL ACTIONS (OCT)
                </p>
                <h4 className="text-3xl font-black text-slate-900 mt-0.5">42</h4>
              </div>

              {/* Sparkline / Trend Icon Circle */}
              <div className="w-11 h-11 rounded-full bg-blue-50/80 text-blue-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            {/* Sub-Card: MOST ACTIVE STAFF */}
            <div className="bg-blue-50/60 rounded-2xl p-4 border border-blue-100/70 space-y-3">
              <p className="text-[10px] font-extrabold text-blue-800 uppercase tracking-wider">
                MOST ACTIVE STAFF
              </p>

              <div className="flex items-center space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop&q=80"
                  alt="Dr. Ananya Iyer"
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-2xs"
                />
                <div>
                  <h5 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    Dr. Ananya Iyer
                  </h5>
                  <p className="text-[11px] font-semibold text-slate-500">18 Actions this month</p>
                </div>
              </div>
            </div>

            {/* Sub-Section: CATEGORY DISTRIBUTION */}
            <div className="space-y-3 pt-2">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                CATEGORY DISTRIBUTION
              </p>

              {/* Multi-segment Progress Bar */}
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                <div className="bg-indigo-900 h-full w-[50%]" title="Clinical (50%)" />
                <div className="bg-purple-600 h-full w-[30%]" title="Admin (30%)" />
                <div className="bg-blue-300 h-full w-[20%]" title="Billing (20%)" />
              </div>

              {/* Category Legend Labels */}
              <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-500 uppercase tracking-wider pt-1">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-900 inline-block" />
                  <span>CLINICAL</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-600 inline-block" />
                  <span>ADMIN</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-300 inline-block" />
                  <span>BILLING</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= WIDGET 2: FILTER HISTORY ================= */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-5">
            {/* Header */}
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <Filter className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Filter History
              </h3>
            </div>

            {/* Filter Option 1: CATEGORY */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                CATEGORY
              </label>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer pr-10"
                >
                  <option value="All Activities">All Activities</option>
                  <option value="Clinical Updates">Clinical Updates</option>
                  <option value="Billing">Billing</option>
                  <option value="Scheduling">Scheduling</option>
                  <option value="Documents">Documents</option>
                  <option value="Care Plan">Care Plan</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Filter Option 2: STAFF MEMBER */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                STAFF MEMBER
              </label>

              <div className="flex flex-wrap gap-2">
                {['All', 'Dr. Sharma', 'Dr. Iyer', 'Priya S.'].map((staff) => (
                  <button
                    key={staff}
                    onClick={() => setSelectedStaff(staff)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      selectedStaff === staff
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                    }`}
                  >
                    {staff}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Filters Button */}
            <div className="pt-2">
              <button
                onClick={handleResetFilters}
                className="w-full py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-extrabold rounded-2xl shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Reset Filters</span>
              </button>
            </div>
          </div>

          {/* ================= WIDGET 3: AUDIT TRAIL VERIFIED BANNER ================= */}
          <div className="bg-emerald-50/80 border border-emerald-100 rounded-3xl p-5 flex items-start space-x-3.5 shadow-2xs">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-extrabold text-emerald-900 tracking-wider uppercase">
                AUDIT TRAIL VERIFIED
              </h4>
              <p className="text-[11px] font-semibold text-emerald-700 leading-snug">
                This log is immutable and HIPAA compliant.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODALS & DIALOGS ================= */}

      {/* 1. DATE RANGE MODAL */}
      {isDateRangeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Select Date Range</h3>
              <button
                onClick={() => setIsDateRangeModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {[
                'Oct 1, 2023 - Oct 25, 2023',
                'Last 7 Days',
                'Last 30 Days',
                'September 2023',
                'All Time',
              ].map((range) => (
                <button
                  key={range}
                  onClick={() => {
                    setSelectedDateRange(range);
                    setIsDateRangeModalOpen(false);
                    showToast(`Date range set to: ${range}`);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-colors ${
                    selectedDateRange === range
                      ? 'bg-blue-50 text-blue-600 border border-blue-100'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. EXPORT MODAL */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Export Audit Trail Log</h3>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 font-semibold">
              Select your desired export format for {patientName}'s audit history log:
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setIsExportModalOpen(false);
                  showToast('Exporting PDF Audit Report...');
                }}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-2xl transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-rose-600" />
                  <span className="text-xs font-extrabold text-slate-800 group-hover:text-blue-700">
                    PDF Document (.pdf)
                  </span>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </button>

              <button
                onClick={() => {
                  setIsExportModalOpen(false);
                  showToast('Exporting CSV Spreadsheet...');
                }}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-2xl transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-extrabold text-slate-800 group-hover:text-blue-700">
                    CSV Spreadsheet (.csv)
                  </span>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. ADD LOG ENTRY MODAL */}
      {isAddActivityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Add Log Entry</h3>
                <p className="text-xs text-slate-500 font-medium">Record a manual activity into the audit trail</p>
              </div>
              <button
                onClick={() => setIsAddActivityModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddActivitySubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Action Title *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Patient consulted regarding home exercise compliance"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) =>
                      setNewCategory(
                        e.target.value as
                          | 'CLINICAL UPDATE'
                          | 'BILLING'
                          | 'SCHEDULING'
                          | 'DOCUMENTS'
                          | 'CARE PLAN'
                      )
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="CLINICAL UPDATE">CLINICAL UPDATE</option>
                    <option value="BILLING">BILLING</option>
                    <option value="SCHEDULING">SCHEDULING</option>
                    <option value="DOCUMENTS">DOCUMENTS</option>
                    <option value="CARE PLAN">CARE PLAN</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Logged By
                  </label>
                  <input
                    type="text"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Notes / Details (Optional)
                </label>
                <textarea
                  rows={3}
                  value={newQuote}
                  onChange={(e) => setNewQuote(e.target.value)}
                  placeholder="Additional details regarding this action..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddActivityModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-extrabold text-white bg-[#0C3E6D] hover:bg-[#092e52] rounded-xl transition-colors cursor-pointer shadow-md"
                >
                  Save Log Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryTab;
