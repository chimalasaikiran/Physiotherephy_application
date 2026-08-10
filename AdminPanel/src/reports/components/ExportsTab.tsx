import React, { useState, useMemo } from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileCode,
  Download,
  Search,
  Filter,
  Clock,
  HardDrive,
  FolderOutput,
  List,
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  Trash2,
  Share2,
  Eye,
  Check,
} from 'lucide-react';
import { mockDataArchiveItems } from '../mockData';
import type { DataArchiveItem } from '../types';

interface ExportsTabProps {
  showToast: (msg: string) => void;
}

export const ExportsTab: React.FC<ExportsTabProps> = ({ showToast }) => {
  const [archiveItems, setArchiveItems] = useState<DataArchiveItem[]>(mockDataArchiveItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Filtered Archive Items
  const filteredItems = useMemo(() => {
    return archiveItems.filter((item) => {
      const matchesSearch =
        item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.format.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.dateCreated.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFormat = selectedFormat === 'All' || item.format === selectedFormat;
      const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;

      return matchesSearch && matchesFormat && matchesStatus;
    });
  }, [archiveItems, searchQuery, selectedFormat, selectedStatus]);

  const handleDownload = (fileName: string) => {
    showToast(`Downloading file ${fileName}...`);
    setActiveMenuId(null);
  };

  const handleDelete = (id: string, fileName: string) => {
    setArchiveItems((prev) => prev.filter((item) => item.id !== id));
    showToast(`Removed "${fileName}" from archive`);
    setActiveMenuId(null);
  };

  const getFileIcon = (format: DataArchiveItem['format']) => {
    switch (format) {
      case 'PDF':
        return (
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
        );
      case 'EXCEL':
        return (
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
        );
      case 'CSV':
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FileCode className="w-5 h-5" />
          </div>
        );
    }
  };

  const getStatusBadge = (status: DataArchiveItem['status']) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100/80">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />
            Completed
          </span>
        );
      case 'Expiring Soon':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100/80">
            <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-500" />
            Expiring Soon
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100/80">
            <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin text-blue-500" />
            Processing
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100/80">
            <X className="w-3.5 h-3.5 mr-1 text-rose-500" />
            Failed
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 3 Top Stat Cards Grid (Matching Figma screenshot) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Card 1: Total Exports */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center space-x-4 hover:shadow-md transition-all">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FolderOutput className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
              Total Exports
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
              342
            </div>
          </div>
        </div>

        {/* Card 2: Storage Used */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center space-x-4 hover:shadow-md transition-all">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <List className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
              Storage Used
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
              8.4GB <span className="text-sm font-semibold text-slate-400">/ 10GB</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-[#0C3E6D] rounded-full transition-all duration-500"
                style={{ width: '84%' }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Scheduled Exports */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center space-x-4 hover:shadow-md transition-all">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
              Scheduled Exports
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
              12
            </div>
          </div>
        </div>
      </div>

      {/* Main Data Archive Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        {/* Data Archive Header Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
            Data Archive
          </h2>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files..."
                className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
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

            {/* Filter Button & Popup Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 flex items-center space-x-2 transition-all cursor-pointer shadow-2xs ${
                  selectedFormat !== 'All' || selectedStatus !== 'All'
                    ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                    : ''
                }`}
              >
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>Filter</span>
                {(selectedFormat !== 'All' || selectedStatus !== 'All') && (
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                )}
              </button>

              {/* Filter Popup Menu */}
              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-100 shadow-xl p-4 z-30 space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-900">Filter Files</span>
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      File Format
                    </label>
                    <select
                      value={selectedFormat}
                      onChange={(e) => setSelectedFormat(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="All">All Formats</option>
                      <option value="CSV">CSV</option>
                      <option value="PDF">PDF</option>
                      <option value="EXCEL">EXCEL</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Export Status
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Completed">Completed</option>
                      <option value="Expiring Soon">Expiring Soon</option>
                      <option value="Processing">Processing</option>
                    </select>
                  </div>

                  {(selectedFormat !== 'All' || selectedStatus !== 'All') && (
                    <button
                      onClick={() => {
                        setSelectedFormat('All');
                        setSelectedStatus('All');
                        setIsFilterOpen(false);
                      }}
                      className="w-full text-center text-xs font-semibold text-rose-600 hover:text-rose-700 py-1"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Data Archive Table View */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">File Name</th>
                <th className="py-3.5 px-6">Format</th>
                <th className="py-3.5 px-6">Size</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Date Created</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100/80">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* File Name */}
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3.5">
                        {getFileIcon(item.format)}
                        <span className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer">
                          {item.fileName}
                        </span>
                      </div>
                    </td>

                    {/* Format */}
                    <td className="py-4 px-6">
                      <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-extrabold tracking-wider uppercase bg-[#EEF2FF] text-[#4338CA] border border-indigo-100">
                        {item.format}
                      </span>
                    </td>

                    {/* Size */}
                    <td className="py-4 px-6">
                      <span className="text-xs font-semibold text-slate-600">
                        {item.size}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">{getStatusBadge(item.status)}</td>

                    {/* Date Created */}
                    <td className="py-4 px-6">
                      <span className="text-xs font-semibold text-slate-500">
                        {item.dateCreated}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="relative inline-flex items-center space-x-2">
                        <button
                          onClick={() => handleDownload(item.fileName)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                          title="Download File"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() =>
                            setActiveMenuId(activeMenuId === item.id ? null : item.id)
                          }
                          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Action Menu Dropdown */}
                        {activeMenuId === item.id && (
                          <div className="absolute right-0 top-10 w-44 bg-white rounded-2xl border border-slate-100 shadow-xl py-1.5 z-30 text-left animate-in fade-in zoom-in-95 duration-150">
                            <button
                              onClick={() => handleDownload(item.fileName)}
                              className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-2 cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5 text-slate-500" />
                              <span>Download</span>
                            </button>
                            <button
                              onClick={() => {
                                showToast(`Sharable link copied for ${item.fileName}`);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-2 cursor-pointer"
                            >
                              <Share2 className="w-3.5 h-3.5 text-slate-500" />
                              <span>Copy Link</span>
                            </button>
                            <div className="my-1 border-t border-slate-100" />
                            <button
                              onClick={() => handleDelete(item.id, item.fileName)}
                              className="w-full px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center space-x-2 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-medium">No export items found.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try adjusting your search query or filter.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExportsTab;
