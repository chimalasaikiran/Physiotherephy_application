import React from 'react';
import { Zap, PlusCircle, BarChart2 } from 'lucide-react';
import { mockRecommendations } from '../mockData';

export const RecommendationsWidget: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
      <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">
        Recommendations
      </h3>

      <div className="space-y-4">
        {mockRecommendations.map((rec) => {
          const IconComponent =
            rec.iconType === 'zap'
              ? Zap
              : rec.iconType === 'plus'
              ? PlusCircle
              : BarChart2;

          return (
            <div key={rec.id} className="flex items-start space-x-3.5 group cursor-pointer">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <IconComponent className="w-4 h-4 stroke-[2.2]" />
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed group-hover:text-slate-900 transition-colors">
                {rec.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
