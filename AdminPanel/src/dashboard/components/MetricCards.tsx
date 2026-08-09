import React from 'react';
import { Users, Calendar, Stethoscope, Banknote, TrendingUp } from 'lucide-react';

export const MetricCards: React.FC = () => {
  const metrics = [
    {
      id: 'total-patients',
      title: 'Total Patients',
      value: '1,248',
      badgeText: '8.4%',
      badgeType: 'positive',
      icon: Users,
      iconBg: 'bg-blue-50 text-blue-600',
      accentBorder: 'before:bg-blue-600',
    },
    {
      id: 'todays-appointments',
      title: "Today's Appointments",
      value: '36',
      badgeText: '12%',
      badgeType: 'positive',
      icon: Calendar,
      iconBg: 'bg-teal-50 text-teal-600',
      accentBorder: 'before:bg-teal-500',
    },
    {
      id: 'active-therapists',
      title: 'Active Therapists',
      value: '24',
      badgeText: '+3 this week',
      badgeType: 'neutral',
      icon: Stethoscope,
      iconBg: 'bg-purple-50 text-purple-600',
      accentBorder: 'before:bg-purple-600',
    },
    {
      id: 'monthly-revenue',
      title: 'Monthly Revenue',
      value: '₹8.4L',
      badgeText: '18%',
      badgeType: 'positive',
      icon: Banknote,
      iconBg: 'bg-indigo-50 text-indigo-600',
      accentBorder: 'before:bg-indigo-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {metrics.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className={`relative bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden before:absolute before:left-0 before:top-3 before:bottom-3 before:w-1 before:rounded-r-md ${card.accentBorder}`}
          >
            {/* Top row with icon and percentage badge */}
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${card.iconBg} shadow-2xs`}>
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
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
                {card.value}
              </h3>
            </div>
          </div>
        );
      })}
    </div>
  );
};
