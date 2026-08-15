import React from 'react';
import {
  TrendingUp,
  AlertCircle,
  Calendar,
  RotateCcw,
  CalendarDays,
} from 'lucide-react';
import { METRIC_CARDS_DATA } from '../mockData';
import type { MetricCardData } from '../types';

interface PaymentsMetricsProps {
  metrics?: MetricCardData[];
}

export const PaymentsMetrics: React.FC<PaymentsMetricsProps> = ({ metrics }) => {
  const cardsToDisplay = metrics && metrics.length > 0 ? metrics : METRIC_CARDS_DATA;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cardsToDisplay.map((card: MetricCardData, index: number) => {
        const isHighlighted = card.isHighlighted;

        return (
          <div
            key={index}
            className={`relative bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-200 flex flex-col justify-between ${
              isHighlighted
                ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md shadow-blue-500/5'
                : 'border-slate-100 shadow-xs hover:shadow-md hover:border-slate-200'
            }`}
          >
            {/* Top row with title & badges or icons */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    {card.title}
                  </span>
                  {card.badge && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide uppercase bg-rose-100 text-rose-600">
                      {card.badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Top right icon */}
              <div>
                {card.iconType === 'trend' && (
                  <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                )}
                {card.iconType === 'today' && (
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    <Calendar className="w-4 h-4" />
                  </div>
                )}
                {card.iconType === 'refunds' && (
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                )}
                {card.iconType === 'payouts' && (
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                )}
                {card.iconType === 'attention' && (
                  <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>

            {/* Main Metric Value */}
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {card.value}
              </div>

              {/* Subtext or secondary status badge */}
              <div className="mt-1 flex items-center text-xs font-medium text-slate-500">
                {card.badgeType === 'success' && (
                  <span className="inline-flex items-center text-cyan-600 font-semibold bg-cyan-50 px-2 py-0.5 rounded-md text-[11px]">
                    <TrendingUp className="w-3 h-3 mr-1 inline" />
                    {card.subtext}
                  </span>
                )}
                {card.iconType === 'payouts' ? (
                  <span className="text-blue-600 font-bold">
                    {card.subtext}
                  </span>
                ) : (
                  card.badgeType !== 'success' && <span>{card.subtext}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

