import React from 'react';
import { Sparkles } from 'lucide-react';
import { mockClinicalInsights } from '../mockData';

export const AiClinicalInsightsWidget: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-[#EBF3FE] via-[#E8EFFF] to-[#E3EBFC] rounded-3xl p-6 border border-blue-100/60 shadow-xs space-y-5">
      {/* Header with Sparkles */}
      <div className="flex items-center space-x-2 text-blue-700">
        <Sparkles className="w-5 h-5 fill-blue-600/20 stroke-blue-700" />
        <h3 className="text-sm font-extrabold tracking-tight">AI Clinical Insights</h3>
      </div>

      {/* Insight Cards */}
      <div className="space-y-4">
        {mockClinicalInsights.map((insight) => (
          <div
            key={insight.id}
            className="bg-white/90 backdrop-blur-xs rounded-2xl p-4 border border-white/80 shadow-2xs space-y-1.5 transition-all hover:bg-white hover:shadow-xs"
          >
            <h4 className="text-xs font-extrabold text-slate-900 leading-snug">
              {insight.title}
            </h4>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {insight.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
