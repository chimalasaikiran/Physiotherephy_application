import React, { useState } from 'react';
import { createProgram } from '@/services/programService';

import {
  Plus,
  User,
  Zap,
  Activity,
  Dumbbell,
  BriefcaseMedical,
  ShieldCheck,
  CloudCheck,
  Lock,
  ChevronRight,
  Calendar,
  Mail,
  ArrowLeft,
  Check,
} from 'lucide-react';
import type { Program, ProgramDifficulty } from './types';

interface CreateRecoveryProgramPageProps {
  onBack?: () => void;
  onCreateProgram?: (newProgram: Omit<Program, 'id'>) => void;
}

interface TemplateOption {
  id: string;
  title: string;
  icon: React.ElementType;
  targetCondition: string;
  bodyArea: string;
  difficulty: ProgramDifficulty;
  durationWeeks: number;
  description: string;
}

const TEMPLATES: TemplateOption[] = [
  {
    id: 'blank',
    title: 'Blank Program',
    icon: Plus,
    targetCondition: '',
    bodyArea: '',
    difficulty: 'Beginner',
    durationWeeks: 12,
    description: '',
  },
  {
    id: 'lower-back',
    title: 'Lower Back',
    icon: User,
    targetCondition: 'Lumbar Disc Herniation',
    bodyArea: 'Lower Back',
    difficulty: 'Beginner',
    durationWeeks: 8,
    description: 'Targeted strengthening and stabilization protocol for lower back recovery.',
  },
  {
    id: 'acl-rehab',
    title: 'ACL Rehab',
    icon: Zap,
    targetCondition: 'ACL Reconstruction',
    bodyArea: 'Knee',
    difficulty: 'Intermediate',
    durationWeeks: 12,
    description: 'Post-operative ACL reconstruction progressive protocol.',
  },
  {
    id: 'shoulder',
    title: 'Shoulder',
    icon: Activity,
    targetCondition: 'Rotator Cuff Tendonitis',
    bodyArea: 'Shoulder',
    difficulty: 'Beginner',
    durationWeeks: 6,
    description: 'Rotator cuff activation and shoulder impingement restoration.',
  },
  {
    id: 'sports-injury',
    title: 'Sports Injury',
    icon: Dumbbell,
    targetCondition: 'Hamstring Strain',
    bodyArea: 'Leg / Thigh',
    difficulty: 'Advanced',
    durationWeeks: 6,
    description: 'High-performance athletic rehabilitation and return-to-sport testing.',
  },
  {
    id: 'post-surgery',
    title: 'Post Surgery',
    icon: BriefcaseMedical,
    targetCondition: 'Post-Op Knee Replacement',
    bodyArea: 'Knee',
    difficulty: 'Beginner',
    durationWeeks: 12,
    description: 'Early-stage post-surgical tissue healing and joint mobility restoration.',
  },
];

export const CreateRecoveryProgramPage: React.FC<CreateRecoveryProgramPageProps> = ({
  onBack,
  onCreateProgram,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('blank');
  const [programName, setProgramName] = useState<string>('');
  const [targetCondition, setTargetCondition] = useState<string>('');
  const [bodyArea, setBodyArea] = useState<string>('');
  const [difficulty, setDifficulty] = useState<ProgramDifficulty>('Beginner');
  const [estimatedDuration, setEstimatedDuration] = useState<number>(12);
  const [visibility, setVisibility] = useState<'draft' | 'publish-later'>('draft');

  // Handle template selection
  const handleSelectTemplate = (template: TemplateOption) => {
    setSelectedTemplateId(template.id);
    if (template.id === 'blank') {
      setProgramName('');
      setTargetCondition('');
      setBodyArea('');
      setDifficulty('Beginner');
      setEstimatedDuration(12);
    } else {
      setProgramName(`12-Week ${template.title} Protocol`);
      setTargetCondition(template.targetCondition);
      setBodyArea(template.bodyArea);
      setDifficulty(template.difficulty);
      setEstimatedDuration(template.durationWeeks);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newProg: Omit<Program, 'id'> = {
      title: programName || 'Untitled Recovery Program',
      description: 'Custom therapeutic rehabilitation protocol created by clinical admin.',
      status: visibility === 'draft' ? 'draft' : 'published',
      bodyAreaTag: bodyArea || 'General Recovery',
      coverImage:
        'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
      duration: `${estimatedDuration} Weeks`,
      difficulty: difficulty,
      activePatients: 0,
      completionRate: 'N/A',
      updatedAt: 'Just now',
      type: 'Rehabilitation',
      exercisesCount: 12,
    };

    try {
      if (onCreateProgram) {
        onCreateProgram(newProg);
      } else {
        await createProgram(newProg);
        if (onBack) onBack();
      }
    } catch (err) {
      console.error('Failed to create program:', err);
      if (onBack) onBack();
    }
  };


  return (
    <div className="w-full space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-slate-900 mb-3 group cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to Programs</span>
            </button>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Create Recovery Program
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Start with the essentials. You can add exercises, weeks and goals later.
          </p>
        </div>
      </div>

      {/* START FROM A TEMPLATE Section */}
      <div className="space-y-4">
        <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
          START FROM A TEMPLATE
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {TEMPLATES.map((tpl) => {
            const Icon = tpl.icon;
            const isSelected = selectedTemplateId === tpl.id;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleSelectTemplate(tpl)}
                className={`flex flex-col items-center justify-center p-5 rounded-2xl sm:rounded-3xl border text-center transition-all duration-200 cursor-pointer group relative ${
                  isSelected
                    ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-500/20'
                    : 'bg-white/80 border-slate-200/80 hover:border-slate-300 hover:bg-white shadow-xs'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-105 ${
                    isSelected
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-blue-50/60 text-blue-600/80 group-hover:bg-blue-50 group-hover:text-blue-600'
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2]" />
                </div>
                <span
                  className={`text-xs font-bold leading-tight ${
                    isSelected ? 'text-slate-900' : 'text-slate-700'
                  }`}
                >
                  {tpl.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl sm:rounded-[32px] p-6 sm:p-8 lg:p-10 border border-slate-200/80 shadow-xs space-y-6 sm:space-y-8">
        {/* Program Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Program Name
          </label>
          <input
            type="text"
            required
            value={programName}
            onChange={(e) => setProgramName(e.target.value)}
            placeholder="e.g. 12-Week Post-ACL Reconstruction"
            className="w-full px-4 py-3.5 rounded-2xl border border-slate-200/90 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-white transition-all"
          />
        </div>

        {/* Target Condition & Body Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Target Condition
            </label>
            <div className="relative">
              <select
                value={targetCondition}
                onChange={(e) => setTargetCondition(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-200/90 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-white appearance-none cursor-pointer pr-10"
              >
                <option value="">Select condition</option>
                <option value="ACL Reconstruction">ACL Reconstruction / Post-Op</option>
                <option value="Lumbar Disc Herniation">Lumbar Disc Herniation</option>
                <option value="Rotator Cuff Tendonitis">Rotator Cuff Tendonitis</option>
                <option value="Meniscus Tear">Meniscus Tear</option>
                <option value="Osteoarthritis">Osteoarthritis</option>
                <option value="Patellofemoral Pain">Patellofemoral Pain Syndrome</option>
                <option value="Post-Op Knee Replacement">Post-Op Knee Replacement</option>
                <option value="General Rehabilitation">General Rehabilitation</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Body Area
            </label>
            <div className="relative">
              <select
                value={bodyArea}
                onChange={(e) => setBodyArea(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-200/90 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-white appearance-none cursor-pointer pr-10"
              >
                <option value="">Select area</option>
                <option value="Lower Back">Lower Back</option>
                <option value="Knee">Knee</option>
                <option value="Shoulder">Shoulder</option>
                <option value="Ankle & Foot">Ankle & Foot</option>
                <option value="Hip & Pelvis">Hip & Pelvis</option>
                <option value="Neck & Spine">Neck & Spine</option>
                <option value="Leg / Thigh">Leg / Thigh</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Difficulty & Estimated Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Difficulty
            </label>
            <div className="p-1.5 bg-[#eef2ff] rounded-2xl flex items-center gap-1 border border-indigo-100/60">
              {(['Beginner', 'Intermediate', 'Advanced'] as ProgramDifficulty[]).map((level) => {
                const isActive = difficulty === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-indigo-900/60 hover:text-slate-900'
                    }`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Estimated Duration
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                min={1}
                max={52}
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3.5 pr-20 rounded-2xl border border-slate-200/90 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-white"
              />
              <span className="absolute right-4 text-xs font-bold text-slate-400 pointer-events-none uppercase tracking-wider">
                Weeks
              </span>
            </div>
          </div>
        </div>

        {/* Program Visibility */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Program Visibility
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Draft Mode Option */}
            <div
              onClick={() => setVisibility('draft')}
              className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border flex items-start space-x-4 cursor-pointer transition-all ${
                visibility === 'draft'
                  ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <Mail className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Draft Mode</h4>
                <p className="text-xs font-medium text-slate-400 mt-0.5">Visible only to admins</p>
              </div>
            </div>

            {/* Publish Later Option */}
            <div
              onClick={() => setVisibility('publish-later')}
              className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border flex items-start space-x-4 cursor-pointer transition-all ${
                visibility === 'publish-later'
                  ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
                <Calendar className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Publish Later</h4>
                <p className="text-xs font-medium text-slate-400 mt-0.5">Schedule for specific date</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto text-center px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3 bg-[#0047ab] hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-2xl sm:rounded-full transition-all duration-200 shadow-md shadow-blue-900/20 cursor-pointer"
          >
            <span>Create Program</span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </form>

      {/* Security & Trust Footer Badges */}
      <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 pt-4 text-slate-400 text-xs font-semibold">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-blue-500" />
          <span>Clinical Grade Precision</span>
        </div>
        <div className="flex items-center space-x-2">
          <CloudCheck className="w-4 h-4 text-blue-500" />
          <span>Auto-saved to Cloud</span>
        </div>
        <div className="flex items-center space-x-2">
          <Lock className="w-4 h-4 text-blue-500" />
          <span>HIPAA Compliant Protocol</span>
        </div>
      </div>
    </div>
  );
};
