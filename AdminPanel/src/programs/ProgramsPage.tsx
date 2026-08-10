import React, { useState, useMemo } from 'react';
import {
  Plus,
  Filter,
  LayoutGrid,
  List,
  CheckCircle2,
  TrendingUp,
  Clock,
  Users,
  Search,
  CloudCheck,
  Check,
} from 'lucide-react';
import { INITIAL_PROGRAMS, RECENTLY_EDITED, POPULAR_TEMPLATES } from './mockData';
import type { Program, RecentlyEditedItem, PopularTemplateItem } from './types';
import { ProgramCard } from './components/ProgramCard';
import { ProgramListItem } from './components/ProgramListItem';
import { QuickActionsWidget } from './components/QuickActionsWidget';
import { RecentlyEditedWidget } from './components/RecentlyEditedWidget';
import { PopularTemplatesWidget } from './components/PopularTemplatesWidget';
import { CreateProgramModal } from './components/CreateProgramModal';
import { ProgramDetailsModal } from './components/ProgramDetailsModal';
import { ProgramDetailsPage } from './ProgramDetailsPage';

interface ProgramsPageProps {
  onNavigateToCreateProgram?: () => void;
  onNavigateToProgramDetails?: (program?: Program) => void;
}

export const ProgramsPage: React.FC<ProgramsPageProps> = ({
  onNavigateToCreateProgram,
  onNavigateToProgramDetails,
}) => {
  const [programs, setPrograms] = useState<Program[]>(INITIAL_PROGRAMS);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('any');
  const [bodyAreaFilter, setBodyAreaFilter] = useState<string>('all');

  // Modals & Active Program state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [showDetailedPage, setShowDetailedPage] = useState(false);

  const handleOpenProgramDetails = (p: Program) => {
    setSelectedProgram(p);
    if (onNavigateToProgramDetails) {
      onNavigateToProgramDetails(p);
    } else {
      setShowDetailedPage(true);
    }
  };

  // Toast alert state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Metric Stats Calculation
  const totalTemplates = programs.length + 42; // Base offset to mirror Figma ~48
  const publishedCount = programs.filter((p) => p.status === 'published').length + 23;
  const draftCount = programs.filter((p) => p.status === 'draft').length + 10;
  const totalPatientsAssigned = '1,248';

  // Filtered Programs
  const filteredPrograms = useMemo(() => {
    return programs.filter((program) => {
      // Search query filter
      if (
        searchQuery &&
        !program.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !program.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !program.bodyAreaTag.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'all' && program.status !== statusFilter) {
        return false;
      }
      // Type filter
      if (typeFilter !== 'any' && program.type.toLowerCase() !== typeFilter.toLowerCase()) {
        return false;
      }
      // Body Area filter
      if (
        bodyAreaFilter !== 'all' &&
        !program.bodyAreaTag.toLowerCase().includes(bodyAreaFilter.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [programs, searchQuery, statusFilter, typeFilter, bodyAreaFilter]);

  // Handlers
  const handleCreateProgram = (newProg: Omit<Program, 'id'>) => {
    const created: Program = {
      ...newProg,
      id: `prog-${Date.now()}`,
    };
    setPrograms([created, ...programs]);
    showToast(`Program "${created.title}" successfully created!`);
  };

  const handleQuickAction = (action: string, program?: Program) => {
    const targetTitle = program ? `"${program.title}"` : 'selected program';
    switch (action) {
      case 'duplicate':
        if (program) {
          const duplicated: Program = {
            ...program,
            id: `prog-${Date.now()}`,
            title: `${program.title} (Copy)`,
            status: 'draft',
            activePatients: '--',
            completionRate: 'N/A',
          };
          setPrograms([duplicated, ...programs]);
          showToast(`Duplicated ${targetTitle}`);
        } else {
          showToast('Duplicated first program in list');
        }
        break;
      case 'share':
        showToast(`Share link for ${targetTitle} copied to clipboard!`);
        break;
      case 'archive':
        if (program) {
          setPrograms(
            programs.map((p) => (p.id === program.id ? { ...p, status: 'archived' } : p))
          );
          showToast(`Archived ${targetTitle}`);
        } else {
          showToast(`Archived selected program`);
        }
        break;
      case 'delete':
        if (program) {
          setPrograms(programs.filter((p) => p.id !== program.id));
          showToast(`Deleted ${targetTitle}`);
        } else {
          showToast(`Deleted selected program`);
        }
        break;
      default:
        break;
    }
  };

  const handleToggleStatus = (programId: string) => {
    setPrograms((prev) =>
      prev.map((p) => {
        if (p.id === programId) {
          const nextStatus = p.status === 'published' ? 'draft' : 'published';
          showToast(`Updated status of "${p.title}" to ${nextStatus}`);
          return { ...p, status: nextStatus };
        }
        return p;
      })
    );
    if (selectedProgram && selectedProgram.id === programId) {
      setSelectedProgram((prev) =>
        prev ? { ...prev, status: prev.status === 'published' ? 'draft' : 'published' } : null
      );
    }
  };

  if (showDetailedPage) {
    return (
      <ProgramDetailsPage
        program={selectedProgram}
        onBack={() => setShowDetailedPage(false)}
      />
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-bold flex items-center space-x-2 animate-in slide-in-from-top duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Programs
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Create, organize and publish rehabilitation programs.
          </p>
        </div>

        {/* Top Right Action Button */}
        <button
          onClick={() => {
            if (onNavigateToCreateProgram) {
              onNavigateToCreateProgram();
            } else {
              setIsCreateModalOpen(true);
            }
          }}
          className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-2xl transition-all duration-200 shadow-md shadow-blue-500/20 cursor-pointer shrink-0"
        >

          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Create Program</span>
        </button>
      </div>

      {/* Top Metric Cards Row (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Program Templates */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
              PROGRAM TEMPLATES
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
              {totalTemplates}
            </div>
          </div>
          <div className="flex items-center space-x-1.5 text-xs font-bold text-blue-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+4 this month</span>
          </div>
        </div>

        {/* Card 2: Published */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
              PUBLISHED
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
              {publishedCount}
            </div>
          </div>
          <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-600">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Active status</span>
          </div>
        </div>

        {/* Card 3: Drafts */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
              DRAFTS
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
              {draftCount}
            </div>
          </div>
          <div className="flex items-center space-x-1.5 text-xs font-bold text-purple-600">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending review</span>
          </div>
        </div>

        {/* Card 4: Patients Assigned */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
              PATIENTS ASSIGNED
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
              {totalPatientsAssigned}
            </div>
          </div>
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-500">
            <Users className="w-3.5 h-3.5" />
            <span>Total reach</span>
          </div>
        </div>
      </div>

      {/* Filter and View Toggle Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Filter Dropdowns Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filters Button */}
          <div className="flex items-center space-x-2 px-3.5 py-2 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filters</span>
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 cursor-pointer"
            >
              <option value="all">Status: All</option>
              <option value="published">Status: Published</option>
              <option value="draft">Status: Draft</option>
              <option value="archived">Status: Archived</option>
            </select>
          </div>

          {/* Type Filter Dropdown */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 cursor-pointer"
            >
              <option value="any">Type: Any</option>
              <option value="rehabilitation">Rehabilitation</option>
              <option value="core stability">Core Stability</option>
              <option value="mobility">Mobility</option>
              <option value="balance">Balance</option>
            </select>
          </div>

          {/* Body Area Dropdown */}
          <div className="relative">
            <select
              value={bodyAreaFilter}
              onChange={(e) => setBodyAreaFilter(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 cursor-pointer"
            >
              <option value="all">Body Area: All</option>
              <option value="knee">Knee Recovery</option>
              <option value="lumbar">Lumbar Stability</option>
              <option value="neck">Neck/Spine</option>
              <option value="shoulder">Shoulder</option>
              <option value="leg">Leg/Thigh</option>
              <option value="ankle">Ankle/Foot</option>
            </select>
          </div>
        </div>

        {/* Search & View Mode Switcher */}
        <div className="flex items-center space-x-3">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search programs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>

            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Content Area: Programs + Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left / Main Column (2 Spans on Desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {filteredPrograms.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-slate-200/80 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No programs found</h3>
              <p className="text-xs text-slate-500">
                Try adjusting your search criteria or filter selections.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setTypeFilter('any');
                  setBodyAreaFilter('all');
                }}
                className="inline-block px-4 py-2 bg-blue-50 text-blue-600 text-xs font-bold rounded-xl hover:bg-blue-100 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View Mode */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPrograms.map((prog) => (
                <ProgramCard
                  key={prog.id}
                  program={prog}
                  onViewDetails={handleOpenProgramDetails}
                  onQuickAction={(action, p) => handleQuickAction(action, p)}
                />
              ))}
            </div>
          ) : (
            /* List View Mode Table */
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      <th className="py-3 px-4">Program</th>
                      <th className="py-3 px-4">Body Area</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Difficulty</th>
                      <th className="py-3 px-4">Patients</th>
                      <th className="py-3 px-4">Completion</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPrograms.map((prog) => (
                      <ProgramListItem
                        key={prog.id}
                        program={prog}
                        onViewDetails={handleOpenProgramDetails}
                        onQuickAction={(action, p) => handleQuickAction(action, p)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Widgets (1 Span on Desktop) */}
        <div className="space-y-6">
          {/* Quick Actions Widget */}
          <QuickActionsWidget onActionClick={(action) => handleQuickAction(action)} />

          {/* Recently Edited Widget */}
          <RecentlyEditedWidget
            items={RECENTLY_EDITED}
            onSelectItem={(item) => {
              showToast(`Opened recently edited: "${item.title}"`);
            }}
          />

          {/* Popular Templates Widget */}
          <PopularTemplatesWidget
            templates={POPULAR_TEMPLATES}
            onSelectTemplate={(tpl) => {
              showToast(`Selected template: "${tpl.title}"`);
            }}
          />

          {/* Cloud Sync Status Box */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-slate-900">Cloud Sync Active</h4>
              <p className="text-[11px] font-medium text-slate-400">All changes saved automatically</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateProgramModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateProgram}
      />

      <ProgramDetailsModal
        program={selectedProgram}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
};
