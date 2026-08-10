import React, { useState } from 'react';
import { Search, Filter, Download, Plus, Eye, MoreVertical } from 'lucide-react';
import { MOCK_INVOICES } from '../mockData';
import type { InvoiceItem } from '../types';

interface InvoicesTabViewProps {
  onCreateInvoice: () => void;
}

export const InvoicesTabView: React.FC<InvoicesTabViewProps> = ({
  onCreateInvoice,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredInvoices = MOCK_INVOICES.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.therapistName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'All' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Clinic Invoices
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            Manage, generate and track patient billing statements.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={onCreateInvoice}
            className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Invoice
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-50">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Invoice #, Patient or Therapist..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 text-xs font-semibold text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              <th className="py-3 px-4">Invoice #</th>
              <th className="py-3 px-4">Patient Name</th>
              <th className="py-3 px-4">Therapist</th>
              <th className="py-3 px-4">Issue Date</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
            {filteredInvoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-4 font-bold text-blue-600">
                  {inv.invoiceNumber}
                </td>
                <td className="py-3.5 px-4 font-bold text-slate-900">
                  {inv.patientName}
                </td>
                <td className="py-3.5 px-4 text-slate-500">{inv.therapistName}</td>
                <td className="py-3.5 px-4 text-slate-400">{inv.issueDate}</td>
                <td className="py-3.5 px-4 text-slate-400">{inv.dueDate}</td>
                <td className="py-3.5 px-4 font-extrabold text-slate-900">
                  ₹{inv.amount.toLocaleString('en-IN')}
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      inv.status === 'Paid'
                        ? 'bg-emerald-50 text-emerald-600'
                        : inv.status === 'Overdue'
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}
                  >
                    {inv.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right space-x-2">
                  <button
                    title="View details"
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    title="Download PDF"
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
