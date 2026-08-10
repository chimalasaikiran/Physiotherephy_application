import React from 'react';
import { Activity, Dumbbell, Scale } from 'lucide-react';
import type { ExerciseCategory } from '../types';

interface CategoriesWidgetProps {
  categories: ExerciseCategory[];
  activeCategory: string;
  onSelectCategory: (name: string) => void;
}

export const CategoriesWidget: React.FC<CategoriesWidgetProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
}) => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'Range of Motion':
        return <Activity className="w-4 h-4 text-blue-600" />;
      case 'Strengthening':
        return <Dumbbell className="w-4 h-4 text-blue-600" />;
      case 'Stability':
        return <Scale className="w-4 h-4 text-blue-600" />;
      default:
        return <Activity className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
      <h3 className="text-base font-bold text-slate-900 mb-4">Categories</h3>

      <div className="space-y-2">
        {categories.map((cat) => {
          const isSelected = activeCategory === cat.name;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(isSelected ? 'All' : cat.name)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left cursor-pointer ${
                isSelected
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'bg-slate-50/60 hover:bg-slate-100/80 text-slate-700 font-semibold'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="p-1.5 rounded-lg bg-white shadow-xs">
                  {getIcon(cat.name)}
                </div>
                <span className="text-sm">{cat.name}</span>
              </div>
              <span className="bg-white border border-slate-100 text-slate-600 text-xs font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
