import React, { useState } from 'react';
import { X, Plus, Upload, Sparkles } from 'lucide-react';
import type { Exercise, DifficultyLevel } from '../types';

interface CreateExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateExercise: (newExercise: Exercise) => void;
}

export const CreateExerciseModal: React.FC<CreateExerciseModalProps> = ({
  isOpen,
  onClose,
  onCreateExercise,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Easy');
  const [bodyArea, setBodyArea] = useState('Lumbar');
  const [equipment, setEquipment] = useState('Yoga Mat');
  const [durationMinutes, setDurationMinutes] = useState<number>(10);
  const [category, setCategory] = useState('Range of Motion');
  const [coverImage, setCoverImage] = useState(
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80'
  );
  const [instructionsText, setInstructionsText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const instructions = instructionsText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const newExercise: Exercise = {
      id: `ex-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'Custom rehabilitation exercise protocol.',
      difficulty,
      bodyArea,
      equipment,
      durationMinutes: Number(durationMinutes) || 10,
      usedInProgramsCount: 0,
      isFavorite: false,
      coverImage: coverImage.trim() || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
      category,
      assignedUsers: [{ id: 'u-curr', name: 'Dr. Sarah Chen', initials: 'SC' }],
      extraUsersCount: 0,
      instructions: instructions.length > 0 ? instructions : ['Perform exercise with controlled posture.', 'Maintain slow breathing throughout repetition.'],
      addedAt: 'Just now',
      addedBy: 'Dr. Sarah Chen',
    };

    onCreateExercise(newExercise);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Create New Exercise</h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Add a new rehabilitation protocol exercise to the clinic library.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Exercise Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Scapular Wall Slides"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden bg-white"
              >
                <option value="Range of Motion">Range of Motion</option>
                <option value="Strengthening">Strengthening</option>
                <option value="Stability">Stability</option>
                <option value="Mobility">Mobility</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Body Area
              </label>
              <select
                value={bodyArea}
                onChange={(e) => setBodyArea(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden bg-white"
              >
                <option value="Lumbar">Lumbar</option>
                <option value="Shoulder">Shoulder</option>
                <option value="Ankle">Ankle</option>
                <option value="Knee">Knee</option>
                <option value="Hip">Hip</option>
                <option value="Neck">Neck</option>
                <option value="Core">Core</option>
                <option value="Wrist">Wrist</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden bg-white"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Equipment
              </label>
              <input
                type="text"
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                placeholder="e.g. Yoga Mat, Band"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Duration (Mins)
              </label>
              <input
                type="number"
                min={1}
                max={120}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a short overview of what this exercise targets..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Step-by-Step Instructions (One per line)
            </label>
            <textarea
              rows={3}
              value={instructionsText}
              onChange={(e) => setInstructionsText(e.target.value)}
              placeholder="1. Lie comfortably on mat&#10;2. Pull knees towards chest&#10;3. Hold for 30 seconds"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Cover Image URL
            </label>
            <div className="flex space-x-2">
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
              />
              <button
                type="button"
                onClick={() =>
                  setCoverImage(
                    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80'
                  )
                }
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Sample Image
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Exercise</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
