import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, Check } from 'lucide-react';
import type { ExerciseCategory } from '../types';

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ExerciseCategory[];
  onAddCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
}

export const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onDeleteCategory,
}) => {
  const [newCatName, setNewCatName] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    onAddCategory(newCatName.trim());
    setNewCatName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Manage Categories</h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Add or remove exercise classification categories.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add Category Form */}
        <form onSubmit={handleAdd} className="flex space-x-2">
          <input
            type="text"
            placeholder="New Category Name..."
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-colors flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </form>

        {/* Categories List */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 text-sm font-semibold"
            >
              <span>{cat.name}</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400 font-medium">{cat.count} exercises</span>
                <button
                  onClick={() => onDeleteCategory(cat.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  aria-label="Delete Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
