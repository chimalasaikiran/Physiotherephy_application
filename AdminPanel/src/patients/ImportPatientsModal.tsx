import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, Check, Download, AlertCircle } from 'lucide-react';

interface ImportPatientsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (count: number) => void;
}

export const ImportPatientsModal: React.FC<ImportPatientsModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

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

  const handleProcessImport = () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setIsComplete(true);
      setTimeout(() => {
        onImportSuccess(12);
        setIsComplete(false);
        setSelectedFile(null);
        onClose();
      }, 1200);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Import Patients</h3>
              <p className="text-xs text-slate-500 font-medium">Batch upload patient records via CSV / Excel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Download Sample Template */}
          <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Download className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="text-xs font-bold text-blue-900">Need standard format?</h4>
                <p className="text-[11px] text-blue-700">Download sample CSV template with required fields</p>
              </div>
            </div>
            <button
              onClick={() => alert('Downloading sample_patients_template.csv')}
              className="px-3 py-1.5 bg-white text-blue-600 border border-blue-200 rounded-xl text-xs font-bold shadow-2xs hover:bg-blue-50 transition-colors"
            >
              Template
            </button>
          </div>

          {/* Drag and Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-200 flex flex-col items-center justify-center relative ${
              dragActive
                ? 'border-blue-500 bg-blue-50/50 scale-[0.99]'
                : selectedFile
                ? 'border-emerald-400 bg-emerald-50/30'
                : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
            }`}
          >
            {isComplete ? (
              <div className="py-4 space-y-2 text-emerald-600">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="text-base font-bold">Import Successful!</h4>
                <p className="text-xs text-slate-500">12 new patient records added.</p>
              </div>
            ) : isUploading ? (
              <div className="py-6 space-y-3">
                <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm font-bold text-slate-800">Processing file & validating fields...</p>
              </div>
            ) : selectedFile ? (
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto font-bold">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{selectedFile.name}</p>
                  <p className="text-xs text-slate-400 font-medium">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Ready to import
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-xs font-semibold text-rose-500 hover:underline"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-800">
                  Drag and drop your file here, or{' '}
                  <label className="text-blue-600 hover:underline cursor-pointer">
                    browse
                    <input
                      type="file"
                      accept=".csv, .xlsx, .xls"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </p>
                <p className="text-xs text-slate-400 mt-1 font-medium">Supports CSV, XLS, XLSX up to 10MB</p>
              </>
            )}
          </div>

          <div className="flex items-center space-x-2 text-slate-400 text-xs">
            <AlertCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>Ensure Patient ID, Name, Condition, and Contact details exist in column headers.</span>
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={!selectedFile || isUploading}
              onClick={handleProcessImport}
              className={`px-6 py-2.5 text-sm font-bold rounded-xl shadow-md transition-all ${
                selectedFile && !isUploading
                  ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer hover:shadow-lg'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Start Import
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
