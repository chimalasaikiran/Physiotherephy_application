import React from 'react';
import { Loader2 } from 'lucide-react';
import type { DashboardMetricsSummary } from '../useDashboardData';

import patientsIcon from '../../assets/Icon (3).svg';
import appointmentsIcon from '../../assets/Icon.svg';
import therapistsIcon from '../../assets/Icon (1).svg';
import revenueIcon from '../../assets/Icon (2).svg';

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
  const metrics = [
    {
      id: 'total-patients',
      title: 'Total Patients',
      value: isLoading ? '...' : (summaryMetrics ? summaryMetrics.totalPatients.toLocaleString('en-IN') : '0'),
      badgeText: summaryMetrics ? `${summaryMetrics.activePatients} Active` : '0 Active',
      icon: patientsIcon,
      accentBorder: 'border-[#003D9B]',
      iconBg: 'bg-[#003D9B]/10',
      badgeColor: 'text-[#00687B]',
      targetTab: 'patients',
    },
    {
      id: 'todays-appointments',
      title: "Today's Appointments",
      value: isLoading ? '...' : (summaryMetrics ? (summaryMetrics.todaysAppointmentsCount ?? summaryMetrics.scheduledAppointments).toString() : '0'),
      badgeText: summaryMetrics ? `${summaryMetrics.completedAppointments} Completed` : '0 Done',
      icon: appointmentsIcon,
      accentBorder: 'border-[#00687B]',
      iconBg: 'bg-[#00687B]/10',
      badgeColor: 'text-[#00687B]',
      targetTab: 'schedule',
    },
    {
      id: 'active-therapists',
      title: 'Active Therapists',
      value: isLoading ? '...' : (summaryMetrics ? summaryMetrics.activeTherapists.toString() : '0'),
      badgeText: summaryMetrics ? `of ${summaryMetrics.totalTherapists} Total` : '0 Total',
      icon: therapistsIcon,
      accentBorder: 'border-[#432F9C]',
      iconBg: 'bg-[#432F9C]/10',
      badgeColor: 'text-[#432F9C]',
      targetTab: 'therapists',
    },
    {
      id: 'monthly-revenue',
      title: 'Total Payments & Revenue',
      value: isLoading
        ? '...'
        : summaryMetrics
        ? summaryMetrics.totalRevenue >= 100000
          ? `₹${(summaryMetrics.totalRevenue / 100000).toFixed(1)}L`
          : `₹${summaryMetrics.totalRevenue.toLocaleString('en-IN')}`
        : '₹0',
      badgeText: summaryMetrics && summaryMetrics.pendingPaymentsTotal > 0 ? `₹${summaryMetrics.pendingPaymentsTotal.toLocaleString('en-IN')} Due` : 'Live Total',
      icon: revenueIcon,
      accentBorder: 'border-[#0052CC]',
      iconBg: 'bg-[#0052CC]/10',
      badgeColor: 'text-[#0052CC]',
      targetTab: 'payments',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
      {metrics.map((card) => (
        <div
          key={card.id}
          onClick={() => onNavigateToTab && onNavigateToTab(card.targetTab)}
          className={`self-stretch h-48 p-8 bg-white/70 rounded-[32px] shadow-[0px_8px_32px_0px_rgba(0,61,155,0.05)] border-l-4 ${card.accentBorder} backdrop-blur-[10px] flex flex-col justify-start items-start gap-1 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}
        >
          {/* Top header row with icon and percentage badge */}
          <div className="self-stretch inline-flex justify-between items-start">
            <div className={`w-9 h-10 ${card.iconBg} rounded-[32px] flex justify-center items-center`}>
              <img src={card.icon} alt={card.title} className="w-5 h-5 object-contain" />
            </div>
            <div className="flex justify-start items-center">
              <div className={`justify-center ${card.badgeColor} text-sm font-bold font-['Inter'] leading-5`}>
                {card.badgeText}
              </div>
            </div>
          </div>

          {/* Metric Title */}
          <div className="self-stretch pt-3 flex flex-col justify-start items-start">
            <div className="self-stretch justify-center text-gray-700 text-sm font-medium font-['Inter'] leading-5">
              {card.title}
            </div>
          </div>

          {/* Metric Value */}
          <div className="self-stretch flex flex-col justify-start items-start">
            <div className="self-stretch justify-center text-slate-900 text-2xl font-bold font-['Inter'] leading-8 flex items-center gap-2">
              <span>{card.value}</span>
              {isLoading && <Loader2 className="w-4 h-4 animate-spin text-slate-400 inline" />}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};


