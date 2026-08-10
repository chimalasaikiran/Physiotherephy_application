import React, { useState } from 'react';
import {
  ArrowLeft,
  Edit3,
  Copy,
  Calendar,
  Building2,
  Users,
  CheckCircle2,
  Star,
  Play,
  Maximize2,
  AlertTriangle,
  Dumbbell,
  ChevronRight,
  Check,
  Clock,
  Heart,
  Bookmark,
  Share2,
  X,
} from 'lucide-react';
import type { Exercise } from './types';
import { INITIAL_EXERCISES } from './mockData';

interface ExerciseDetailPageProps {
  exercise?: Exercise | null;
  onBack?: () => void;
  onSelectExercise?: (exercise: Exercise) => void;
}

export const ExerciseDetailPage: React.FC<ExerciseDetailPageProps> = ({
  exercise: initialExercise,
  onBack,
  onSelectExercise,
}) => {
  // Use passed exercise or fallback to Hamstring Stretch
  const currentExercise = initialExercise || INITIAL_EXERCISES[0];

  const [activeExercise, setActiveExercise] = useState<Exercise>(currentExercise);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [isFavorite, setIsFavorite] = useState(activeExercise.isFavorite || false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Synchronize state if prop changes
  React.useEffect(() => {
    if (initialExercise) {
      setActiveExercise(initialExercise);
      setIsFavorite(initialExercise.isFavorite || false);
    }
  }, [initialExercise]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper values with defaults matching Figma layout
  const levelTag = activeExercise.levelTag || activeExercise.difficulty?.toUpperCase() || 'INTERMEDIATE';
  const statusTag = activeExercise.status || 'Published';
  const programsUsingCount = activeExercise.usedInProgramsCount || 12;
  const patientsAssignedCount = activeExercise.patientsAssignedCount || 148;
  const clinicsCount = activeExercise.clinicsCount || 6;
  const completionRate = activeExercise.completionRate || '92%';
  const rating = activeExercise.rating || 4.8;
  const reviewsCount = activeExercise.reviewsCount || 85;

  const clinicalOverview =
    activeExercise.clinicalOverview ||
    activeExercise.description ||
    'The supine hamstring stretch is a foundational mobility exercise designed to improve flexibility in the posterior chain, specifically targeting the biceps femoris, semitendinosus, and semimembranosus. This variation utilizes a strap or towel to provide controlled, progressive tension while maintaining spinal neutrality, making it ideal for patients recovering from lower back strain or those with acute hamstring tightness.';

  // Default steps matching Figma
  const stepInstructions = activeExercise.instructions && activeExercise.instructions.length > 0
    ? activeExercise.instructions.map((ins, i) => {
        if (ins.includes(':')) {
          const [title, ...rest] = ins.split(':');
          return { title: title.trim(), text: rest.join(':').trim() };
        }
        const defaultTitles = ['Starting Position', 'Elevation Phase', 'Static Hold'];
        return {
          title: defaultTitles[i] || `Step ${i + 1}`,
          text: ins,
        };
      })
    : [
        {
          title: 'Starting Position',
          text: 'Lie flat on your back on a firm surface. Extend both legs fully. Loop a stretch strap or towel around the arch of the foot you intend to stretch.',
        },
        {
          title: 'Elevation Phase',
          text: 'Slowly lift your leg toward the ceiling, keeping your knee as straight as possible until you feel a gentle pull in the back of your thigh.',
        },
        {
          title: 'Static Hold',
          text: 'Hold the position for 30 seconds. Ensure your breathing remains steady and your shoulders remain relaxed against the floor.',
        },
      ];

  const safetyGuidelines = activeExercise.safetyGuidelines || [
    'Do not lock the knee completely if you have hypermobility.',
    'Stop immediately if you feel sharp, radiating pain or numbness.',
    'Avoid arching the lower back off the floor.',
  ];

  const requiredEquipment = activeExercise.requiredEquipment || [
    'Yoga Mat',
    'Resistance Strap',
    'Towel (Alternative)',
  ];

  const activeProgramsList = activeExercise.activeProgramsList || [
    {
      title: 'Post-Op ACL Recovery',
      patientsCount: 8,
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=150&q=80',
    },
    {
      title: 'Daily Mobility Flow',
      patientsCount: 52,
      thumbnail: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=150&q=80',
    },
  ];

  const recentUpdates = activeExercise.recentUpdates || [
    {
      date: 'Today, 10:45 AM',
      title: 'Video demonstration updated',
      author: 'by Dr. Sarah Miller',
    },
    {
      date: 'Oct 12, 2023',
      title: 'Instructional text clarified',
      author: '',
    },
  ];

  const relatedExercises = activeExercise.relatedExercises || [
    {
      title: 'Piriformis Stretch',
      subtitle: 'Glutes & Hips • Beginner',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=500&q=80',
    },
    {
      title: 'Standing Quad Stretch',
      subtitle: 'Quadriceps • Beginner',
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=500&q=80',
    },
    {
      title: 'Glute Bridges',
      subtitle: 'Core & Glutes • Intermediate',
      image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=500&q=80',
    },
    {
      title: 'Calf Stretch',
      subtitle: 'Calves • Beginner',
      image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=500&q=80',
    },
  ];

  const handleSelectRelated = (relTitle: string) => {
    const found = INITIAL_EXERCISES.find(
      (ex) => ex.title.toLowerCase() === relTitle.toLowerCase()
    );
    if (found) {
      setActiveExercise(found);
      if (onSelectExercise) onSelectExercise(found);
      showToast(`Loaded ${found.title}`);
    } else {
      showToast(`Loaded ${relTitle}`);
    }
  };

  return (
    <div className="w-full space-y-6 sm:space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-bold flex items-center space-x-2 animate-in slide-in-from-top duration-200">
          <Check className="w-4 h-4 text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          {/* Back Link */}
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-slate-900 group cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to Exercise Library</span>
            </button>
          )}

          {/* Badges Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 bg-indigo-50/90 text-indigo-600 text-[11px] font-extrabold rounded-md uppercase tracking-wider border border-indigo-100">
              {levelTag}
            </span>
            <span className="px-2.5 py-0.5 bg-teal-50/90 text-teal-700 text-[11px] font-extrabold rounded-md uppercase tracking-wider border border-teal-100/80 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              <span>• {statusTag}</span>
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            {activeExercise.title}
          </h1>
        </div>

        {/* Action Buttons (Right) */}
        <div className="flex items-center space-x-3 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => showToast('Editing exercise protocol...')}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit</span>
          </button>

          <button
            onClick={() => showToast('Exercise duplicated to library')}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            <span>Duplicate</span>
          </button>

          <button
            onClick={() => {
              setIsFavorite(!isFavorite);
              showToast(isFavorite ? 'Removed from favorites' : 'Saved to favorites');
            }}
            className="p-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 shadow-2xs transition-all cursor-pointer"
            aria-label="Bookmark"
          >
            <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-blue-600 text-blue-600' : 'text-slate-500'}`} />
          </button>
        </div>
      </div>

      {/* Top 4 Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 1: Programs Using */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              Programs Using
            </p>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {programsUsingCount}
            </div>
            <span className="text-[11px] font-bold text-teal-600 mt-0.5 inline-block">
              +2 this month
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: Patients Assigned */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              Patients Assigned
            </p>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {patientsAssignedCount}
            </div>
            <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
              Across {clinicsCount} clinics
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Completion Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="flex-1 pr-2">
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              Completion Rate
            </p>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {completionRate}
            </div>
            {/* Progress bar line */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-teal-500 h-full rounded-full transition-all duration-700"
                style={{ width: completionRate }}
              />
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4: Average Rating */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              Average Rating
            </p>
            <div className="flex items-center space-x-1.5 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{rating}</span>
            </div>
            <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
              Based on {reviewsCount} reviews
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 fill-rose-500 text-rose-500" />
          </div>
        </div>
      </div>

      {/* Main Content Layout Grid (Left Main + Right Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
        {/* LEFT COLUMN (2 Spans) */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          {/* Demonstration Video Player Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="relative aspect-video w-full bg-slate-900 overflow-hidden group">
              <img
                src={activeExercise.coverImage}
                alt={activeExercise.title}
                className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                  isPlayingVideo ? 'opacity-40' : 'opacity-85'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />

              {/* Center Play Button */}
              <button
                onClick={() => {
                  setIsPlayingVideo(!isPlayingVideo);
                  showToast(isPlayingVideo ? 'Paused demonstration video' : 'Playing demonstration video');
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/30 backdrop-blur-md hover:bg-white/50 hover:scale-110 transition-all flex items-center justify-center text-white shadow-2xl cursor-pointer"
                aria-label="Play Demonstration Video"
              >
                <Play className="w-8 h-8 sm:w-9 sm:h-9 fill-white ml-1" />
              </button>

              {/* Bottom Control Bar */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md text-white text-xs font-bold rounded-xl border border-white/10 flex items-center space-x-2">
                  <Clock className="w-3.5 h-3.5 text-teal-400" />
                  <span>0:45 / Demonstration</span>
                </div>

                <button
                  onClick={() => showToast('Expanded video to fullscreen')}
                  className="p-2 bg-black/40 backdrop-blur-md text-white hover:bg-black/60 rounded-xl border border-white/10 transition-colors cursor-pointer"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Clinical Overview Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Clinical Overview
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
              {clinicalOverview}
            </p>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Step-by-Step Instructions
            </h2>

            <div className="space-y-4">
              {stepInstructions.map((step, idx) => {
                const stepNumStr = String(idx + 1).padStart(2, '0');
                return (
                  <div
                    key={idx}
                    className="p-5 bg-slate-50/60 rounded-2xl border border-slate-100 flex items-start space-x-4 transition-all hover:bg-slate-50"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-100/80 text-blue-700 text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                      {stepNumStr}
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <h4 className="text-sm font-extrabold text-slate-900">{step.title}</h4>
                      <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                        {step.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Safety Guidelines & Required Equipment (2 Cards Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Safety Guidelines Card */}
            <div className="bg-rose-50/40 rounded-3xl p-6 border border-rose-100/80 space-y-4">
              <div className="flex items-center space-x-2.5 text-rose-700">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="text-base font-extrabold">Safety Guidelines</h3>
              </div>

              <ul className="space-y-3">
                {safetyGuidelines.map((guide, idx) => (
                  <li key={idx} className="flex items-start space-x-2.5 text-xs sm:text-sm font-medium text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-2" />
                    <span>{guide}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Required Equipment Card */}
            <div className="bg-sky-50/40 rounded-3xl p-6 border border-sky-100/80 space-y-4">
              <div className="flex items-center space-x-2.5 text-sky-800">
                <Dumbbell className="w-5 h-5 shrink-0" />
                <h3 className="text-base font-extrabold">Required Equipment</h3>
              </div>

              <div className="flex flex-wrap gap-2.5 pt-1">
                {requiredEquipment.map((eq, idx) => (
                  <span
                    key={idx}
                    className="px-3.5 py-1.5 bg-white text-sky-900 text-xs font-bold rounded-xl border border-sky-200/60 shadow-2xs"
                  >
                    {eq}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar Widgets (1 Span) */}
        <div className="space-y-6 sm:space-y-8">
          {/* Card 1: Exercise Details */}
          <div className="bg-indigo-50/40 rounded-3xl p-6 border border-indigo-100/80 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Exercise Details</h3>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between py-1 border-b border-indigo-100/60">
                <span className="text-slate-500 font-semibold">Target Muscle</span>
                <span className="font-extrabold text-slate-900">
                  {activeExercise.targetMuscles ? activeExercise.targetMuscles[0] : 'Hamstrings'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-indigo-100/60">
                <span className="text-slate-500 font-semibold">Body Area</span>
                <span className="font-extrabold text-slate-900">{activeExercise.bodyArea}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-indigo-100/60">
                <span className="text-slate-500 font-semibold">Standard Duration</span>
                <span className="font-extrabold text-slate-900">45 - 60 sec</span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500 font-semibold">Difficulty</span>
                <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 font-extrabold text-[10px] rounded-md uppercase tracking-wider">
                  {levelTag}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Active Programs */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Active Programs</h3>

            <div className="space-y-3">
              {activeProgramsList.map((prog, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-slate-100 cursor-pointer"
                  onClick={() => showToast(`Opened ${prog.title}`)}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <img
                      src={prog.thumbnail || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=150&q=80'}
                      alt={prog.title}
                      className="w-10 h-10 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-extrabold text-slate-900 truncate">
                        {prog.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {prog.patientsCount} Patients Enrolled
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              ))}
            </div>

            <button
              onClick={() => showToast('Opening all enrolled programs...')}
              className="w-full text-center text-xs font-bold text-blue-600 hover:text-blue-700 py-1.5 transition-colors cursor-pointer"
            >
              View All Programs
            </button>
          </div>

          {/* Card 3: Recent Updates */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Recent Updates</h3>

            <div className="space-y-4 relative pl-3">
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-100" />

              {recentUpdates.map((upd, idx) => (
                <div key={idx} className="relative flex items-start space-x-3">
                  <div
                    className={`w-3.5 h-3.5 rounded-full shrink-0 mt-1 border-2 border-white shadow-2xs z-10 ${
                      idx === 0 ? 'bg-blue-600 ring-2 ring-blue-100' : 'bg-slate-300'
                    }`}
                  />
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[11px] font-semibold text-slate-400 block">
                      {upd.date}
                    </span>
                    <p className="text-xs font-extrabold text-slate-900">{upd.title}</p>
                    {upd.author && (
                      <p className="text-[11px] text-slate-400 font-medium">{upd.author}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Related Exercises */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6 mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Related Exercises
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Commonly prescribed alongside {activeExercise.title}
            </p>
          </div>

          {onBack && (
            <button
              onClick={onBack}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
            >
              See Library
            </button>
          )}
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {relatedExercises.map((rel, idx) => (
            <div
              key={idx}
              onClick={() => handleSelectRelated(rel.title)}
              className="group bg-slate-50/60 rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md hover:border-blue-200 transition-all cursor-pointer flex flex-col"
            >
              <div className="relative aspect- video h-36 w-full overflow-hidden bg-slate-900">
                <img
                  src={rel.image}
                  alt={rel.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="p-4 space-y-1 flex-1 flex flex-col justify-between">
                <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {rel.title}
                </h4>
                <p className="text-xs font-medium text-slate-400">{rel.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExerciseDetailPage;
