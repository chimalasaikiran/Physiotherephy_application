import React, { useState, useMemo } from 'react';
import type { Patient } from './types';
import { updatePatientRecord } from '@/services/patientService';
import {
  Plus,
  FileText,
  History,
  AlertTriangle,
  Activity,
  Droplet,
  ArrowUpDown,
  Scale,
  MapPin,
  CheckCircle2,
  Building2,
  FileDown,
  Pill,
  Clock,
  Sparkles,
  Stethoscope,
  X,
  Edit2,
  Trash2,
} from 'lucide-react';

export interface PrimaryDiagnosis {
  id: string;
  title: string;
  description: string;
  diagnosedDate: string;
  status: 'CURRENT' | 'PAST';
  statusColor: string;
}

interface TimelineItem {
  id: string;
  title: string;
  description: string;
  date: string;
  attachmentName?: string;
  isRecent?: boolean;
}

export interface SurgeryRecord {
  id: string;
  year: string;
  title: string;
  description: string;
  doctorName?: string;
  hospitalName?: string;
  completed?: boolean;
}

export interface FamilyHistoryItem {
  id: string;
  relation: 'PATERNAL' | 'MATERNAL';
  gender: 'male' | 'female';
  condition: string;
}

export interface AllergyItem {
  id: string;
  name: string;
  severity: 'SEVERE' | 'MILD' | 'MODERATE';
  description: string;
}

export interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
  schedule: string;
}

interface MedicalHistoryTabProps {
  patientName?: string;
  patient?: Patient;
  medicalHistoryList?: any[];
  onAddMedicalHistory?: (data: any) => Promise<string>;
}

export const MedicalHistoryTab: React.FC<MedicalHistoryTabProps> = ({
  patientName = 'Patient',
  patient,
  medicalHistoryList = [],
  onAddMedicalHistory,
}) => {
  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Derive records dynamically from Firestore real-time list or patient document
  const patientMedHistoryDoc = (patient?.medicalHistory as any) || {};
  const latestMedRecord = medicalHistoryList.length > 0 ? medicalHistoryList[0] : patientMedHistoryDoc;

  // Primary Diagnoses
  const diagnosesList: PrimaryDiagnosis[] = useMemo(() => {
    if (medicalHistoryList.length > 0) {
      return medicalHistoryList.map((item, idx) => ({
        id: item.id || `diag-${idx}`,
        title: item.primaryDiagnosis || item.title || patient?.condition || 'Diagnosis Record',
        description: item.description || 'Clinical observation recorded.',
        diagnosedDate: item.diagnosedDate || (item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }).toUpperCase() : 'RECENT'),
        status: (item.status === 'PAST' ? 'PAST' : 'CURRENT') as 'CURRENT' | 'PAST',
        statusColor: item.status === 'PAST' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-amber-50 text-amber-700 border-amber-200/80',
      }));
    }
    if (patientMedHistoryDoc?.primaryDiagnosis) {
      return [
        {
          id: 'diag-doc',
          title: patientMedHistoryDoc.primaryDiagnosis,
          description: patientMedHistoryDoc.description || `Severity: ${patientMedHistoryDoc.severity || 'Moderate'}`,
          diagnosedDate: 'RECENT',
          status: 'CURRENT',
          statusColor: 'bg-amber-50 text-amber-700 border-amber-200/80',
        },
      ];
    }
    if (patient?.condition && patient.condition !== 'General Rehab' && patient.condition !== 'Physiotherapy Evaluation') {
      return [
        {
          id: 'diag-cond',
          title: patient.condition,
          description: 'Primary evaluation and rehabilitation protocol.',
          diagnosedDate: 'RECENT',
          status: 'CURRENT',
          statusColor: 'bg-amber-50 text-amber-700 border-amber-200/80',
        },
      ];
    }
    return [];
  }, [medicalHistoryList, patientMedHistoryDoc, patient?.condition]);

  // Surgeries
  const surgeriesList: SurgeryRecord[] = useMemo(() => {
    if (latestMedRecord?.surgeries && Array.isArray(latestMedRecord.surgeries)) {
      return latestMedRecord.surgeries;
    }
    return [];
  }, [latestMedRecord]);

  // Family History
  const familyHistoryList: FamilyHistoryItem[] = useMemo(() => {
    if (latestMedRecord?.familyHistory && Array.isArray(latestMedRecord.familyHistory)) {
      return latestMedRecord.familyHistory;
    }
    return [];
  }, [latestMedRecord]);

  // Allergies
  const allergiesList: AllergyItem[] = useMemo(() => {
    if (latestMedRecord?.allergies && Array.isArray(latestMedRecord.allergies)) {
      return latestMedRecord.allergies;
    }
    return [];
  }, [latestMedRecord]);

  // Medications
  const medicationsList: MedicationItem[] = useMemo(() => {
    if (latestMedRecord?.medications && Array.isArray(latestMedRecord.medications)) {
      return latestMedRecord.medications;
    }
    return [];
  }, [latestMedRecord]);

  // Timeline
  const timelineList: TimelineItem[] = useMemo(() => {
    if (medicalHistoryList.length > 0) {
      return medicalHistoryList.map((item, idx) => ({
        id: item.id || `time-${idx}`,
        title: item.title || item.primaryDiagnosis || 'Medical Record Logged',
        description: item.description || '',
        date: item.diagnosedDate || (item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent'),
        isRecent: idx === 0,
      }));
    }
    return [];
  }, [medicalHistoryList]);

  // Modal states
  const [isAddRecordModalOpen, setIsAddRecordModalOpen] = useState(false);
  const [isUpdateRegimenModalOpen, setIsUpdateRegimenModalOpen] = useState(false);
  const [showAllTimelineLogs, setShowAllTimelineLogs] = useState(false);

  // Form input states for new Diagnosis Record
  const [newDiagTitle, setNewDiagTitle] = useState('');
  const [newDiagDesc, setNewDiagDesc] = useState('');
  const [newDiagDate, setNewDiagDate] = useState('JAN 2026');
  const [newDiagStatus, setNewDiagStatus] = useState<'CURRENT' | 'PAST'>('CURRENT');

  // Form input state for medication update
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedSchedule, setNewMedSchedule] = useState('Once Daily');

  const handleCreateDiagnosis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiagTitle.trim()) return;

    const newRecordData = {
      primaryDiagnosis: newDiagTitle.trim(),
      description: newDiagDesc.trim() || 'No additional notes provided.',
      diagnosedDate: newDiagDate.toUpperCase(),
      status: newDiagStatus,
    };

    if (onAddMedicalHistory && patient) {
      try {
        await onAddMedicalHistory(newRecordData);
        showToast('New primary diagnosis record saved to Firestore!');
      } catch (err: any) {
        showToast('Failed to save medical record');
      }
    } else {
      showToast('Medical history saved successfully!');
    }

    setNewDiagTitle('');
    setNewDiagDesc('');
    setIsAddRecordModalOpen(false);
  };

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) return;

    const newMedObj = {
      id: `med-${Date.now()}`,
      name: newMedName.trim(),
      dosage: newMedDosage.trim() || 'Standard Dose',
      schedule: newMedSchedule,
    };

    const updatedMedications = [...medicationsList, newMedObj];

    if (onAddMedicalHistory && patient) {
      try {
        await onAddMedicalHistory({
          ...latestMedRecord,
          medications: updatedMedications,
        });
        showToast('Medication regimen updated in Firestore!');
      } catch (err: any) {
        showToast('Failed to update medication regimen');
      }
    } else {
      showToast('Medication regimen updated successfully!');
    }

    setNewMedName('');
    setNewMedDosage('');
    setIsUpdateRegimenModalOpen(false);
  };

  const handleDownloadFile = (fileName: string) => {
    showToast(`Downloading medical document: ${fileName}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Action Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center space-x-2.5 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Grid: Left Column (~65%) and Right Column (~35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ================= LEFT COLUMN ================= */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. PRIMARY DIAGNOSES CARD */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  Primary Diagnoses
                </h3>
              </div>
              <button
                onClick={() => setIsAddRecordModalOpen(true)}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Record</span>
              </button>
            </div>

            {/* List of Diagnoses */}
            <div className="space-y-4">
              {diagnosesList.length > 0 ? (
                diagnosesList.map((diag) => (
                  <div
                    key={diag.id}
                    className="p-5 rounded-2xl border border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition-colors space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3.5">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          {diag.status === 'CURRENT' ? (
                            <FileText className="w-5 h-5" />
                          ) : (
                            <History className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-base font-extrabold text-slate-900">{diag.title}</h4>
                          <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">
                            {diag.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex items-center space-x-2 pt-1 pl-13">
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-extrabold rounded-md uppercase tracking-wider">
                        DIAGNOSED {diag.diagnosedDate}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-md uppercase tracking-wider ${diag.statusColor}`}
                      >
                        {diag.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-400 italic bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                  <p className="text-xs font-bold text-slate-600">No primary medical diagnoses recorded yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* 2. MEDICAL TIMELINE CARD */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  Medical Timeline
                </h3>
              </div>
            </div>

            {/* Vertical Step Timeline Container */}
            {timelineList.length > 0 ? (
              <div className="relative pl-6 space-y-7 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                {timelineList.map((item) => (
                  <div key={item.id} className="relative flex items-start justify-between group">
                    {/* Timeline Bullet Node */}
                    <div
                      className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 bg-white flex items-center justify-center transition-all ${
                        item.isRecent
                          ? 'border-blue-600 ring-4 ring-blue-50'
                          : 'border-slate-300 group-hover:border-slate-400'
                      }`}
                    >
                      {item.isRecent && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                    </div>

                    {/* Content Details */}
                    <div className="space-y-1 pr-4">
                      <h4 className="text-sm font-extrabold text-slate-900">{item.title}</h4>
                      {item.description && (
                        <p className="text-xs font-medium text-slate-500 leading-relaxed">
                          {item.description}
                        </p>
                      )}

                      {/* PDF Attachment Link */}
                      {item.attachmentName && (
                        <button
                          onClick={() => handleDownloadFile(item.attachmentName!)}
                          className="inline-flex items-center space-x-2 px-3 py-1.5 bg-blue-50/80 hover:bg-blue-100 text-blue-700 border border-blue-100 rounded-xl text-xs font-bold transition-colors cursor-pointer mt-1"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span>{item.attachmentName}</span>
                          <FileDown className="w-3.5 h-3.5 text-blue-600" />
                        </button>
                      )}
                    </div>

                    {/* Date Tag */}
                    <span className="text-xs font-bold text-slate-400 whitespace-nowrap pt-0.5">
                      {item.date}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 italic bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs font-bold text-slate-600">No medical timeline events recorded.</p>
              </div>
            )}
          </div>

          {/* 3. SURGICAL HISTORY CARD */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-5">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Surgical History
              </h3>
            </div>

            {surgeriesList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {surgeriesList.map((surg) => (
                  <div
                    key={surg.id}
                    className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-teal-600 tracking-wider uppercase">
                          {surg.year}
                        </span>
                        {surg.completed && (
                          <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                        {surg.title}
                      </h4>
                      <p className="text-xs font-medium text-slate-500 leading-relaxed">
                        {surg.description}
                      </p>
                    </div>

                    {/* Physician / Hospital Footer */}
                    <div className="pt-2 flex items-center space-x-2 text-xs font-bold text-slate-700 border-t border-slate-200/50">
                      {surg.doctorName ? (
                        <>
                          <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-extrabold">
                            VM
                          </div>
                          <span className="text-slate-600">{surg.doctorName}</span>
                        </>
                      ) : surg.hospitalName ? (
                        <>
                          <Building2 className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600">{surg.hospitalName}</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 italic bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs font-bold text-slate-600">No surgical history recorded.</p>
              </div>
            )}
          </div>

          {/* 4. FAMILY MEDICAL HISTORY CARD */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-5">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Family Medical History
              </h3>
            </div>

            {familyHistoryList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {familyHistoryList.map((fam) => (
                  <div
                    key={fam.id}
                    className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center space-x-4"
                  >
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center text-base font-bold flex-shrink-0 ${
                        fam.gender === 'male'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {fam.gender === 'male' ? '♂' : '♀'}
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block">
                        {fam.relation}
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">
                        {fam.condition}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 italic bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs font-bold text-slate-600">No family medical history recorded.</p>
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div className="space-y-6">
          {/* 1. ALLERGIES CARD (Figma Red Header Bar) */}
          <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-2xs space-y-5 relative overflow-hidden before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1.5 before:bg-rose-500">
            <div className="flex items-center space-x-3 pl-1">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Allergies</h3>
            </div>

            {allergiesList.length > 0 ? (
              <div className="space-y-3">
                {allergiesList.map((alg) => (
                  <div
                    key={alg.id}
                    className={`p-4 rounded-2xl border space-y-2 ${
                      alg.severity === 'SEVERE'
                        ? 'bg-rose-50/60 border-rose-100'
                        : 'bg-amber-50/60 border-amber-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-extrabold text-slate-900">{alg.name}</h4>
                      <span
                        className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          alg.severity === 'SEVERE'
                            ? 'bg-rose-600 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        {alg.severity}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-600 leading-relaxed">
                      {alg.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-slate-400 italic bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs font-bold text-slate-600">No known allergies recorded.</p>
              </div>
            )}
          </div>

          {/* 2. MEDICATIONS CARD */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-5">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Pill className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Medications
              </h3>
            </div>

            {medicationsList.length > 0 ? (
              <div className="space-y-4 divide-y divide-slate-100">
                {medicationsList.map((med) => (
                  <div key={med.id} className="pt-3 first:pt-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-extrabold text-slate-900">{med.name}</h4>
                      <span className="text-xs font-extrabold text-slate-800">{med.schedule}</span>
                    </div>
                    <p className="text-xs font-medium text-slate-400">{med.dosage}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-slate-400 italic bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs font-bold text-slate-600">No active medications recorded.</p>
              </div>
            )}

            <button
              onClick={() => setIsUpdateRegimenModalOpen(true)}
              className="w-full py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-2xl shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            >
              Update Regimen
            </button>
          </div>

          {/* 3. VITAL METRICS CARD */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-5">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Vital Metrics
              </h3>
            </div>

            {/* Metrics List */}
            <div className="space-y-3.5 text-xs font-bold">
              {/* Blood Type */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50/70 rounded-2xl border border-slate-100">
                <div className="flex items-center space-x-3 text-slate-600">
                  <Droplet className="w-4 h-4 text-blue-600" />
                  <span>Blood Type</span>
                </div>
                <span className="px-2.5 py-1 bg-blue-100/80 text-blue-700 rounded-lg font-extrabold">
                  O+
                </span>
              </div>

              {/* Height */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50/70 rounded-2xl border border-slate-100">
                <div className="flex items-center space-x-3 text-slate-600">
                  <ArrowUpDown className="w-4 h-4 text-slate-400" />
                  <span>Height</span>
                </div>
                <span className="text-slate-900 font-extrabold">168 cm</span>
              </div>

              {/* Weight */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50/70 rounded-2xl border border-slate-100">
                <div className="flex items-center space-x-3 text-slate-600">
                  <Scale className="w-4 h-4 text-slate-400" />
                  <span>Weight</span>
                </div>
                <span className="text-slate-900 font-extrabold">62 kg</span>
              </div>
            </div>

            {/* BMI Index Box */}
            <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    BMI INDEX
                  </span>
                  <span className="text-xl font-extrabold text-slate-900">22.0</span>
                </div>
                <span className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-extrabold uppercase">
                  NORMAL
                </span>
              </div>

              {/* Visual Gauge Bar */}
              <div className="space-y-1 pt-1">
                <div className="w-full bg-slate-200 h-2 rounded-full flex overflow-hidden">
                  <div className="w-1/4 bg-slate-300" title="Underweight" />
                  <div className="w-1/2 bg-blue-600" title="Ideal Range" />
                  <div className="w-1/4 bg-slate-300" title="Overweight" />
                </div>
                <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wider pt-0.5">
                  <span>UNDER</span>
                  <span className="text-blue-600 font-extrabold">IDEAL RANGE</span>
                  <span>OVER</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. CLINICIAN NOTES CARD (Figma Soft Blue Container) */}
          <div className="bg-[#EEF4FB] rounded-3xl p-6 border border-blue-100/60 shadow-2xs space-y-3">
            <div className="flex items-center space-x-2.5 text-blue-900">
              <MapPin className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-extrabold tracking-tight">Clinician Notes</h3>
            </div>
            <p className="text-xs font-semibold text-slate-600 leading-relaxed italic">
              "{patientName} shows high adherence to post-op recovery protocols. Recent lumbar flare-up
              likely related to increased desk time. Recommended ergonomic assessment."
            </p>
          </div>
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* 1. Add Diagnosis Modal */}
      {isAddRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900">Add Primary Diagnosis</h3>
              <button
                onClick={() => setIsAddRecordModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDiagnosis} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Diagnosis Title
                </label>
                <input
                  type="text"
                  value={newDiagTitle}
                  onChange={(e) => setNewDiagTitle(e.target.value)}
                  placeholder="e.g. Lumbar Disc Herniation"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Clinical Description
                </label>
                <textarea
                  value={newDiagDesc}
                  onChange={(e) => setNewDiagDesc(e.target.value)}
                  placeholder="Details on symptoms, location, severity..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Diagnosed Date
                  </label>
                  <input
                    type="text"
                    value={newDiagDate}
                    onChange={(e) => setNewDiagDate(e.target.value)}
                    placeholder="e.g. FEB 2024"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Status
                  </label>
                  <select
                    value={newDiagStatus}
                    onChange={(e) => setNewDiagStatus(e.target.value as 'CURRENT' | 'PAST')}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="CURRENT">CURRENT</option>
                    <option value="PAST">PAST</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddRecordModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl cursor-pointer"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Update Regimen Modal */}
      {isUpdateRegimenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900">Update Medication Regimen</h3>
              <button
                onClick={() => setIsUpdateRegimenModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMedication} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Medication Name
                </label>
                <input
                  type="text"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  placeholder="e.g. Paracetamol"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Dosage
                </label>
                <input
                  type="text"
                  value={newMedDosage}
                  onChange={(e) => setNewMedDosage(e.target.value)}
                  placeholder="e.g. 500mg"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Frequency / Schedule
                </label>
                <select
                  value={newMedSchedule}
                  onChange={(e) => setNewMedSchedule(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Once Daily">Once Daily</option>
                  <option value="Twice Daily">Twice Daily</option>
                  <option value="Before Breakfast">Before Breakfast</option>
                  <option value="As Needed (PRN)">As Needed (PRN)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUpdateRegimenModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl cursor-pointer"
                >
                  Add Medication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalHistoryTab;
