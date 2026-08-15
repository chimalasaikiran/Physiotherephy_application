import React from 'react';
import { Users, Calendar, UserCheck, Banknote, TrendingUp, Loader2 } from 'lucide-react';
import type { DashboardMetricsSummary } from '../useDashboardData';

interface MetricCardsProps {
  summaryMetrics?: DashboardMetricsSummary;
  isLoading?: boolean;
  onNavigateToTab?: (tab: string) => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  summaryMetrics,
  isLoading = false,
  onNavigateToTab,
}) => {
  const totalTherapists = summaryMetrics?.totalTherapists ?? 0;
  const activeTherapists = summaryMetrics?.activeTherapists ?? 0;

  const totalPatients = summaryMetrics?.totalPatients ?? 0;
  const activePatients = summaryMetrics?.activePatients ?? 0;

  const totalAppointments = summaryMetrics?.totalAppointments ?? 0;
  const completedAppointments = summaryMetrics?.completedAppointments ?? 0;
  const scheduledAppointments = summaryMetrics?.scheduledAppointments ?? 0;

  const totalRevenue = summaryMetrics?.totalRevenue ?? 0;
  const paidPaymentsTotal = summaryMetrics?.paidPaymentsTotal ?? 0;
  const pendingPaymentsTotal = summaryMetrics?.pendingPaymentsTotal ?? 0;

  const metrics = [
    {
      id: 'total-therapists',
      title: 'Total Therapists',
      value: isLoading ? '...' : totalTherapists.toString(),
      subValue: `${activeTherapists} Active Specialists`,
      badgeText: 'Live Sync',
      badgeType: 'positive',
      icon: UserCheck,
      iconBg: 'bg-[#0F4C81]/10 text-[#0F4C81]',
      accentBorder: 'before:bg-[#0F4C81]',
      targetTab: 'therapists',
    },
    {
      id: 'total-patients',
      title: 'Total Patients',
      value: isLoading ? '...' : totalPatients.toLocaleString('en-IN'),
      subValue: `${activePatients} Active Treatment`,
      badgeText: 'Live Sync',
      badgeType: 'positive',
      icon: Users,
      iconBg: 'bg-blue-50 text-blue-600',
      accentBorder: 'before:bg-blue-600',
      targetTab: 'patients',
    },
    {
      id: 'total-appointments',
      title: 'Total Appointments',
      value: isLoading ? '...' : totalAppointments.toString(),
      subValue: `${completedAppointments} Completed • ${scheduledAppointments} Pending`,
      badgeText: 'Live Sync',
      badgeType: 'positive',
      icon: Calendar,
      iconBg: 'bg-teal-50 text-teal-600',
      accentBorder: 'before:bg-teal-500',
      targetTab: 'schedule',
    },
    {
      id: 'total-revenue',
      title: 'Total Revenue',
      value: isLoading ? '...' : `₹${totalRevenue.toLocaleString('en-IN')}`,
      subValue: `Paid: ₹${paidPaymentsTotal.toLocaleString('en-IN')} • Due: ₹${pendingPaymentsTotal.toLocaleString('en-IN')}`,
      badgeText: 'Live Sync',
      badgeType: 'positive',
      icon: Banknote,
      iconBg: 'bg-indigo-50 text-indigo-600',
      accentBorder: 'before:bg-indigo-600',
      targetTab: 'payments',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {metrics.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={() => onNavigateToTab && onNavigateToTab(card.targetTab)}
            className={`relative bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer group before:absolute before:left-0 before:top-3 before:bottom-3 before:w-1 before:rounded-r-md ${card.accentBorder}`}
          >
            {/* Top row with icon and percentage badge */}
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${card.iconBg} shadow-2xs group-hover:scale-105 transition-transform`}>
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>

              {card.badgeType === 'positive' ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold text-teal-700 bg-teal-50 border border-teal-100/50">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {card.badgeText}
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-100/50">
                  {card.badgeText}
                </span>
              )}
            </div>

            {/* Bottom details */}
            <div>
              <p className="text-xs font-semibold text-slate-400 tracking-wide">
                {card.title}
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight flex items-center space-x-2">
                <span>{card.value}</span>
                {isLoading && <Loader2 className="w-4 h-4 animate-spin text-slate-400 inline" />}
              </h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                {card.subValue}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
