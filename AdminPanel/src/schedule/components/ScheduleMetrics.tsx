import React from 'react';
import type { AppointmentItem } from './AppointmentsTable';

interface ScheduleMetricsProps {
  appointments?: AppointmentItem[];
}

export const ScheduleMetrics: React.FC<ScheduleMetricsProps> = ({ appointments = [] }) => {
  const activeCount = appointments.filter((a) => a.status === 'Confirmed' || a.status === 'Scheduled').length;
  const completedCount = appointments.filter((a) => a.status === 'Completed').length;
  const expiredCount = appointments.filter((a) => (a.status as any) === 'Expired').length;
  const cancelledCount = appointments.filter((a) => a.status === 'Cancelled').length;

  // Calculate financial statistics dynamically from database records
  let totalRevenue = 0;
  let onlineRevenue = 0;
  let pendingCash = 0;
  let refundedAmount = 0;

  appointments.forEach((a) => {
    const amt = Number(a.amount || a.pricing?.totalAmount || 1500);
    const payStatus = (a.paymentStatus || 'Pending').toString().toUpperCase();
    const payMethod = (a.paymentMethod || (a.type === 'Online' ? 'ONLINE' : 'CASH')).toString().toUpperCase();

    if (payStatus === 'PAID') {
      totalRevenue += amt;
      if (payMethod === 'ONLINE') {
        onlineRevenue += amt;
      }
    } else if (payStatus === 'PENDING' && payMethod === 'CASH') {
      pendingCash += amt;
    } else if (payStatus === 'REFUNDED' || payStatus === 'REFUND_PENDING') {
      refundedAmount += amt;
    }
  });

  const metrics = [
    {
      id: 'active',
      label: 'UPCOMING SESSIONS',
      badgeText: String(activeCount),
      badgeType: 'positive',
      value: activeCount,
      description: 'Confirmed & scheduled sessions',
    },
    {
      id: 'completed',
      label: 'COMPLETED SESSIONS',
      badgeText: String(completedCount),
      badgeType: 'positive',
      value: completedCount,
      description: 'Successfully finished sessions',
    },
    {
      id: 'total_revenue',
      label: 'TOTAL REVENUE',
      badgeText: `₹${(totalRevenue / 1000).toFixed(1)}k`,
      badgeType: 'positive',
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      description: `Online: ₹${onlineRevenue.toLocaleString('en-IN')}`,
    },
    {
      id: 'pending_cash',
      label: 'PENDING CASH',
      badgeText: `₹${pendingCash}`,
      badgeType: pendingCash > 0 ? 'warning' : 'neutral',
      value: `₹${pendingCash.toLocaleString('en-IN')}`,
      description: 'Uncollected cash payments',
    },
    {
      id: 'cancelled',
      label: 'CANCELLED SESSIONS',
      badgeText: String(cancelledCount),
      badgeType: cancelledCount > 0 ? 'negative' : 'neutral',
      value: cancelledCount,
      description: 'Cancelled appointments',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {metrics.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs flex flex-col justify-between space-y-3 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 tracking-wider uppercase truncate">
              {item.label}
            </span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                item.badgeType === 'positive'
                  ? 'bg-sky-100 text-sky-700'
                  : item.badgeType === 'warning'
                  ? 'bg-amber-100 text-amber-800'
                  : item.badgeType === 'negative'
                  ? 'bg-rose-100 text-rose-600'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {item.badgeText}
            </span>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {item.value}
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium mt-1 truncate">
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
