import React, { useState } from 'react';
import {
  FileText,
  Lock,
  Search,
  Plus,
  Calendar,
  ChevronDown,
  Flag,
  Share2,
  Download,
  ExternalLink,
  X,
  CheckCircle2,
  Video,
  Link as LinkIcon,
  Clock,
  Send,
} from 'lucide-react';

interface NotesTabProps {
  patientName?: string;
  therapistName?: string;
}

export interface ClinicalNoteItem {
  id: string;
  title: string;
  category: 'SESSION NOTE' | 'INTERNAL' | 'ASSESSMENT' | 'REFERRAL';
  date: string;
  time: string;
  author: string;
  content: string;
  contentSecondary?: string;
  isInternal: boolean;
  attachments?: {
    name: string;
    type: 'pdf' | 'link' | 'video';
    url?: string;
  }[];
}

export const NotesTab: React.FC<NotesTabProps> = ({
  patientName = 'Sanya Malhotra',
  therapistName = 'Dr. Ananya Iyer',
}) => {
  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Notes List State
  const [notes, setNotes] = useState<ClinicalNoteItem[]>([
    {
      id: 'note-1',
      title: 'Session Note - Lower Lumbar Focus',
      category: 'SESSION NOTE',
      date: '22 Feb 2024',
      time: '10:30 AM',
      author: 'Dr. Ananya Iyer',
      isInternal: false,
      content:
        "Sanya reported a significant reduction in morning stiffness compared to last week (3/10 vs 6/10 on VAS). Today's focus was on dynamic lumbar stabilization and progressive loading of the posterior chain.",
      contentSecondary:
        'Observed slight compensation in right hip during single-leg bridge exercises. Corrected with tactile cues to pelvis. Patient was able to complete 3 sets of 12 reps with good form afterwards.',
      attachments: [
        { name: 'Mobility_Report_V2.pdf', type: 'pdf' },
        { name: 'Exercise Log', type: 'link' },
      ],
    },
    {
      id: 'note-2',
      title: 'Private Note: Therapist Transition',
      category: 'INTERNAL',
      date: '20 Feb 2024',
      time: '04:15 PM',
      author: 'Dr. Ananya Iyer',
      isInternal: true,
      content:
        '"Patient is highly motivated but tends to over-train at home. Suggested a strict rest day on Sundays. If her ROM doesn\'t improve by next Friday, consider referring back to Dr. Kapoor for a fresh MRI consult on L4-L5."',
    },
    {
      id: 'note-3',
      title: 'Initial Assessment - Post-Op Review',
      category: 'ASSESSMENT',
      date: '15 Feb 2024',
      time: '09:00 AM',
      author: 'Dr. Rajesh Mehta',
      isInternal: false,
      content:
        "Standard post-operative review 6 weeks following microdiscectomy. Scar tissue healing well. Baseline flexion/extension measurements recorded in 'Progress' tab. Patient cleared for Phase 2 rehabilitation.",
    },
  ]);

  // Loaded Previous Notes State Flag
  const [hasLoadedPrevious, setHasLoadedPrevious] = useState(false);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [internalOnlyToggle, setInternalOnlyToggle] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('All Time');
  const [isDateRangeModalOpen, setIsDateRangeModalOpen] = useState(false);

  // Modal States
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ name: string; type: string } | null>(null);

  // New Note Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'SESSION NOTE' | 'INTERNAL' | 'ASSESSMENT' | 'REFERRAL'>('SESSION NOTE');
  const [newContent, setNewContent] = useState('');
  const [newContentSecondary, setNewContentSecondary] = useState('');
  const [newIsInternal, setNewIsInternal] = useState(false);
  const [newAttachmentName, setNewAttachmentName] = useState('');

  // Share Form State
  const [specialistEmail, setSpecialistEmail] = useState('');
  const [specialistNote, setSpecialistNote] = useState('');

  // Handler: Load previous notes
  const handleLoadPreviousNotes = () => {
    if (hasLoadedPrevious) {
      showToast('All historical clinical notes are currently loaded.');
      return;
    }

    const historicalNotes: ClinicalNoteItem[] = [
      {
        id: 'note-4',
        title: 'Orthopedic Consult Referral Note',
        category: 'REFERRAL',
        date: '08 Feb 2024',
        time: '02:30 PM',
        author: 'Dr. Rajesh Mehta',
        isInternal: false,
        content:
          'Referred patient to Dr. Kapoor for secondary evaluation of spinal alignment prior to launching progressive resistance loading.',
        attachments: [{ name: 'Referral_Summary.pdf', type: 'pdf' }],
      },
      {
        id: 'note-5',
        title: 'Biomechanical Baseline & Posture Assessment',
        category: 'SESSION NOTE',
        date: '01 Feb 2024',
        time: '11:00 AM',
        author: 'Dr. Ananya Iyer',
        isInternal: false,
        content:
          'Baseline postural scan completed. Moderate thoracic curvature observed along with 15-degree anterior pelvic tilt.',
      },
    ];

    setNotes((prev) => [...prev, ...historicalNotes]);
    setHasLoadedPrevious(true);
    showToast('Loaded 2 previous historical clinical notes!');
  };

  // Handler: Add New Note
  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      showToast('Please fill in required fields (Title and Observations).');
      return;
    }

    const todayStr = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const createdNote: ClinicalNoteItem = {
      id: `note-${Date.now()}`,
      title: newTitle.trim(),
      category: newIsInternal ? 'INTERNAL' : newCategory,
      date: todayStr,
      time: '10:00 AM',
      author: therapistName,
      isInternal: newIsInternal,
      content: newContent.trim(),
      contentSecondary: newContentSecondary.trim() || undefined,
      attachments: newAttachmentName.trim()
        ? [{ name: newAttachmentName.trim(), type: 'pdf' }]
        : undefined,
    };

    setNotes((prev) => [createdNote, ...prev]);
    setIsAddNoteModalOpen(false);

    // Reset Form
    setNewTitle('');
    setNewCategory('SESSION NOTE');
    setNewContent('');
    setNewContentSecondary('');
    setNewIsInternal(false);
    setNewAttachmentName('');

    showToast(`New ${newIsInternal ? 'internal ' : ''}note "${createdNote.title}" added!`);
  };

  // Filter Notes Logic
  const filteredNotes = notes.filter((note) => {
    // 1. Internal Only Filter
    if (internalOnlyToggle && !note.isInternal) {
      return false;
    }

    // 2. Category Filter
    if (selectedCategory !== 'All Categories') {
      const catMatch =
        (selectedCategory === 'Session Note' && note.category === 'SESSION NOTE') ||
        (selectedCategory === 'Internal Only' && note.isInternal) ||
        (selectedCategory === 'Assessment' && note.category === 'ASSESSMENT') ||
        (selectedCategory === 'Referral' && note.category === 'REFERRAL');
      if (!catMatch) return false;
    }

    // 3. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = note.title.toLowerCase().includes(q);
      const matchContent = note.content.toLowerCase().includes(q);
      const matchAuthor = note.author.toLowerCase().includes(q);
      if (!matchTitle && !matchContent && !matchAuthor) return false;
    }

    return true;
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

      {/* ================= TOP FILTER & CONTROLS TOOLBAR ================= */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side Filters: Dropdowns, Date Range, Search & Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          {/* 1. All Categories Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 flex items-center space-x-2 transition-colors cursor-pointer"
            >
              <span>{selectedCategory}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {isCategoryDropdownOpen && (
              <div className="absolute left-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-30 py-2 animate-in fade-in zoom-in-95 duration-150">
                {['All Categories', 'Session Note', 'Internal Only', 'Assessment', 'Referral'].map(
                  (cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setIsCategoryDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs sm:text-sm font-semibold transition-colors ${
                        selectedCategory === cat
                          ? 'bg-blue-50 text-blue-600 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {/* 2. Date Range Button */}
          <button
            onClick={() => setIsDateRangeModalOpen(true)}
            className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Date Range</span>
            {selectedDateRange !== 'All Time' && (
              <span className="ml-1 text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full">
                {selectedDateRange}
              </span>
            )}
          </button>

          {/* Search Input Filter */}
          <div className="relative min-w-[160px] sm:min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 3. Internal Only Switch Toggle */}
          <div className="flex items-center space-x-2.5 bg-slate-50 border border-slate-200/80 px-3.5 py-2 rounded-2xl">
            <button
              type="button"
              onClick={() => setInternalOnlyToggle(!internalOnlyToggle)}
              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                internalOnlyToggle ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  internalOnlyToggle ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-xs font-bold text-slate-700 whitespace-nowrap cursor-pointer" onClick={() => setInternalOnlyToggle(!internalOnlyToggle)}>
              Internal Only
            </span>
          </div>
        </div>

        {/* Right Side: + Add New Note Button */}
        <div>
          <button
            onClick={() => setIsAddNoteModalOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#0C3E6D] hover:bg-[#092e52] text-white text-xs sm:text-sm font-extrabold rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New Note</span>
          </button>
        </div>
      </div>

      {/* ================= MAIN CONTENT GRID (2 COLUMNS: ~68% LEFT, ~32% RIGHT) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ================= LEFT COLUMN: NOTES FEED (~68% on Desktop) ================= */}
        <div className="lg:col-span-2 space-y-5">
          {filteredNotes.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-slate-100 text-center space-y-4 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900">No notes found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No clinical notes match your current search or filter criteria. Try adjusting your filters or add a new note.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All Categories');
                  setInternalOnlyToggle(false);
                  setSearchQuery('');
                  setSelectedDateRange('All Time');
                }}
                className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredNotes.map((note) => {
              // Styling parameters based on Category & Internal status
              let borderColor = 'border-l-blue-600';
              let iconBg = 'bg-blue-50 text-blue-600';
              let badgeBg = 'bg-blue-50/80 text-blue-700 border-blue-100';

              if (note.category === 'INTERNAL' || note.isInternal) {
                borderColor = 'border-l-slate-800';
                iconBg = 'bg-slate-100 text-slate-800';
                badgeBg = 'bg-slate-800 text-white border-slate-700';
              } else if (note.category === 'ASSESSMENT') {
                borderColor = 'border-l-teal-500';
                iconBg = 'bg-teal-50 text-teal-600';
                badgeBg = 'bg-teal-50/90 text-teal-800 border-teal-100';
              } else if (note.category === 'REFERRAL') {
                borderColor = 'border-l-purple-500';
                iconBg = 'bg-purple-50 text-purple-600';
                badgeBg = 'bg-purple-50/90 text-purple-800 border-purple-100';
              }

              return (
                <div
                  key={note.id}
                  className={`bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 border-l-4 ${borderColor} shadow-2xs hover:shadow-xs transition-all space-y-4 group`}
                >
                  {/* Top Bar: Icon + Title + Category Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3 min-w-0">
                      {/* Left Icon Square */}
                      <div className={`w-10 h-10 rounded-2xl ${iconBg} flex items-center justify-center flex-shrink-0 shadow-2xs`}>
                        {note.isInternal ? (
                          <Lock className="w-5 h-5" />
                        ) : note.category === 'ASSESSMENT' ? (
                          <Search className="w-5 h-5" />
                        ) : note.category === 'REFERRAL' ? (
                          <ExternalLink className="w-5 h-5" />
                        ) : (
                          <FileText className="w-5 h-5" />
                        )}
                      </div>

                      {/* Title */}
                      <div>
                        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                          {note.title}
                        </h3>
                        {/* Date & Author */}
                        <p className="text-xs font-semibold text-slate-400 mt-0.5">
                          {note.date}, {note.time} • {note.author}
                        </p>
                      </div>
                    </div>

                    {/* Badge */}
                    <span
                      className={`text-[10px] font-extrabold px-3 py-1 rounded-md tracking-wider uppercase border flex-shrink-0 ${badgeBg}`}
                    >
                      {note.isInternal ? 'INTERNAL' : note.category}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="space-y-3 pt-1">
                    <p
                      className={`text-xs sm:text-sm font-medium leading-relaxed ${
                        note.isInternal
                          ? 'italic text-slate-700 bg-slate-50/70 p-4 rounded-2xl border border-slate-100'
                          : 'text-slate-700'
                      }`}
                    >
                      {note.content}
                    </p>

                    {note.contentSecondary && (
                      <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                        {note.contentSecondary}
                      </p>
                    )}
                  </div>

                  {/* Attachments / Related Links Footer (If Any) */}
                  {note.attachments && note.attachments.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2.5">
                      {note.attachments.map((att, idx) => (
                        <button
                          key={idx}
                          onClick={() => setPreviewFile({ name: att.name, type: att.type })}
                          className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-blue-50/60 hover:bg-blue-100/70 border border-blue-100 rounded-xl text-xs font-bold text-blue-700 transition-colors cursor-pointer"
                        >
                          {att.type === 'pdf' ? (
                            <FileText className="w-3.5 h-3.5 text-blue-600" />
                          ) : (
                            <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
                          )}
                          <span>{att.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Bottom Action: Load Previous Notes Button */}
          <div className="pt-4 text-center">
            <button
              onClick={handleLoadPreviousNotes}
              className="px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-extrabold rounded-full shadow-2xs hover:shadow-xs transition-all cursor-pointer inline-flex items-center space-x-2"
            >
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Load previous notes</span>
            </button>
          </div>
        </div>

        {/* ================= RIGHT COLUMN / SIDEBAR (~32% on Desktop) ================= */}
        <div className="space-y-6">
          {/* 1. QUICK ACTIONS PANEL */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-4">
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Quick Actions
            </h4>

            <div className="space-y-2.5">
              {/* Action 1: Flag for Review */}
              <button
                onClick={() => setIsFlagModalOpen(true)}
                className="w-full flex items-center space-x-3 p-3.5 bg-white hover:bg-rose-50/50 border border-slate-100 hover:border-rose-100 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 transition-all cursor-pointer text-left group"
              >
                <Flag className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
                <span className="group-hover:text-rose-700 transition-colors">Flag for Review</span>
              </button>

              {/* Action 2: Share with Specialist */}
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="w-full flex items-center space-x-3 p-3.5 bg-white hover:bg-blue-50/50 border border-slate-100 hover:border-blue-100 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 transition-all cursor-pointer text-left group"
              >
                <Share2 className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="group-hover:text-blue-700 transition-colors">Share with Specialist</span>
              </button>

              {/* Action 3: Export Notes (PDF) */}
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="w-full flex items-center space-x-3 p-3.5 bg-white hover:bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 transition-all cursor-pointer text-left group"
              >
                <Download className="w-4 h-4 text-slate-500 group-hover:scale-110 transition-transform" />
                <span>Export Notes (PDF)</span>
              </button>
            </div>
          </div>

          {/* 2. RECOVERY SNAPSHOT PANEL */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-4">
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Recovery Snapshot
            </h4>

            <div className="space-y-3.5 pt-1">
              {/* Row 1: Protocol */}
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-semibold text-slate-500">Protocol</span>
                <span className="font-extrabold text-slate-900 text-right">
                  Lumbar Stabilization
                </span>
              </div>

              {/* Row 2: Phase */}
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-semibold text-slate-500">Phase</span>
                <span className="font-extrabold text-slate-900">2 of 4</span>
              </div>

              {/* Row 3: Overall Progress */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-[11px] font-extrabold tracking-wider uppercase text-slate-400">
                  <span>OVERALL PROGRESS</span>
                  <span className="text-slate-900">65%</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#0C3E6D] h-full rounded-full transition-all duration-700"
                    style={{ width: '65%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. FILES & LINKS PANEL */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                Files & Links
              </h4>
              <button
                onClick={() => setIsAddNoteModalOpen(true)}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                + Add
              </button>
            </div>

            <div className="space-y-3">
              {/* File Item 1: MRI PDF */}
              <div
                onClick={() => setPreviewFile({ name: 'MRI_Lumbosacral.pdf', type: 'pdf' })}
                className="flex items-center space-x-3.5 p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100/70 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h5 className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                    MRI_Lumbosacral.pdf
                  </h5>
                  <p className="text-[11px] font-semibold text-slate-400">Added 10 Feb 2024</p>
                </div>
              </div>

              {/* File Item 2: Gait Analysis Video */}
              <div
                onClick={() => setPreviewFile({ name: 'Gait_Analysis_V1.mp4', type: 'video' })}
                className="flex items-center space-x-3.5 p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100/70 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                  <Video className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h5 className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                    Gait_Analysis_V1.mp4
                  </h5>
                  <p className="text-[11px] font-semibold text-slate-400">Added 05 Feb 2024</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODALS & DIALOGS ================= */}

      {/* 1. ADD NEW NOTE MODAL */}
      {isAddNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Add Clinical Note</h3>
                <p className="text-xs text-slate-500 font-medium">Record session notes for {patientName}</p>
              </div>
              <button
                onClick={() => setIsAddNoteModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNoteSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Note Title *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Progress Review - Core Stabilization"
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
                      setNewCategory(e.target.value as 'SESSION NOTE' | 'INTERNAL' | 'ASSESSMENT' | 'REFERRAL')
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="SESSION NOTE">SESSION NOTE</option>
                    <option value="INTERNAL">INTERNAL NOTE</option>
                    <option value="ASSESSMENT">ASSESSMENT</option>
                    <option value="REFERRAL">REFERRAL</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl w-full">
                    <input
                      type="checkbox"
                      id="newIsInternal"
                      checked={newIsInternal}
                      onChange={(e) => setNewIsInternal(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="newIsInternal" className="text-xs font-bold text-slate-700 cursor-pointer">
                      Internal Note Only
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Clinical Observations & Details *
                </label>
                <textarea
                  rows={3}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Record patient complaints, functional tests, ROM measurements..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Secondary Notes / Exercises (Optional)
                </label>
                <textarea
                  rows={2}
                  value={newContentSecondary}
                  onChange={(e) => setNewContentSecondary(e.target.value)}
                  placeholder="Additional observations or recommendations..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Attached File Name (Optional)
                </label>
                <input
                  type="text"
                  value={newAttachmentName}
                  onChange={(e) => setNewAttachmentName(e.target.value)}
                  placeholder="e.g., Spine_Flexion_Log.pdf"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddNoteModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-extrabold text-white bg-[#0C3E6D] hover:bg-[#092e52] rounded-xl transition-colors cursor-pointer shadow-md"
                >
                  Save Clinical Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. SHARE WITH SPECIALIST MODAL */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Share Notes with Specialist</h3>
                <p className="text-xs text-slate-500 font-medium">Send encrypted clinical records for {patientName}</p>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsShareModalOpen(false);
                showToast(`Clinical notes shared with ${specialistEmail || 'Specialist'} securely!`);
                setSpecialistEmail('');
                setSpecialistNote('');
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Specialist Email *
                </label>
                <input
                  type="email"
                  value={specialistEmail}
                  onChange={(e) => setSpecialistEmail(e.target.value)}
                  placeholder="dr.kapoor@orthopedics.org"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Covering Message
                </label>
                <textarea
                  rows={3}
                  value={specialistNote}
                  onChange={(e) => setSpecialistNote(e.target.value)}
                  placeholder="Please review Sanya's L4-L5 lumbar progress note attached..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shadow-md flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Records</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. EXPORT NOTES (PDF) MODAL */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Export Notes (PDF)</h3>
                <p className="text-xs text-slate-500 font-medium">Download complete clinical timeline for {patientName}</p>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Included Notes:</span>
                <span className="text-blue-600">{filteredNotes.length} Notes</span>
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <p>• Session notes & post-op assessments included</p>
                <p>• Internal clinical notes excluded from patient PDF export</p>
                <p>• Formatted with practice letterhead and clinician signatures</p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setIsExportModalOpen(false);
                  showToast(`Exporting ${patientName}_Clinical_Notes.pdf...`);
                }}
                className="px-6 py-2.5 text-xs font-extrabold text-white bg-[#0C3E6D] hover:bg-[#092e52] rounded-xl transition-colors cursor-pointer shadow-md flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. FLAG FOR REVIEW MODAL */}
      {isFlagModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2.5 text-rose-600">
                <Flag className="w-5 h-5" />
                <h3 className="text-lg font-extrabold text-slate-900">Flag Patient for Review</h3>
              </div>
              <button
                onClick={() => setIsFlagModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Flagging {patientName}'s clinical notes will notify the head therapist and schedule a multi-disciplinary review session.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsFlagModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsFlagModalOpen(false);
                  showToast(`Patient ${patientName} flagged for clinical review.`);
                }}
                className="px-6 py-2.5 text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer shadow-md"
              >
                Confirm Flag
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. FILE PREVIEW MODAL */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  {previewFile.type === 'video' ? <Video className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{previewFile.name}</h3>
                  <p className="text-xs text-slate-500 font-semibold uppercase">{previewFile.type} Attachment</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
                {previewFile.type === 'video' ? <Video className="w-8 h-8" /> : <FileText className="w-8 h-8" />}
              </div>
              <h4 className="text-base font-extrabold text-slate-800">Previewing {previewFile.name}</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                File verified under HIPAA security protocols. Full document ready for view or download.
              </p>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end space-x-3">
              <button
                onClick={() => setPreviewFile(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  showToast(`Downloading ${previewFile.name}...`);
                  setPreviewFile(null);
                }}
                className="px-5 py-2 bg-[#0C3E6D] text-white text-xs font-bold rounded-xl hover:bg-[#092e52] transition-colors cursor-pointer inline-flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download File</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. DATE RANGE FILTER MODAL */}
      {isDateRangeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Select Date Range</h3>
              <button
                onClick={() => setIsDateRangeModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {['All Time', 'Last 7 Days', 'Last 30 Days', 'This Month', 'February 2024'].map((range) => (
                <button
                  key={range}
                  onClick={() => {
                    setSelectedDateRange(range);
                    setIsDateRangeModalOpen(false);
                    showToast(`Filtered notes by range: ${range}`);
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    selectedDateRange === range
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
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
    </div>
  );
};

export default NotesTab;
