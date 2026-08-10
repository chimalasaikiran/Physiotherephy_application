import React, { useState, useMemo } from 'react';
import {
  Search,
  Calendar,
  ChevronDown,
  FileText,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  FileCheck,
  X,
  Copy,
  Download,
  Info,
  CheckCircle2,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: {
    name: string;
    role: string;
    avatarInitials: string;
    avatarBg: string;
    avatarTextColor: string;
  };
  type: 'Security' | 'Clinical' | 'Financial' | 'System';
  description: string;
  subtext: string;
  source: {
    ip: string;
    device: string;
  };
  details?: {
    actionType: string;
    affectedResource: string;
    status: 'Success' | 'Warning' | 'Failure';
    payloadJson?: string;
  };
}

interface AuditLogsTabProps {
  onShowToast: (message: string) => void;
}

const initialAuditLogs: AuditLogEntry[] = [
  {
    id: 'LOG-2023-9001',
    timestamp: 'Oct 24, 2023 09:42:11 AM',
    user: {
      name: 'Dr. Arjun Mehta',
      role: 'Senior Physiotherapist',
      avatarInitials: 'AM',
      avatarBg: 'bg-[#FBE8D8]',
      avatarTextColor: 'text-[#8A4215]',
    },
    type: 'Security',
    description: 'Updated MFA Policy for Clinic staff',
    subtext: 'Transitioned from SMS to TOTP auth.',
    source: {
      ip: '192.168.1.104',
      device: 'macOS • Chrome',
    },
    details: {
      actionType: 'MFA_POLICY_UPDATE',
      affectedResource: 'Auth Module / Staff Portal',
      status: 'Success',
      payloadJson: '{\n  "previous_mfa": "SMS",\n  "new_mfa": "TOTP_AUTHENTICATOR",\n  "enforced_roles": ["Physiotherapist", "Clinical Lead"]\n}',
    },
  },
  {
    id: 'LOG-2023-9002',
    timestamp: 'Oct 24, 2023 08:15:33 AM',
    user: {
      name: 'Dr. Ananya Iyer',
      role: 'Clinical Lead',
      avatarInitials: 'AI',
      avatarBg: 'bg-[#D1F5F0]',
      avatarTextColor: 'text-[#0F766E]',
    },
    type: 'Clinical',
    description: 'Assigned Recovery Program to #PID-8821',
    subtext: 'Protocol: Post-ACL Grade 3 Repair.',
    source: {
      ip: '203.0.113.42',
      device: 'iOS • Mobile App',
    },
    details: {
      actionType: 'PROGRAM_ASSIGNMENT',
      affectedResource: 'Patient #PID-8821',
      status: 'Success',
      payloadJson: '{\n  "patient_id": "PID-8821",\n  "program": "Post-ACL Grade 3 Repair",\n  "duration_weeks": 12,\n  "assigned_by": "Dr. Ananya Iyer"\n}',
    },
  },
  {
    id: 'LOG-2023-9003',
    timestamp: 'Oct 23, 2023 04:22:10 PM',
    user: {
      name: 'Rahul Varma',
      role: 'Admin Staff',
      avatarInitials: 'RV',
      avatarBg: 'bg-[#E2E8F0]',
      avatarTextColor: 'text-[#334155]',
    },
    type: 'Financial',
    description: 'Modified Invoice #INV-2023-441',
    subtext: 'Adjusted insurance coverage percentage.',
    source: {
      ip: '110.22.45.19',
      device: 'Windows • Edge',
    },
    details: {
      actionType: 'INVOICE_MODIFICATION',
      affectedResource: 'Invoice #INV-2023-441',
      status: 'Success',
      payloadJson: '{\n  "invoice_id": "INV-2023-441",\n  "old_coverage": "70%",\n  "new_coverage": "85%",\n  "reason": "Secondary insurance approval"\n}',
    },
  },
  {
    id: 'LOG-2023-9004',
    timestamp: 'Oct 23, 2023 11:05:00 AM',
    user: {
      name: 'Priya Sharma',
      role: 'Facility Manager',
      avatarInitials: 'PS',
      avatarBg: 'bg-[#FCE7F3]',
      avatarTextColor: 'text-[#9D174D]',
    },
    type: 'System',
    description: 'Updated Clinic Branding Assets',
    subtext: 'Uploaded new high-res logo variant.',
    source: {
      ip: '122.161.49.201',
      device: 'macOS • Safari',
    },
    details: {
      actionType: 'BRANDING_UPDATE',
      affectedResource: 'Clinic Branding Configuration',
      status: 'Success',
      payloadJson: '{\n  "asset_name": "logo_vector_v2.svg",\n  "size": "2.4 MB",\n  "applied_to": "Patient Portal & Invoices"\n}',
    },
  },
  {
    id: 'LOG-2023-9005',
    timestamp: 'Oct 22, 2023 03:14:02 PM',
    user: {
      name: 'Dr. Sarah Chen',
      role: 'Clinic Administrator',
      avatarInitials: 'SC',
      avatarBg: 'bg-[#DBEAFE]',
      avatarTextColor: 'text-[#1E40AF]',
    },
    type: 'Security',
    description: 'Modified User Role Access for #USR-902',
    subtext: 'Elevated therapist permissions for pediatric module.',
    source: {
      ip: '192.168.1.105',
      device: 'macOS • Chrome',
    },
    details: {
      actionType: 'ROLE_PERMISSION_CHANGE',
      affectedResource: 'User Account #USR-902',
      status: 'Success',
      payloadJson: '{\n  "target_user": "USR-902",\n  "added_permissions": ["pediatric_module_access", "export_reports"]\n}',
    },
  },
  {
    id: 'LOG-2023-9006',
    timestamp: 'Oct 22, 2023 01:50:44 PM',
    user: {
      name: 'Marcus Holloway',
      role: 'Senior Therapist',
      avatarInitials: 'MH',
      avatarBg: 'bg-[#FEF3C7]',
      avatarTextColor: 'text-[#92400E]',
    },
    type: 'Clinical',
    description: 'Exported Patient Progress Report #REP-104',
    subtext: 'Downloaded PDF report for patient Sarah Jenkins.',
    source: {
      ip: '192.168.1.112',
      device: 'Windows • Chrome',
    },
    details: {
      actionType: 'REPORT_EXPORT',
      affectedResource: 'Patient Record #PAT-4402',
      status: 'Success',
      payloadJson: '{\n  "patient_name": "Sarah Jenkins",\n  "report_type": "PDF Progress Summary",\n  "hipaa_logged": true\n}',
    },
  },
  {
    id: 'LOG-2023-9007',
    timestamp: 'Oct 21, 2023 05:30:15 PM',
    user: {
      name: 'System Worker',
      role: 'Automated Service',
      avatarInitials: 'SW',
      avatarBg: 'bg-[#F3E8FF]',
      avatarTextColor: 'text-[#6B21A8]',
    },
    type: 'System',
    description: 'Automated Database Snapshot Completed',
    subtext: 'Nightly encrypted snapshot saved to AWS S3.',
    source: {
      ip: '10.0.4.12',
      device: 'Server • Cloud Worker',
    },
    details: {
      actionType: 'DB_BACKUP_COMPLETED',
      affectedResource: 'Database Core Instance',
      status: 'Success',
      payloadJson: '{\n  "backup_size": "14.2 GB",\n  "encryption": "AES-256",\n  "status": "COMPLETED_OK"\n}',
    },
  },
  {
    id: 'LOG-2023-9008',
    timestamp: 'Oct 21, 2023 02:11:09 PM',
    user: {
      name: 'Rahul Varma',
      role: 'Admin Staff',
      avatarInitials: 'RV',
      avatarBg: 'bg-[#E2E8F0]',
      avatarTextColor: 'text-[#334155]',
    },
    type: 'Financial',
    description: 'Generated Billing Statement Batch #BST-90',
    subtext: 'Processed 48 claim statements for BlueCross insurance.',
    source: {
      ip: '110.22.45.19',
      device: 'Windows • Edge',
    },
    details: {
      actionType: 'BATCH_BILLING',
      affectedResource: 'Claims Engine',
      status: 'Success',
      payloadJson: '{\n  "claims_count": 48,\n  "total_value": "$24,500.00",\n  "payer": "BlueCross"\n}',
    },
  },
];

export const AuditLogsTab: React.FC<AuditLogsTabProps> = ({ onShowToast }) => {
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [eventCategory, setEventCategory] = useState<string>('All Events');
  const [dateRange, setDateRange] = useState<string>('Last 7 days');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  // Selected Log Details Modal State
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return initialAuditLogs.filter((log) => {
      // Category Filter
      if (eventCategory !== 'All Events' && log.type.toLowerCase() !== eventCategory.toLowerCase()) {
        return false;
      }
      // Search Filter
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesUser = log.user.name.toLowerCase().includes(query) || log.user.role.toLowerCase().includes(query);
        const matchesDesc = log.description.toLowerCase().includes(query) || log.subtext.toLowerCase().includes(query);
        const matchesSource = log.source.ip.toLowerCase().includes(query) || log.source.device.toLowerCase().includes(query);
        const matchesType = log.type.toLowerCase().includes(query);
        if (!matchesUser && !matchesDesc && !matchesSource && !matchesType) {
          return false;
        }
      }
      return true;
    });
  }, [searchTerm, eventCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  
  // Current Page Data
  const currentLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  // Apply Filter Action
  const handleApplyFilters = () => {
    setCurrentPage(1);
    onShowToast(`Filters applied: ${eventCategory}, ${dateRange}${searchTerm ? `, "${searchTerm}"` : ''}`);
  };

  // Export CSV Functionality
  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'User', 'Role', 'Event Type', 'Description', 'Subtext', 'IP Address', 'Device'];
    const rows = filteredLogs.map((log) => [
      log.id,
      `"${log.timestamp}"`,
      `"${log.user.name}"`,
      `"${log.user.role}"`,
      `"${log.type}"`,
      `"${log.description}"`,
      `"${log.subtext}"`,
      `"${log.source.ip}"`,
      `"${log.source.device}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('Exported audit logs to CSV successfully!');
  };

  // Export PDF Functionality
  const handleExportPDF = () => {
    const content = `ONE MEDICAL DOWNTOWN CLINIC - AUDIT LOGS REPORT\nGenerated: ${new Date().toLocaleString()}\n\n` +
      filteredLogs.map(log => 
        `[${log.timestamp}] - ${log.user.name} (${log.user.role})\nType: ${log.type}\nAction: ${log.description}\nDetail: ${log.subtext}\nSource: ${log.source.ip} | ${log.source.device}\n----------------------------------------`
      ).join('\n\n');
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Audit_Logs_Report_${new Date().toISOString().slice(0, 10)}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('Exported audit logs report file successfully!');
  };

  // Badge Helper
  const getTypeBadge = (type: AuditLogEntry['type']) => {
    switch (type) {
      case 'Security':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#EBF3FF] text-[#2563EB] border border-[#BFDBFE]">
            Security
          </span>
        );
      case 'Clinical':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#E6F7F5] text-[#00A389] border border-[#A7F3D0]">
            Clinical
          </span>
        );
      case 'Financial':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
            Financial
          </span>
        );
      case 'System':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#F3E8FF] text-[#9333EA] border border-[#E9D5FF]">
            System
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. Header & Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Audit Logs</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Review all administrative and clinical activity across your clinic for compliance and security.
          </p>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleExportPDF}
            className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Filter Bar Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
          
          {/* Search logs (5 Cols) */}
          <div className="lg:col-span-5 space-y-1.5">
            <label className="block text-xs font-bold text-slate-600">Search logs</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                placeholder="Action, user, or IP..."
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A389]/40 focus:border-[#00A389] transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Event Category (3 Cols) */}
          <div className="lg:col-span-3 space-y-1.5">
            <label className="block text-xs font-bold text-slate-600">Event Category</label>
            <div className="relative">
              <select
                value={eventCategory}
                onChange={(e) => setEventCategory(e.target.value)}
                className="w-full appearance-none bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 pr-9 focus:outline-none focus:ring-2 focus:ring-[#00A389]/40 focus:border-[#00A389] cursor-pointer transition-colors"
              >
                <option value="All Events">All Events</option>
                <option value="Security">Security</option>
                <option value="Clinical">Clinical</option>
                <option value="Financial">Financial</option>
                <option value="System">System</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Date Range (2 Cols) */}
          <div className="lg:col-span-2 space-y-1.5">
            <label className="block text-xs font-bold text-slate-600">Date Range</label>
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full appearance-none bg-[#F8FAFC] border border-slate-200 rounded-xl pl-3.5 pr-8 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00A389]/40 focus:border-[#00A389] cursor-pointer transition-colors"
              >
                <option value="Last 7 days">Last 7 days</option>
                <option value="Today">Today</option>
                <option value="Last 30 days">Last 30 days</option>
                <option value="Last 90 days">Last 90 days</option>
                <option value="Custom Range">Custom Range</option>
              </select>
              <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Apply Filters Button (2 Cols) */}
          <div className="lg:col-span-2">
            <button
              onClick={handleApplyFilters}
              className="w-full px-4 py-2.5 bg-[#D0F2EC] hover:bg-[#BCEBE3] text-[#0F766E] font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <span>Apply Filters</span>
            </button>
          </div>

        </div>
      </div>

      {/* 3. Main Audit Logs Table Container Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="py-3.5 px-6 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  TIMESTAMP
                </th>
                <th className="py-3.5 px-6 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  USER
                </th>
                <th className="py-3.5 px-6 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  TYPE
                </th>
                <th className="py-3.5 px-6 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  DESCRIPTION
                </th>
                <th className="py-3.5 px-6 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  SOURCE
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {currentLogs.length > 0 ? (
                currentLogs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    {/* TIMESTAMP */}
                    <td className="py-4 px-6 align-top">
                      <span className="text-xs font-semibold text-slate-700 block leading-tight max-w-[110px]">
                        {log.timestamp}
                      </span>
                    </td>

                    {/* USER */}
                    <td className="py-4 px-6 align-top">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-9 h-9 rounded-full ${log.user.avatarBg} ${log.user.avatarTextColor} font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs`}
                        >
                          {log.user.avatarInitials}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#00A389] transition-colors">
                            {log.user.name}
                          </h4>
                          <span className="text-[11px] font-medium text-slate-500 block mt-0.5">
                            {log.user.role}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* TYPE */}
                    <td className="py-4 px-6 align-top">
                      {getTypeBadge(log.type)}
                    </td>

                    {/* DESCRIPTION */}
                    <td className="py-4 px-6 align-top max-w-sm">
                      <p className="text-xs font-bold text-slate-900 leading-snug">
                        {log.description}
                      </p>
                      <p className="text-[11px] italic font-medium text-slate-500 mt-1">
                        {log.subtext}
                      </p>
                    </td>

                    {/* SOURCE */}
                    <td className="py-4 px-6 align-top">
                      <span className="text-xs font-medium text-slate-700 block">
                        {log.source.ip}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500 block mt-0.5">
                        {log.source.device}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Info className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-sm font-semibold text-slate-600">No activity logs found</p>
                      <p className="text-xs text-slate-400">
                        Try adjusting your search criteria or category filter.
                      </p>
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setEventCategory('All Events');
                          setDateRange('Last 7 days');
                        }}
                        className="mt-2 px-3 py-1.5 text-xs font-bold text-[#00A389] hover:underline"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="p-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
          <div className="text-xs font-semibold text-slate-500">
            Showing <span className="font-bold text-slate-800">{currentLogs.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} - {Math.min(currentPage * pageSize, 1248)}</span> of <span className="font-bold text-slate-800">1,248</span> activities
          </div>

          <div className="flex items-center space-x-1.5 self-end sm:self-auto">
            {/* Prev Button */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page 1 */}
            <button
              onClick={() => setCurrentPage(1)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentPage === 1
                  ? 'bg-[#00A389] text-white shadow-2xs'
                  : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              1
            </button>

            {/* Page 2 */}
            <button
              onClick={() => setCurrentPage(2)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentPage === 2
                  ? 'bg-[#00A389] text-white shadow-2xs'
                  : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              2
            </button>

            {/* Page 3 */}
            <button
              onClick={() => setCurrentPage(3)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentPage === 3
                  ? 'bg-[#00A389] text-white shadow-2xs'
                  : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              3
            </button>

            {/* Ellipsis */}
            <span className="px-1 text-slate-400 font-bold text-xs">...</span>

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Bottom Metric Cards (3 Cards Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        
        {/* Card 1: Failed Logins */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center space-x-4 hover:shadow-sm transition-shadow">
          <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Failed Logins</h4>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              12
            </div>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">
              ↑ 4 from last 24h
            </p>
          </div>
        </div>

        {/* Card 2: Clinical Updates */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center space-x-4 hover:shadow-sm transition-shadow">
          <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-[#00A389] shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Clinical Updates</h4>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              342
            </div>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">
              Total clinical modifications
            </p>
          </div>
        </div>

        {/* Card 3: Policy Changes */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center space-x-4 hover:shadow-sm transition-shadow">
          <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Policy Changes</h4>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              3
            </div>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">
              Pending review by Lead
            </p>
          </div>
        </div>

      </div>

      {/* 5. Detailed Audit Log Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                  LOG
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Audit Log Details</h3>
                  <p className="text-xs text-slate-500">{selectedLog.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/50 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="p-6 space-y-5 text-xs">
              
              {/* Event Overview Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    EVENT TYPE
                  </span>
                  {getTypeBadge(selectedLog.type)}
                </div>
                <h4 className="text-sm font-bold text-slate-900">{selectedLog.description}</h4>
                <p className="text-slate-600 font-medium italic">{selectedLog.subtext}</p>
              </div>

              {/* Grid Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    USER NAME & ROLE
                  </span>
                  <p className="font-bold text-slate-900">{selectedLog.user.name}</p>
                  <p className="text-slate-500 font-medium">{selectedLog.user.role}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    TIMESTAMP
                  </span>
                  <p className="font-bold text-slate-900">{selectedLog.timestamp}</p>
                  <p className="text-slate-500 font-medium">UTC Offset: +05:30</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    SOURCE IP
                  </span>
                  <p className="font-bold text-slate-900">{selectedLog.source.ip}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    CLIENT DEVICE
                  </span>
                  <p className="font-bold text-slate-900">{selectedLog.source.device}</p>
                </div>
              </div>

              {/* Action JSON Payload */}
              {selectedLog.details?.payloadJson && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    EVENT AUDIT PAYLOAD (JSON)
                  </span>
                  <pre className="p-3.5 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto border border-slate-800 leading-relaxed">
                    {selectedLog.details.payloadJson}
                  </pre>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedLog.id);
                  onShowToast(`Copied log ID ${selectedLog.id} to clipboard!`);
                }}
                className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Log ID</span>
              </button>

              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
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

export default AuditLogsTab;
