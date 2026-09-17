import React, { useState } from 'react';
import { Search, Filter, Download, Plus, Eye, CheckCircle, Trash2 } from 'lucide-react';
import type { InvoiceDocument } from '../types';
import { markInvoiceAsPaid, deleteInvoice } from '@/services/paymentService';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InvoicesTabViewProps {
  onCreateInvoice: () => void;
  invoices?: InvoiceDocument[];
}

export const InvoicesTabView: React.FC<InvoicesTabViewProps> = ({
  onCreateInvoice,
  invoices = [],
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.therapistName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'All' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleMarkPaid = async (id: string) => {
    const isCash = window.confirm('Click OK to mark payment as Cash (Received at Clinic), or Cancel to mark as Online/UPI.');
    const method = isCash ? 'Cash' : 'UPI';
    setActionLoadingId(id);
    try {
      await markInvoiceAsPaid(id, method);
    } catch (err) {
      console.error('Error marking invoice paid:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    setActionLoadingId(id);
    try {
      await deleteInvoice(id);
    } catch (err) {
      console.error('Error deleting invoice:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleExportAll = () => {
    const rows = [
      ['Invoice #', 'Patient Name', 'Therapist', 'Issue Date', 'Due Date', 'Amount (INR)', 'Status']
    ];
    invoices.forEach((inv) => {
      rows.push([
        inv.invoiceNumber,
        inv.patientName,
        inv.therapistName || 'Unassigned',
        inv.issueDate,
        inv.dueDate || '--',
        String(inv.totalAmount || inv.amount),
        inv.status
      ]);
    });
    
    const csvContent = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `All_Invoices_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = (inv: InvoiceDocument) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('INVOICE', 14, 22);
    
    doc.setFontSize(10);
    doc.text(`Invoice Number: ${inv.invoiceNumber}`, 14, 30);
    doc.text(`Issue Date: ${inv.issueDate}`, 14, 35);
    if (inv.dueDate) doc.text(`Due Date: ${inv.dueDate}`, 14, 40);
    
    // Patient Info
    doc.setFontSize(12);
    doc.text('Bill To:', 14, 50);
    doc.setFontSize(10);
    doc.text(`Name: ${inv.patientName}`, 14, 55);
    if (inv.patientEmail) doc.text(`Email: ${inv.patientEmail}`, 14, 60);
    
    // Therapist
    doc.text(`Therapist: ${inv.therapistName || 'Unassigned'}`, 14, 70);
    
    // Amount & Status
    doc.text(`Status: ${inv.status}`, 14, 80);
    if (inv.paymentMethod) doc.text(`Payment Method: ${inv.paymentMethod}`, 14, 85);
    
    // Line Items Table
    const tableBody = [];
    if (inv.lineItems && inv.lineItems.length > 0) {
      inv.lineItems.forEach(item => {
        tableBody.push([
          item.description || 'Session',
          String(item.quantity || 1),
          (item.unitPrice || 0).toLocaleString('en-IN'),
          (item.total || 0).toLocaleString('en-IN')
        ]);
      });
    } else {
      tableBody.push([
        inv.description || 'Physiotherapy Session',
        '1',
        inv.amount.toLocaleString('en-IN'),
        inv.amount.toLocaleString('en-IN')
      ]);
    }
    
    const finalAmount = inv.totalAmount || inv.amount;

    autoTable(doc, {
      startY: 95,
      head: [['Description', 'Qty', 'Unit Price (INR)', 'Total (INR)']],
      body: tableBody,
      foot: [
        ['', '', 'Subtotal', inv.amount.toLocaleString('en-IN')],
        ['', '', 'Tax', (inv.taxAmount || 0).toLocaleString('en-IN')],
        ['', '', 'Discount', (inv.discountAmount || 0).toLocaleString('en-IN')],
        ['', '', 'Total', finalAmount.toLocaleString('en-IN')]
      ],
    });
    
    doc.save(`Invoice_${inv.invoiceNumber}.pdf`);
  };

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
            onClick={handleExportAll}
            className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export All
          </button>
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
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                  No invoices match your filters.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-blue-600">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {inv.patientName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{inv.therapistName || 'Unassigned'}</td>
                  <td className="py-3.5 px-4 text-slate-400">{inv.issueDate}</td>
                  <td className="py-3.5 px-4 text-slate-400">{inv.dueDate || '--'}</td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-900">
                    ₹{(inv.totalAmount || inv.amount).toLocaleString('en-IN')}
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
                  <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => handleDownloadPdf(inv)}
                      title="Download PDF"
                      className="p-1.5 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors cursor-pointer inline-flex items-center"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    {inv.status !== 'Paid' && (
                      <button
                        onClick={() => handleMarkPaid(inv.id)}
                        disabled={actionLoadingId === inv.id}
                        title="Mark as Paid"
                        className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer inline-flex items-center"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(inv.id)}
                      disabled={actionLoadingId === inv.id}
                      title="Delete Invoice"
                      className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer inline-flex items-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

