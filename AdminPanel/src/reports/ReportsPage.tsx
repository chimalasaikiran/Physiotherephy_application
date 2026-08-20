import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Clock,
  HardDrive,
  Search,
  Calendar,
  ChevronDown,
  User,
  ShieldCheck,
  SlidersHorizontal,
  Plus,
  TrendingUp,
  UserCheck,
  MoreVertical,
  Eye,
  Pin,
  Trash2,
  FileSpreadsheet,
  Check,
} from 'lucide-react';
import { InitialsAvatar } from '../components/ui/InitialsAvatar';

// Firestore Services & Data Sources
import {
  subscribeToReports,
  subscribeToExportsArchive,
  togglePinReport,
  deleteReportRecord,
  createExportArchiveItem,
  calculateReportsDashboardMetrics,
  type FirestoreReportRecord,
  type FirestoreExportArchiveItem,
} from '../services/reportService';

import { subscribeToTherapists } from '../services/therapistService';
import { subscribeToPatients } from '../services/patientService';
import { subscribeToPayments } from '../services/paymentService';

import type { RecentReport, ScheduledRun } from './types';
import type { Therapist } from '../therapists/types';
import type { Patient } from '../patients/types';
import type { PaymentRecord } from '../payments/types';

// Child Components & Modals
import ExportsTab from './components/ExportsTab';
import { CreateReportModal } from './components/CreateReportModal';
import { ViewReportModal } from './components/ViewReportModal';

// Helper for exporting arrays to CSV
const downloadCsv = (filename: string, headers: { header: string; accessor: (item: any) => any }[], data: any[]) => {
  if (!data || data.length === 0) return '0 KB';
  const csvRows: string[] = [];
  csvRows.push(headers.map((h) => `"${h.header}"`).join(','));

  data.forEach((row) => {
    const values = headers.map((h) => {
      const val = h.accessor(row);
      const escaped = ('' + (val ?? '')).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  });

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  const kbSize = (csvContent.length / 1024).toFixed(1);
  return `${kbSize} KB`;
};

interface ReportsPageProps {
  initialSubTab?: 'Overview' | 'Patient Reports' | 'Treatment Reports' | 'Financial Reports' | 'Exports';
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ initialSubTab = 'Overview' }) => {
  // Navigation & SubTab state
  const [activeSubTab, setActiveSubTab] = useState<
    'Overview' | 'Patient Reports' | 'Treatment Reports' | 'Financial Reports' | 'Exports'
  >(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Firestore real-time state
  const [metrics, setMetrics] = useState({
    totalReports: 1284,
    patientReportsCount: 450,
    treatmentReportsCount: 380,
    financialReportsCount: 454,
    totalRevenue: 0,
    totalPaid: 0,
    totalPending: 0,
    exportsCount: 342,
    storageUsedMB: 4300,
    storageUsedGBStr: '4.20',
  });
  const [exportsArchive, setExportsArchive] = useState<FirestoreExportArchiveItem[]>([]);
  const [reports, setReports] = useState<FirestoreReportRecord[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [mockScheduledRuns] = useState<ScheduledRun[]>([
    {
      id: 's1',
      month: 'OCT',
      day: '15',
      title: 'Weekly Compliance Audit',
      description: 'Automatically sends to Board',
      runsAt: 'RUNS AT 08:00 AM',
    },
    {
      id: 's2',
      month: 'OCT',
      day: '18',
      title: 'Bi-Weekly Finance Sync',
      description: 'Internal reconciliation export',
      runsAt: 'RUNS AT 11:30 PM',
    },
  ]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  // UI & Search/Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [reportTypeFilter, setReportTypeFilter] = useState('All');
  const [therapistFilter, setTherapistFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals & Menu State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedReportForView, setSelectedReportForView] = useState<RecentReport | null>(null);
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Real-time Firestore Subscriptions
  useEffect(() => {
    const unsubReports = subscribeToReports((data: FirestoreReportRecord[]) => setReports(data));
    const unsubExports = subscribeToExportsArchive((data: FirestoreExportArchiveItem[]) => setExportsArchive(data));
    const unsubTherapists = subscribeToTherapists((data: Therapist[]) => setTherapists(data));
    const unsubPatients = subscribeToPatients((data: Patient[]) => setPatients(data));
    const unsubPayments = subscribeToPayments((data: PaymentRecord[]) => setPayments(data));

    return () => {
      unsubReports();
      unsubExports();
      unsubTherapists();
      unsubPatients();
      unsubPayments();
    };
  }, []);

  // Update metrics whenever data changes
  useEffect(() => {
    const calculated = calculateReportsDashboardMetrics(patients, [], payments, [], reports, exportsArchive);
    setMetrics(calculated);
  }, [patients, payments, reports, exportsArchive]);

  // Convert FirestoreReportRecord to RecentReport for UI view
  const recentReports: RecentReport[] = reports.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    date: r.date,
    status: r.status,
    author: r.author,
    iconType: r.iconType || 'document',
    patientId: r.patientId,
    patientName: r.patientName,
    therapistId: r.therapistId,
    therapistName: r.therapistName,
    summaryText: r.summaryText,
    fileFormat: r.fileFormat,
    isPinned: r.isPinned,
  }));

  // Filtered recent reports logic
  const filteredRecentReports = recentReports.filter((report) => {
    // Sub-tab filter
    if (activeSubTab === 'Patient Reports' && report.category !== 'Patient Care' && report.category !== 'Assessment') {
      return false;
    }
    if (activeSubTab === 'Treatment Reports' && report.category !== 'Clinical' && report.category !== 'Progress') {
      return false;
    }
    if (activeSubTab === 'Financial Reports' && report.category !== 'Financial') {
      return false;
    }

    // Dropdown filters
    if (reportTypeFilter !== 'All' && report.category !== reportTypeFilter) {
      return false;
    }
    if (statusFilter !== 'All' && report.status !== statusFilter) {
      return false;
    }
    if (therapistFilter !== 'All') {
      const authorName = typeof report.author === 'string' ? report.author : report.author?.name || '';
      if (!authorName.toLowerCase().includes(therapistFilter.toLowerCase())) {
        return false;
      }
    }

    // Search query filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const titleMatch = report.title.toLowerCase().includes(q);
      const catMatch = report.category.toLowerCase().includes(q);
      const authorName = typeof report.author === 'string' ? report.author : report.author?.name || '';
      const authorMatch = authorName.toLowerCase().includes(q);
      return titleMatch || catMatch || authorMatch;
    }

    return true;
  });

  const pinnedReports = recentReports.filter((r) => r.isPinned);

  // Trigger export for current active view
  const handleExportData = async (format: 'CSV' | 'Excel' | 'PDF' = 'CSV') => {
    const filename = `Physio_${activeSubTab.replace(/\\s+/g, '_')}_${Date.now()}`;

    if (activeSubTab === 'Patient Reports' && patients.length > 0) {
      const sizeStr = downloadCsv(
        filename,
        [
          { header: 'Patient Name', accessor: (item: Patient) => item.name },
          { header: 'Condition', accessor: (item: Patient) => item.condition || 'General' },
          { header: 'Recovery Score %', accessor: (item: Patient) => item.recoveryScore || 0 },
          { header: 'Status', accessor: (item: Patient) => item.status || 'Active' },
          { header: 'Attending Therapist', accessor: (item: Patient) => item.therapistName || 'Staff' },
        ],
        patients
      );

      await createExportArchiveItem({
        fileName: `${filename}.${format.toLowerCase()}`,
        format: format === 'Excel' ? 'EXCEL' : format === 'PDF' ? 'PDF' : 'CSV',
        size: sizeStr,
        status: 'Completed',
        dateCreated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        reportType: 'Patient Reports',
        recordsCount: patients.length,
      });

      showToast(`Exported ${patients.length} patient records to ${filename}.csv!`);
    } else if (activeSubTab === 'Financial Reports' && payments.length > 0) {
      const sizeStr = downloadCsv(
        filename,
        [
          { header: 'Transaction ID', accessor: (item: PaymentRecord) => item.id },
          { header: 'Patient Name', accessor: (item: PaymentRecord) => item.patientName },
          { header: 'Amount (INR)', accessor: (item: PaymentRecord) => item.amount },
          { header: 'Date', accessor: (item: PaymentRecord) => item.paidAt || item.createdAt },
          { header: 'Payment Method', accessor: (item: PaymentRecord) => item.paymentMethod },
          { header: 'Status', accessor: (item: PaymentRecord) => item.paymentStatus || item.status },
        ],
        payments
      );

      await createExportArchiveItem({
        fileName: `${filename}.${format.toLowerCase()}`,
        format: format === 'Excel' ? 'EXCEL' : format === 'PDF' ? 'PDF' : 'CSV',
        size: sizeStr,
        status: 'Completed',
        dateCreated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        reportType: 'Financial Reports',
        recordsCount: payments.length,
      });

      showToast(`Exported ${payments.length} financial payment records to ${filename}.csv!`);
    } else {
      const sizeStr = downloadCsv(
        filename,
        [
          { header: 'Report Title', accessor: (item: RecentReport) => item.title },
          { header: 'Category', accessor: (item: RecentReport) => item.category },
          { header: 'Patient Name', accessor: (item: RecentReport) => item.patientName || 'N/A' },
          { header: 'Therapist Name', accessor: (item: RecentReport) => item.therapistName || 'N/A' },
          { header: 'Status', accessor: (item: RecentReport) => item.status || 'Verified' },
          { header: 'Date', accessor: (item: RecentReport) => item.date },
          { header: 'Summary', accessor: (item: RecentReport) => item.summaryText || '' },
        ],
        filteredRecentReports
      );

      await createExportArchiveItem({
        fileName: `${filename}.${format.toLowerCase()}`,
        format: format === 'Excel' ? 'EXCEL' : format === 'PDF' ? 'PDF' : 'CSV',
        size: sizeStr,
        status: 'Completed',
        dateCreated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        reportType: activeSubTab,
        recordsCount: filteredRecentReports.length,
      });

      showToast(`Exported ${filteredRecentReports.length} ${activeSubTab} records to ${filename}.csv!`);
    }
  };

  // Toggle pin report in Firestore
  const handleTogglePin = async (reportId: string, currentIsPinned?: boolean) => {
    try {
      await togglePinReport(reportId, !!currentIsPinned);
      showToast(currentIsPinned ? 'Unpinned report.' : 'Pinned report to dashboard!');
    } catch (e: any) {
      showToast(`Error toggling pin: ${e.message}`);
    }
    setActiveActionMenuId(null);
  };

  // Delete report from Firestore
  const handleDeleteReport = async (reportId: string, title: string) => {
    if (!reportId.startsWith('rec-') && !reportId.startsWith('appt-') && !reportId.startsWith('pay-')) {
      try {
        await deleteReportRecord(reportId);
        showToast(`Deleted report "${title}" from Firestore.`);
      } catch (e: any) {
        showToast(`Error deleting report: ${e.message}`);
      }
    } else {
      showToast(`Removed "${title}" from view.`);
    }
    setActiveActionMenuId(null);
  };

  const handleReportCreated = (newReport: { title: string; category: string }) => {
    showToast(`Report "${newReport.title}" saved to Firestore successfully!`);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-800 flex items-center space-x-3 transition-all animate-bounce">
          <Check className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Page Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Reports
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Generate, organize and export clinical, treatment, and financial reports from Firestore.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleExportData('CSV')}
            className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center space-x-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Reports</span>
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 bg-[#0C3E6D] hover:bg-[#092e52] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-blue-900/20 flex items-center space-x-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Report</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="border-b border-slate-200/80 overflow-x-auto no-scrollbar scroll-smooth">
        <nav className="flex space-x-8 min-w-max">
          {(
            [
              'Overview',
              'Patient Reports',
              'Treatment Reports',
              'Financial Reports',
              'Exports',
            ] as const
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

      {/* Tab Content */}
      {activeSubTab === 'Exports' ? (
        <ExportsTab showToast={showToast} />
      ) : (
        <div className="self-stretch px-0 pb-12 inline-flex flex-col justify-start items-start gap-8">
          {/* Top 4 Metric KPI Cards Grid (Figma Dev Mode Node 26-408) */}
          <div className="self-stretch pb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Reports Generated */}
            <div className="flex-1 p-6 relative bg-white/70 rounded-3xl outline outline-1 outline-offset-[-1px] outline-slate-200 backdrop-blur-[10px] inline-flex flex-col justify-start items-start gap-2 shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.03)] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow">
              <div className="w-64 h-48 left-0 top-0 absolute bg-white/0 rounded-3xl shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.03)] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)] pointer-events-none"></div>
              <div className="w-10 h-12 pb-2 flex flex-col justify-start items-start">
                <div className="size-10 bg-teal-500/10 rounded-full inline-flex justify-center items-center">
                  <FileText className="w-5 h-5 text-blue-900" />
                </div>
              </div>
              <div className="self-stretch flex flex-col justify-start items-start">
                <div className="self-stretch justify-center text-gray-500 text-base font-semibold font-['Inter'] leading-6">
                  Reports Generated
                </div>
              </div>
              <div className="self-stretch flex flex-col justify-start items-start">
                <div className="self-stretch justify-center text-slate-900 text-base font-normal font-['Inter'] leading-6">
                  {metrics.totalReports ? metrics.totalReports.toLocaleString('en-IN') : '1,284'}
                </div>
              </div>
              <div className="self-stretch inline-flex justify-start items-center gap-1">
                <div className="inline-flex flex-col justify-start items-start">
                  <div className="size-2.5 bg-green-600 rounded-xs"></div>
                </div>
                <div className="justify-center text-green-600 text-xs font-normal font-['Inter'] leading-4">
                  12% vs last month
                </div>
              </div>
            </div>

            {/* Card 2: Monthly Exports */}
            <div className="flex-1 p-6 relative bg-white/70 rounded-3xl outline outline-1 outline-offset-[-1px] outline-slate-200 backdrop-blur-[10px] inline-flex flex-col justify-start items-start gap-2 shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.03)] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow">
              <div className="w-64 h-48 left-0 top-0 absolute bg-white/0 rounded-3xl shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.03)] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)] pointer-events-none"></div>
              <div className="w-10 h-12 pb-2 flex flex-col justify-start items-start">
                <div className="size-10 bg-blue-900/10 rounded-full inline-flex justify-center items-center">
                  <Download className="w-5 h-5 text-blue-900" />
                </div>
              </div>
              <div className="self-stretch flex flex-col justify-start items-start">
                <div className="self-stretch justify-center text-gray-500 text-base font-semibold font-['Inter'] leading-6">
                  Monthly Exports
                </div>
              </div>
              <div className="self-stretch flex flex-col justify-start items-start">
                <div className="self-stretch justify-center text-slate-900 text-base font-normal font-['Inter'] leading-6">
                  {exportsArchive.length > 0 ? exportsArchive.length : '342'}
                </div>
              </div>
              <div className="self-stretch inline-flex justify-start items-center">
                <div className="justify-center text-blue-900 text-xs font-normal font-['Inter'] leading-4">
                  Steady activity
                </div>
              </div>
            </div>

            {/* Card 3: Scheduled Reports */}
            <div className="flex-1 p-6 relative bg-white/70 rounded-3xl outline outline-1 outline-offset-[-1px] outline-slate-200 backdrop-blur-[10px] inline-flex flex-col justify-start items-start gap-2 shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.03)] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow">
              <div className="w-64 h-48 left-0 top-0 absolute bg-white/0 rounded-3xl shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.03)] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)] pointer-events-none"></div>
              <div className="w-10 h-12 pb-2 flex flex-col justify-start items-start">
                <div className="size-10 bg-indigo-800/10 rounded-full inline-flex justify-center items-center">
                  <Clock className="w-5 h-5 text-indigo-800" />
                </div>
              </div>
              <div className="self-stretch flex flex-col justify-start items-start">
                <div className="self-stretch justify-center text-gray-500 text-base font-semibold font-['Inter'] leading-6">
                  Scheduled Reports
                </div>
              </div>
              <div className="self-stretch flex flex-col justify-start items-start">
                <div className="self-stretch justify-center text-slate-900 text-base font-normal font-['Inter'] leading-6">
                  {mockScheduledRuns.length > 0 ? mockScheduledRuns.length : '18'}
                </div>
              </div>
              <div className="self-stretch flex flex-col justify-start items-start">
                <div className="self-stretch justify-center text-gray-500 text-xs font-normal font-['Inter'] leading-4">
                  Next run: Tomorrow
                </div>
              </div>
            </div>

            {/* Card 4: Storage Used */}
            <div className="flex-1 px-6 pt-6 pb-8 relative bg-white/70 rounded-3xl outline outline-1 outline-offset-[-1px] outline-slate-200 backdrop-blur-[10px] inline-flex flex-col justify-start items-start gap-2 shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.03)] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow">
              <div className="w-64 h-48 left-0 top-0 absolute bg-white/0 rounded-3xl shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.03)] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)] pointer-events-none"></div>
              <div className="w-10 h-12 pb-2 flex flex-col justify-start items-start">
                <div className="size-10 bg-sky-800/10 rounded-full inline-flex justify-center items-center">
                  <HardDrive className="w-5 h-5 text-sky-800" />
                </div>
              </div>
              <div className="self-stretch inline-flex justify-between items-end">
                <div className="pr-6 inline-flex flex-col justify-start items-start">
                  <div className="justify-center text-gray-500 text-base font-semibold font-['Inter'] leading-6">
                    Storage<br />Used
                  </div>
                </div>
                <div className="pr-2 inline-flex flex-col justify-start items-start">
                  <div className="justify-center text-gray-700 text-xs font-normal font-['Inter'] leading-4 text-right">
                    {(metrics.storageUsedMB / 1024).toFixed(1)} / 10<br />GB
                  </div>
                </div>
              </div>
              <div className="self-stretch h-4 pt-2 flex flex-col justify-start items-start">
                <div className="self-stretch h-2 relative bg-blue-100 rounded-full overflow-hidden">
                  <div
                    className="h-2 left-0 top-0 bg-blue-900 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(8, (metrics.storageUsedMB / 10240) * 100))}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar Container (Figma Glassmorphism Node) */}
          <div className="self-stretch p-4 relative bg-white/70 rounded-3xl outline outline-1 outline-offset-[-1px] outline-slate-200 backdrop-blur-[10px] shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.03)] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)] flex flex-wrap lg:flex-nowrap items-center justify-between gap-4">
            {/* Search Input Box */}
            <div className="w-full lg:w-96 relative">
              <div className="w-full pl-10 pr-4 py-3 bg-indigo-50 rounded-2xl flex items-center overflow-hidden border border-transparent focus-within:border-blue-500 focus-within:bg-white transition-all">
                <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search reports, authors, or categories..."
                  className="w-full bg-transparent text-sm text-gray-500 font-['Inter'] focus:outline-none"
                />
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              <button
                type="button"
                className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 rounded-2xl inline-flex justify-start items-center gap-2 text-gray-700 text-base font-normal font-['Inter'] leading-6 transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-gray-700" />
                <span>Date Range</span>
              </button>

              <div className="relative">
                <select
                  value={reportTypeFilter}
                  onChange={(e) => setReportTypeFilter(e.target.value)}
                  className="appearance-none bg-indigo-50 hover:bg-indigo-100 rounded-2xl px-4 py-2.5 pr-8 text-base font-normal text-gray-700 font-['Inter'] leading-6 focus:outline-none cursor-pointer transition-colors"
                >
                  <option value="All">Report Type</option>
                  <option value="Clinical">Clinical Analysis</option>
                  <option value="Assessment">Assessment</option>
                  <option value="Progress">Progress</option>
                  <option value="Financial">Financial</option>
                  <option value="Patient Care">Patient Care</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-700 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={therapistFilter}
                  onChange={(e) => setTherapistFilter(e.target.value)}
                  className="appearance-none bg-indigo-50 hover:bg-indigo-100 rounded-2xl px-4 py-2.5 pr-8 text-base font-normal text-gray-700 font-['Inter'] leading-6 focus:outline-none cursor-pointer transition-colors"
                >
                  <option value="All">Created By</option>
                  {therapists.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <User className="w-3.5 h-3.5 text-gray-700 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-indigo-50 hover:bg-indigo-100 rounded-2xl px-4 py-2.5 pr-8 text-base font-normal text-gray-700 font-['Inter'] leading-6 focus:outline-none cursor-pointer transition-colors"
                >
                  <option value="All">Status</option>
                  <option value="Verified">Ready / Verified</option>
                  <option value="Needs Review">Needs Review</option>
                  <option value="Draft">Draft</option>
                </select>
                <ShieldCheck className="w-3.5 h-3.5 text-gray-700 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-4 py-2.5 rounded-2xl border border-slate-300 hover:bg-slate-50 inline-flex justify-start items-center gap-2 text-gray-700 text-base font-normal font-['Inter'] leading-6 transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-gray-700" />
                <span>Sort By</span>
              </button>
            </div>
          </div>

          {/* Main 2-Column Grid Layout */}
          <div className="self-stretch grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Column (Spans 2) */}
            <div className="lg:col-span-2 space-y-12">
              {/* Section 1: Pinned Reports */}
              <div className="self-stretch flex flex-col justify-start items-start gap-6">
                <div className="self-stretch inline-flex justify-start items-center gap-2">
                  <div className="w-3 h-5 bg-blue-900 rounded-xs"></div>
                  <div className="justify-center text-slate-900 text-base font-normal font-['Inter'] leading-6">
                    Pinned Reports
                  </div>
                </div>

                <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {pinnedReports.map((report) => (
                    <div
                      key={report.id}
                      className="flex-1 p-8 relative bg-white/70 rounded-3xl shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.03)] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-1px] outline-slate-200 backdrop-blur-[10px] inline-flex flex-col justify-start items-start gap-2 overflow-hidden hover:shadow-md transition-all group"
                    >
                      <div className="size-16 bg-teal-500/10 rounded-2xl inline-flex justify-center items-center text-blue-900">
                        {report.iconType === 'chart' ? (
                          <TrendingUp className="w-6 h-6 text-blue-900" />
                        ) : report.iconType === 'user' ? (
                          <UserCheck className="w-6 h-6 text-blue-900" />
                        ) : (
                          <FileText className="w-6 h-6 text-blue-900" />
                        )}
                      </div>

                      <div className="self-stretch pt-4 flex flex-col justify-start items-start">
                        <div className="self-stretch justify-center text-slate-900 text-base font-normal font-['Inter'] leading-6">
                          {report.title}
                        </div>
                      </div>

                      <div className="self-stretch inline-flex justify-start items-center gap-3">
                        <div className="px-3 py-1 bg-blue-100 rounded-full inline-flex flex-col justify-start items-start">
                          <div className="justify-center text-gray-700 text-xs font-bold font-['Inter'] leading-4">
                            {report.category || 'Clinical Analysis'}
                          </div>
                        </div>
                        <div className="px-3 py-1 bg-green-100 rounded-full flex justify-start items-center gap-1">
                          <div className="size-1.5 bg-green-500 rounded-full"></div>
                          <div className="justify-center text-green-700 text-xs font-bold font-['Inter'] leading-4">
                            {report.status || 'Ready'}
                          </div>
                        </div>
                      </div>

                      <div className="self-stretch py-4 flex flex-col justify-start items-start">
                        <div className="self-stretch justify-center text-gray-500 text-base font-normal font-['Inter'] leading-6">
                          Updated Oct 14, 2026
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedReportForView(report)}
                        className="self-stretch py-3 bg-violet-100 hover:bg-violet-200 rounded-2xl outline outline-1 outline-offset-[-1px] outline-slate-300/30 inline-flex justify-center items-center transition-colors cursor-pointer"
                      >
                        <div className="text-center justify-center text-slate-900 text-base font-normal font-['Inter'] leading-6">
                          View Report
                        </div>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveActionMenuId(activeActionMenuId === report.id ? null : report.id);
                        }}
                        className="p-1.5 text-gray-500 hover:text-slate-900 absolute right-6 top-6 rounded-lg cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu Popup */}
                      {activeActionMenuId === report.id && (
                        <div className="absolute right-6 top-14 w-44 bg-white rounded-2xl border border-slate-200 shadow-xl py-1.5 z-30 text-left animate-in fade-in zoom-in-95">
                          <button
                            onClick={() => {
                              setSelectedReportForView(report);
                              setActiveActionMenuId(null);
                            }}
                            className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-2 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>View Details</span>
                          </button>
                          <button
                            onClick={() => handleTogglePin(report.id, report.isPinned)}
                            className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-2 cursor-pointer"
                          >
                            <Pin className="w-3.5 h-3.5 text-slate-500" />
                            <span>Unpin</span>
                          </button>
                          <div className="my-1 border-t border-slate-100" />
                          <button
                            onClick={() => handleDeleteReport(report.id, report.title)}
                            className="w-full px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center space-x-2 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 2: Recent Reports */}
              <div className="self-stretch flex flex-col justify-start items-start gap-6">
                <div className="self-stretch inline-flex justify-between items-center">
                  <div className="justify-center text-slate-900 text-base font-normal font-['Inter'] leading-6">
                    Recent Reports
                  </div>
                  <button
                    onClick={() => setActiveSubTab('Overview')}
                    className="text-center justify-center text-blue-900 text-base font-normal font-['Inter'] leading-6 hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                <div className="self-stretch bg-white/70 rounded-3xl shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.03)] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-1px] outline-slate-200 backdrop-blur-[10px] flex flex-col justify-start items-start overflow-hidden divide-y divide-slate-300/30">
                  {filteredRecentReports.length > 0 ? (
                    filteredRecentReports.map((report) => {
                      const authorName =
                        typeof report.author === 'string'
                          ? report.author
                          : report.author?.name || 'Dr. Sarah Jenkins';

                      return (
                        <div
                          key={report.id}
                          onClick={() => setSelectedReportForView(report)}
                          className="self-stretch p-4 inline-flex justify-start items-center gap-4 hover:bg-slate-50/80 transition-colors cursor-pointer relative"
                        >
                          <div className="size-12 bg-blue-100 rounded-[48px] flex justify-center items-center shrink-0">
                            <FileText className="w-5 h-5 text-gray-700" />
                          </div>

                          <div className="flex-1 inline-flex flex-col justify-start items-start gap-1 min-w-0">
                            <div className="self-stretch justify-center text-slate-900 text-base font-normal font-['Inter'] leading-6 truncate">
                              {report.title}
                            </div>
                            <div className="self-stretch inline-flex justify-start items-center gap-4">
                              <div className="justify-center text-gray-500 text-xs font-normal font-['Inter'] leading-4">
                                {report.category}
                              </div>
                              <div className="justify-center text-gray-500 text-xs font-normal font-['Inter'] leading-4">
                                • {report.date}
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-start items-center gap-6 shrink-0">
                            <InitialsAvatar name={authorName} className="size-8 rounded-full border-2 border-slate-50 text-xs font-bold" />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveActionMenuId(activeActionMenuId === report.id ? null : report.id);
                              }}
                              className="p-1 text-gray-500 hover:text-slate-900 cursor-pointer"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* Dropdown Popup */}
                            {activeActionMenuId === report.id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-4 top-12 w-44 bg-white rounded-2xl border border-slate-200 shadow-xl py-1.5 z-30 text-left animate-in fade-in zoom-in-95"
                              >
                                <button
                                  onClick={() => {
                                    setSelectedReportForView(report);
                                    setActiveActionMenuId(null);
                                  }}
                                  className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-2 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                                  <span>View Report</span>
                                </button>
                                <button
                                  onClick={() => handleTogglePin(report.id, report.isPinned)}
                                  className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-2 cursor-pointer"
                                >
                                  <Pin className="w-3.5 h-3.5 text-slate-500" />
                                  <span>{report.isPinned ? 'Unpin' : 'Pin to Top'}</span>
                                </button>
                                <div className="my-1 border-t border-slate-100" />
                                <button
                                  onClick={() => handleDeleteReport(report.id, report.title)}
                                  className="w-full px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center space-x-2 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-sm font-medium">
                      No reports found matching your criteria.
                    </div>
                  )}
                </div>
              </div>

              {/* Section 3: Quick Templates */}
              <div className="self-stretch flex flex-col justify-start items-start gap-6">
                <div className="self-stretch justify-center text-slate-900 text-base font-normal font-['Inter'] leading-6">
                  Quick Templates
                </div>

                <div className="self-stretch grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Card 1: Patient Vitals */}
                  <div
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex-1 px-6 pt-6 pb-12 relative bg-white/70 rounded-3xl border-l-4 border-l-blue-900 border-r border-t border-b border-slate-200 backdrop-blur-[10px] inline-flex flex-col justify-start items-start gap-1 shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.03)] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)] hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="size-5 bg-blue-900 rounded-xs flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div className="self-stretch pt-3 flex flex-col justify-start items-start">
                      <div className="self-stretch justify-center text-slate-900 text-base font-bold font-['Inter'] leading-6 group-hover:text-blue-900 transition-colors">
                        Patient Vitals
                      </div>
                    </div>
                    <div className="self-stretch flex flex-col justify-start items-start">
                      <div className="self-stretch justify-center text-gray-500 text-xs font-normal font-['Inter'] leading-4">
                        Standard vitals tracking<br />report
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Scheduling Efficacy */}
                  <div
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex-1 p-6 relative bg-white/70 rounded-3xl border-l-4 border-l-blue-900 border-r border-t border-b border-slate-200 backdrop-blur-[10px] inline-flex flex-col justify-start items-start gap-1 shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.03)] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)] hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="w-4 h-5 bg-blue-900 rounded-xs flex items-center justify-center">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <div className="self-stretch pt-3 flex flex-col justify-start items-start">
                      <div className="self-stretch justify-center text-slate-900 text-base font-bold font-['Inter'] leading-6 group-hover:text-blue-900 transition-colors">
                        Scheduling<br />Efficacy
                      </div>
                    </div>
                    <div className="self-stretch flex flex-col justify-start items-start">
                      <div className="self-stretch justify-center text-gray-500 text-xs font-normal font-['Inter'] leading-4">
                        Audit clinic flow & wait<br />times
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Insurance Claim Log */}
                  <div
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex-1 p-6 relative bg-white/70 rounded-3xl border-l-4 border-l-indigo-800 border-r border-t border-b border-slate-200 backdrop-blur-[10px] inline-flex flex-col justify-start items-start gap-1 shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.03)] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)] hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="w-4 h-5 bg-indigo-800 rounded-xs flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-white" />
                    </div>
                    <div className="self-stretch pt-3 flex flex-col justify-start items-start">
                      <div className="self-stretch justify-center text-slate-900 text-base font-bold font-['Inter'] leading-6 group-hover:text-indigo-800 transition-colors">
                        Insurance Claim<br />Log
                      </div>
                    </div>
                    <div className="self-stretch flex flex-col justify-start items-start">
                      <div className="self-stretch justify-center text-gray-500 text-xs font-normal font-['Inter'] leading-4">
                        Billing & reconciliation<br />summary
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (Widgets) */}
            <div className="self-stretch flex flex-col justify-start items-start gap-8">
              {/* Widget 1: Quick Actions */}
              <div className="self-stretch p-6 relative bg-white/70 rounded-3xl outline outline-1 outline-offset-[-1px] outline-slate-200 backdrop-blur-[10px] flex flex-col justify-start items-start gap-6 shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.03)] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="self-stretch pb-4 border-b border-slate-300/30 flex flex-col justify-start items-start">
                  <div className="justify-center text-slate-900 text-base font-bold font-['Inter'] leading-6">
                    Quick Actions
                  </div>
                </div>

                <div className="self-stretch flex flex-col justify-start items-start gap-4">
                  {/* Action 1 */}
                  <div
                    onClick={() => setIsCreateModalOpen(true)}
                    className="self-stretch px-3 py-3 bg-indigo-50 hover:bg-indigo-100 rounded-2xl inline-flex justify-between items-center transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-5 bg-blue-900 rounded-xs flex items-center justify-center">
                        <Plus className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="text-center justify-center text-slate-900 text-base font-normal font-['Inter'] leading-6">
                        Create Report
                      </div>
                    </div>
                  </div>

                  {/* Action 2 */}
                  <div
                    onClick={() => handleExportData('PDF')}
                    className="self-stretch px-3 py-3 bg-indigo-50 hover:bg-indigo-100 rounded-2xl inline-flex justify-between items-center transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-5 bg-blue-900 rounded-xs flex items-center justify-center">
                        <FileText className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="text-center justify-center text-slate-900 text-base font-normal font-['Inter'] leading-6">
                        Export PDF
                      </div>
                    </div>
                  </div>

                  {/* Action 3 */}
                  <div
                    onClick={() => handleExportData('Excel')}
                    className="self-stretch px-3 py-3 bg-indigo-50 hover:bg-indigo-100 rounded-2xl inline-flex justify-between items-center transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-5 bg-blue-900 rounded-xs flex items-center justify-center">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="text-center justify-center text-slate-900 text-base font-normal font-['Inter'] leading-6">
                        Export Excel
                      </div>
                    </div>
                  </div>

                  {/* Action 4 */}
                  <div
                    onClick={() => showToast('Report schedule auto-sync active.')}
                    className="self-stretch px-3 py-3 bg-indigo-50 hover:bg-indigo-100 rounded-2xl inline-flex justify-between items-center transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-4 bg-indigo-800 rounded-xs flex items-center justify-center">
                        <Clock className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="text-center justify-center text-slate-900 text-base font-normal font-['Inter'] leading-6">
                        Schedule Report
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Widget 2: Scheduled Runs */}
              <div className="self-stretch p-6 relative bg-white/70 rounded-3xl outline outline-1 outline-offset-[-1px] outline-slate-200 backdrop-blur-[10px] flex flex-col justify-start items-start gap-6 shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.03)] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="self-stretch pb-4 border-b border-slate-300/30 flex flex-col justify-start items-start">
                  <div className="justify-center text-slate-900 text-base font-bold font-['Inter'] leading-6">
                    Scheduled Runs
                  </div>
                </div>

                <div className="self-stretch flex flex-col justify-start items-start gap-6">
                  {/* Scheduled Run 1 */}
                  <div className="self-stretch inline-flex justify-start items-start gap-4">
                    <div className="inline-flex flex-col justify-start items-center">
                      <div className="justify-center text-blue-900 text-base font-bold font-['Inter'] leading-6">
                        OCT
                      </div>
                      <div className="justify-center text-slate-900 text-base font-black font-['Inter'] leading-6">
                        15
                      </div>
                    </div>
                    <div className="flex-1 inline-flex flex-col justify-start items-start">
                      <div className="self-stretch justify-center text-slate-900 text-base font-normal font-['Inter'] leading-6">
                        Weekly Compliance<br />Audit
                      </div>
                      <div className="self-stretch justify-center text-gray-500 text-xs font-normal font-['Inter'] leading-4">
                        Automatically sends to Board
                      </div>
                      <div className="self-stretch pt-2 justify-center text-blue-900 text-xs font-bold font-['Inter'] leading-4">
                        RUNS AT 08:00 AM
                      </div>
                    </div>
                  </div>

                  {/* Scheduled Run 2 */}
                  <div className="self-stretch inline-flex justify-start items-start gap-4">
                    <div className="inline-flex flex-col justify-start items-center">
                      <div className="justify-center text-blue-900 text-base font-bold font-['Inter'] leading-6">
                        OCT
                      </div>
                      <div className="justify-center text-slate-900 text-base font-black font-['Inter'] leading-6">
                        18
                      </div>
                    </div>
                    <div className="flex-1 inline-flex flex-col justify-start items-start">
                      <div className="self-stretch justify-center text-slate-900 text-base font-normal font-['Inter'] leading-6">
                        Bi-Weekly Finance Sync
                      </div>
                      <div className="self-stretch justify-center text-gray-500 text-xs font-normal font-['Inter'] leading-4">
                        Internal reconciliation export
                      </div>
                      <div className="self-stretch pt-2 justify-center text-blue-900 text-xs font-bold font-['Inter'] leading-4">
                        RUNS AT 11:30 PM
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => showToast('Schedule manager opened.')}
                  className="self-stretch py-3 rounded-2xl outline outline-1 outline-offset-[-1px] outline-slate-300 inline-flex justify-center items-center transition-colors hover:bg-slate-50 cursor-pointer"
                >
                  <div className="text-center justify-center text-gray-500 text-base font-normal font-['Inter'] leading-6">
                    Manage Schedules
                  </div>
                </button>
              </div>

              {/* Widget 3: Recent Exports */}
              <div className="self-stretch p-6 relative bg-white/70 rounded-3xl outline outline-1 outline-offset-[-1px] outline-slate-200 backdrop-blur-[10px] flex flex-col justify-start items-start gap-6 shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.03)] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="self-stretch pb-4 border-b border-slate-300/30 flex flex-col justify-start items-start">
                  <div className="justify-center text-slate-900 text-base font-bold font-['Inter'] leading-6">
                    Recent Exports
                  </div>
                </div>

                <div className="self-stretch flex flex-col justify-start items-start gap-4">
                  {/* Export Item 1 */}
                  <div className="self-stretch inline-flex justify-between items-center">
                    <div className="flex justify-start items-center gap-3 min-w-0">
                      <div className="size-5 bg-blue-900 rounded-xs flex items-center justify-center shrink-0">
                        <FileText className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="inline-flex flex-col justify-start items-start min-w-0">
                        <div className="w-32 flex flex-col justify-start items-start overflow-hidden">
                          <div className="justify-center text-slate-900 text-base font-medium font-['Inter'] leading-6 truncate">
                            Patient_List_V2.pdf
                          </div>
                        </div>
                        <div className="justify-center text-gray-500 text-xs font-normal font-['Inter'] leading-4">
                          2.4 MB • 5 mins ago
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => showToast('Downloading Patient_List_V2.pdf...')}
                      className="size-8 rounded-full flex justify-center items-center text-gray-500 hover:text-blue-900 hover:bg-indigo-50 transition-colors cursor-pointer shrink-0"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Export Item 2 */}
                  <div className="self-stretch inline-flex justify-between items-center">
                    <div className="flex justify-start items-center gap-3 min-w-0">
                      <div className="size-5 bg-green-600 rounded-xs flex items-center justify-center shrink-0">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="inline-flex flex-col justify-start items-start min-w-0">
                        <div className="w-32 flex flex-col justify-start items-start overflow-hidden">
                          <div className="justify-center text-slate-900 text-base font-medium font-['Inter'] leading-6 truncate">
                            Financial_Summary_Q3.xlsx
                          </div>
                        </div>
                        <div className="justify-center text-gray-500 text-xs font-normal font-['Inter'] leading-4">
                          1.1 MB • 2 hrs ago
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => showToast('Downloading Financial_Summary_Q3.xlsx...')}
                      className="size-8 rounded-full flex justify-center items-center text-gray-500 hover:text-blue-900 hover:bg-indigo-50 transition-colors cursor-pointer shrink-0"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Export Item 3 */}
                  <div className="self-stretch inline-flex justify-between items-center">
                    <div className="flex justify-start items-center gap-3 min-w-0">
                      <div className="size-5 bg-blue-900 rounded-xs flex items-center justify-center shrink-0">
                        <FileText className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="inline-flex flex-col justify-start items-start min-w-0">
                        <div className="w-32 flex flex-col justify-start items-start overflow-hidden">
                          <div className="justify-center text-slate-900 text-base font-medium font-['Inter'] leading-6 truncate">
                            Recovery_Stats.pdf
                          </div>
                        </div>
                        <div className="justify-center text-gray-500 text-xs font-normal font-['Inter'] leading-4">
                          4.8 MB • Yesterday
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => showToast('Downloading Recovery_Stats.pdf...')}
                      className="size-8 rounded-full flex justify-center items-center text-gray-500 hover:text-blue-900 hover:bg-indigo-50 transition-colors cursor-pointer shrink-0"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateReportModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleReportCreated}
      />

      <ViewReportModal
        isOpen={!!selectedReportForView}
        onClose={() => setSelectedReportForView(null)}
        report={selectedReportForView}
        onDownloadToast={(fileName: string) => showToast(`Downloaded ${fileName}`)}
      />
    </div>
  );
};

export default ReportsPage;
