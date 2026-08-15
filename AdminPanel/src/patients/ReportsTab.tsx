import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Eye,
  Download,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Share2,
  Trash2,
  MoreVertical,
  CheckCircle2,
  X,
  ShieldCheck,
  Activity,
  ClipboardList,
  FileCheck,
  Printer,
  AlertCircle,
} from 'lucide-react';
import type { Patient } from './types';
import type { PatientReportItem } from './usePatientProfileData';

interface ReportsTabProps {
  patientName?: string;
  therapistName?: string;
  patient?: Patient;
  reports?: PatientReportItem[];
  onUploadReport?: (fileData: any) => Promise<string>;
}

interface ReportItem {
  id: string;
  name: string;
  category: 'Assessment' | 'Imaging' | 'Progress' | 'Lab Results' | 'Summary';
  date: string;
  size: string;
  status: 'VERIFIED' | 'PENDING' | 'ARCHIVED';
  typeIcon: 'teal' | 'purple' | 'blue' | 'amber';
  summaryText?: string;
}

export const ReportsTab: React.FC<ReportsTabProps> = ({
  patientName = 'Sanya Malhotra',
  therapistName = 'Dr. Ananya Iyer',
  patient,
  reports = [],
  onUploadReport,
}) => {
  // Notification Feedback Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Hidden File Input Ref for Upload trigger
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag over dropzone state
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Recent Reports State (4 main cards in top grid matching Figma)
  const [recentReports, setRecentReports] = useState<ReportItem[]>([
    {
      id: 'rr-1',
      name: 'MRI Lumbar Spine',
      category: 'Imaging',
      date: '24 Oct 2024',
      size: '12.4 MB',
      status: 'VERIFIED',
      typeIcon: 'teal',
      summaryText:
        'Lumbar spine scan shows mild L4-L5 disc protrusion without spinal canal stenosis. Soft tissue alignment intact.',
    },
    {
      id: 'rr-2',
      name: 'Initial Assessment',
      category: 'Assessment',
      date: '18 Oct 2024',
      size: '2.1 MB',
      status: 'VERIFIED',
      typeIcon: 'purple',
      summaryText:
        'Comprehensive baseline evaluation. Reduced lumbar range of motion (40%), acute pain index 6/10.',
    },
    {
      id: 'rr-3',
      name: 'Biomechanical Analysis',
      category: 'Progress',
      date: '02 Nov 2024',
      size: '45.8 MB',
      status: 'PENDING',
      typeIcon: 'blue',
      summaryText:
        '3D Motion capture data for gait asymmetry and pelvic tilt during squat movement pattern.',
    },
    {
      id: 'rr-4',
      name: 'Progress Summary Q3',
      category: 'Summary',
      date: '30 Sep 2024',
      size: '1.4 MB',
      status: 'VERIFIED',
      typeIcon: 'teal',
      summaryText:
        'Quarterly physical therapy outcomes summary demonstrating 38% overall functional recovery boost.',
    },
  ]);

  // Report History Table State ( matching lower table in Figma )
  const [historyReports] = useState<ReportItem[]>([
    {
      id: 'rh-1',
      name: 'Physio Intake Form',
      category: 'Assessment',
      date: '15 Oct 2024',
      size: '850 KB',
      status: 'VERIFIED',
      typeIcon: 'teal',
      summaryText: 'Standard intake questionnaire detailing pain onset, medical history, and goals.',
    },
    {
      id: 'rh-2',
      name: 'X-Ray Pelvis',
      category: 'Imaging',
      date: '12 Oct 2024',
      size: '18.2 MB',
      status: 'VERIFIED',
      typeIcon: 'blue',
      summaryText: 'Anteroposterior pelvic radiographic view confirming normal sacroiliac joints.',
    },
    {
      id: 'rh-3',
      name: 'ROM Measurements',
      category: 'Progress',
      date: '01 Nov 2024',
      size: '1.1 MB',
      status: 'PENDING',
      typeIcon: 'amber',
      summaryText: 'Goniometric range of motion tracking for flexors, extensors, and lateral rotation.',
    },
    {
      id: 'rh-4',
      name: 'EMG Muscle Activity Report',
      category: 'Lab Results',
      date: '28 Sep 2024',
      size: '5.6 MB',
      status: 'VERIFIED',
      typeIcon: 'purple',
      summaryText: 'Electromyography evaluation of lumbar erector spinae muscle fatigue rates.',
    },
  ]);

  // Active View Modal State
  const [selectedReportModal, setSelectedReportModal] = useState<ReportItem | null>(null);

  // Modals state
  const [isGenerateReportModalOpen, setIsGenerateReportModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Storage Stats State
  const [usedStorageMB, setUsedStorageMB] = useState(154.2);
  const totalStorageMB = 1000; // 1 GB
  const storagePercentage = Math.round((usedStorageMB / totalStorageMB) * 100);

  // Pagination State for Report History Table
  const [currentPage, setCurrentPage] = useState(1);
  const totalReportsCount = 18;

  // Generate Report Form State
  const [genReportType, setGenReportType] = useState('Full Progress Report');
  const [genDateRange, setGenDateRange] = useState('Last 30 Days');
  const [genIncludeCharts, setGenIncludeCharts] = useState(true);
  const [genIncludeNotes, setGenIncludeNotes] = useState(true);

  // File upload Handler
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    const reportData = {
      name: file.name.replace(/\.[^/.]+$/, ''),
      category: 'Assessment' as const,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      status: 'VERIFIED' as const,
      typeIcon: 'teal' as const,
      summaryText: `Uploaded clinical document ${file.name} for ${patientName}.`,
    };

    if (onUploadReport) {
      try {
        await onUploadReport(reportData);
        setUsedStorageMB((prev) => parseFloat((prev + file.size / (1024 * 1024)).toFixed(1)));
        showToast(`Uploaded "${file.name}" to Firestore & Patient Mobile App!`);
      } catch (err: any) {
        showToast(`Error saving document to Firestore: ${err.message}`);
      }
    } else {
      const newReport: ReportItem = {
        id: `rr-${Date.now()}`,
        ...reportData,
        date: 'Today',
      };
      setRecentReports((prev) => [newReport, ...prev]);
      setUsedStorageMB((prev) => parseFloat((prev + file.size / (1024 * 1024)).toFixed(1)));
      showToast(`Uploaded "${file.name}" successfully! Status: Verified.`);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  // Generate Report Submission
  const handleGenerateReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newGenReport: ReportItem = {
      id: `rr-${Date.now()}`,
      name: `${genReportType} - ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`,
      category: 'Summary',
      date: 'Today',
      size: '3.4 MB',
      status: 'VERIFIED',
      typeIcon: 'purple',
      summaryText: `Automated ${genReportType} generated for ${patientName}. Covers ${genDateRange}.`,
    };

    setRecentReports((prev) => [newGenReport, ...prev]);
    setIsGenerateReportModalOpen(false);
    showToast(`✨ Generated ${genReportType} successfully!`);
  };

  // Download simulation
  const handleDownloadReport = (report: ReportItem) => {
    showToast(`Downloading "${report.name}" (${report.size})...`);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center space-x-2.5 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileUpload(e.target.files)}
        accept=".pdf,.dcm,.jpeg,.jpg,.png"
        className="hidden"
      />

      {/* ================= MAIN CONTENT GRID (2 COLUMNS: ~68% LEFT, ~32% RIGHT) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ================= LEFT COLUMN (~68% on Desktop) ================= */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          {/* 1. UPLOAD CLINICAL DOCUMENTS BOX (Dotted Dropzone) */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center flex flex-col items-center justify-center space-y-4 transition-all cursor-pointer group ${
              isDraggingOver
                ? 'border-blue-500 bg-blue-50/80 scale-[1.01]'
                : 'border-blue-200/90 bg-blue-50/30 hover:bg-blue-50/60 hover:border-blue-300'
            }`}
          >
            {/* Upload Icon Circle */}
            <div className="w-14 h-14 rounded-2xl bg-blue-100/70 text-blue-600 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform duration-200">
              <UploadCloud className="w-7 h-7 stroke-[2]" />
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1 max-w-md">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Upload Clinical Documents
              </h3>
              <p className="text-xs sm:text-sm font-medium text-slate-500 leading-relaxed">
                Drag and drop MRI, CT scans, or clinical notes here. Supported formats: PDF, DICOM,
                JPEG.
              </p>
            </div>

            {/* Select Files Action Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-6 py-2.5 bg-white hover:bg-slate-50 text-blue-600 border border-blue-200 text-xs sm:text-sm font-extrabold rounded-full shadow-2xs hover:shadow-xs transition-all cursor-pointer inline-flex items-center space-x-2"
              >
                <span>Select Files</span>
              </button>
            </div>
          </div>

          {/* 2. RECENT REPORTS GRID SECTION */}
          <div className="space-y-4">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Recent Reports
              </h3>
              <button
                onClick={() => showToast('Displaying all historical patient reports.')}
                className="text-xs sm:text-sm font-extrabold text-blue-600 hover:text-blue-700 flex items-center space-x-1 cursor-pointer"
              >
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* 2x2 Grid of Recent Report Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(reports.length > 0 ? (reports as any[]) : recentReports).map((report) => (
                <div
                  key={report.id}
                  className="bg-white rounded-3xl p-5 border border-slate-100 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-4 group"
                >
                  {/* Top Bar: Icon + Status Badge */}
                  <div className="flex items-center justify-between">
                    {/* Category Icon Badge */}
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                        report.typeIcon === 'teal'
                          ? 'bg-teal-50 text-teal-600'
                          : report.typeIcon === 'purple'
                          ? 'bg-purple-50 text-purple-600'
                          : report.typeIcon === 'blue'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      {report.category === 'Imaging' ? (
                        <FileText className="w-5.5 h-5.5" />
                      ) : report.category === 'Assessment' ? (
                        <ClipboardList className="w-5.5 h-5.5" />
                      ) : report.category === 'Progress' ? (
                        <Activity className="w-5.5 h-5.5" />
                      ) : (
                        <FileCheck className="w-5.5 h-5.5" />
                      )}
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                        report.status === 'VERIFIED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>

                  {/* Title & Metadata */}
                  <div className="space-y-1">
                    <h4 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {report.name}
                    </h4>
                    <p className="text-xs font-semibold text-slate-400">
                      {report.date} • {report.size}
                    </p>
                  </div>

                  {/* Card Bottom Actions (View Button + Download Icon) */}
                  <div className="pt-2 border-t border-slate-50 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedReportModal(report)}
                      className="flex-1 py-2 px-4 bg-slate-50 hover:bg-slate-100/90 text-slate-700 text-xs font-extrabold rounded-xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>View</span>
                    </button>

                    <button
                      onClick={() => handleDownloadReport(report)}
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                      title="Download File"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. REPORT HISTORY TABLE SECTION */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-100 shadow-2xs space-y-5">
            {/* Table Header & Title */}
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Report History
              </h3>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
                  Filter by Category:
                </span>
                <span className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200/70 px-3 py-1.5 rounded-xl">
                  All Reports
                </span>
              </div>
            </div>

            {/* Table Area */}
            <div className="overflow-x-auto -mx-5 sm:mx-0">
              <table className="w-full text-left border-collapse min-w-[580px]">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50/40">
                    <th className="py-3 px-4 rounded-l-xl">REPORT NAME</th>
                    <th className="py-3 px-4">CATEGORY</th>
                    <th className="py-3 px-4">DATE</th>
                    <th className="py-3 px-4">STATUS</th>
                    <th className="py-3 px-4 text-right rounded-r-xl">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/70 text-xs sm:text-sm">
                  {historyReports.map((report) => (
                    <tr
                      key={report.id}
                      className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                      onClick={() => setSelectedReportModal(report)}
                    >
                      {/* Name + Icon */}
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                            {report.category === 'Imaging' ? (
                              <FileText className="w-4 h-4" />
                            ) : (
                              <ClipboardList className="w-4 h-4" />
                            )}
                          </div>
                          <span className="group-hover:text-blue-600 transition-colors">
                            {report.name}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 font-semibold text-slate-600">
                        {report.category}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 font-semibold text-slate-500">
                        {report.date}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1.5 font-bold text-xs">
                          {report.status === 'VERIFIED' ? (
                            <>
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span className="text-emerald-700">Verified</span>
                            </>
                          ) : (
                            <>
                              <span className="w-2 h-2 rounded-full bg-amber-500" />
                              <span className="text-amber-700">Pending</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReportModal(report);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                          title="Options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer with Pagination matching Figma */}
            <div className="pt-2 flex items-center justify-between text-xs font-semibold text-slate-400 border-t border-slate-100/70">
              <span>Showing 3 of {totalReportsCount} reports</span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 font-bold text-slate-700">{currentPage}</span>
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN / SIDEBAR (~32% on Desktop) ================= */}
        <div className="space-y-6 sm:space-y-8">
          {/* 1. QUICK ACTIONS CARD (Figma Sidebar top) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-4">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
              QUICK ACTIONS
            </span>

            <div className="space-y-3">
              {/* Button 1: Primary Dark Blue Generate Progress Report */}
              <button
                onClick={() => setIsGenerateReportModalOpen(true)}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-[#0C3E6D] hover:bg-[#092e52] text-white text-xs sm:text-sm font-extrabold rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 fill-white/20" />
                <span>Generate Progress Report</span>
              </button>

              {/* Button 2: Share with Patient */}
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-slate-50 hover:bg-slate-100/90 text-slate-700 border border-slate-100 text-xs sm:text-sm font-bold rounded-2xl transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-slate-500" />
                <span>Share with Patient</span>
              </button>

              {/* Button 3: Export Medical Record */}
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-slate-50 hover:bg-slate-100/90 text-slate-700 border border-slate-100 text-xs sm:text-sm font-bold rounded-2xl transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Export Medical Record</span>
              </button>

              {/* Button 4: Archive Records */}
              <button
                onClick={() => setIsArchiveModalOpen(true)}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-rose-50/70 hover:bg-rose-100/70 text-rose-700 border border-rose-100/80 text-xs sm:text-sm font-bold rounded-2xl transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Archive Records</span>
              </button>
            </div>
          </div>

          {/* 2. STORAGE USAGE CARD */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-4">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
              STORAGE USAGE
            </span>

            <div className="space-y-3">
              {/* Storage Info Header */}
              <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold text-slate-900">
                <span>
                  {usedStorageMB} MB of 1 GB
                </span>
                <span className="text-blue-600">{storagePercentage}%</span>
              </div>

              {/* Storage Progress Bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-700"
                  style={{ width: `${storagePercentage}%` }}
                />
              </div>

              {/* HIPAA / Security Subtext */}
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed pt-1">
                Clinical data is end-to-end encrypted and HIPAA compliant.
              </p>
            </div>
          </div>

          {/* 3. RECENTLY SHARED CARD */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-4">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
              RECENTLY SHARED
            </span>

            <div className="space-y-3">
              {/* Avatar Row Badges */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold flex items-center justify-center border-2 border-white shadow-2xs">
                  AS
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-xs font-extrabold flex items-center justify-center border-2 border-white shadow-2xs">
                  SM
                </div>
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 text-xs font-extrabold flex items-center justify-center border-2 border-white shadow-2xs">
                  AI
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 text-xs font-extrabold flex items-center justify-center border-2 border-white shadow-2xs">
                  +2
                </div>
              </div>

              {/* Subtext */}
              <p className="text-xs font-medium text-slate-500">
                Last shared with {therapistName} on 03 Nov.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODALS & DIALOGS ================= */}

      {/* 1. DOCUMENT PREVIEW / VIEW MODAL */}
      {selectedReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                    {selectedReportModal.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">
                    {selectedReportModal.category} • {selectedReportModal.date} •{' '}
                    {selectedReportModal.size}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReportModal(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Simulated Document Viewer */}
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  CLINICAL SUMMARY & FINDINGS
                </span>
                <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                  {selectedReportModal.summaryText ||
                    'Clinical document verified and synced into patient record. All parameter readings comply with baseline protocols.'}
                </p>
              </div>

              {/* Simulated PDF Preview Container */}
              <div className="border border-slate-200 rounded-2xl p-8 bg-slate-100/50 text-center space-y-3">
                <FileCheck className="w-12 h-12 text-blue-600 mx-auto opacity-80" />
                <h4 className="text-sm font-bold text-slate-800">PDF Preview Document Loaded</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  High-resolution DICOM & PDF document attached. Verified under HIPAA license protocol.
                </p>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Encrypted File</span>
              </span>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    showToast(`Printing document: ${selectedReportModal.name}`);
                  }}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer flex items-center space-x-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => {
                    handleDownloadReport(selectedReportModal);
                    setSelectedReportModal(null);
                  }}
                  className="px-5 py-2 bg-[#0C3E6D] text-white text-xs font-bold rounded-xl hover:bg-[#092e52] transition-colors cursor-pointer flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. GENERATE PROGRESS REPORT MODAL */}
      {isGenerateReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Generate Progress Report
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Create a customized clinical report for {patientName}
                </p>
              </div>
              <button
                onClick={() => setIsGenerateReportModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateReportSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Report Type
                </label>
                <select
                  value={genReportType}
                  onChange={(e) => setGenReportType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Full Progress Report">Full Progress Report</option>
                  <option value="Pain & Recovery Summary">Pain & Recovery Summary</option>
                  <option value="Gait & Biomechanical Analysis">
                    Gait & Biomechanical Analysis
                  </option>
                  <option value="Insurance Claim Clinical Notes">
                    Insurance Claim Clinical Notes
                  </option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Time Period
                </label>
                <select
                  value={genDateRange}
                  onChange={(e) => setGenDateRange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Last 30 Days">Last 30 Days</option>
                  <option value="Last 60 Days">Last 60 Days</option>
                  <option value="Current Treatment Cycle">Current Treatment Cycle</option>
                  <option value="Full Treatment History">Full Treatment History</option>
                </select>
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={genIncludeCharts}
                    onChange={(e) => setGenIncludeCharts(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Include Pain & Mobility Trend Charts</span>
                </label>
                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={genIncludeNotes}
                    onChange={(e) => setGenIncludeNotes(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Include Clinician Notes & Observations</span>
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsGenerateReportModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0C3E6D] hover:bg-[#092e52] rounded-xl transition-colors cursor-pointer shadow-xs flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Report</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. SHARE WITH PATIENT MODAL */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-extrabold text-slate-900">Share Reports</h3>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-500 font-medium">
                Share clinical records securely with {patientName} via Patient Portal app or email.
              </p>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Patient Portal Access</span>
                <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                  Active
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Direct Email Notification
                </label>
                <input
                  type="email"
                  defaultValue="sanya.malhotra@example.com"
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
                  type="button"
                  onClick={() => {
                    setIsShareModalOpen(false);
                    showToast(`Reports shared with ${patientName}!`);
                  }}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer"
                >
                  Send Access Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. ARCHIVE RECORDS CONFIRMATION MODAL */}
      {isArchiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Archive Patient Records</h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Are you sure you want to archive older report records for {patientName}? Archived files
              will be moved to secure cloud cold storage and remain accessible anytime.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsArchiveModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsArchiveModalOpen(false);
                  showToast('Patient records archived to cold storage.');
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Confirm Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. EXPORT MEDICAL RECORD MODAL */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-extrabold text-slate-900">Export Medical Record</h3>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-500 font-medium">
                Bundle and export all clinical reports, imaging, and progress data into a single ZIP or encrypted PDF.
              </p>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Export Format
                </label>
                <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none">
                  <option value="pdf-bundle">Combined PDF Package (HIPAA Compliant)</option>
                  <option value="zip-archive">ZIP Archive with Raw DICOM + PDF Files</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsExportModalOpen(false);
                    showToast(`Exporting full medical record package for ${patientName}...`);
                  }}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0C3E6D] hover:bg-[#092e52] rounded-xl transition-colors cursor-pointer shadow-xs flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Package</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsTab;
