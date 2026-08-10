import React from 'react';
import { Heart, Clock, MoreVertical, Layers, Sparkles } from 'lucide-react';
import type { Exercise } from '../types';

interface ExerciseCardProps {
  exercise: Exercise;
  onToggleFavorite: (id: string) => void;
  onSelect: (exercise: Exercise) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  onToggleFavorite,
  onSelect,
}) => {
  const getDifficultyBadgeStyle = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-blue-600 text-white font-bold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full shadow-xs';
      case 'medium':
        return 'bg-cyan-500 text-white font-bold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full shadow-xs';
      case 'hard':
        return 'bg-rose-500 text-white font-bold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full shadow-xs';
      default:
        return 'bg-slate-600 text-white font-bold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full shadow-xs';
    }
  };

  return (
    <div
      onClick={() => onSelect(exercise)}
      className="group bg-white rounded-2xl border border-slate-100 p-3.5 sm:p-4 hover:shadow-xl hover:shadow-slate-200/50 hover:border-blue-100 transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Card Media Container */}
        <div className="relative aspect-16/10 w-full overflow-hidden rounded-xl bg-slate-100 mb-4">
          <img
            src={exercise.coverImage}
            alt={exercise.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-black/20" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className={getDifficultyBadgeStyle(exercise.difficulty)}>
              {exercise.difficulty}
            </span>
            <span className="bg-slate-900/60 backdrop-blur-md text-white font-bold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full">
              {exercise.bodyArea}
            </span>
          </div>

          {/* Duration Badge */}
          <div className="absolute bottom-3 right-3 bg-slate-900/70 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-slate-200" />
            <span>{exercise.durationMinutes} mins</span>
          </div>
        </div>

        {/* Card Header & Title */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-1">
            {exercise.title}
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(exercise.id);
            }}
            className="p-1 text-slate-400 hover:text-rose-500 transition-colors focus:outline-hidden"
            aria-label="Toggle Favorite"
          >
            <Heart
              className={`w-5 h-5 transition-transform active:scale-125 ${
                exercise.isFavorite
                  ? 'fill-rose-500 text-rose-500'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            />
          </button>
        </div>

        {/* Specs Metadata */}
        <div className="flex items-center text-xs text-slate-500 font-medium space-x-2 mb-4">
          <div className="flex items-center space-x-1.5 bg-slate-50 px-2 py-1 rounded-md text-slate-600">
            <Sparkles className="w-3.5 h-3.5 text-slate-400" />
            <span>{exercise.equipment}</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center space-x-1 text-slate-600">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>Used in {exercise.usedInProgramsCount} Programs</span>
          </div>
        </div>
      </div>

      {/* Card Footer: Users & Menu */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <div className="flex -space-x-2 overflow-hidden">
            {exercise.assignedUsers.map((user) => (
              <div
                key={user.id}
                title={user.name}
                className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold ring-2 ring-white"
              >
                {user.initials}
              </div>
            ))}
          </div>
          {exercise.extraUsersCount && exercise.extraUsersCount > 0 && (
            <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold text-[11px]">
              +{exercise.extraUsersCount}
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(exercise);
          }}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
          aria-label="Options"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
