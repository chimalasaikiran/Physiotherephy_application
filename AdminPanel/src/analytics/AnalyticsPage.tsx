import React, { useState } from 'react';
import {
  Download,
  ChevronDown,
  Share2,
  Mail,
  Check,
} from 'lucide-react';
import { mockMetricCards } from './mockData';
import type { FilterState } from './types';
import { ClinicHealthScoreChart } from './components/ClinicHealthScoreChart';
import { RecoveryTrendChart } from './components/RecoveryTrendChart';
import { AppointmentTrendChart } from './components/AppointmentTrendChart';
import { RevenueGrowthChart } from './components/RevenueGrowthChart';
import { TopTherapistsWidget } from './components/TopTherapistsWidget';
import { RecoveryProgramsWidget } from './components/RecoveryProgramsWidget';
import { AiClinicalInsightsWidget } from './components/AiClinicalInsightsWidget';
import { RecommendationsWidget } from './components/RecommendationsWidget';
import { ExportAnalyticsModal } from './components/ExportAnalyticsModal';
import { ShareDashboardModal } from './components/ShareDashboardModal';
import { EmailReportModal } from './components/EmailReportModal';
import { PatientsAnalyticsTab } from './components/PatientsAnalyticsTab';
import { TherapistsAnalyticsTab } from './components/TherapistsAnalyticsTab';
import { ProgramsAnalyticsTab } from './components/ProgramsAnalyticsTab';
import { RevenueAnalyticsTab } from './components/RevenueAnalyticsTab';

interface AnalyticsPageProps {
  onNavigateToTherapists?: () => void;
  onNavigateToPatients?: () => void;
  initialSubTab?: 'Overview' | 'Patients' | 'Therapists' | 'Recovery Programs' | 'Revenue';
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  onNavigateToTherapists,
  onNavigateToPatients,
  initialSubTab = 'Overview',
}) => {
  // Navigation Tabs state
  const [activeSubTab, setActiveSubTab] = useState<
    'Overview' | 'Patients' | 'Therapists' | 'Recovery Programs' | 'Revenue'
  >(initialSubTab);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    dateRange: 'Last 30 Days',
    therapist: 'All Therapists',
    program: 'All Programs',
    location: 'All Centers',
  });

  // Modal states
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    showToast(`Filter applied: ${value}`);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 animate-in fade-in duration-300 font-sans">
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-800 flex items-center space-x-3 transition-all animate-bounce">
          <Check className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Export Analytics Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Analytics
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Monitor clinic performance, recovery outcomes and operational efficiency.
          </p>
        </div>

        <div>
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="w-full sm:w-auto px-6 py-3 bg-[#0C3E6D] hover:bg-[#092e52] text-white font-extrabold text-xs sm:text-sm rounded-2xl transition-all shadow-md shadow-blue-900/20 flex items-center justify-center space-x-2.5 cursor-pointer"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Export Analytics</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar Card (Matching Figma) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-0 lg:divide-x divide-slate-100">
          {/* Date Range Dropdown */}
          <div className="lg:px-4 flex flex-col justify-center">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
              Date Range
            </span>
            <div className="relative">
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full appearance-none bg-transparent text-xs sm:text-sm font-bold text-blue-600 focus:outline-none cursor-pointer pr-6 py-0.5"
              >
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="Last Quarter (Q3)">Last Quarter (Q3)</option>
                <option value="Year to Date (YTD)">Year to Date (YTD)</option>
              </select>
              <ChevronDown className="w-4 h-4 text-blue-600 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Therapist Dropdown */}
          <div className="lg:px-4 flex flex-col justify-center">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
              Therapist
            </span>
            <div className="relative">
              <select
                value={filters.therapist}
                onChange={(e) => handleFilterChange('therapist', e.target.value)}
                className="w-full appearance-none bg-transparent text-xs sm:text-sm font-bold text-blue-600 focus:outline-none cursor-pointer pr-6 py-0.5"
              >
                <option value="All Therapists">All Therapists</option>
                <option value="Dr. Sarah Miller">Dr. Sarah Miller</option>
                <option value="James Wilson">James Wilson</option>
                <option value="Elena Rodriguez">Elena Rodriguez</option>
              </select>
              <ChevronDown className="w-4 h-4 text-blue-600 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Program Dropdown */}
          <div className="lg:px-4 flex flex-col justify-center">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
              Program
            </span>
            <div className="relative">
              <select
                value={filters.program}
                onChange={(e) => handleFilterChange('program', e.target.value)}
                className="w-full appearance-none bg-transparent text-xs sm:text-sm font-bold text-blue-600 focus:outline-none cursor-pointer pr-6 py-0.5"
              >
                <option value="All Programs">All Programs</option>
                <option value="Lower Back Pain">Lower Back Pain</option>
                <option value="Post-Op ACL">Post-Op ACL</option>
                <option value="Shoulder Rehab">Shoulder Rehab</option>
              </select>
              <ChevronDown className="w-4 h-4 text-blue-600 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Location Dropdown */}
          <div className="lg:px-4 flex flex-col justify-center">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
              Location
            </span>
            <div className="relative">
              <select
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full appearance-none bg-transparent text-xs sm:text-sm font-bold text-blue-600 focus:outline-none cursor-pointer pr-6 py-0.5"
              >
                <option value="All Centers">All Centers</option>
                <option value="Downtown Clinic">Downtown Clinic</option>
                <option value="Westside Facility">Westside Facility</option>
                <option value="Northside Hub">Northside Hub</option>
              </select>
              <ChevronDown className="w-4 h-4 text-blue-600 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Top KPI Metric Cards (5 Cards matching Figma layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {mockMetricCards.map((card) => (
          <div
            key={card.id}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group min-h-[120px]"
          >
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                {card.title}
              </span>

              <div className="flex items-baseline space-x-2 mt-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {card.value}
                </span>

                {card.trendText && (
                  <span className="text-xs font-bold text-blue-600">
                    {card.trendText}
                  </span>
                )}

                {card.badge && (
                  <span className="px-2 py-0.5 bg-blue-100/70 text-blue-700 font-extrabold text-[10px] rounded-full uppercase tracking-wider">
                    {card.badge}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-3">
              <span className="text-xs font-medium text-slate-400 block">
                {card.subtext}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="border-b border-slate-200/80 overflow-x-auto no-scrollbar scroll-smooth">
        <nav className="flex space-x-8 min-w-max">
          {(
            ['Overview', 'Patients', 'Therapists', 'Recovery Programs', 'Revenue'] as const
          ).map((tab) => {
            const isActive = activeSubTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`py-3.5 px-1 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sub-Tab Content rendering */}
      {activeSubTab === 'Patients' ? (
        <PatientsAnalyticsTab onNavigateToPatients={onNavigateToPatients} />
      ) : activeSubTab === 'Therapists' ? (
        <TherapistsAnalyticsTab onShowToast={showToast} />
      ) : activeSubTab === 'Recovery Programs' ? (
        <ProgramsAnalyticsTab />
      ) : activeSubTab === 'Revenue' ? (
        <RevenueAnalyticsTab onShowToast={showToast} />
      ) : (
        /* Overview Tab Layout matching Figma design */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Left & Middle Area (8 Columns on Large Screens) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Row 1: Health Score Donut & Recovery Trend Bars */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              <div className="md:col-span-4">
                <ClinicHealthScoreChart score={94} statusLabel="Excellence Status" />
              </div>
              <div className="md:col-span-8">
                <RecoveryTrendChart />
              </div>
            </div>

            {/* Row 2: Appointment Trend & Revenue Growth */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              <AppointmentTrendChart />
              <RevenueGrowthChart />
            </div>

            {/* Row 3: Top Performing Therapists & Recovery Programs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              <TopTherapistsWidget onViewAll={onNavigateToTherapists} />
              <RecoveryProgramsWidget />
            </div>
          </div>

          {/* Right Column (4 Columns on Large Screens) */}
          <div className="lg:col-span-4 space-y-6">
            {/* AI Clinical Insights */}
            <AiClinicalInsightsWidget />

            {/* Recommendations */}
            <RecommendationsWidget />

            {/* Bottom Action Buttons (Matching Figma layout & styling) */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="w-full py-3.5 px-5 bg-blue-50/80 hover:bg-blue-100 text-blue-700 font-extrabold text-xs sm:text-sm rounded-2xl transition-colors flex items-center justify-between cursor-pointer border border-blue-100/80 shadow-2xs"
              >
                <div className="flex items-center space-x-3">
                  <Share2 className="w-4 h-4 text-blue-600" />
                  <span>Share Dashboard</span>
                </div>
                <span className="text-blue-500 font-bold">›</span>
              </button>

              <button
                onClick={() => setIsEmailModalOpen(true)}
                className="w-full py-3.5 px-5 bg-blue-50/80 hover:bg-blue-100 text-blue-700 font-extrabold text-xs sm:text-sm rounded-2xl transition-colors flex items-center justify-between cursor-pointer border border-blue-100/80 shadow-2xs"
              >
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span>Email Weekly Report</span>
                </div>
                <span className="text-blue-500 font-bold">›</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Modals */}
      <ExportAnalyticsModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={(format, dateRange) =>
          showToast(`Analytics exported as ${format} (${dateRange}) successfully!`)
        }
      />

      <ShareDashboardModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onShareSuccess={showToast}
      />

      <EmailReportModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onSendSuccess={showToast}
      />
    </div>
  );
};

export default AnalyticsPage;
