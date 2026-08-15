import React, { useState, useMemo } from 'react';
import {
  Upload,
  Plus,
  Maximize2,
  Grid,
  Activity,
  Building2,
  LayoutGrid,
  List,
  ChevronDown,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { ExerciseCard } from './components/ExerciseCard';
import { ExerciseListView } from './components/ExerciseListView';
import { PopularExercisesWidget } from './components/PopularExercisesWidget';
import { CategoriesWidget } from './components/CategoriesWidget';
import { QuickActionsWidget } from './components/QuickActionsWidget';
import { RecentlyAddedWidget } from './components/RecentlyAddedWidget';
import { CreateExerciseModal } from './components/CreateExerciseModal';
import { ImportExercisesModal } from './components/ImportExercisesModal';
import { ManageCategoriesModal } from './components/ManageCategoriesModal';
import { ExerciseDetailPage } from './ExerciseDetailPage';

import {
  INITIAL_EXERCISES,
  CATEGORIES_LIST,
  POPULAR_EXERCISES,
  RECENTLY_ADDED,
} from './mockData';
import type { Exercise, ExerciseCategory } from './types';

interface ExerciseLibraryPageProps {
  onNavigateToCreateExercise?: () => void;
  onNavigateToExerciseDetails?: (exercise?: Exercise) => void;
}

export const ExerciseLibraryPage: React.FC<ExerciseLibraryPageProps> = ({
  onNavigateToCreateExercise,
  onNavigateToExerciseDetails,
}) => {
  const [exercises, setExercises] = useState<Exercise[]>(INITIAL_EXERCISES);

  const [categories, setCategories] = useState<ExerciseCategory[]>(CATEGORIES_LIST);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBodyArea, setSelectedBodyArea] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isManageCatModalOpen, setIsManageCatModalOpen] = useState(false);
  const [selectedDetailExercise, setSelectedDetailExercise] = useState<Exercise | null>(null);

  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedDetailExercise(exercise);
    if (onNavigateToExerciseDetails) {
      onNavigateToExerciseDetails(exercise);
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = (id: string) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, isFavorite: !ex.isFavorite } : ex))
    );
  };

  // Add New Exercise
  const handleCreateExercise = async (newEx: Exercise) => {
    setExercises((prev) => [newEx, ...prev]);
  };

  // Delete Category
  const handleDeleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // Add Category
  const handleAddCategory = (name: string) => {
    const newCat: ExerciseCategory = {
      id: `cat-${Date.now()}`,
      name,
      count: 0,
      iconName: 'Activity',
    };
    setCategories((prev) => [...prev, newCat]);
  };

  // Filter Options Extracted
  const bodyAreaOptions = ['All', 'Lumbar', 'Shoulder', 'Ankle', 'Hip', 'Wrist', 'Core', 'Knee'];
  const difficultyOptions = ['All', 'Easy', 'Medium', 'Hard'];
  const equipmentOptions = ['All', 'Yoga Mat', 'Empty Wall', 'Resistance Band', 'Balance Disc', 'None'];
  const typeOptions = ['All', 'Range of Motion', 'Strengthening', 'Stability', 'Mobility'];

  // Filtered Exercises
  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      // Search
      if (
        searchQuery &&
        !ex.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !ex.category.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !ex.equipment.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      // Category Widget Filter
      if (activeCategory !== 'All' && ex.category !== activeCategory) {
        return false;
      }
      // Body Area
      if (selectedBodyArea !== 'All' && ex.bodyArea !== selectedBodyArea) {
        return false;
      }
      // Difficulty
      if (selectedDifficulty !== 'All' && ex.difficulty !== selectedDifficulty) {
        return false;
      }
      // Equipment
      if (selectedEquipment !== 'All' && ex.equipment !== selectedEquipment) {
        return false;
      }
      // Type
      if (selectedType !== 'All' && ex.category !== selectedType) {
        return false;
      }
      return true;
    });
  }, [
    exercises,
    searchQuery,
    activeCategory,
    selectedBodyArea,
    selectedDifficulty,
    selectedEquipment,
    selectedType,
  ]);

  const totalExercisesCount = exercises.length;

  if (selectedDetailExercise) {
    return (
      <ExerciseDetailPage
        exercise={selectedDetailExercise}
        onBack={() => setSelectedDetailExercise(null)}
        onSelectExercise={(ex) => setSelectedDetailExercise(ex)}
      />
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Exercise Library
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Manage reusable rehabilitation exercises for all recovery programs
          </p>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-4 py-2.5 bg-blue-50/80 hover:bg-blue-100 text-blue-600 text-sm font-bold rounded-xl border border-blue-100/80 transition-all flex items-center space-x-2 shadow-2xs cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Import Exercises</span>
          </button>

          <button
            onClick={() => {
              if (onNavigateToCreateExercise) {
                onNavigateToCreateExercise();
              } else {
                setIsCreateModalOpen(true);
              }
            }}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Exercise</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row (4 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Exercises */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Maximize2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              TOTAL EXERCISES
            </p>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-2xl font-extrabold text-slate-900">{totalExercisesCount}</span>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                +12%
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Categories */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              CATEGORIES
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {categories.length} Active
            </p>
          </div>
        </div>

        {/* Card 3: Most Used */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              MOST USED
            </p>
            <p className="text-lg font-extrabold text-slate-900 mt-0.5 truncate max-w-[140px]">
              Lumbar Stretch
            </p>
          </div>
        </div>

        {/* Card 4: Programs Using */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              PROGRAMS USING
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">84 Clinics</p>
          </div>
        </div>
      </div>

      {/* Toolbar / Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Body Area */}
          <div className="relative">
            <select
              value={selectedBodyArea}
              onChange={(e) => setSelectedBodyArea(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200/80 rounded-xl py-2 pl-3.5 pr-8 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors focus:outline-hidden cursor-pointer"
            >
              {bodyAreaOptions.map((opt) => (
                <option key={opt} value={opt}>
                  Body Area: {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Difficulty */}
          <div className="relative">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200/80 rounded-xl py-2 pl-3.5 pr-8 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors focus:outline-hidden cursor-pointer"
            >
              {difficultyOptions.map((opt) => (
                <option key={opt} value={opt}>
                  Difficulty: {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Equipment */}
          <div className="relative">
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200/80 rounded-xl py-2 pl-3.5 pr-8 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors focus:outline-hidden cursor-pointer"
            >
              {equipmentOptions.map((opt) => (
                <option key={opt} value={opt}>
                  Equipment: {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Type */}
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200/80 rounded-xl py-2 pl-3.5 pr-8 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors focus:outline-hidden cursor-pointer"
            >
              {typeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  Type: {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* View Switcher (Grid vs List) */}
        <div className="flex items-center space-x-1.5 self-end md:self-auto shrink-0 bg-slate-100/70 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            aria-label="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            aria-label="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Responsive Grid Layout (Left Content + Right Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
        {/* Left Column: Exercises Cards Grid or List */}
        <div className="lg:col-span-2 space-y-6">
          {filteredExercises.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center space-y-3">
              <SlidersHorizontal className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Exercises Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No exercises match your current search or filter criteria. Try resetting filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedBodyArea('All');
                  setSelectedDifficulty('All');
                  setSelectedEquipment('All');
                  setSelectedType('All');
                  setActiveCategory('All');
                }}
                className="px-4 py-2 bg-blue-50 text-blue-600 text-xs font-bold rounded-xl hover:bg-blue-100 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {filteredExercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  onToggleFavorite={handleToggleFavorite}
                  onSelect={(ex) => handleSelectExercise(ex)}
                />
              ))}
            </div>
          ) : (
            <ExerciseListView
              exercises={filteredExercises}
              onToggleFavorite={handleToggleFavorite}
              onSelect={(ex) => handleSelectExercise(ex)}
            />
          )}
        </div>

        {/* Right Column: Widgets */}
        <div className="space-y-6">
          {/* Popular Right Now */}
          <PopularExercisesWidget
            items={POPULAR_EXERCISES}
            onSelect={(id) => {
              const found = exercises.find((ex) => ex.id === id || ex.title === 'Wall Angels');
              if (found) handleSelectExercise(found);
            }}
          />

          {/* Categories Widget */}
          <CategoriesWidget
            categories={categories}
            activeCategory={activeCategory}
            onSelectCategory={(name) => setActiveCategory(name)}
          />

          {/* Quick Actions */}
          <QuickActionsWidget
            onManageCategories={() => setIsManageCatModalOpen(true)}
            onExportLibrary={() => {
              const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exercises, null, 2));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute('href', dataStr);
              downloadAnchor.setAttribute('download', 'Exercise_Library.json');
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
          />

          {/* Recently Added */}
          <RecentlyAddedWidget
            items={RECENTLY_ADDED}
            onSelect={(title) => {
              const found = exercises.find((ex) => ex.title === title);
              if (found) handleSelectExercise(found);
            }}
          />
        </div>
      </div>

      {/* Modals */}
      <CreateExerciseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateExercise={handleCreateExercise}
      />

      <ImportExercisesModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={(count) => console.log(`Imported ${count} exercises`)}
      />

      <ManageCategoriesModal
        isOpen={isManageCatModalOpen}
        onClose={() => setIsManageCatModalOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
      />
    </div>
  );
};

export default ExerciseLibraryPage;
