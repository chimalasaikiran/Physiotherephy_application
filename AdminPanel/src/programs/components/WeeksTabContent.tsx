import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Plus,
  PlusCircle,
  Calendar,
  Dumbbell,
  Brain,
  ShieldCheck,
  Check,
  X,
  FileText,
  Sparkles,
  Info,
  HelpCircle,
  Edit2,
  Trash2,
  AlertTriangle
} from 'lucide-react';

import { 
  addWeekToProgram, 
  addExerciseToWeek, 
  updateWeekInProgram, 
  deleteWeekFromProgram, 
  updateExerciseInWeek, 
  deleteExerciseFromWeek, 
  subscribeToProgramWeeks, 
  type WeekData, 
  type ExerciseData 
} from '@/services/programService';

import { INITIAL_EXERCISES } from '@/exercises/mockData';

interface WeeksTabContentProps {
  onShowToast: (message: string) => void;
  programId?: string;
}

export const WeeksTabContent: React.FC<WeeksTabContentProps> = ({ onShowToast, programId }) => {
  const [expandedPhaseId, setExpandedPhaseId] = useState<string | null>(null);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phases, setPhases] = useState<WeekData[]>([]);

  useEffect(() => {
    if (!programId) return;
    setIsLoading(true);
    const unsubscribe = subscribeToProgramWeeks(
      programId,
      (data) => {
        setPhases(data);
        if (data.length > 0 && !expandedPhaseId) {
          setExpandedPhaseId(data[0].id || null);
        }
        setIsLoading(false);
      },
      (err) => {
        console.error('Error fetching weeks:', err);
        onShowToast('Failed to load weeks.');
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [programId]);

  const togglePhase = (id: string | undefined) => {
    if (!id) return;
    setExpandedPhaseId((prev) => (prev === id ? null : id));
  };

  // Add Week
  const [isAddWeekModalOpen, setIsAddWeekModalOpen] = useState(false);
  const [newWeekTitle, setNewWeekTitle] = useState('');
  const [newWeekDescription, setNewWeekDescription] = useState('');
  const [newWeekSessions, setNewWeekSessions] = useState('3 per week');
  const [newWeekFocus, setNewWeekFocus] = useState('');

  const handleAddWeekSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programId || !newWeekTitle.trim()) return;
    setIsSubmitting(true);
    try {
      const order = phases.length + 1;
      await addWeekToProgram(programId, {
        title: newWeekTitle,
        description: newWeekDescription,
        sessionsPerWeek: newWeekSessions,
        clinicalFocus: newWeekFocus,
        order
      });
      setIsAddWeekModalOpen(false);
      setNewWeekTitle('');
      setNewWeekDescription('');
      setNewWeekFocus('');
      onShowToast(`Added new week: ${newWeekTitle}`);
    } catch (err) {
      onShowToast('Failed to add week.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit Week
  const [isEditWeekModalOpen, setIsEditWeekModalOpen] = useState(false);
  const [editWeekId, setEditWeekId] = useState('');
  const [editWeekTitle, setEditWeekTitle] = useState('');
  const [editWeekDescription, setEditWeekDescription] = useState('');
  const [editWeekSessions, setEditWeekSessions] = useState('');
  const [editWeekFocus, setEditWeekFocus] = useState('');

  const openEditWeek = (week: WeekData) => {
    setEditWeekId(week.id as string);
    setEditWeekTitle(week.title || '');
    setEditWeekDescription(week.description || '');
    setEditWeekSessions(week.sessionsPerWeek || '');
    setEditWeekFocus(week.clinicalFocus || '');
    setIsEditWeekModalOpen(true);
  };

  const handleEditWeekSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programId || !editWeekId) return;
    setIsSubmitting(true);
    try {
      await updateWeekInProgram(programId, editWeekId, {
        title: editWeekTitle,
        description: editWeekDescription,
        sessionsPerWeek: editWeekSessions,
        clinicalFocus: editWeekFocus
      });
      setIsEditWeekModalOpen(false);
      onShowToast('Week updated successfully');
    } catch (err) {
      onShowToast('Failed to update week');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Week
  const [isDeleteWeekModalOpen, setIsDeleteWeekModalOpen] = useState(false);
  const [deleteWeekId, setDeleteWeekId] = useState('');

  const handleDeleteWeekConfirm = async () => {
    if (!programId || !deleteWeekId) return;
    setIsSubmitting(true);
    try {
      await deleteWeekFromProgram(programId, deleteWeekId);
      setIsDeleteWeekModalOpen(false);
      onShowToast('Week deleted successfully');
    } catch (err) {
      onShowToast('Failed to delete week');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add Exercise
  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [newExerciseSetsReps, setNewExerciseSetsReps] = useState('3 sets × 10 reps');
  const [newExerciseRest, setNewExerciseRest] = useState('Rest: 30s');

  const handleAddExerciseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programId || !expandedPhaseId || !selectedExerciseId) return;
    setIsSubmitting(true);
    try {
      const activePhase = phases.find((p) => p.id === expandedPhaseId);
      const order = (activePhase?.exercises?.length || 0) + 1;
      
      const libraryExercise = INITIAL_EXERCISES.find(ex => ex.id === selectedExerciseId);
      if (!libraryExercise) return;

      await addExerciseToWeek(programId, expandedPhaseId, {
        name: libraryExercise.title,
        dosage: `${newExerciseSetsReps} • ${newExerciseRest}`,
        image: libraryExercise.coverImage,
        order
      });
      
      setSelectedExerciseId('');
      setNewExerciseSetsReps('3 sets × 10 reps');
      setNewExerciseRest('Rest: 30s');
      setIsAddExerciseModalOpen(false);
      onShowToast(`Added "${libraryExercise.title}"`);
    } catch (err) {
      onShowToast('Failed to add exercise.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit Exercise
  const [isEditExerciseModalOpen, setIsEditExerciseModalOpen] = useState(false);
  const [editExerciseId, setEditExerciseId] = useState('');
  const [editExerciseName, setEditExerciseName] = useState('');
  const [editExerciseDosage, setEditExerciseDosage] = useState('');

  const openEditExercise = (exercise: ExerciseData) => {
    setEditExerciseId(exercise.id as string);
    setEditExerciseName(exercise.name || '');
    setEditExerciseDosage(exercise.dosage || '');
    setIsEditExerciseModalOpen(true);
  };

  const handleEditExerciseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programId || !expandedPhaseId || !editExerciseId) return;
    setIsSubmitting(true);
    try {
      await updateExerciseInWeek(programId, expandedPhaseId, editExerciseId, {
        dosage: editExerciseDosage
      });
      setIsEditExerciseModalOpen(false);
      onShowToast('Exercise updated successfully');
    } catch (err) {
      onShowToast('Failed to update exercise');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Exercise
  const [isDeleteExerciseModalOpen, setIsDeleteExerciseModalOpen] = useState(false);
  const [deleteExerciseId, setDeleteExerciseId] = useState('');

  const handleDeleteExerciseConfirm = async () => {
    if (!programId || !expandedPhaseId || !deleteExerciseId) return;
    setIsSubmitting(true);
    try {
      await deleteExerciseFromWeek(programId, expandedPhaseId, deleteExerciseId);
      setIsDeleteExerciseModalOpen(false);
      onShowToast('Exercise deleted successfully');
    } catch (err) {
      onShowToast('Failed to delete exercise');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false);
  const [isProtocolsModalOpen, setIsProtocolsModalOpen] = useState(false);

  const programLoadData = [
    { week: 'W1', value: 20, color: 'from-emerald-300 to-teal-400' },
    { week: 'W2', value: 32, color: 'from-teal-400 to-teal-500' },
    { week: 'W3', value: 45, color: 'from-teal-500 to-cyan-500' },
    { week: 'W4', value: 60, color: 'from-cyan-500 to-sky-500' },
    { week: 'W5', value: 74, color: 'from-sky-500 to-blue-500' },
    { week: 'W6', value: 85, color: 'from-blue-500 to-blue-600' },
    { week: 'W7', value: 94, color: 'from-blue-600 to-indigo-600' },
    { week: 'W8', value: 100, color: 'from-indigo-600 to-blue-900' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start animate-in fade-in duration-300">
      <div className="lg:col-span-8 space-y-4">
        {isLoading && <p className="text-sm text-slate-500">Loading weeks...</p>}
        {phases.length === 0 && !isLoading && (
          <div className="p-8 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 border-dashed">
            No weeks added yet.
          </div>
        )}
        {phases.map((phase, index) => {
          const isExpanded = expandedPhaseId === phase.id;

          return (
            <div
              key={phase.id}
              className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden ${
                isExpanded
                  ? 'border-blue-200 shadow-md shadow-blue-500/5 ring-1 ring-blue-100'
                  : 'border-slate-200/80 shadow-xs hover:border-slate-300'
              }`}
            >
              <div
                onClick={() => togglePhase(phase.id)}
                className="p-5 sm:p-6 flex items-start sm:items-center justify-between cursor-pointer select-none group"
              >
                <div className="flex items-start sm:items-center space-x-4 pr-2">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0 transition-colors ${
                      isExpanded
                        ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/30'
                        : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                    }`}
                  >
                    {phase.order || (index + 1)}
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                      {phase.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 max-w-xl line-clamp-2 sm:line-clamp-1">
                      {phase.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0 ml-2">
                  {!isExpanded && (
                    <span className="hidden sm:inline-block px-2.5 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-lg uppercase tracking-wider">
                      {phase.exercises?.length || 0} EXERCISES
                    </span>
                  )}
                  <div className="p-1 rounded-full text-slate-400 group-hover:text-slate-700 transition-colors">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-blue-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="px-5 sm:px-6 pb-6 pt-2 space-y-6 border-t border-slate-100">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="flex items-center space-x-3 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100">
                      <div className="w-8 h-8 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                          Sessions
                        </span>
                        <span className="text-xs font-extrabold text-slate-900">
                          {phase.sessionsPerWeek}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100">
                      <div className="w-8 h-8 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0">
                        <Dumbbell className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                          Exercises
                        </span>
                        <span className="text-xs font-extrabold text-slate-900">
                          {phase.exercises?.length || 0} exercises
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100">
                      <div className="w-8 h-8 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0">
                        <Brain className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                          Clinical Focus
                        </span>
                        <span className="text-xs font-extrabold text-slate-900 truncate block max-w-[140px]">
                          {phase.clinicalFocus}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                        EXERCISE SEQUENCE
                      </span>
                      <button
                        onClick={() => setIsAddExerciseModalOpen(true)}
                        className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Exercise</span>
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {(phase.exercises || []).map((ex) => (
                        <div
                          key={ex.id}
                          className="group p-3.5 bg-white border border-slate-200/90 hover:border-blue-300 rounded-2xl flex items-center justify-between shadow-2xs hover:shadow-xs transition-all"
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            <div className="text-slate-300 group-hover:text-slate-400 cursor-grab active:cursor-grabbing p-1 shrink-0">
                              <GripVertical className="w-4 h-4" />
                            </div>

                            <img
                              src={ex.image}
                              alt={ex.name}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                            />

                            <div className="min-w-0">
                              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                                {ex.name}
                              </h4>
                              <p className="text-xs text-slate-500 font-medium mt-0.5">
                                {ex.dosage}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 shrink-0">
                            <button
                              onClick={() => openEditExercise(ex)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteExerciseId(ex.id as string);
                                setIsDeleteExerciseModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openEditWeek(phase)}
                        className="text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors text-left cursor-pointer py-1 flex items-center"
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit Week
                      </button>
                      <button
                        onClick={() => {
                          setDeleteWeekId(phase.id as string);
                          setIsDeleteWeekModalOpen(true);
                        }}
                        className="text-xs font-bold text-slate-600 hover:text-red-600 transition-colors text-left cursor-pointer py-1 flex items-center ml-4"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Week
                      </button>
                    </div>

                    <button
                      onClick={() => setIsAddSessionModalOpen(true)}
                      className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200/60 transition-colors cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4 text-blue-600" />
                      <span>Add Training Session</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <div className="flex justify-center pt-2">
          <button
            onClick={() => setIsAddWeekModalOpen(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-white border border-blue-200 hover:border-blue-400 text-blue-600 hover:text-blue-700 text-sm font-bold rounded-full shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Week</span>
          </button>
        </div>

        <div className="py-6 flex items-center justify-center space-x-4">
          <div className="h-px bg-slate-200 flex-1 max-w-[120px]" />
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 text-center">
            END OF PROGRAM WEEKS
          </span>
          <div className="h-px bg-slate-200 flex-1 max-w-[120px]" />
        </div>
      </div>

      <div className="lg:col-span-4 space-y-6 sm:space-y-8">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
            SELECTED WEEK INSIGHTS
          </span>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Weekly Progress Target</span>
              <span className="text-lg font-extrabold text-blue-600">100%</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full w-full" />
            </div>
          </div>

          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Most patients complete this week in 7.2 days on average. Success rate for neural desensitization targets is 84%.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
            CUMULATIVE PROGRAM LOAD
          </span>

          <div className="pt-4 pb-2 relative">
            <div className="h-40 flex items-end justify-between gap-1.5 sm:gap-2 px-1">
              {programLoadData.map((item, idx) => {
                const isHovered = hoveredBarIndex === idx;
                return (
                  <div
                    key={item.week}
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                    className="flex-1 flex flex-col items-center group relative cursor-pointer"
                  >
                    {isHovered && (
                      <div className="absolute -top-10 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg z-20 whitespace-nowrap animate-in fade-in duration-150">
                        {item.week}: {item.value}% Load
                      </div>
                    )}
                    <div
                      className={`w-full rounded-t-lg bg-gradient-to-t ${item.color} transition-all duration-300 group-hover:brightness-110`}
                      style={{ height: `${item.value}%` }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-400 uppercase tracking-wider pt-3 border-t border-slate-100">
              <span>WEEK 1</span>
              <span>WEEK 8</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50/60 rounded-3xl p-6 border border-blue-100 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-blue-900">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-900">
              PHASE I GUIDELINES
            </h4>
          </div>

          <ul className="space-y-3 text-xs text-slate-600 font-medium leading-relaxed">
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
              <span>Avoid end-range lumbar flexion during acute symptomatic presentation.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
              <span>Emphasize abdominal bracing without breath-holding (Valsalva).</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
              <span>Target VAS pain reduction of 30% before advancing to Week 3.</span>
            </li>
          </ul>

          <div className="pt-2">
            <button
              onClick={() => setIsProtocolsModalOpen(true)}
              className="text-xs font-extrabold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer inline-flex items-center space-x-1"
            >
              <span>View Full Clinical Protocols</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Exercise Modal */}
      {isAddExerciseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-5">
            <button
              onClick={() => setIsAddExerciseModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Add Prescribed Exercise</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Select from Exercise Library for Phase {expandedPhaseId || 1}
              </p>
            </div>

            <form onSubmit={handleAddExerciseSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Select Exercise
                </label>
                <select
                  required
                  value={selectedExerciseId}
                  onChange={(e) => setSelectedExerciseId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                >
                  <option value="">-- Select an Exercise --</option>
                  {INITIAL_EXERCISES.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">
                    Sets & Reps
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="3 sets × 10 reps"
                    value={newExerciseSetsReps}
                    onChange={(e) => setNewExerciseSetsReps(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">
                    Rest Duration
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Rest: 30s"
                    value={newExerciseRest}
                    onChange={(e) => setNewExerciseRest(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddExerciseModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  {isSubmitting ? 'Adding...' : 'Add Exercise'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Exercise Modal */}
      {isEditExerciseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-5">
            <button
              onClick={() => setIsEditExerciseModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Edit Exercise Dosage</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Update dosage for {editExerciseName}
              </p>
            </div>

            <form onSubmit={handleEditExerciseSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Dosage (Sets, Reps, Rest)
                </label>
                <input
                  type="text"
                  required
                  placeholder="3 sets × 10 reps • Rest: 30s"
                  value={editExerciseDosage}
                  onChange={(e) => setEditExerciseDosage(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditExerciseModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Exercise Modal */}
      {isDeleteExerciseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">Delete Exercise?</h3>
            <p className="text-sm text-slate-500">
              Are you sure you want to remove this exercise from the week? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center space-x-3 pt-4">
              <button
                onClick={() => setIsDeleteExerciseModalOpen(false)}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteExerciseConfirm}
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl cursor-pointer"
              >
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Week Modal */}
      {isAddWeekModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-5">
            <button
              onClick={() => setIsAddWeekModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Add New Week</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Define the phase goals and schedule.
              </p>
            </div>

            <form onSubmit={handleAddWeekSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Week Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Strength & Dynamic Control"
                  value={newWeekTitle}
                  onChange={(e) => setNewWeekTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Description
                </label>
                <textarea
                  required
                  placeholder="Brief description of this phase..."
                  value={newWeekDescription}
                  onChange={(e) => setNewWeekDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">
                    Sessions Per Week
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 3 per week"
                    value={newWeekSessions}
                    onChange={(e) => setNewWeekSessions(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">
                    Clinical Focus
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Core stabilizer"
                    value={newWeekFocus}
                    onChange={(e) => setNewWeekFocus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddWeekModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  {isSubmitting ? 'Adding...' : 'Add Week'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Week Modal */}
      {isEditWeekModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-5">
            <button
              onClick={() => setIsEditWeekModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Edit Week Configuration</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Update phase goals and schedule.
              </p>
            </div>

            <form onSubmit={handleEditWeekSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Week Title
                </label>
                <input
                  type="text"
                  required
                  value={editWeekTitle}
                  onChange={(e) => setEditWeekTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Description
                </label>
                <textarea
                  required
                  value={editWeekDescription}
                  onChange={(e) => setEditWeekDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">
                    Sessions Per Week
                  </label>
                  <input
                    type="text"
                    required
                    value={editWeekSessions}
                    onChange={(e) => setEditWeekSessions(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">
                    Clinical Focus
                  </label>
                  <input
                    type="text"
                    required
                    value={editWeekFocus}
                    onChange={(e) => setEditWeekFocus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditWeekModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Week Modal */}
      {isDeleteWeekModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">Delete Week?</h3>
            <p className="text-sm text-slate-500">
              Are you sure you want to delete this entire week and all its exercises? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center space-x-3 pt-4">
              <button
                onClick={() => setIsDeleteWeekModalOpen(false)}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteWeekConfirm}
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl cursor-pointer"
              >
                {isSubmitting ? 'Deleting...' : 'Delete Week'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Session Modal (Placeholder) */}
      {isAddSessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-5">
            <button
              onClick={() => setIsAddSessionModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Add Training Session</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Configure additional clinical session slot.
              </p>
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setIsAddSessionModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsAddSessionModalOpen(false);
                  onShowToast('Training session added!');
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Save Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Protocols Modal */}
      {isProtocolsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-5">
            <button
              onClick={() => setIsProtocolsModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Clinical Guidelines & Protocols</h3>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsProtocolsModalOpen(false)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeksTabContent;
