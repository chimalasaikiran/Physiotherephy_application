import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Save,
  Info,
  FileText,
  Video,
  Upload,
  Image as ImageIcon,
  Plus,
  X,
  Play,
  Share2,
  AlertTriangle,
  Check,
  Maximize2,
  Copy,
  Archive,
  ChevronRight,
  Bold,
  Italic,
  List,
  Link2,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

interface CreateExercisePageProps {
  onBack: () => void;
  onSuccess?: () => void;
}

export const CreateExercisePage: React.FC<CreateExercisePageProps> = ({
  onBack,
  onSuccess,
}) => {
  // Form State
  const [exerciseName, setExerciseName] = useState('Weighted Goblet Squat');
  const [category, setCategory] = useState('Strength & Conditioning');
  const [duration, setDuration] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  
  // Tag States
  const [targetBodyAreas, setTargetBodyAreas] = useState<string[]>(['Lower Back', 'Hips', 'Core']);
  const [newAreaInput, setNewAreaInput] = useState('');
  const [isAddingArea, setIsAddingArea] = useState(false);

  const [requiredEquipment, setRequiredEquipment] = useState<string[]>(['Yoga Mat', 'Resistance Band']);
  const [newEquipmentInput, setNewEquipmentInput] = useState('');
  const [isAddingEquipment, setIsAddingEquipment] = useState(false);

  const [targetMuscles, setTargetMuscles] = useState<string[]>(['Glutes', 'Hamstrings']);
  const [newMuscleInput, setNewMuscleInput] = useState('');
  const [isAddingMuscle, setIsAddingMuscle] = useState(false);

  const [contraindications, setContraindications] = useState<string[]>(['Acute Disc Prolapse']);
  const [newContraInput, setNewContraInput] = useState('');
  const [isAddingContra, setIsAddingContra] = useState(false);

  // Instructions & Precautions
  const [instructions, setInstructions] = useState(
    'Hold a dumbbell or kettlebell vertically against your chest. Stand with feet slightly wider than shoulder-width. Lower into a squat by sending your hips back and knees outward, keeping chest upright. Push through heels to return to standing.'
  );
  const [safetyPrecautions, setSafetyPrecautions] = useState('Avoid if you have active lumbar hernia or acute knee inflammation without prior clinical clearance.');
  const [commonMistakes, setCommonMistakes] = useState('Rounding the lower back during descent, allowing knees to cave inward, looking straight down.');

  // Media State
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80'
  );
  const [galleryImages, setGalleryImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=400&q=80',
  ]);

  // Modal / Feedback state
  const [isFullScreenPreviewOpen, setIsFullScreenPreviewOpen] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);

  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  // Tag Handlers
  const handleRemoveTag = (list: string[], setList: (l: string[]) => void, itemToRemove: string) => {
    setList(list.filter((item) => item !== itemToRemove));
  };

  const handleAddTag = (
    value: string,
    setValue: (val: string) => void,
    list: string[],
    setList: (l: string[]) => void,
    setIsAdding: (b: boolean) => void
  ) => {
    if (value.trim() && !list.includes(value.trim())) {
      setList([...list, value.trim()]);
      setValue('');
      setIsAdding(false);
    }
  };

  // Handle Media File Uploads
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    }
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setThumbnailPreview(url);
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setGalleryImages((prev) => [...prev, url]);
    }
  };

  const handleSave = (isDraft = false) => {
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      if (onSuccess) onSuccess();
      else onBack();
    }, 1200);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {showSavedToast && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center space-x-3 border border-slate-700 animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <div>
            <p className="text-sm font-bold">Exercise Saved Successfully!</p>
            <p className="text-xs text-slate-300">Added to patient library.</p>
          </div>
        </div>
      )}

      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center transition-all shadow-2xs cursor-pointer shrink-0"
            aria-label="Back to Exercise Library"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Create Exercise
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">
              Create a reusable exercise for your patient library with high-fidelity media.
            </p>
          </div>
        </div>

        {/* Top Header Action Buttons */}
        <div className="flex items-center space-x-3 shrink-0 self-end sm:self-auto">
          <button
            onClick={() => handleSave(true)}
            className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl border border-slate-200/80 shadow-2xs transition-all cursor-pointer"
          >
            Save as Draft
          </button>
          <button
            onClick={() => handleSave(false)}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Exercise</span>
          </button>
        </div>
      </div>

      {/* Main Responsive Grid Layout (Left Forms + Right Preview Column) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
        {/* Left Column: Form Sections */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          
          {/* CARD 1: BASIC INFORMATION */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs space-y-6">
            <div className="flex items-center space-x-3 pb-2 border-b border-slate-100/60">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Basic Information</h2>
                <p className="text-xs text-slate-400 font-medium">Core exercise identity and targets</p>
              </div>
            </div>

            {/* Exercise Name */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Exercise Name
              </label>
              <input
                type="text"
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                placeholder="e.g. Weighted Goblet Squat"
                className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Category & Estimated Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Category */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full appearance-none bg-slate-50/80 border border-slate-200/80 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                  >
                    <option value="Strength & Conditioning">Strength & Conditioning</option>
                    <option value="Range of Motion">Range of Motion</option>
                    <option value="Flexibility & Stretching">Flexibility & Stretching</option>
                    <option value="Post-Op Rehabilitation">Post-Op Rehabilitation</option>
                    <option value="Balance & Stability">Balance & Stability</option>
                    <option value="Cardiovascular">Cardiovascular</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                    ▼
                  </div>
                </div>
              </div>

              {/* Estimated Duration */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Estimated Duration
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full px-4 py-3 pr-20 bg-slate-50/80 border border-slate-200/80 rounded-xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <span className="absolute right-4 text-xs font-bold text-slate-400 uppercase tracking-wider pointer-events-none">
                    Minutes
                  </span>
                </div>
              </div>
            </div>

            {/* Difficulty Segmented Slider/Pills */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Difficulty
              </label>
              <div className="bg-slate-100/80 p-1.5 rounded-2xl flex items-center gap-1.5 border border-slate-200/50">
                {(['Beginner', 'Intermediate', 'Advanced'] as const).map((level) => {
                  const isActive = difficulty === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setDifficulty(level)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                        isActive
                          ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                      }`}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Body Area */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Target Body Area
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {targetBodyAreas.map((area) => (
                  <span
                    key={area}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50/80 border border-blue-100/80 rounded-xl text-xs font-bold text-blue-700 shadow-2xs"
                  >
                    <span>{area}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(targetBodyAreas, setTargetBodyAreas, area)}
                      className="text-blue-400 hover:text-blue-700 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}

                {isAddingArea ? (
                  <div className="flex items-center space-x-1.5 bg-white border border-blue-400 rounded-xl px-2.5 py-1 shadow-2xs">
                    <input
                      type="text"
                      autoFocus
                      value={newAreaInput}
                      onChange={(e) => setNewAreaInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddTag(newAreaInput, setNewAreaInput, targetBodyAreas, setTargetBodyAreas, setIsAddingArea);
                        } else if (e.key === 'Escape') {
                          setIsAddingArea(false);
                        }
                      }}
                      placeholder="e.g. Quadriceps"
                      className="text-xs font-bold text-slate-800 focus:outline-hidden w-28"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddTag(newAreaInput, setNewAreaInput, targetBodyAreas, setTargetBodyAreas, setIsAddingArea)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingArea(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAddingArea(true)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 rounded-xl text-xs font-bold text-slate-600 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-slate-500" />
                    <span>Add Area</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* CARD 2: EXERCISE INSTRUCTIONS */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs space-y-6">
            <div className="flex items-center space-x-3 pb-2 border-b border-slate-100/60">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Exercise Instructions</h2>
                <p className="text-xs text-slate-400 font-medium">Detailed patient guidance and technique tips</p>
              </div>
            </div>

            {/* Rich Text Step-by-Step Instructions */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Step-by-Step Instructions
              </label>

              {/* Formatting Toolbar */}
              <div className="border border-slate-200/80 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                <div className="bg-slate-50/80 border-b border-slate-200/80 px-3 py-2 flex items-center space-x-2 text-slate-500">
                  <button
                    type="button"
                    className="p-1.5 hover:bg-slate-200/60 rounded-lg transition-colors font-bold text-slate-700 cursor-pointer"
                    title="Bold"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className="p-1.5 hover:bg-slate-200/60 rounded-lg transition-colors italic text-slate-700 cursor-pointer"
                    title="Italic"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <div className="w-px h-4 bg-slate-300 my-auto" />
                  <button
                    type="button"
                    className="p-1.5 hover:bg-slate-200/60 rounded-lg transition-colors text-slate-700 cursor-pointer"
                    title="Bullet List"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className="p-1.5 hover:bg-slate-200/60 rounded-lg transition-colors text-slate-700 cursor-pointer"
                    title="Link"
                  >
                    <Link2 className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Describe the movements clearly..."
                  className="w-full p-4 bg-white text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden resize-y min-h-[120px]"
                />
              </div>
            </div>

            {/* Side-by-Side Callouts: Safety Precautions & Common Mistakes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Safety Precautions Box */}
              <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-4 space-y-2">
                <div className="flex items-center space-x-2 text-rose-700">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider">Safety Precautions</span>
                </div>
                <textarea
                  rows={3}
                  value={safetyPrecautions}
                  onChange={(e) => setSafetyPrecautions(e.target.value)}
                  placeholder="Avoid if you have..."
                  className="w-full bg-transparent text-xs font-medium text-rose-900 placeholder-rose-400/80 focus:outline-hidden resize-none"
                />
              </div>

              {/* Common Mistakes Box */}
              <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 space-y-2">
                <div className="flex items-center space-x-2 text-indigo-700">
                  <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider">Common Mistakes</span>
                </div>
                <textarea
                  rows={3}
                  value={commonMistakes}
                  onChange={(e) => setCommonMistakes(e.target.value)}
                  placeholder="Rounding the back, looking down..."
                  className="w-full bg-transparent text-xs font-medium text-indigo-900 placeholder-indigo-400/80 focus:outline-hidden resize-none"
                />
              </div>
            </div>
          </div>

          {/* CARD 3: MEDIA ASSETS */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100/60 gap-1">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Media Assets</h2>
                  <p className="text-xs text-slate-400 font-medium">Upload high quality video & imagery</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                Max size: 500MB • 4K Supported
              </span>
            </div>

            {/* Top Dropzones Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Master Video Dropzone (Spans 2 columns on desktop) */}
              <div
                onClick={() => videoFileInputRef.current?.click()}
                className="md:col-span-2 border-2 border-dashed border-blue-200/80 bg-blue-50/30 hover:bg-blue-50/70 rounded-2xl p-6 text-center flex flex-col items-center justify-center transition-all cursor-pointer group min-h-[160px] relative overflow-hidden"
              >
                <input
                  type="file"
                  ref={videoFileInputRef}
                  onChange={handleVideoUpload}
                  accept="video/*"
                  className="hidden"
                />

                {videoPreview ? (
                  <div className="w-full h-full relative group">
                    <video src={videoPreview} className="w-full max-h-[160px] object-cover rounded-xl" controls />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setVideoPreview(null);
                      }}
                      className="absolute top-2 right-2 bg-slate-900/80 text-white p-1.5 rounded-lg text-xs hover:bg-slate-900"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-blue-100/80 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xs">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-900">Master Video (4K)</p>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      Drag and drop or click to upload
                    </p>
                  </>
                )}
              </div>

              {/* Thumbnail Image Dropzone */}
              <div
                onClick={() => thumbnailFileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/60 rounded-2xl p-6 text-center flex flex-col items-center justify-center transition-all cursor-pointer group min-h-[160px] relative overflow-hidden"
              >
                <input
                  type="file"
                  ref={thumbnailFileInputRef}
                  onChange={handleThumbnailUpload}
                  accept="image/*"
                  className="hidden"
                />

                {thumbnailPreview ? (
                  <div className="w-full h-full relative group flex items-center justify-center">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-full max-h-[140px] object-cover rounded-xl"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white text-xs font-bold">
                      Change Thumbnail
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">Thumbnail Image</p>
                  </>
                )}
              </div>
            </div>

            {/* Image Gallery (Additional Angles) */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Image Gallery (Additional Angles)
              </label>

              <div className="flex flex-wrap items-center gap-3">
                {/* Upload Button Box */}
                <button
                  type="button"
                  onClick={() => galleryFileInputRef.current?.click()}
                  className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200/80 bg-slate-50/60 hover:bg-slate-100/60 flex flex-col items-center justify-center text-slate-400 hover:text-slate-600 transition-all cursor-pointer shrink-0"
                >
                  <input
                    type="file"
                    ref={galleryFileInputRef}
                    onChange={handleGalleryUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <ImageIcon className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-bold">+ Add Photo</span>
                </button>

                {/* Gallery Previews */}
                {galleryImages.map((imgUrl, index) => (
                  <div
                    key={index}
                    className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-200/80 relative group shadow-2xs shrink-0"
                  >
                    <img
                      src={imgUrl}
                      alt={`Angle ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setGalleryImages(galleryImages.filter((_, i) => i !== index))
                      }
                      className="absolute top-1 right-1 bg-slate-900/80 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Live Mobile Preview & Classifications */}
        <div className="space-y-6 sm:space-y-8">
          
          {/* PATIENT EXPERIENCE (LIVE PHONE PREVIEW) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                PATIENT EXPERIENCE
              </span>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                Live Preview
              </span>
            </div>

            {/* Smartphone Container Mockup */}
            <div className="mx-auto max-w-[270px] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-4 border-slate-900 relative ring-1 ring-slate-800/80">
              {/* Notch */}
              <div className="w-20 h-4 bg-slate-900 rounded-full mx-auto mb-2 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-slate-950" />
              </div>

              {/* Patient App Screen */}
              <div className="bg-slate-900 text-white rounded-[32px] overflow-hidden p-4 space-y-3 font-sans">
                {/* App Header */}
                <div className="flex items-center justify-between text-slate-400 pb-1">
                  <button className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <button className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Video Media Card */}
                <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-800 flex items-center justify-center group shadow-md">
                  {thumbnailPreview ? (
                    <img
                      src={thumbnailPreview}
                      alt="App preview thumbnail"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-slate-950/30 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/90 text-blue-600 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                      <Play className="w-4 h-4 fill-blue-600 ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-xs font-extrabold text-white leading-snug line-clamp-2">
                    {exerciseName || 'Lower Back Relief: Glute Bridge Flow'}
                  </h3>
                  {/* Meta Pills */}
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                      ⏱ {duration} mins
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                      ⚡ {difficulty}
                    </span>
                  </div>
                </div>

                {/* Skeleton Instruction Lines */}
                <div className="space-y-1.5 pt-1">
                  <div className="h-1.5 bg-slate-800 rounded-full w-full" />
                  <div className="h-1.5 bg-slate-800 rounded-full w-5/6" />
                  <div className="h-1.5 bg-slate-800 rounded-full w-2/3" />
                </div>

                {/* Start Button inside phone */}
                <button
                  type="button"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl text-center shadow-md shadow-blue-500/20 transition-colors"
                >
                  Start Exercise
                </button>
              </div>
            </div>

            <p className="text-xs font-medium text-slate-400 text-center">
              Live preview from Patient App
            </p>
          </div>

          {/* CLASSIFICATION CARD */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-5">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
              CLASSIFICATION
            </span>

            {/* Required Equipment */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Required Equipment
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {requiredEquipment.map((eq) => (
                  <span
                    key={eq}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold"
                  >
                    <span>{eq}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(requiredEquipment, setRequiredEquipment, eq)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {isAddingEquipment ? (
                  <div className="flex items-center space-x-1 bg-white border border-blue-400 rounded-lg px-2 py-0.5 shadow-2xs">
                    <input
                      type="text"
                      autoFocus
                      value={newEquipmentInput}
                      onChange={(e) => setNewEquipmentInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddTag(newEquipmentInput, setNewEquipmentInput, requiredEquipment, setRequiredEquipment, setIsAddingEquipment);
                        } else if (e.key === 'Escape') {
                          setIsAddingEquipment(false);
                        }
                      }}
                      placeholder="e.g. Dumbbell"
                      className="text-xs font-bold text-slate-800 focus:outline-hidden w-20"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddTag(newEquipmentInput, setNewEquipmentInput, requiredEquipment, setRequiredEquipment, setIsAddingEquipment)}
                      className="text-blue-600"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAddingEquipment(true)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    + Add
                  </button>
                )}
              </div>
            </div>

            {/* Target Muscles */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Target Muscles
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {targetMuscles.map((muscle) => (
                  <span
                    key={muscle}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold"
                  >
                    <span>{muscle}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(targetMuscles, setTargetMuscles, muscle)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {isAddingMuscle ? (
                  <div className="flex items-center space-x-1 bg-white border border-blue-400 rounded-lg px-2 py-0.5 shadow-2xs">
                    <input
                      type="text"
                      autoFocus
                      value={newMuscleInput}
                      onChange={(e) => setNewMuscleInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddTag(newMuscleInput, setNewMuscleInput, targetMuscles, setTargetMuscles, setIsAddingMuscle);
                        } else if (e.key === 'Escape') {
                          setIsAddingMuscle(false);
                        }
                      }}
                      placeholder="e.g. Quadriceps"
                      className="text-xs font-bold text-slate-800 focus:outline-hidden w-20"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddTag(newMuscleInput, setNewMuscleInput, targetMuscles, setTargetMuscles, setIsAddingMuscle)}
                      className="text-blue-600"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAddingMuscle(true)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    + Add
                  </button>
                )}
              </div>
            </div>

            {/* Contraindications */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Contraindications
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {contraindications.map((contra) => (
                  <span
                    key={contra}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 bg-rose-50 border border-rose-200/60 text-rose-700 rounded-lg text-xs font-bold"
                  >
                    <span>{contra}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(contraindications, setContraindications, contra)}
                      className="text-rose-400 hover:text-rose-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {isAddingContra ? (
                  <div className="flex items-center space-x-1 bg-white border border-rose-400 rounded-lg px-2 py-0.5 shadow-2xs">
                    <input
                      type="text"
                      autoFocus
                      value={newContraInput}
                      onChange={(e) => setNewContraInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddTag(newContraInput, setNewContraInput, contraindications, setContraindications, setIsAddingContra);
                        } else if (e.key === 'Escape') {
                          setIsAddingContra(false);
                        }
                      }}
                      placeholder="e.g. Hernia"
                      className="text-xs font-bold text-slate-800 focus:outline-hidden w-20"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddTag(newContraInput, setNewContraInput, contraindications, setContraindications, setIsAddingContra)}
                      className="text-rose-600"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAddingContra(true)}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    + Add
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ACTIONS CARD */}
          <div className="bg-white rounded-3xl p-3 border border-slate-100 shadow-xs space-y-1">
            <button
              type="button"
              onClick={() => setIsFullScreenPreviewOpen(true)}
              className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer text-xs font-bold text-slate-700"
            >
              <div className="flex items-center space-x-3">
                <Maximize2 className="w-4 h-4 text-slate-400" />
                <span>Full Screen Preview</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => {
                setExerciseName((prev) => `${prev} (Copy)`);
                setShowSavedToast(true);
                setTimeout(() => setShowSavedToast(false), 2000);
              }}
              className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer text-xs font-bold text-slate-700"
            >
              <div className="flex items-center space-x-3">
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Duplicate Exercise</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => {
                if (confirm('Are you sure you want to archive this exercise?')) {
                  onBack();
                }
              }}
              className="w-full flex items-center justify-between p-3 hover:bg-rose-50/60 rounded-2xl transition-colors cursor-pointer text-xs font-bold text-rose-600"
            >
              <div className="flex items-center space-x-3">
                <Archive className="w-4 h-4 text-rose-500" />
                <span>Archive & Deprecate</span>
              </div>
              <Trash2 className="w-4 h-4 text-rose-500" />
            </button>
          </div>

        </div>
      </div>

      {/* FULL SCREEN PREVIEW MODAL */}
      {isFullScreenPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 rounded-3xl max-w-sm w-full p-6 text-white space-y-4 border border-slate-800 shadow-2xl relative">
            <button
              onClick={() => setIsFullScreenPreviewOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider text-center">
              Full Screen Patient App Preview
            </h3>

            <div className="rounded-2xl overflow-hidden aspect-video bg-slate-900 relative">
              {thumbnailPreview && (
                <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-slate-950/30 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-xl">
                  <Play className="w-5 h-5 fill-blue-600 ml-0.5" />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-base font-extrabold text-white">{exerciseName}</h2>
              <p className="text-xs text-slate-400 mt-1">{instructions}</p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <span className="text-xs font-bold text-blue-400 bg-blue-950 px-2.5 py-1 rounded-lg border border-blue-800">
                {category}
              </span>
              <span className="text-xs font-bold text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg">
                ⏱ {duration} mins
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateExercisePage;
