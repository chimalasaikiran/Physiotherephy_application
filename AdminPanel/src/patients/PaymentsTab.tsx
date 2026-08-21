import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  CheckCircle2,
  ShieldCheck,
  Filter,
  Download,
  FileText,
  CreditCard,
  Bell,
  ChevronRight,
  Plus,
  BarChart3,
  Calendar,
  Phone,
  Edit2,
  X,
  Printer,
  Check,
  Send,
  ArrowUpRight,
  Search,
} from 'lucide-react';
import type { Patient } from './types';
import type { PaymentRecord, InvoiceDocument } from '@/payments/types';
import { createInvoice, createPaymentRecord } from '@/services/paymentService';

interface PaymentsTabProps {
  patientName?: string;
  therapistName?: string;
  patient?: Patient;
  payments?: PaymentRecord[];
  invoices?: InvoiceDocument[];
}

export interface InvoiceItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Failed' | 'Refunded' | 'Partially Refunded';
  items?: { name: string; qty: number; rate: number; total: number }[];
  transactionId?: string;
  paymentMethod?: string;
}

export const PaymentsTab: React.FC<PaymentsTabProps> = ({
  patientName = 'Sanya Malhotra',
  therapistName = 'Dr. Ananya Iyer',
  patient,
  payments = [],
  invoices: firestoreInvoices = [],
}) => {
  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Derive live billing items from real-time Firestore payments and invoices
  const effectiveInvoices: InvoiceItem[] = useMemo(() => {
    const items: InvoiceItem[] = [];

    // Add Firestore invoices
    firestoreInvoices.forEach((inv) => {
      items.push({
        id: inv.invoiceNumber || inv.id,
        date: inv.issueDate || (inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Today'),
        description: inv.description || 'Physiotherapy Session',
        amount: Number(inv.totalAmount || inv.amount) || 0,
        status: (inv.status as any) || 'Pending',
        items: inv.lineItems?.map((li) => ({ name: li.description, qty: li.quantity, rate: li.unitPrice, total: li.total })) || undefined,
        paymentMethod: inv.paymentMethod || undefined,
      });
    });

    // Add Firestore payments that don't duplicate an invoice number
    const existingIds = new Set(items.map((i) => i.id));
    payments.forEach((pay) => {
      const invId = pay.invoiceNumber || pay.invoiceNo || pay.paymentId || pay.id;
      if (!existingIds.has(invId)) {
        items.push({
          id: invId,
          date: pay.paidAt ? new Date(pay.paidAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : (pay.createdAt ? new Date(pay.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Today'),
          description: pay.title || 'Physiotherapy Session',
          amount: Number(pay.numericAmount || pay.amount) || 0,
          status: (pay.paymentStatus as any) || (pay.status === 'PAID' ? 'Paid' : pay.status === 'REFUNDED' ? 'Refunded' : pay.status === 'PARTIALLY REFUNDED' ? 'Partially Refunded' : 'Pending'),
          transactionId: pay.transactionId,
          paymentMethod: pay.paymentMethod || pay.paymentMethodName,
        });
      }
    });

    return items;
  }, [firestoreInvoices, payments]);

  // Active Insurance Details State
  const [insuranceInfo, setInsuranceInfo] = useState({
    provider: 'HDFC ERGO Health',
    policyNumber: 'HEP-90123-2024-MH',
    coveragePercent: 80,
    validity: 'Jan 2025',
    helpline: '1800-22-4444',
  });

  // Saved Payment Methods
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 'pm-1', type: 'VISA', last4: '4421', expiry: '10/26', isDefault: true },
  ]);

  // Filter State
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Pending' | 'Overdue'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [isGenerateInvoiceModalOpen, setIsGenerateInvoiceModalOpen] = useState(false);
  const [isRecordPaymentModalOpen, setIsRecordPaymentModalOpen] = useState(false);
  const [isSendReminderModalOpen, setIsSendReminderModalOpen] = useState(false);
  const [isAddPaymentMethodModalOpen, setIsAddPaymentMethodModalOpen] = useState(false);
  const [isUpdateInsuranceModalOpen, setIsUpdateInsuranceModalOpen] = useState(false);
  const [isFullHistoryModalOpen, setIsFullHistoryModalOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  // Generate Invoice Form state
  const [genDescription, setGenDescription] = useState('Physiotherapy Session');
  const [genAmount, setGenAmount] = useState('4000');
  const [genDueDate, setGenDueDate] = useState('2024-11-15');
  const [genSendEmail, setGenSendEmail] = useState(true);

  // Record Payment Form state
  const [recInvoiceId, setRecInvoiceId] = useState('#INV-8854');
  const [recPaymentMethod, setRecPaymentMethod] = useState('UPI / GPay');
  const [recAmount, setRecAmount] = useState('4000');

  // Send Reminder Form state
  const [remInvoiceId, setRemInvoiceId] = useState('#INV-8601');
  const [remChannel, setRemChannel] = useState<'SMS' | 'Email' | 'WhatsApp'>('WhatsApp');
  const [remNote, setRemNote] = useState(
    'Friendly reminder: Invoice #INV-8601 for ₹4,000 was due on Sep 21. Kindly arrange payment.'
  );

  // Add Payment Method Form state
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [newCardHolder, setNewCardHolder] = useState(patientName);

  // Filtered invoices logic
  const filteredInvoices = effectiveInvoices.filter((inv) => {
    const matchesFilter = statusFilter === 'All' || inv.status === statusFilter;
    const matchesSearch =
      inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Calculate totals
  const totalBilledVal = effectiveInvoices.reduce((acc, curr) => acc + curr.amount, 0);
  const outstandingVal = effectiveInvoices
    .filter((inv) => inv.status === 'Pending' || inv.status === 'Overdue')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Handlers
  const handleGenerateInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(genAmount) || 4000;
    const newInvNum = `INV-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      if (patient?.id) {
        await createInvoice({
          invoiceNumber: newInvNum,
          patientId: patient.id,
          patientName,
          therapistId: '',
          therapistName,
          description: genDescription,
          lineItems: [
            {
              description: `${genDescription} for ${patientName}`,
              quantity: 1,
              unitPrice: amountVal,
              total: amountVal,
            },
          ],
          amount: amountVal,
          totalAmount: amountVal,
          currency: 'INR',
          status: 'Pending',
          issueDate: new Date().toISOString().split('T')[0],
          dueDate: genDueDate,
        });
      }
      setIsGenerateInvoiceModalOpen(false);
      showToast(`Invoice ${newInvNum} generated in Firestore & synced to Mobile App!`);
    } catch (err: any) {
      showToast(`Error generating invoice: ${err.message}`);
    }
  };

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(recAmount) || 4000;

    try {
      if (patient?.id) {
        await createPaymentRecord({
          patientId: patient.id,
          patientName,
          therapistName,
          amount: amountVal,
          paymentMethod: recPaymentMethod,
          invoiceNumber: recInvoiceId,
          description: `Payment recorded for ${recInvoiceId}`,
        });
      }
      setIsRecordPaymentModalOpen(false);
      showToast(`Payment of ₹${amountVal.toLocaleString('en-IN')} recorded in Firestore!`);
    } catch (err: any) {
      showToast(`Error recording payment: ${err.message}`);
    }
  };

  const handleSendReminderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendReminderModalOpen(false);
    showToast(`Payment reminder sent via ${remChannel} for ${remInvoiceId}!`);
  };

  const handleAddPaymentMethodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardNumber) return;
    const last4 = newCardNumber.slice(-4) || '8812';
    const newPm = {
      id: `pm-${Date.now()}`,
      type: 'Mastercard',
      last4,
      expiry: newCardExpiry || '12/28',
      isDefault: false,
    };
    setPaymentMethods((prev) => [...prev, newPm]);
    setIsAddPaymentMethodModalOpen(false);
    setNewCardNumber('');
    setNewCardExpiry('');
    showToast(`Added card ending in ${last4} to payment methods!`);
  };

  const handleUpdateInsuranceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdateInsuranceModalOpen(false);
    showToast('Insurance policy details updated successfully!');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center space-x-2.5 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================= 1. TOP SUMMARY METRIC CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Billed */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs flex flex-col justify-between space-y-4 hover:shadow-xs transition-shadow">
          <div>
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
              TOTAL BILLED
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              ₹{totalBilledVal.toLocaleString('en-IN')}
            </h2>
          </div>

          <div className="flex items-center space-x-1.5 text-xs font-extrabold text-blue-600 bg-blue-50/80 w-fit px-3 py-1.5 rounded-full border border-blue-100">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>8 sessions billed in 2024</span>
          </div>
        </div>

        {/* Card 2: Outstanding */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs flex flex-col justify-between space-y-4 hover:shadow-xs transition-shadow">
          <div>
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
              OUTSTANDING
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-rose-600 tracking-tight mt-1">
              ₹{outstandingVal.toLocaleString('en-IN')}
            </h2>
          </div>

          <div className="flex items-center space-x-1.5 text-xs font-bold text-rose-700 bg-rose-50/90 w-fit px-3 py-1.5 rounded-full border border-rose-100">
            <Clock className="w-3.5 h-3.5 text-rose-600" />
            <span>Next payment due in 3 days</span>
          </div>
        </div>

        {/* Card 3: Insurance Status */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs flex flex-col justify-between space-y-4 hover:shadow-xs transition-shadow">
          <div>
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
              INSURANCE STATUS
            </span>
            <div className="flex items-center space-x-2 mt-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Verified
              </h2>
              <CheckCircle2 className="w-6 h-6 text-teal-600 fill-teal-50" />
            </div>
          </div>

          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 bg-slate-50 w-fit px-3 py-1.5 rounded-full border border-slate-200/60">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>{insuranceInfo.provider}</span>
          </div>
        </div>
      </div>

      {/* ================= 2. MAIN CONTENT GRID (2 COLUMNS) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ================= LEFT COLUMN (~65% on Desktop) ================= */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          {/* A. BILLING HISTORY CARD */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-2xs space-y-5">
            {/* Card Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Billing History
              </h3>

              <div className="flex items-center space-x-2.5">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search invoices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-36 sm:w-44"
                  />
                </div>

                {/* Filter Menu Toggle Button */}
                <div className="relative">
                  <button
                    onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                    className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                      statusFilter !== 'All'
                        ? 'bg-blue-50 border-blue-200 text-blue-600'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-700'
                    }`}
                    title="Filter Invoices"
                  >
                    <Filter className="w-4 h-4" />
                  </button>

                  {/* Dropdown Filter */}
                  {isFilterMenuOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-20 animate-in fade-in duration-150">
                      <div className="px-3 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                        Filter Status
                      </div>
                      {(['All', 'Paid', 'Pending', 'Overdue'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => {
                            setStatusFilter(st);
                            setIsFilterMenuOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-xs font-bold transition-colors flex items-center justify-between cursor-pointer ${
                            statusFilter === st
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span>{st}</span>
                          {statusFilter === st && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Export Invoices CSV Button */}
                <button
                  onClick={() => showToast('Exporting billing history report to CSV...')}
                  className="p-2 bg-slate-50 hover:bg-slate-100/90 border border-slate-200 text-slate-500 hover:text-slate-700 rounded-xl transition-colors cursor-pointer"
                  title="Download Statements"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Invoices Table */}
            <div className="overflow-x-auto -mx-6 sm:mx-0">
              <table className="w-full text-left border-collapse min-w-[620px]">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50/60">
                    <th className="py-3 px-4 rounded-l-xl">INVOICE ID</th>
                    <th className="py-3 px-4">DATE</th>
                    <th className="py-3 px-4">DESCRIPTION</th>
                    <th className="py-3 px-4">AMOUNT</th>
                    <th className="py-3 px-4">STATUS</th>
                    <th className="py-3 px-4 text-right rounded-r-xl">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80 text-xs sm:text-sm">
                  {filteredInvoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                      onClick={() => setSelectedInvoice(invoice)}
                    >
                      {/* Invoice ID */}
                      <td className="py-4 px-4 font-bold text-blue-600 group-hover:underline">
                        {invoice.id}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 font-medium text-slate-500 whitespace-nowrap">
                        {invoice.date}
                      </td>

                      {/* Description */}
                      <td className="py-4 px-4 font-semibold text-slate-800">
                        {invoice.description}
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-4 font-extrabold text-slate-900 whitespace-nowrap">
                        ₹{invoice.amount.toLocaleString('en-IN')}
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                            invoice.status === 'Paid'
                              ? 'bg-teal-50 text-teal-700 border border-teal-100'
                              : invoice.status === 'Partially Refunded'
                              ? 'bg-amber-50 text-amber-700 border border-amber-100'
                              : invoice.status === 'Refunded'
                              ? 'bg-rose-50 text-rose-700 border border-rose-100'
                              : invoice.status === 'Pending'
                              ? 'bg-blue-50 text-blue-700 border border-blue-100'
                              : 'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}
                        >
                          {invoice.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInvoice(invoice);
                          }}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer hover:underline"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredInvoices.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-slate-400 font-semibold">
                        No billing records found matching parameters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* View Full Transaction History Link */}
            <div className="pt-2 text-center border-t border-slate-100/70">
              <button
                onClick={() => setIsFullHistoryModalOpen(true)}
                className="text-xs font-extrabold text-blue-600 hover:text-blue-700 inline-flex items-center space-x-1 cursor-pointer hover:underline"
              >
                <span>View Full Transaction History</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* B. ACTIVE INSURANCE CARD */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-2xs space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Active Insurance
              </h3>
            </div>

            {/* Provider details grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Provider */}
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  PROVIDER
                </span>
                <div className="flex items-center space-x-2 pt-0.5">
                  <div className="w-5 h-5 rounded-md bg-rose-50 text-rose-600 font-extrabold text-[9px] flex items-center justify-center border border-rose-100">
                    H
                  </div>
                  <span className="text-sm font-extrabold text-slate-900">
                    {insuranceInfo.provider}
                  </span>
                </div>
              </div>

              {/* Policy Number */}
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  POLICY NUMBER
                </span>
                <span className="text-sm font-extrabold text-slate-900 block pt-0.5 font-mono">
                  {insuranceInfo.policyNumber}
                </span>
              </div>

              {/* Coverage */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  COVERAGE
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-extrabold text-teal-600 whitespace-nowrap">
                    {insuranceInfo.coveragePercent}% Reimbursable
                  </span>
                </div>
                {/* Coverage progress bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-teal-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${insuranceInfo.coveragePercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Card Footer info bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-semibold text-slate-500">
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Valid till {insuranceInfo.validity}</span>
                </span>

                <span className="flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{insuranceInfo.helpline}</span>
                </span>
              </div>

              <button
                onClick={() => setIsUpdateInsuranceModalOpen(true)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1 cursor-pointer self-start sm:self-auto hover:underline"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Update Details</span>
              </button>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN / SIDEBAR (~35% on Desktop) ================= */}
        <div className="space-y-6 sm:space-y-8">
          {/* 1. QUICK ACTIONS CARD */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-4">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
              QUICK ACTIONS
            </span>

            <div className="space-y-3">
              {/* Button 1: Dark Navy Generate Invoice */}
              <button
                onClick={() => setIsGenerateInvoiceModalOpen(true)}
                className="w-full flex items-center justify-between p-4 bg-[#0C3E6D] hover:bg-[#092e52] text-white rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold">Generate Invoice</span>
                </div>
                <ChevronRight className="w-4 h-4 text-white/70 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Button 2: Dark Teal Record Payment */}
              <button
                onClick={() => setIsRecordPaymentModalOpen(true)}
                className="w-full flex items-center justify-between p-4 bg-[#0D7A73] hover:bg-[#095f59] text-white rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold">Record Payment</span>
                </div>
                <ChevronRight className="w-4 h-4 text-white/70 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Button 3: Soft Purple/Blue Send Reminder */}
              <button
                onClick={() => setIsSendReminderModalOpen(true)}
                className="w-full flex items-center justify-between p-4 bg-[#E8EDFA] hover:bg-[#d8e3f8] text-[#1E3A8A] rounded-2xl transition-colors cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-[#1E3A8A]">
                    <Bell className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold">Send Reminder</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#1E3A8A]/70 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* 2. PAYMENT METHODS CARD */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-4">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
              Payment Methods
            </span>

            <div className="space-y-3">
              {/* Payment Method Saved Row */}
              {paymentMethods.map((pm) => (
                <div
                  key={pm.id}
                  className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    {/* VISA Badge */}
                    <div className="px-2.5 py-1 bg-slate-900 text-white rounded-md text-[10px] font-black tracking-widest uppercase">
                      {pm.type}
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900 block">
                        •••• {pm.last4}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400 block">
                        Expires {pm.expiry}
                      </span>
                    </div>
                  </div>

                  {pm.isDefault && (
                    <CheckCircle2 className="w-5 h-5 text-teal-600 fill-teal-50 flex-shrink-0" />
                  )}
                </div>
              ))}

              {/* Add New Method Button */}
              <button
                onClick={() => setIsAddPaymentMethodModalOpen(true)}
                className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200 border-dashed rounded-2xl text-xs sm:text-sm font-bold text-slate-700 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-slate-500" />
                <span>Add new method</span>
              </button>
            </div>
          </div>

          {/* 3. BILLING FORECAST CARD */}
          <div className="border-2 border-dashed border-indigo-100 bg-indigo-50/30 rounded-3xl p-6 text-center space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
              <BarChart3 className="w-5 h-5" />
            </div>

            <div>
              <h4 className="text-sm font-extrabold text-slate-900">Billing Forecast</h4>
              <p className="text-xs font-semibold text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
                Estimated bill for next 4 sessions is approx. ₹16,000
              </p>
            </div>

            <button
              onClick={() => showToast('Downloading 4-session billing forecast PDF projection...')}
              className="text-xs font-extrabold text-blue-600 hover:text-blue-700 inline-flex items-center space-x-1 cursor-pointer pt-1 hover:underline"
            >
              <span>Download Projection</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= MODALS & DIALOGS ================= */}

      {/* 1. VIEW INVOICE MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                    Invoice {selectedInvoice.id}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500">
                    Issued on {selectedInvoice.date} • {patientName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    STATUS
                  </span>
                  <span
                    className={`inline-block mt-0.5 px-3 py-0.5 rounded-full text-xs font-extrabold ${
                      selectedInvoice.status === 'Paid'
                        ? 'bg-teal-50 text-teal-700'
                        : selectedInvoice.status === 'Pending'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {selectedInvoice.status}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    TOTAL DUE
                  </span>
                  <span className="text-lg font-extrabold text-slate-900 block mt-0.5">
                    ₹{selectedInvoice.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-2">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
                  Service Line Items
                </span>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                  {(selectedInvoice.items || [
                    { name: selectedInvoice.description, qty: 1, rate: selectedInvoice.amount, total: selectedInvoice.amount },
                  ]).map((item, idx) => (
                    <div key={idx} className="p-3.5 bg-white flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900 block">{item.name}</span>
                        <span className="text-slate-400 font-semibold">
                          Qty: {item.qty} × ₹{item.rate.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <span className="font-extrabold text-slate-900">
                        ₹{item.total.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Patient info */}
              <div className="p-4 border border-slate-100 rounded-2xl space-y-1 bg-slate-50/30 text-xs">
                <div className="flex justify-between text-slate-500 font-semibold">
                  <span>Patient:</span>
                  <span className="text-slate-900 font-bold">{patientName}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-semibold">
                  <span>Attending Clinician:</span>
                  <span className="text-slate-900 font-bold">{therapistName}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-semibold">
                  <span>Payment Terms:</span>
                  <span className="text-slate-900 font-bold">Net 15 Days</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/60">
              <button
                onClick={() => showToast(`Printing Invoice ${selectedInvoice.id}...`)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 flex items-center space-x-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    showToast(`Downloading PDF for ${selectedInvoice.id}...`);
                    setSelectedInvoice(null);
                  }}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 flex items-center space-x-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>

                {selectedInvoice.status !== 'Paid' && (
                  <button
                    onClick={() => {
                      selectedInvoice.status = 'Paid';
                      setSelectedInvoice(null);
                      showToast(`Marked ${selectedInvoice.id} as Paid!`);
                    }}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Mark Paid
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. GENERATE INVOICE MODAL */}
      {isGenerateInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Generate New Invoice</h3>
                <p className="text-xs text-slate-500 font-medium">For patient {patientName}</p>
              </div>
              <button
                onClick={() => setIsGenerateInvoiceModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateInvoiceSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Service Description
                </label>
                <select
                  value={genDescription}
                  onChange={(e) => setGenDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Physiotherapy Session">Physiotherapy Session (₹4,000)</option>
                  <option value="Initial Clinical Assessment">Initial Clinical Assessment (₹6,500)</option>
                  <option value="Custom Rehabilitation Package">Custom Rehabilitation Package (₹12,000)</option>
                  <option value="Therapeutic Equipment Consultation">Therapeutic Equipment Consultation (₹2,500)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={genAmount}
                  onChange={(e) => setGenAmount(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Due Date
                </label>
                <input
                  type="date"
                  value={genDueDate}
                  onChange={(e) => setGenDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={genSendEmail}
                  onChange={(e) => setGenSendEmail(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Email digital invoice copy to patient immediately</span>
              </label>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsGenerateInvoiceModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0C3E6D] hover:bg-[#092e52] text-white text-xs font-extrabold rounded-xl transition-colors cursor-pointer shadow-md"
                >
                  Create & Send Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. RECORD PAYMENT MODAL */}
      {isRecordPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Record Payment</h3>
                <p className="text-xs text-slate-500 font-medium">Log received funds for patient</p>
              </div>
              <button
                onClick={() => setIsRecordPaymentModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Select Pending / Overdue Invoice
                </label>
                <select
                  value={recInvoiceId}
                  onChange={(e) => setRecInvoiceId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {effectiveInvoices
                    .filter((inv) => inv.status !== 'Paid')
                    .map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.id} - {inv.description} (₹{inv.amount.toLocaleString('en-IN')}) [{inv.status}]
                      </option>
                    ))}
                  {effectiveInvoices.filter((inv) => inv.status !== 'Paid').length === 0 && (
                    <option value="">No pending invoices available</option>
                  )}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Payment Mode
                </label>
                <select
                  value={recPaymentMethod}
                  onChange={(e) => setRecPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="UPI / GPay">UPI / GPay / PhonePe</option>
                  <option value="Credit / Debit Card">Credit / Debit Card</option>
                  <option value="Direct Insurance Reimbursement">Direct Insurance Reimbursement</option>
                  <option value="Net Banking">Net Banking</option>
                  <option value="Cash">Cash Payment</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Amount Received (₹)
                </label>
                <input
                  type="number"
                  value={recAmount}
                  onChange={(e) => setRecAmount(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRecordPaymentModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0D7A73] hover:bg-[#095f59] text-white text-xs font-extrabold rounded-xl transition-colors cursor-pointer shadow-md"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. SEND REMINDER MODAL */}
      {isSendReminderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Send Payment Reminder</h3>
                <p className="text-xs text-slate-500 font-medium">Notify {patientName} regarding due balance</p>
              </div>
              <button
                onClick={() => setIsSendReminderModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendReminderSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Target Invoice
                </label>
                <select
                  value={remInvoiceId}
                  onChange={(e) => setRemInvoiceId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {effectiveInvoices
                    .filter((i) => i.status !== 'Paid')
                    .map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.id} - ₹{inv.amount.toLocaleString('en-IN')} [{inv.status}]
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Channel
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['WhatsApp', 'SMS', 'Email'] as const).map((ch) => (
                    <button
                      type="button"
                      key={ch}
                      onClick={() => setRemChannel(ch)}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition-colors ${
                        remChannel === ch
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Custom Reminder Message
                </label>
                <textarea
                  rows={3}
                  value={remNote}
                  onChange={(e) => setRemNote(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSendReminderModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#1E3A8A] hover:bg-[#152a65] text-white text-xs font-extrabold rounded-xl transition-colors cursor-pointer shadow-md flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Reminder</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. ADD PAYMENT METHOD MODAL */}
      {isAddPaymentMethodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Add Payment Method</h3>
                <p className="text-xs text-slate-500 font-medium">Save card or account for fast checkout</p>
              </div>
              <button
                onClick={() => setIsAddPaymentMethodModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPaymentMethodSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={newCardHolder}
                  onChange={(e) => setNewCardHolder(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="4532 •••• •••• 8812"
                  value={newCardNumber}
                  onChange={(e) => setNewCardNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Expiry (MM/YY)
                  </label>
                  <input
                    type="text"
                    placeholder="12/28"
                    value={newCardExpiry}
                    onChange={(e) => setNewCardExpiry(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    CVV Code
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="•••"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddPaymentMethodModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl transition-colors cursor-pointer shadow-md"
                >
                  Save Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. UPDATE INSURANCE MODAL */}
      {isUpdateInsuranceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Update Active Insurance</h3>
                <p className="text-xs text-slate-500 font-medium">Modify policy details for {patientName}</p>
              </div>
              <button
                onClick={() => setIsUpdateInsuranceModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateInsuranceSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Insurance Provider
                </label>
                <input
                  type="text"
                  value={insuranceInfo.provider}
                  onChange={(e) => setInsuranceInfo({ ...insuranceInfo, provider: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Policy Number
                </label>
                <input
                  type="text"
                  value={insuranceInfo.policyNumber}
                  onChange={(e) =>
                    setInsuranceInfo({ ...insuranceInfo, policyNumber: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Coverage %
                  </label>
                  <input
                    type="number"
                    value={insuranceInfo.coveragePercent}
                    onChange={(e) =>
                      setInsuranceInfo({
                        ...insuranceInfo,
                        coveragePercent: parseInt(e.target.value) || 80,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Validity Period
                  </label>
                  <input
                    type="text"
                    value={insuranceInfo.validity}
                    onChange={(e) => setInsuranceInfo({ ...insuranceInfo, validity: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUpdateInsuranceModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl transition-colors cursor-pointer shadow-md"
                >
                  Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. FULL TRANSACTION HISTORY MODAL */}
      {isFullHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Full Transaction History</h3>
                <p className="text-xs text-slate-500 font-medium">All financial transactions for {patientName}</p>
              </div>
              <button
                onClick={() => setIsFullHistoryModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[65vh] overflow-y-auto">
              <table className="w-full text-left border-collapse min-w-[550px]">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50/60">
                    <th className="py-3 px-4 rounded-l-xl">INVOICE ID</th>
                    <th className="py-3 px-4">DATE</th>
                    <th className="py-3 px-4">DESCRIPTION</th>
                    <th className="py-3 px-4">AMOUNT</th>
                    <th className="py-3 px-4 text-right rounded-r-xl">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {effectiveInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-blue-600">{inv.id}</td>
                      <td className="py-3.5 px-4 text-slate-500">{inv.date}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{inv.description}</td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">
                        ₹{inv.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            inv.status === 'Paid'
                              ? 'bg-teal-50 text-teal-700'
                              : inv.status === 'Pending'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/60">
              <span className="text-xs font-semibold text-slate-500">
                Total 6 ledger entries found
              </span>
              <button
                onClick={() => {
                  showToast('Exporting full financial ledger statements...');
                  setIsFullHistoryModalOpen(false);
                }}
                className="px-5 py-2.5 bg-[#0C3E6D] hover:bg-[#092e52] text-white text-xs font-extrabold rounded-xl transition-colors cursor-pointer shadow-md flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Full Ledger</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsTab;
