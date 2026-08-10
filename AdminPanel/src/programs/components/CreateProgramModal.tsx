import React, { useState } from 'react';
import { X, Plus, Image as ImageIcon } from 'lucide-react';
import type { Program, ProgramDifficulty } from '../types';

interface CreateProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newProgram: Omit<Program, 'id'>) => void;
}

export const CreateProgramModal: React.FC<CreateProgramModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [bodyAreaTag, setBodyAreaTag] = useState('Knee Recovery');
  const [duration, setDuration] = useState('8 Weeks');
  const [difficulty, setDifficulty] = useState<ProgramDifficulty>('Beginner');
  const [type, setType] = useState('Rehabilitation');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreate({
      title,
      description: description || 'Custom rehabilitation protocol.',
      status: 'draft',
      bodyAreaTag,
      coverImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
      duration,
      difficulty,
      activePatients: '--',
      completionRate: 'N/A',
      updatedAt: 'Just now',
      type,
      exercisesCount: 10,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Create Rehabilitation Program</h2>
            <p className="text-xs text-slate-500 font-medium">Design and publish custom exercise plans.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Program Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Post-Op ACL Recovery Phase 1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm font-medium text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Target Body Area
              </label>
              <select
                value={bodyAreaTag}
                onChange={(e) => setBodyAreaTag(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm font-medium text-slate-900 bg-white"
              >
                <option value="Knee Recovery">Knee Recovery</option>
                <option value="Lumbar Stability">Lumbar Stability</option>
                <option value="Neck/Spine">Neck/Spine</option>
                <option value="Shoulder">Shoulder</option>
                <option value="Ankle/Foot">Ankle/Foot</option>
                <option value="Hip/Pelvis">Hip/Pelvis</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Program Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm font-medium text-slate-900 bg-white"
              >
                <option value="Rehabilitation">Rehabilitation</option>
                <option value="Core Stability">Core Stability</option>
                <option value="Mobility">Mobility</option>
                <option value="Balance">Balance</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm font-medium text-slate-900 bg-white"
              >
                <option value="2 Weeks">2 Weeks</option>
                <option value="4 Weeks">4 Weeks</option>
                <option value="6 Weeks">6 Weeks</option>
                <option value="8 Weeks">8 Weeks</option>
                <option value="12 Weeks">12 Weeks</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as ProgramDifficulty)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm font-medium text-slate-900 bg-white"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Brief summary of rehabilitation goals and exercise guidelines..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm font-medium text-slate-900 resize-none"
            />
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors cursor-pointer shadow-md shadow-blue-500/20"
            >
              Save as Draft
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
