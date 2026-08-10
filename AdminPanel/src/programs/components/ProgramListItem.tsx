import React, { useState } from 'react';
import { MoreVertical, Copy, Share2, Archive, Trash2, Eye } from 'lucide-react';
import type { Program } from '../types';

interface ProgramListItemProps {
  program: Program;
  onViewDetails: (program: Program) => void;
  onQuickAction: (action: string, program: Program) => void;
}

export const ProgramListItem: React.FC<ProgramListItemProps> = ({
  program,
  onViewDetails,
  onQuickAction,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors group">
      {/* Thumbnail + Title */}
      <td className="py-3.5 px-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/60">
            <img
              src={program.coverImage}
              alt={program.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h4
              onClick={() => onViewDetails(program)}
              className="text-sm font-bold text-slate-900 group-hover:text-blue-600 cursor-pointer transition-colors"
            >
              {program.title}
            </h4>
            <p className="text-xs text-slate-500 max-w-xs truncate">{program.description}</p>
          </div>
        </div>
      </td>

      {/* Body Area */}
      <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">
        <span className="px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200/50">
          {program.bodyAreaTag}
        </span>
      </td>

      {/* Status */}
      <td className="py-3.5 px-4">
        {program.status === 'published' ? (
          <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
            Published
          </span>
        ) : program.status === 'draft' ? (
          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
            Draft
          </span>
        ) : (
          <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 text-xs font-bold rounded-full">
            Archived
          </span>
        )}
      </td>

      {/* Duration */}
      <td className="py-3.5 px-4 text-xs font-bold text-slate-900">{program.duration}</td>

      {/* Difficulty */}
      <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">{program.difficulty}</td>

      {/* Active Patients */}
      <td className="py-3.5 px-4 text-xs font-bold text-slate-900">
        {typeof program.activePatients === 'number'
          ? `${program.activePatients} Active`
          : program.activePatients}
      </td>

      {/* Completion */}
      <td className="py-3.5 px-4 text-xs font-bold text-slate-900">{program.completionRate}</td>

      {/* Actions */}
      <td className="py-3.5 px-4 text-right relative">
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => onViewDetails(program)}
            className="px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
          >
            {program.status === 'draft' ? 'Edit' : 'View'}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-8 z-30 w-40 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 text-xs font-semibold text-slate-700 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onQuickAction('duplicate', program);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Duplicate</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onQuickAction('share', program);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <Share2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Share</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onQuickAction('archive', program);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
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
                    className="w-full text-left px-4 py-2 hover:bg-rose-50 flex items-center gap-2 text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Delete</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
};
