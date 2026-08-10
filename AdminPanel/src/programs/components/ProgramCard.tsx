import React, { useState } from 'react';
import { MoreVertical, Copy, Share2, Archive, Trash2, Edit3, Eye } from 'lucide-react';
import type { Program } from '../types';

interface ProgramCardProps {
  program: Program;
  onViewDetails: (program: Program) => void;
  onQuickAction: (action: string, program: Program) => void;
}

export const ProgramCard: React.FC<ProgramCardProps> = ({
  program,
  onViewDetails,
  onQuickAction,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Beginner':
        return 'text-blue-600 font-semibold';
      case 'Intermediate':
        return 'text-teal-600 font-semibold';
      case 'Advanced':
        return 'text-amber-600 font-semibold';
      default:
        return 'text-slate-700 font-semibold';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden group">
      {/* Cover Image Header */}
      <div className="relative h-44 sm:h-48 w-full bg-slate-100 overflow-hidden">
        <img
          src={program.coverImage}
          alt={program.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            // Fallback gradient background if image fails
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        {/* Fallback pattern background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-slate-900/60 -z-10" />

        {/* Top Left Badge: Status */}
        <div className="absolute top-3 left-3">
          {program.status === 'published' ? (
            <span className="px-3 py-1 bg-blue-600 text-white text-[11px] font-bold tracking-wider uppercase rounded-md shadow-xs">
              PUBLISHED
            </span>
          ) : program.status === 'draft' ? (
            <span className="px-3 py-1 bg-slate-100/90 backdrop-blur-md text-slate-700 border border-slate-200/60 text-[11px] font-bold tracking-wider uppercase rounded-md shadow-xs">
              DRAFT
            </span>
          ) : (
            <span className="px-3 py-1 bg-amber-500 text-white text-[11px] font-bold tracking-wider uppercase rounded-md shadow-xs">
              ARCHIVED
            </span>
          )}
        </div>

        {/* Bottom Right Tag: Body Area */}
        <div className="absolute bottom-3 right-3">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-slate-800 text-xs font-semibold rounded-lg shadow-xs border border-white/40">
            {program.bodyAreaTag}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            {program.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {program.description}
          </p>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-4 pt-2">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              DURATION
            </span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block">
              {program.duration}
            </span>
          </div>

          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              DIFFICULTY
            </span>
            <span className={`text-sm mt-0.5 block ${getDifficultyColor(program.difficulty)}`}>
              {program.difficulty}
            </span>
          </div>

          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              PATIENTS
            </span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block">
              {typeof program.activePatients === 'number'
                ? `${program.activePatients} Active`
                : program.activePatients}
            </span>
          </div>

          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              COMPLETION
            </span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block">
              {program.completionRate}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between relative">
          <button
            onClick={() => onViewDetails(program)}
            className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            {program.status === 'draft' ? 'Continue Editing' : 'View Details'}
          </button>

          {/* Context Menu Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 bottom-8 z-30 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 text-xs font-semibold text-slate-700 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onViewDetails(program);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <span>View Details</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onQuickAction('duplicate', program);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Duplicate</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onQuickAction('share', program);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700"
                  >
                    <Share2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Share</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onQuickAction('archive', program);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700"
                  >
                    <Archive className="w-3.5 h-3.5 text-slate-400" />
                    <span>Archive</span>
                  </button>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onQuickAction('delete', program);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-rose-50 flex items-center gap-2.5 text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Delete</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
