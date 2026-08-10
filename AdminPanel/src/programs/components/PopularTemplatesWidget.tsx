import React from 'react';
import { TrendingUp } from 'lucide-react';
import type { PopularTemplateItem } from '../types';

interface PopularTemplatesWidgetProps {
  templates: PopularTemplateItem[];
  onSelectTemplate: (template: PopularTemplateItem) => void;
}

export const PopularTemplatesWidget: React.FC<PopularTemplatesWidgetProps> = ({
  templates,
  onSelectTemplate,
}) => {
  return (
    <div className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100/60 space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900/60">
        POPULAR TEMPLATES
      </h3>

      <div className="space-y-3">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            onClick={() => onSelectTemplate(tpl)}
            className="bg-white rounded-2xl p-4 border border-blue-100/80 shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer flex items-center justify-between group"
          >
            <div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {tpl.title}
              </h4>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Used in {tpl.usageCount} programs
              </p>
            </div>

            <TrendingUp className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
          </div>
        ))}
      </div>
    </div>
  );
};
