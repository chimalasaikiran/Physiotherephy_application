import React, { useState } from 'react';
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

  // Filter dropdown states
  const [timeframe, setTimeframe] = useState('Last 30 Days');
  const [statusFilter, setStatusFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('Any');
  const [therapistFilter, setTherapistFilter] = useState('All');

  // Modal states
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [isExportFinancialsOpen, setIsExportFinancialsOpen] = useState(false);

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
            Track clinic revenue, invoices and financial transactions.
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
      <PaymentsMetrics />

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
              <option value="All">All</option>
              <option value="Dr. Ananya Ray">Dr. Ananya Ray</option>
              <option value="Dr. Vikram Seth">Dr. Vikram Seth</option>
              <option value="Meera Nair">Meera Nair</option>
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
            <RevenueTrendChart />

            {/* Middle Row: Outstanding Payments & Method Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <OutstandingPaymentsCard
                onViewAll={() => setActiveSubTab('Invoices')}
              />
              <MethodDistributionCard />
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
              onDownloadCSV={() => setIsExportFinancialsOpen(true)}
              onReconcileAccounts={() => setIsRecordPaymentOpen(true)}
            />

            {/* Recent Activity Card */}
            <RecentActivityCard />
          </div>
        </div>
      ) : activeSubTab === 'Invoices' ? (
        <InvoicesTabView onCreateInvoice={handleCreateInvoiceClick} />
      ) : activeSubTab === 'Transactions' ? (
        <TransactionsTabView />
      ) : activeSubTab === 'Packages' ? (
        <PackagesTabView onCreatePackage={handleCreatePackageClick} />
      ) : activeSubTab === 'Refunds' ? (
        <RefundsTabView />
      ) : (
        <PayoutsTabView />
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
