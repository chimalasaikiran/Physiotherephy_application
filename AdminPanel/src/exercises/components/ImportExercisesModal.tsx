import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2 } from 'lucide-react';

interface ImportExercisesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (count: number) => void;
}

export const ImportExercisesModal: React.FC<ImportExercisesModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleStartImport = () => {
    setIsImporting(true);
    setTimeout(() => {
      setIsImporting(false);
      setIsSuccess(true);
      setTimeout(() => {
        onImportComplete(5);
        onClose();
        setIsSuccess(false);
        setSelectedFile(null);
      }, 1000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Import Exercises</h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Upload CSV or JSON file to batch import exercise routines.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dropzone Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
            dragActive
              ? 'border-blue-500 bg-blue-50/50'
              : selectedFile
              ? 'border-emerald-300 bg-emerald-50/30'
              : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          {isSuccess ? (
            <div className="space-y-2 py-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
              <h4 className="text-base font-bold text-slate-900">Import Successful!</h4>
              <p className="text-xs text-slate-500">5 new exercises added to library.</p>
            </div>
          ) : selectedFile ? (
            <div className="space-y-3 py-2">
              <FileText className="w-10 h-10 text-blue-600 mx-auto" />
              <div>
                <p className="text-sm font-bold text-slate-900">{selectedFile.name}</p>
                <p className="text-xs text-slate-400">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-xs font-semibold text-rose-500 hover:underline"
              >
                Remove File
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Drag and drop your file here, or{' '}
                  <label className="text-blue-600 hover:underline cursor-pointer">
                    browse
                    <input
                      type="file"
                      accept=".csv, .json"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </p>
                <p className="text-xs text-slate-400 mt-1">Supports CSV, JSON (max 10MB)</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedFile || isImporting || isSuccess}
            onClick={handleStartImport}
            className={`px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-all ${
              !selectedFile || isImporting || isSuccess
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20'
            }`}
          >
            {isImporting ? 'Importing...' : 'Start Import'}
          </button>
        </div>
      </div>
    </div>
  );
};
