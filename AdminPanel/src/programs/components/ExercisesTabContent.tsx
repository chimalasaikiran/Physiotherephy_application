import React, { useState } from 'react';
import {
  Search,
  Plus,
  Play,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Upload,
  Zap,
  X,
  Filter,
  Check,
  FileVideo,
  AlertTriangle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface ClinicalCue {
  type: 'do' | 'dont';
  text: string;
}

export interface ExerciseItem {
  id: string;
  title: string;
  category: 'MOBILITY' | 'STABILITY' | 'STRENGTHENING' | 'NEURAL';
  status: 'ACTIVE' | 'UNDER REVIEW' | 'DRAFT';
  shortDesc: string;
  description: string;
  duration: string;
  reps: string;
  type: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  image: string;
  videoUrl?: string;
  equipment: string[];
  clinicalCues: ClinicalCue[];
}

interface ExercisesTabContentProps {
  onShowToast: (message: string) => void;
}

export const ExercisesTabContent: React.FC<ExercisesTabContentProps> = ({ onShowToast }) => {
  // Sample Exercise Database matching Figma design (node 52-5275)
  const [exercises, setExercises] = useState<ExerciseItem[]>([
    {
      id: 'ex-pelvic-tilts',
      title: 'Pelvic Tilts',
      category: 'MOBILITY',
      status: 'ACTIVE',
      shortDesc: 'Core activation and lumbar release',
      description:
        'Flatten your lower back against the floor by contracting your abdominal muscles and gently tilting your pelvis upward. Promotes segmental control and releases lumbar tension.',
      duration: '3 mins',
      reps: '15 Reps',
      type: 'Mobility',
      difficulty: 'Beginner',
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80',
      equipment: ['Yoga Mat'],
      clinicalCues: [
        { type: 'do', text: 'Engage deep transverse abdominis' },
        { type: 'do', text: 'Maintain smooth diaphragmatic breathing' },
        { type: 'dont', text: 'Avoid lifting glutes excessively off mat' },
      ],
    },
    {
      id: 'ex-knee-to-chest',
      title: 'Knee- to- Chest',
      category: 'MOBILITY',
      status: 'ACTIVE',
      shortDesc: 'Lumbar flexion and glute stretch',
      description:
        'Gently stretch the lower back and gluteal muscles by bringing one or both knees to the chest. Promotes flexion and relieves neural tension.',
      duration: '2 mins',
      reps: 'Hold 30s',
      type: 'Mobility',
      difficulty: 'Beginner',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80',
      equipment: ['Yoga Mat', 'Small Pillow (Optional)'],
      clinicalCues: [
        { type: 'do', text: 'Keep upper body relaxed' },
        { type: 'do', text: 'Breathe deeply into the belly' },
        { type: 'dont', text: 'Avoid sharp pain; stay in comfort zone' },
      ],
    },
    {
      id: 'ex-cat-cow',
      title: 'Cat- Cow',
      category: 'MOBILITY',
      status: 'UNDER REVIEW',
      shortDesc: 'Spinal articulation and rhythm',
      description:
        'Alternating between arching and rounding the spine in a quadruped position to promote joint lubrication, spinal rhythm, and paraspinal relaxation.',
      duration: '5 mins',
      reps: '10 Reps',
      type: 'Mobility',
      difficulty: 'Intermediate',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
      equipment: ['Yoga Mat'],
      clinicalCues: [
        { type: 'do', text: 'Initiate motion from the pelvis' },
        { type: 'do', text: 'Coordinate movement with exhalation' },
        { type: 'dont', text: 'Avoid forcing hyperextension into pain' },
      ],
    },
    {
      id: 'ex-bird-dog',
      title: 'Bird- Dog',
      category: 'STABILITY',
      status: 'ACTIVE',
      shortDesc: 'Core and posterior chain stability',
      description:
        'Extend opposite arm and leg simultaneously while maintaining a stable neutral spine, targeting multi-planar lumbar stability and glute activation.',
      duration: '4 mins',
      reps: '12 Reps',
      type: 'Stability',
      difficulty: 'Intermediate',
      image: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=600&q=80',
      equipment: ['Yoga Mat'],
      clinicalCues: [
        { type: 'do', text: 'Maintain hips parallel to the floor' },
        { type: 'do', text: 'Keep neck aligned with spine' },
        { type: 'dont', text: 'Avoid lumbar sagging during extension' },
      ],
    },
  ]);

  // Currently inspected exercise (default to Knee- to- Chest as in Figma)
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('ex-knee-to-chest');

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');

  // Video Playing Preview State
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isReplaceVideoModalOpen, setIsReplaceVideoModalOpen] = useState(false);
  const [isMaintenanceReportModalOpen, setIsMaintenanceReportModalOpen] = useState(false);

  // New Exercise Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'MOBILITY' | 'STABILITY' | 'STRENGTHENING' | 'NEURAL'>('MOBILITY');
  const [newStatus, setNewStatus] = useState<'ACTIVE' | 'UNDER REVIEW' | 'DRAFT'>('ACTIVE');
  const [newShortDesc, setNewShortDesc] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDuration, setNewDuration] = useState('3 mins');
  const [newReps, setNewReps] = useState('12 Reps');
  const [newDifficulty, setNewDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [newEquipment, setNewEquipment] = useState('Yoga Mat');

  // Find currently inspected exercise
  const selectedExercise = exercises.find((ex) => ex.id === selectedExerciseId) || exercises[0];

  // Filtered exercises list
  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch =
      ex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.shortDesc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All' || ex.type.toLowerCase() === typeFilter.toLowerCase();
    const matchesDifficulty =
      difficultyFilter === 'All' || ex.difficulty.toLowerCase() === difficultyFilter.toLowerCase();
    return matchesSearch && matchesType && matchesDifficulty;
  });

  // Handle create new exercise submission
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newEx: ExerciseItem = {
      id: `ex-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      status: newStatus,
      shortDesc: newShortDesc || 'Prescribed therapy exercise',
      description: newDescription || 'Standard clinical instruction for therapeutic recovery.',
      duration: newDuration,
      reps: newReps,
      type: newCategory === 'MOBILITY' ? 'Mobility' : newCategory === 'STABILITY' ? 'Stability' : 'Strengthening',
      difficulty: newDifficulty,
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80',
      equipment: newEquipment.split(',').map((s) => s.trim()),
      clinicalCues: [
        { type: 'do', text: 'Maintain smooth steady breathing' },
        { type: 'dont', text: 'Avoid sharp radiating discomfort' },
      ],
    };

    setExercises((prev) => [newEx, ...prev]);
    setSelectedExerciseId(newEx.id);
    setIsCreateModalOpen(false);
    onShowToast(`Created exercise "${newTitle}" successfully!`);

    // Reset Form
    setNewTitle('');
    setNewShortDesc('');
    setNewDescription('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* FILTER AND ACTION BAR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Left Side: Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-slate-200/80 rounded-2xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Type Filter Dropdown */}
          <div className="relative inline-flex items-center">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none px-4 py-2.5 pr-8 bg-white border border-slate-200/90 rounded-2xl text-xs font-bold text-slate-700 hover:border-slate-300 focus:outline-none cursor-pointer transition-colors"
            >
              <option value="All">Type: All</option>
              <option value="Mobility">Type: Mobility</option>
              <option value="Stability">Type: Stability</option>
              <option value="Strengthening">Type: Strengthening</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 pointer-events-none" />
          </div>

          {/* Difficulty Filter Dropdown */}
          <div className="relative inline-flex items-center">
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="appearance-none px-4 py-2.5 pr-8 bg-white border border-slate-200/90 rounded-2xl text-xs font-bold text-slate-700 hover:border-slate-300 focus:outline-none cursor-pointer transition-colors"
            >
              <option value="All">Difficulty: All</option>
              <option value="Beginner">Difficulty: Beginner</option>
              <option value="Intermediate">Difficulty: Intermediate</option>
              <option value="Advanced">Difficulty: Advanced</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 pointer-events-none" />
          </div>
        </div>

        {/* Right Side: Create New Exercise Button */}
        <div className="shrink-0">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create New Exercise</span>
          </button>
        </div>
      </div>

      {/* MAIN TWO-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* LEFT COLUMN: Exercise Cards Grid (7 Spans on Desktop) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredExercises.map((ex) => {
              const isSelected = selectedExerciseId === ex.id;
              const isUnderReview = ex.status === 'UNDER REVIEW';

              return (
                <div
                  key={ex.id}
                  onClick={() => {
                    setSelectedExerciseId(ex.id);
                    setIsPlayingVideo(false);
                  }}
                  className={`group bg-white rounded-3xl border transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-600 ring-2 ring-blue-600/20 shadow-md shadow-blue-500/10'
                      : 'border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-md'
                  }`}
                >
                  {/* Card Thumbnail Container */}
                  <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden">
                    <img
                      src={ex.image}
                      alt={ex.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Status Badge Top-Right */}
                    <div className="absolute top-3 right-3 z-10">
                      {isUnderReview ? (
                        <span className="px-2.5 py-1 bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider rounded-lg shadow-xs">
                          UNDER REVIEW
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider rounded-lg shadow-xs">
                          ACTIVE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {ex.title}
                        </h3>

                        {/* Category Pill Tag */}
                        <span className="px-2.5 py-0.5 bg-cyan-50 text-cyan-700 text-[10px] font-extrabold uppercase tracking-wider rounded-md border border-cyan-200/60 shrink-0">
                          {ex.category}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
                        {ex.shortDesc}
                      </p>
                    </div>

                    {/* Card Footer Meta Info */}
                    <div className="flex items-center space-x-4 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-400">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ex.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ex.reps}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* "ADD NEW EXERCISE" Card Slot */}
            <div
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-slate-50/80 hover:bg-blue-50/40 border-2 border-dashed border-slate-200 hover:border-blue-300 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[220px] transition-all cursor-pointer text-center group"
            >
              <div className="w-12 h-12 rounded-full bg-white border border-slate-200 group-hover:border-blue-400 group-hover:bg-blue-600 text-slate-400 group-hover:text-white flex items-center justify-center shadow-xs transition-all mb-3">
                <Plus className="w-6 h-6 stroke-[2]" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 group-hover:text-blue-600 transition-colors">
                ADD NEW EXERCISE
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar Widgets (5 Spans on Desktop) */}
        <div className="lg:col-span-5 space-y-6">
          {/* SIDEBAR WIDGET 1: EXERCISE DETAILS */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Exercise Details</h3>
                <p className="text-xs font-medium text-slate-400 mt-0.5">
                  Currently Inspecting: <span className="font-bold text-blue-600">{selectedExercise.title}</span>
                </p>
              </div>

              <button
                onClick={() => onShowToast(`Options for ${selectedExercise.title}`)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Media Video Player Preview */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-md group">
                <img
                  src={selectedExercise.image}
                  alt={selectedExercise.title}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    isPlayingVideo ? 'opacity-30' : 'opacity-85'
                  }`}
                />

                {/* Play Button Overlay */}
                <button
                  onClick={() => setIsPlayingVideo(!isPlayingVideo)}
                  className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-blue-600/90 hover:bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 transition-transform group-hover:scale-110 cursor-pointer z-10"
                >
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                </button>

                {/* Playing Simulation Toast Banner inside Video */}
                {isPlayingVideo && (
                  <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/80 text-white text-[11px] font-bold flex items-center justify-between z-20 animate-in fade-in">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>Playing 4K Video Demonstration</span>
                    </div>
                    <button
                      onClick={() => setIsPlayingVideo(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      Pause
                    </button>
                  </div>
                )}
              </div>

              {/* DESCRIPTION Section */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  DESCRIPTION
                </span>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  {selectedExercise.description}
                </p>
              </div>

              {/* EQUIPMENT NEEDED Section */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  EQUIPMENT NEEDED
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {selectedExercise.equipment.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200/60"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* CLINICAL CUES Section */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  CLINICAL CUES
                </span>
                <div className="space-y-2">
                  {selectedExercise.clinicalCues.map((cue, idx) => (
                    <div key={idx} className="flex items-start space-x-2.5 text-xs font-semibold">
                      {cue.type === 'do' ? (
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      )}
                      <span className={cue.type === 'do' ? 'text-slate-700' : 'text-rose-600 font-bold'}>
                        {cue.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Replace Video Button */}
              <div className="pt-2">
                <button
                  onClick={() => setIsReplaceVideoModalOpen(true)}
                  className="w-full py-2.5 border border-slate-200/90 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-2xl transition-colors cursor-pointer text-center block"
                >
                  Replace Video
                </button>
              </div>
            </div>
          </div>

          {/* SIDEBAR WIDGET 2: LIBRARY HEALTH */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">Library Health</h3>
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>

            {/* VIDEO COVERAGE Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[10px] uppercase tracking-wider text-slate-400">VIDEO COVERAGE</span>
                <span className="text-blue-600 font-extrabold">94%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full w-[94%]" />
              </div>
            </div>

            {/* METADATA COMPLETION Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[10px] uppercase tracking-wider text-slate-400">METADATA COMPLETION</span>
                <span className="text-blue-600 font-extrabold">82%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full w-[82%]" />
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="pt-2 space-y-2.5 border-t border-slate-100 text-xs font-semibold">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Missing descriptions:</span>
                <span className="font-extrabold text-slate-900">4 items</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Low quality videos:</span>
                <span className="font-extrabold text-slate-900">2 items</span>
              </div>
            </div>

            {/* View Maintenance Report Link */}
            <div className="pt-2">
              <button
                onClick={() => setIsMaintenanceReportModalOpen(true)}
                className="text-xs font-extrabold text-blue-600 hover:text-blue-700 cursor-pointer block text-left"
              >
                View Maintenance Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: CREATE NEW EXERCISE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-5">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Create New Exercise</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Add a new exercise to the prescribed exercise library
              </p>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                  Exercise Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Quadruped Rock Back"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="MOBILITY">MOBILITY</option>
                    <option value="STABILITY">STABILITY</option>
                    <option value="STRENGTHENING">STRENGTHENING</option>
                    <option value="NEURAL">NEURAL</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                    Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="UNDER REVIEW">UNDER REVIEW</option>
                    <option value="DRAFT">DRAFT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                    Reps / Hold
                  </label>
                  <input
                    type="text"
                    value={newReps}
                    onChange={(e) => setNewReps(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lumbar decompression and hip flexion"
                  value={newShortDesc}
                  onChange={(e) => setNewShortDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                  Full Clinical Instructions
                </label>
                <textarea
                  rows={3}
                  placeholder="Detailed patient execution instructions..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  Create Exercise
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REPLACE VIDEO MODAL */}
      {isReplaceVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-5">
            <button
              onClick={() => setIsReplaceVideoModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Replace Demonstration Video</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Upload a new 4K HD video for <span className="font-bold text-slate-900">{selectedExercise.title}</span>
              </p>
            </div>

            <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50 rounded-2xl p-8 text-center space-y-3 transition-colors cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Click to upload or drag & drop</p>
                <p className="text-[11px] text-slate-400 mt-1">MP4, MOV, or WEBM (Max 50MB)</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setIsReplaceVideoModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsReplaceVideoModalOpen(false);
                  onShowToast(`Video for "${selectedExercise.title}" updated successfully!`);
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Save Video
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: MAINTENANCE REPORT MODAL */}
      {isMaintenanceReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-5">
            <button
              onClick={() => setIsMaintenanceReportModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Library Maintenance Report</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Items requiring clinical review or media updates
              </p>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-amber-900">Cat- Cow</h4>
                    <p className="text-[11px] text-amber-700">Missing 4K video demonstration</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsMaintenanceReportModalOpen(false);
                    setIsReplaceVideoModalOpen(true);
                  }}
                  className="px-2.5 py-1 bg-amber-600 text-white text-[11px] font-bold rounded-lg"
                >
                  Fix
                </button>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <FileVideo className="w-4 h-4 text-slate-500 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-900">Standing Extension</h4>
                    <p className="text-[11px] text-slate-500">Low resolution video asset</p>
                  </div>
                </div>
                <button
                  onClick={() => onShowToast('Flagged for media re-recording')}
                  className="px-2.5 py-1 bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg"
                >
                  Review
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsMaintenanceReportModalOpen(false)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExercisesTabContent;
