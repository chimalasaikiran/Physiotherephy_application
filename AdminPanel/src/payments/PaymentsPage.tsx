import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Calendar,
  Filter,
  CreditCard,
  User,
  ChevronDown,
  Receipt,
} from 'lucide-react';
import { PaymentsMetrics } from './components/PaymentsMetrics';
import { RevenueTrendChart } from './components/RevenueTrendChart';
import { OutstandingPaymentsCard } from './components/OutstandingPaymentsCard';
import { MethodDistributionCard } from './components/MethodDistributionCard';
import { UpcomingTherapistPayoutsCard } from './components/UpcomingTherapistPayoutsCard';
import { QuickActionsCard } from './components/QuickActionsCard';
import { RecentActivityCard } from './components/RecentActivityCard';
import { InvoicesTabView } from './components/InvoicesTabView';
import { TransactionsTabView } from './components/TransactionsTabView';
import { PackagesTabView } from './components/PackagesTabView';
import { RefundsTabView } from './components/RefundsTabView';
import { PayoutsTabView } from './components/PayoutsTabView';
import { CreateInvoiceModal } from './components/CreateInvoiceModal';
import { RecordPaymentModal } from './components/RecordPaymentModal';
import { ExportFinancialsModal } from './components/ExportFinancialsModal';

import { CreateInvoicePage } from './CreateInvoicePage';
import { CreateTreatmentPackagePage } from './CreateTreatmentPackagePage';

import {
  subscribeToPayments,
  subscribeToInvoices,
  subscribeToTransactions,
  subscribeToPackages,
  subscribeToRefunds,
  subscribeToPayouts,
  calculateDashboardMetrics,
  buildMetricCards,
  toOutstandingItems,
  toMethodDistribution,
  toRevenueTrend,
  toRecentActivity,
  toTransactionItems,
  applyFiltersToPayments,
  exportPaymentsToCSV,
  reconcileAccounts,
} from '@/services/paymentService';
import { seedDemoPaymentData } from './mockData';
import { subscribeToTherapists } from '@/services/therapistService';
import type { Therapist } from '@/therapists/types';
import type {
  PaymentRecord,
  InvoiceDocument,
  TransactionRecord,
  PackageDocument,
  RefundDocument,
  PayoutDocument,
} from './types';

type SubTab = 'Overview' | 'Invoices' | 'Transactions' | 'Packages' | 'Refunds' | 'Payouts';

interface PaymentsPageProps {
  onNavigateToCreateInvoice?: () => void;
  onNavigateToCreatePackage?: () => void;
  onNavigateToPatientProfile?: (patientId: string) => void;
}

export const PaymentsPage: React.FC<PaymentsPageProps> = ({
  onNavigateToCreateInvoice,
  onNavigateToCreatePackage,
  onNavigateToPatientProfile,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('Overview');
  const [isLocalCreateInvoiceOpen, setIsLocalCreateInvoiceOpen] = useState(false);
  const [isLocalCreatePackageOpen, setIsLocalCreatePackageOpen] = useState(false);

  // Firestore real-time state
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [invoices, setInvoices] = useState<InvoiceDocument[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [packages, setPackages] = useState<PackageDocument[]>([]);
  const [refunds, setRefunds] = useState<RefundDocument[]>([]);
  const [payouts, setPayouts] = useState<PayoutDocument[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);

  // Filter dropdown states
  const [timeframe, setTimeframe] = useState('Last 30 Days');
  const [statusFilter, setStatusFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('Any');
  const [therapistFilter, setTherapistFilter] = useState('All');

  // Modal states
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [isExportFinancialsOpen, setIsExportFinancialsOpen] = useState(false);

  // 1. Seed demo data on initial mount if empty
  useEffect(() => {
    seedDemoPaymentData();
  }, []);

  // 2. Subscribe to real-time Firestore feeds
  useEffect(() => {
    const unsubPayments = subscribeToPayments((data) => setPayments(data));
    const unsubInvoices = subscribeToInvoices((data) => setInvoices(data));
    const unsubTransactions = subscribeToTransactions((data) => setTransactions(data));
    const unsubPackages = subscribeToPackages((data) => setPackages(data));
    const unsubRefunds = subscribeToRefunds((data) => setRefunds(data));
    const unsubPayouts = subscribeToPayouts((data) => setPayouts(data));
    const unsubTherapists = subscribeToTherapists((data) => setTherapists(data));

    return () => {
      unsubPayments();
      unsubInvoices();
      unsubTransactions();
      unsubPackages();
      unsubRefunds();
      unsubPayouts();
      unsubTherapists();
    };
  }, []);

  // Filtered payments list
  const filteredPayments = useMemo(() => {
    return applyFiltersToPayments(payments, {
      timeframe,
      status: statusFilter,
      method: methodFilter,
      therapist: therapistFilter,
    });
  }, [payments, timeframe, statusFilter, methodFilter, therapistFilter]);

  // Dashboard metrics computed from live data
  const dashboardMetrics = useMemo(() => {
    return calculateDashboardMetrics(filteredPayments, invoices, refunds, payouts, {
      timeframe,
      status: statusFilter,
      method: methodFilter,
      therapist: therapistFilter,
    });
  }, [filteredPayments, invoices, refunds, payouts, timeframe, statusFilter, methodFilter, therapistFilter]);

  const metricCards = useMemo(() => buildMetricCards(dashboardMetrics), [dashboardMetrics]);
  const outstandingItems = useMemo(() => toOutstandingItems(invoices), [invoices]);
  const methodDistribution = useMemo(() => toMethodDistribution(filteredPayments), [filteredPayments]);
  const revenueTrend = useMemo(() => toRevenueTrend(filteredPayments, payouts, timeframe), [filteredPayments, payouts, timeframe]);
  const recentActivities = useMemo(() => toRecentActivity(payments, refunds, payouts), [payments, refunds, payouts]);

  const combinedTransactions = useMemo(() => {
    const items = toTransactionItems(transactions, payments);
    return items.map((t) => ({
      id: t.id,
      transactionId: t.transactionId,
      type: (t.type || 'Payment') as any,
      patientId: '',
      patientName: t.patientName || 'Patient',
      therapistId: '',
      therapistName: '',
      appointmentId: '',
      invoiceId: '',
      invoiceNumber: '',
      paymentId: '',
      amount: Number(t.amount || 0),
      currency: 'INR',
      method: t.method || 'UPI',
      status: (((t.status as string) === 'Paid' || (t.status as string) === 'PAID' || t.status === 'Completed') ? 'Completed' : t.status || 'Completed') as any,
      description: '',
      timestamp: t.timestamp,
      createdAt: t.timestamp,
    }));
  }, [transactions, payments]);

  const handleCreateInvoiceClick = () => {
    if (onNavigateToCreateInvoice) {
      onNavigateToCreateInvoice();
    } else {
      setIsLocalCreateInvoiceOpen(true);
    }
  };

  const handleCreatePackageClick = () => {
    if (onNavigateToCreatePackage) {
      onNavigateToCreatePackage();
    } else {
      setIsLocalCreatePackageOpen(true);
    }
  };

  const handleQuickDownloadCSV = () => {
    exportPaymentsToCSV(payments, transactions);
  };

  const handleQuickReconcile = () => {
    const res = reconcileAccounts(payments, invoices);
    alert(
      `Reconciliation Summary:\n\n` +
      `✓ Matched Records: ${res.matchedCount}\n` +
      `⚠ Unmatched Payments: ${res.unmatchedPayments.length}\n` +
      `⚠ Unmatched Invoices: ${res.unmatchedInvoices.length}\n` +
      `Total Payments Volume: ₹${res.totalPayments.toLocaleString('en-IN')}\n` +
      `Total Invoices Volume: ₹${res.totalInvoices.toLocaleString('en-IN')}`
    );
  };

  if (isLocalCreateInvoiceOpen) {
    return (
      <CreateInvoicePage
        onBack={() => setIsLocalCreateInvoiceOpen(false)}
        onSuccess={() => setIsLocalCreateInvoiceOpen(false)}
        onNavigateToPatientProfile={onNavigateToPatientProfile}
      />
    );
  }

  if (isLocalCreatePackageOpen) {
    return (
      <CreateTreatmentPackagePage
        onBack={() => setIsLocalCreatePackageOpen(false)}
        onSuccess={() => setIsLocalCreatePackageOpen(false)}
      />
    );
  }

  const subTabs: SubTab[] = [
    'Overview',
    'Invoices',
    'Transactions',
    'Packages',
    'Refunds',
    'Payouts',
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Payments
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Track clinic revenue, invoices and financial transactions in real-time.
          </p>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsRecordPaymentOpen(true)}
            className="px-4 py-2.5 bg-blue-50/80 hover:bg-blue-100 text-blue-700 text-xs sm:text-sm font-bold rounded-xl transition-colors cursor-pointer inline-flex items-center shadow-2xs"
          >
            <Receipt className="w-4 h-4 mr-1.5" />
            Record Payment
          </button>

          <button
            onClick={handleCreatePackageClick}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors cursor-pointer inline-flex items-center shadow-md shadow-blue-600/15"
          >
            <Plus className="w-4 h-4 mr-1 stroke-[3]" />
            Create Package
          </button>

          <button
            onClick={handleCreateInvoiceClick}
            className="px-4 py-2.5 bg-blue-900 hover:bg-blue-950 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors cursor-pointer inline-flex items-center shadow-md shadow-blue-900/10"
          >
            <Plus className="w-4 h-4 mr-1" />
            Create Invoice
          </button>
        </div>
      </div>

      {/* KPI Metrics Row (5 Cards) */}
      <PaymentsMetrics metrics={metricCards} />

      {/* Sub-Navigation Tabs Bar */}
      <div className="border-b border-slate-200/80 pt-2">
        <div className="flex items-center space-x-6 sm:space-x-8 overflow-x-auto no-scrollbar">
          {subTabs.map((tab) => {
            const isActive = activeSubTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`pb-3 text-sm font-bold transition-all relative whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'text-blue-600'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Toolbar Controls */}
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 py-1">
        {/* Timeframe Filter */}
        <div className="relative">
          <div className="flex items-center space-x-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-2xs text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="appearance-none bg-transparent pr-5 font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
              <option>This Quarter</option>
              <option>This Year</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <div className="flex items-center space-x-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-2xs text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
            <Filter className="w-4 h-4 text-slate-400" />
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-transparent pr-5 font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
              <option value="Refunded">Refunded</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Method Filter */}
        <div className="relative">
          <div className="flex items-center space-x-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-2xs text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
            <CreditCard className="w-4 h-4 text-slate-400" />
            <span>Method:</span>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="appearance-none bg-transparent pr-5 font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="Any">Any</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Net Banking">Net Banking</option>
              <option value="Cash">Cash</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Therapist Filter */}
        <div className="relative">
          <div className="flex items-center space-x-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-2xs text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
            <User className="w-4 h-4 text-slate-400" />
            <span>Therapist:</span>
            <select
              value={therapistFilter}
              onChange={(e) => setTherapistFilter(e.target.value)}
              className="appearance-none bg-transparent pr-5 font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All Therapists</option>
              {therapists.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Tab Content Display Area */}
      {activeSubTab === 'Overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
          {/* Main Left Column (2 Spans) */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Revenue Trend Chart */}
            <RevenueTrendChart data={revenueTrend} />

            {/* Middle Row: Outstanding Payments & Method Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <OutstandingPaymentsCard
                items={outstandingItems}
                onViewAll={() => setActiveSubTab('Invoices')}
              />
              <MethodDistributionCard distribution={methodDistribution} />
            </div>

            {/* Upcoming Therapist Payouts */}
            <UpcomingTherapistPayoutsCard />
          </div>

          {/* Right Column (1 Span) */}
          <div className="space-y-6 sm:space-y-8">
            {/* Quick Actions Card */}
            <QuickActionsCard
              onCreateInvoice={handleCreateInvoiceClick}
              onExportFinancials={() => setIsExportFinancialsOpen(true)}
              onDownloadCSV={handleQuickDownloadCSV}
              onReconcileAccounts={handleQuickReconcile}
            />

            {/* Recent Activity Card */}
            <RecentActivityCard activities={recentActivities} />
          </div>
        </div>
      ) : activeSubTab === 'Invoices' ? (
        <InvoicesTabView
          onCreateInvoice={handleCreateInvoiceClick}
          invoices={invoices}
        />
      ) : activeSubTab === 'Transactions' ? (
        <TransactionsTabView transactions={combinedTransactions} />
      ) : activeSubTab === 'Packages' ? (
        <PackagesTabView
          onCreatePackage={handleCreatePackageClick}
          packages={packages}
        />
      ) : activeSubTab === 'Refunds' ? (
        <RefundsTabView refunds={refunds} />
      ) : (
        <PayoutsTabView payouts={payouts} />
      )}

      {/* Interactive Modals */}
      <CreateInvoiceModal
        isOpen={isCreateInvoiceOpen}
        onClose={() => setIsCreateInvoiceOpen(false)}
      />

      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        onClose={() => setIsRecordPaymentOpen(false)}
      />

      <ExportFinancialsModal
        isOpen={isExportFinancialsOpen}
        onClose={() => setIsExportFinancialsOpen(false)}
      />
    </div>
  );
};

