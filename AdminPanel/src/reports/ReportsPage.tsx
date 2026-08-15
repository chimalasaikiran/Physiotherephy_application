import React, { useState, useEffect, useMemo } from 'react';
import { InitialsAvatar } from '@/components/ui/InitialsAvatar';
import {
  FileText,
  Download,
  Plus,
  Cloud,
  Clock,
  HardDrive,
  Search,
  ChevronDown,
  Pin,
  MoreVertical,
  SlidersHorizontal,
  User,
  CheckCircle2,
  FileSpreadsheet,
  Calendar,
  ShieldCheck,
  Check,
  TrendingUp,
  UserCheck,
  Target,
  FilePlus,
  Trash2,
  Eye,
  DollarSign,
  Filter,
} from 'lucide-react';

import type { PinnedReport, RecentReport } from './types';
import { mockQuickTemplates, mockScheduledRuns } from './mockData';
import { CreateReportModal } from './components/CreateReportModal';
import { ViewReportModal } from './components/ViewReportModal';
import { ExportsTab } from './components/ExportsTab';

// Real-time Firestore services
import {
  subscribeToReports,
  subscribeToExportsArchive,
  calculateReportsDashboardMetrics,
  togglePinReport,
  deleteReportRecord,
  createExportArchiveItem,
  type FirestoreReportRecord,
  type FirestoreExportArchiveItem,
} from '@/services/reportService';
import { subscribeToPatients } from '@/services/patientService';
import { subscribeToSchedules } from '@/services/scheduleService';
import { subscribeToPayments, subscribeToInvoices } from '@/services/paymentService';
import { subscribeToTherapists } from '@/services/therapistService';
import { downloadCsv } from '@/utils/exportUtils';

import type { Patient } from '@/patients/types';
import type { AppointmentItem } from '@/schedule/components/AppointmentsTable';
import type { PaymentRecord, InvoiceDocument } from '@/payments/types';
import type { Therapist } from '@/therapists/types';

interface ReportsPageProps {
  initialSubTab?: 'Overview' | 'Patient Reports' | 'Treatment Reports' | 'Financial Reports' | 'Exports';
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ initialSubTab = 'Overview' }) => {
  // Navigation Tabs state
  const [activeSubTab, setActiveSubTab] = useState<
    'Overview' | 'Patient Reports' | 'Treatment Reports' | 'Financial Reports' | 'Exports'
  >(initialSubTab);

  // Firestore collections real-time state
  const [firestoreReports, setFirestoreReports] = useState<FirestoreReportRecord[]>([]);
  const [exportsArchive, setExportsArchive] = useState<FirestoreExportArchiveItem[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [schedules, setSchedules] = useState<AppointmentItem[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [invoices, setInvoices] = useState<InvoiceDocument[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [reportTypeFilter, setReportTypeFilter] = useState('All');
  const [patientFilter, setPatientFilter] = useState('All');
  const [therapistFilter, setTherapistFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Active Menu / Dropdown popup state
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedReportForView, setSelectedReportForView] = useState<PinnedReport | RecentReport | null>(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 1. Subscribe to all Firestore collections in real-time
  useEffect(() => {
    const unsubReports = subscribeToReports(setFirestoreReports);
    const unsubExports = subscribeToExportsArchive(setExportsArchive);
    const unsubPatients = subscribeToPatients(setPatients);
    const unsubSchedules = subscribeToSchedules((appts) => setSchedules(appts));
    const unsubPayments = subscribeToPayments(setPayments);
    const unsubInvoices = subscribeToInvoices(setInvoices);
    const unsubTherapists = subscribeToTherapists(setTherapists);

    return () => {
      unsubReports();
      unsubExports();
      unsubPatients();
      unsubSchedules();
      unsubPayments();
      unsubInvoices();
      unsubTherapists();
    };
  }, []);

  // 2. Dynamic dashboard metrics calculation
  const metrics = useMemo(() => {
    return calculateReportsDashboardMetrics(
      patients,
      schedules,
      payments,
      invoices,
      firestoreReports,
      exportsArchive
    );
  }, [patients, schedules, payments, invoices, firestoreReports, exportsArchive]);

  // Convert firestore reports to UI Pinned & Recent lists
  const pinnedReports: PinnedReport[] = useMemo(() => {
    return firestoreReports
      .filter((r) => r.isPinned)
      .map((r) => ({
        id: r.id,
        title: r.title,
        category: r.category,
        status: r.status,
        updatedAt: `${r.date} • ${typeof r.author === 'string' ? r.author : r.author.name}`,
        author: r.author,
        iconType: (r.iconType || 'document') as any,
        patientId: r.patientId,
        patientName: r.patientName,
        therapistId: r.therapistId,
        therapistName: r.therapistName,
        summaryText: r.summaryText,
        fileFormat: r.fileFormat,
        isPinned: true,
      }));
  }, [firestoreReports]);

  // Combine Firestore reports + dynamic patient/treatment/financial rows into display reports
  const allDisplayReports: RecentReport[] = useMemo(() => {
    const list: RecentReport[] = [];

    // Add Firestore report documents
    firestoreReports.forEach((r) => {
      list.push({
        id: r.id,
        title: r.title,
        category: r.category,
        date: r.date,
        status: r.status,
        author: r.author,
        iconType: (r.iconType || 'document') as any,
        patientId: r.patientId,
        patientName: r.patientName,
        therapistId: r.therapistId,
        therapistName: r.therapistName,
        summaryText: r.summaryText,
        fileFormat: r.fileFormat,
        isPinned: r.isPinned,
      });
    });

    // Synthesize treatment session reports from completed appointments
    schedules.forEach((s) => {
      if (!list.some((item) => item.id === `appt-rep-${s.id}`)) {
        list.push({
          id: `appt-rep-${s.id}`,
          title: `Treatment Session: ${s.patientName} (${s.patientSubtitle})`,
          category: 'Clinical',
          date: s.date,
          status: s.status === 'Completed' ? 'Verified' : 'Needs Review',
          author: {
            name: s.therapistName,
            avatarUrl: s.therapistAvatar || '',
          },
          iconType: 'assessment',
          patientName: s.patientName,
          therapistName: s.therapistName,
          summaryText: `Clinical treatment session conducted by ${s.therapistName} for ${s.patientName} (${s.type}). Status: ${s.status}.`,
          fileFormat: 'PDF',
        });
      }
    });

    // Synthesize financial reports from payment records
    payments.forEach((p) => {
      if (!list.some((item) => item.id === `pay-rep-${p.id}`)) {
        list.push({
          id: `pay-rep-${p.id}`,
          title: `Payment Receipt: ${p.patientName} (₹${(p.amount || p.numericAmount || 0).toLocaleString('en-IN')})`,
          category: 'Financial',
          date: p.paidAt ? p.paidAt.split('T')[0] : p.createdAt.split('T')[0],
          status: p.paymentStatus === 'Paid' || p.status === 'PAID' ? 'Verified' : 'Draft',
          author: {
            name: p.therapistName || 'Billing Desk',
            avatarUrl: '',
          },
          iconType: 'document',
          patientName: p.patientName,
          therapistName: p.therapistName,
          summaryText: `Payment record #${p.paymentId || p.id} for ${p.patientName}. Method: ${p.paymentMethod || 'Online'}. Amount: ₹${p.amount || 0}.`,
          fileFormat: 'CSV',
        });
      }
    });

    return list;
  }, [firestoreReports, schedules, payments]);

  // Filtered reports logic
  const filteredRecentReports = useMemo(() => {
    return allDisplayReports.filter((report) => {
      const authorStr = typeof report.author === 'string' ? report.author : report.author?.name || '';
      const matchesSearch =
        searchQuery === '' ||
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        authorStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (report.patientName && report.patientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (report.therapistName && report.therapistName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesSubTab =
        activeSubTab === 'Overview' ||
        (activeSubTab === 'Patient Reports' && (report.category === 'Clinical' || report.category === 'Assessment' || report.category === 'Patient Care' || !!report.patientName)) ||
        (activeSubTab === 'Treatment Reports' && (report.category === 'Clinical' || report.category === 'Progress' || report.title.includes('Session'))) ||
        (activeSubTab === 'Financial Reports' && (report.category === 'Financial' || report.title.includes('Payment')));

      const matchesType =
        reportTypeFilter === 'All' || report.category.toLowerCase().includes(reportTypeFilter.toLowerCase());

      const matchesStatus =
        statusFilter === 'All' || (report.status && report.status.toLowerCase() === statusFilter.toLowerCase());

      const matchesPatient =
        patientFilter === 'All' || (report.patientName && report.patientName === patientFilter);

      const matchesTherapist =
        therapistFilter === 'All' || (report.therapistName && report.therapistName === therapistFilter);

      return matchesSearch && matchesSubTab && matchesType && matchesStatus && matchesPatient && matchesTherapist;
    });
  }, [allDisplayReports, searchQuery, activeSubTab, reportTypeFilter, statusFilter, patientFilter, therapistFilter]);

  // Trigger export of current filtered reports data to CSV and save to Firestore
  const handleExportData = async (format: 'CSV' | 'Excel' | 'PDF' = 'CSV') => {
    const filename = `${activeSubTab.toLowerCase().replace(/\s+/g, '_')}_export_${new Date().toISOString().split('T')[0]}`;
    
    if (activeSubTab === 'Financial Reports') {
      const sizeStr = downloadCsv(
        filename,
        [
          { header: 'ID', accessor: (item: PaymentRecord) => item.paymentId || item.id },
          { header: 'Patient Name', accessor: (item: PaymentRecord) => item.patientName },
          { header: 'Therapist Name', accessor: (item: PaymentRecord) => item.therapistName || 'Unassigned' },
          { header: 'Amount (INR)', accessor: (item: PaymentRecord) => item.amount || item.numericAmount },
          { header: 'Payment Method', accessor: (item: PaymentRecord) => item.paymentMethod },
          { header: 'Status', accessor: (item: PaymentRecord) => item.paymentStatus || item.status },
          { header: 'Date', accessor: (item: PaymentRecord) => item.paidAt || item.createdAt },
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
        <>
          {/* Metric / KPI Cards Grid (4 Columns calculated from Firestore) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Card 1: Total Reports Generated */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Total Reports
                </span>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {metrics.totalReports.toLocaleString('en-IN')}
                </div>
                <div className="mt-1.5 flex items-center text-xs font-semibold text-emerald-600">
                  <span>Live from Firestore</span>
                </div>
              </div>
            </div>

            {/* Card 2: Financial Revenue / Paid */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Total Revenue
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  ₹{metrics.totalRevenue.toLocaleString('en-IN')}
                </div>
                <div className="mt-1.5 text-xs font-semibold text-slate-500">
                  Paid: ₹{metrics.totalPaid.toLocaleString('en-IN')} • Pending: ₹{metrics.totalPending.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Card 3: Treatment Reports */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Treatment Sessions
                </span>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {metrics.treatmentReportsCount}
                </div>
                <div className="mt-1.5 text-xs font-semibold text-slate-500">
                  {schedules.length} total scheduled
                </div>
              </div>
            </div>

            {/* Card 4: Storage Used */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Storage Used
                </span>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <HardDrive className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Usage</span>
                  <span className="text-xs font-bold text-slate-900">
                    {metrics.storageUsedMB} MB / 10 GB
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(5, (metrics.storageUsedMB / 10240) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Filter and Search Bar Container */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs flex flex-wrap lg:flex-nowrap items-center justify-between gap-3">
            {/* Search Field with ⌘K Badge */}
            <div className="relative w-full lg:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reports, patients, or therapists..."
                className="w-full pl-10 pr-12 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center space-x-1 px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-semibold text-slate-400">
                ⌘K
              </div>
            </div>

            {/* Filter Dropdown Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              {/* Report Type Dropdown */}
              <div className="relative">
                <select
                  value={reportTypeFilter}
                  onChange={(e) => setReportTypeFilter(e.target.value)}
                  className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 pr-8 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors"
                >
                  <option value="All">All Categories</option>
                  <option value="Clinical">Clinical</option>
                  <option value="Assessment">Assessment</option>
                  <option value="Progress">Progress</option>
                  <option value="Financial">Financial</option>
                  <option value="Patient Care">Patient Care</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Patient Selector Filter */}
              <div className="relative">
                <select
                  value={patientFilter}
                  onChange={(e) => setPatientFilter(e.target.value)}
                  className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 pr-8 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors"
                >
                  <option value="All">All Patients</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <User className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Therapist Selector Filter */}
              <div className="relative">
                <select
                  value={therapistFilter}
                  onChange={(e) => setTherapistFilter(e.target.value)}
                  className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 pr-8 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors"
                >
                  <option value="All">All Therapists</option>
                  {therapists.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <UserCheck className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Status Dropdown */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 pr-8 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors"
                >
                  <option value="All">Status</option>
                  <option value="Verified">Verified</option>
                  <option value="Needs Review">Needs Review</option>
                  <option value="Draft">Draft</option>
                  <option value="Ready">Ready</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Main Content Layout Grid (2 Columns: Left Main Content ~65%, Right Widgets ~35%) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
            {/* Left Column (Spans 2 on desktop) */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              {/* Section 1: Pinned Reports */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-slate-900">
                  <Pin className="w-4 h-4 text-blue-600 fill-blue-600" />
                  <h2 className="text-base font-extrabold tracking-tight">
                    {activeSubTab === 'Patient Reports' || activeSubTab === 'Overview'
                      ? 'Pinned Patient Reports'
                      : `Pinned ${activeSubTab}`}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pinnedReports.map((report) => (
                    <div
                      key={report.id}
                      className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow relative"
                    >
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                          {report.iconType === 'chart' ? (
                            <TrendingUp className="w-5 h-5 text-indigo-600" />
                          ) : report.iconType === 'user' ? (
                            <UserCheck className="w-5 h-5 text-blue-600" />
                          ) : (
                            <FileText className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <button
                          onClick={() =>
                            setActiveActionMenuId(activeActionMenuId === report.id ? null : report.id)
                          }
                          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Action Menu Popup */}
                        {activeActionMenuId === report.id && (
                          <div className="absolute right-4 top-12 w-44 bg-white rounded-2xl border border-slate-100 shadow-xl py-1.5 z-30 animate-in fade-in zoom-in-95">
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
                              <span>Unpin Report</span>
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

                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                          {report.title}
                        </h3>

                        {/* Tag Badges */}
                        <div className="flex flex-wrap items-center gap-2 mt-2.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              report.category === 'Clinical'
                                ? 'bg-blue-50 text-blue-700'
                                : report.category === 'Progress'
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'bg-purple-50 text-purple-700'
                            }`}
                          >
                            {report.category}
                          </span>

                          {report.status === 'Verified' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5"></span>
                              {report.status}
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-medium text-slate-400 mt-3">
                          {report.updatedAt}
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedReportForView(report)}
                        className="w-full py-2.5 bg-blue-50/80 hover:bg-blue-100 text-blue-600 font-bold text-sm rounded-xl transition-colors text-center cursor-pointer"
                      >
                        View Report
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 2: Recent Reports */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                    {activeSubTab === 'Patient Reports' || activeSubTab === 'Overview'
                      ? 'Recent Reports'
                      : `Recent ${activeSubTab}`}
                  </h2>
                  <button
                    onClick={() => {
                      setReportTypeFilter('All');
                      setPatientFilter('All');
                      setTherapistFilter('All');
                      setStatusFilter('All');
                      setSearchQuery('');
                    }}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-xs divide-y divide-slate-100 overflow-hidden">
                  {filteredRecentReports.length > 0 ? (
                    filteredRecentReports.map((report) => {
                      const authorName =
                        typeof report.author === 'string'
                          ? report.author
                          : report.author?.name || 'Dr. Sarah Chen';

                      return (
                        <div
                          key={report.id}
                          onClick={() => setSelectedReportForView(report)}
                          className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/80 transition-colors cursor-pointer relative"
                        >
                          <div className="flex items-center space-x-3.5">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                report.category === 'Assessment'
                                  ? 'bg-blue-50 text-blue-600'
                                  : report.category === 'Clinical'
                                  ? 'bg-purple-50 text-purple-600'
                                  : 'bg-teal-50 text-teal-600'
                              }`}
                            >
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="text-sm font-extrabold text-slate-900">
                                  {report.title}
                                </h3>
                              </div>
                              <p className="text-xs font-medium text-slate-400 mt-0.5">
                                {report.category} • {report.date}
                                {report.patientName ? ` • Patient: ${report.patientName}` : ''}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            {report.status && (
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-bold hidden sm:inline-block ${
                                  report.status === 'Verified'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : report.status === 'Needs Review'
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {report.status}
                              </span>
                            )}

                            <InitialsAvatar name={authorName} className="w-8 h-8 text-xs font-bold ring-2 ring-white shrink-0" />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveActionMenuId(activeActionMenuId === report.id ? null : report.id);
                              }}
                              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* Dropdown Popup */}
                            {activeActionMenuId === report.id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-4 top-12 w-44 bg-white rounded-2xl border border-slate-100 shadow-xl py-1.5 z-30 text-left animate-in fade-in zoom-in-95"
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
              <div className="space-y-4">
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Quick Templates
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {mockQuickTemplates.map((tpl) => (
                    <div
                      key={tpl.id}
                      onClick={() => setIsCreateModalOpen(true)}
                      className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-3 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                          tpl.iconType === 'notes'
                            ? 'bg-blue-50 text-blue-600'
                            : tpl.iconType === 'summary'
                            ? 'bg-purple-50 text-purple-600'
                            : 'bg-teal-50 text-teal-600'
                        }`}
                      >
                        {tpl.iconType === 'notes' ? (
                          <FileText className="w-5 h-5" />
                        ) : tpl.iconType === 'summary' ? (
                          <FilePlus className="w-5 h-5" />
                        ) : (
                          <Target className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {tpl.title}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium mt-1 leading-snug">
                          {tpl.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column (Widgets) */}
            <div className="space-y-6 sm:space-y-8">
              {/* Widget 1: Quick Actions */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-4">
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Quick Actions
                </h2>

                <div className="space-y-2.5">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-full py-3 px-4 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-extrabold text-sm rounded-xl transition-colors flex items-center space-x-3 cursor-pointer"
                  >
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Create Report</span>
                  </button>

                  <button
                    onClick={() => handleExportData('PDF')}
                    className="w-full py-3 px-4 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-extrabold text-sm rounded-xl transition-colors flex items-center space-x-3 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Export PDF</span>
                  </button>

                  <button
                    onClick={() => handleExportData('Excel')}
                    className="w-full py-3 px-4 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-extrabold text-sm rounded-xl transition-colors flex items-center space-x-3 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                    <span>Export Excel</span>
                  </button>

                  <button
                    onClick={() => showToast('Report schedule auto-sync active.')}
                    className="w-full py-3 px-4 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-extrabold text-sm rounded-xl transition-colors flex items-center space-x-3 cursor-pointer"
                  >
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Schedule Report</span>
                  </button>
                </div>
              </div>

              {/* Widget 2: Scheduled Runs */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-4">
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Scheduled Runs
                </h2>

                <div className="space-y-4">
                  {mockScheduledRuns.map((run) => (
                    <div key={run.id} className="flex items-start space-x-3.5">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 font-extrabold flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] uppercase font-bold tracking-wider leading-none text-blue-600">
                          {run.month}
                        </span>
                        <span className="text-base leading-none mt-0.5">{run.day}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-extrabold text-slate-900 truncate">
                          {run.title}
                        </h3>
                        <p className="text-[11px] font-medium text-slate-400 truncate mt-0.5">
                          {run.description}
                        </p>
                        <span className="inline-block text-[10px] font-extrabold text-blue-600 tracking-wider uppercase mt-1">
                          {run.runsAt}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => showToast('Report schedule active.')}
                  className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-colors text-center cursor-pointer"
                >
                  Manage Schedules
                </button>
              </div>

              {/* Widget 3: Recent Exports from Firestore */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-4">
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Recent Exports
                </h2>

                <div className="space-y-3">
                  {exportsArchive.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            item.format === 'EXCEL'
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-blue-50 text-blue-600'
                          }`}
                        >
                          {item.format === 'EXCEL' ? (
                            <FileSpreadsheet className="w-4 h-4" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xs font-bold text-slate-900 truncate">
                            {item.fileName}
                          </h3>
                          <p className="text-[11px] text-slate-400 font-medium">
                            {item.size} • {item.dateCreated}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => showToast(`Downloading ${item.fileName}...`)}
                        className="p-2 text-slate-400 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                        title="Download File"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
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
        onDownloadToast={(fileName) => showToast(`Downloaded ${fileName}`)}
      />
    </div>
  );
};

export default ReportsPage;
