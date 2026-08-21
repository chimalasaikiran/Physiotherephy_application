import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  collection,
  onSnapshot,
  query,
  where,
  addDoc,
  doc,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/auth/config/firebase';
import type { Patient, PatientReport } from './types';
import type { ProgramAssignment } from '@/programs/types';
import type { PaymentRecord, InvoiceDocument } from '@/payments/types';
import { mapDocToAssignment, assignPatientToProgram } from '@/services/programService';
import { mapDocToPayment, mapDocToInvoice } from '@/services/paymentService';
import {
  subscribeToPatientActivityLogs,
  subscribeToPatientProgress,
  subscribeToPatientMedicalHistory,
  subscribeToPatientNotes,
  saveClinicalNote,
  deleteClinicalNote,
  saveMedicalHistoryRecord,
  addProgressRecord,
  addPatientActivityLog,
} from '@/services/patientService';

export interface PatientReportItem extends PatientReport {
  name?: string;
  category: 'Assessment' | 'Imaging' | 'Progress' | 'Lab Results' | 'Summary';
  status: 'VERIFIED' | 'PENDING' | 'ARCHIVED';
  typeIcon?: 'teal' | 'purple' | 'blue' | 'amber';
  summaryText?: string;
  fileUrl?: string;
  createdAt?: string;
  patientId: string;
}

export function usePatientProfileData(patient: Patient) {
  const patientId = patient.id;

  // Real-time state arrays
  const [assignedPrograms, setAssignedPrograms] = useState<ProgramAssignment[]>([]);
  const [reports, setReports] = useState<PatientReportItem[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [invoices, setInvoices] = useState<InvoiceDocument[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [progressRecords, setProgressRecords] = useState<any[]>([]);
  const [medicalHistoryList, setMedicalHistoryList] = useState<any[]>([]);
  const [clinicalNotesList, setClinicalNotesList] = useState<any[]>([]);
  const [patientDocData, setPatientDocData] = useState<Partial<Patient>>({});

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Listen to real-time doc updates for this patient in 'users' (primary central record) & legacy 'patient details'
  useEffect(() => {
    if (!patientId) return;

    const usersRef = doc(db, 'users', patientId);
    const unsubUsers = onSnapshot(
      usersRef,
      (snap) => {
        if (snap.exists()) {
          const uData = snap.data();
          setPatientDocData((prev) => ({
            ...prev,
            ...uData,
            name: uData.fullName || uData.name || prev.name || patient.name,
            phone: uData.phone || prev.phone || '',
            email: uData.email || prev.email || '',
            medicalHistory: uData.medicalHistory || prev.medicalHistory || undefined,
          }));
        }
      },
      (err) => console.warn('Users single doc listener error:', err)
    );

    const detailsRef = doc(db, 'patient details', patientId);
    const unsubDetails = onSnapshot(
      detailsRef,
      (snap) => {
        if (snap.exists()) {
          setPatientDocData((prev) => ({ ...snap.data() as Partial<Patient>, ...prev }));
        }
      },
      (err) => console.warn('Patient details single doc listener error:', err)
    );

    return () => {
      unsubUsers();
      unsubDetails();
    };
  }, [patientId, patient.name]);

  // 2. Listen to real-time assigned programs for this patient (by userId / patientId)
  useEffect(() => {
    if (!patientId) return;

    let programsByUser: ProgramAssignment[] = [];
    let programsByPatient: ProgramAssignment[] = [];

    const emitPrograms = () => {
      const map = new Map<string, ProgramAssignment>();
      [...programsByUser, ...programsByPatient].forEach((item) => {
        if (!item.isArchived) map.set(item.id, item);
      });
      setAssignedPrograms(Array.from(map.values()));
      setIsLoading(false);
    };

    try {
      const colRef = collection(db, 'programAssignments');
      const qUser = query(colRef, where('userId', '==', patientId));
      const qPatient = query(colRef, where('patientId', '==', patientId));

      const unsubUser = onSnapshot(
        qUser,
        (snap) => {
          programsByUser = snap.docs.map((d) => mapDocToAssignment(d.id, d.data()));
          emitPrograms();
        },
        (err) => console.warn('ProgramAssignments by userId error:', err)
      );

      const unsubPatient = onSnapshot(
        qPatient,
        (snap) => {
          programsByPatient = snap.docs.map((d) => mapDocToAssignment(d.id, d.data()));
          emitPrograms();
        },
        (err) => console.warn('ProgramAssignments by patientId error:', err)
      );

      return () => {
        unsubUser();
        unsubPatient();
      };
    } catch (err: any) {
      console.error('Failed to subscribe to patient program assignments:', err);
      setIsLoading(false);
    }
  }, [patientId]);

  // 3. Listen to real-time reports strictly isolated by userId / patientId
  useEffect(() => {
    if (!patientId) return;

    let reportsByUser: PatientReportItem[] = [];
    let reportsByPatient: PatientReportItem[] = [];

    const emitReports = () => {
      const map = new Map<string, PatientReportItem>();
      [...reportsByUser, ...reportsByPatient].forEach((item) => map.set(item.id, item));
      const list = Array.from(map.values());
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setReports(list);
    };

    const mapReportDoc = (d: any): PatientReportItem => {
      const data = d.data();
      return {
        id: d.id,
        patientId: data.userId || data.patientId || patientId,
        title: data.title || data.name || 'Clinical Document',
        name: data.name || data.title || 'Clinical Document',
        category: data.category || 'Assessment',
        date: data.date || (data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Today'),
        size: data.size || '1.2 MB',
        status: data.status || 'VERIFIED',
        typeIcon: data.typeIcon || 'teal',
        summaryText: data.summaryText || '',
        fileUrl: data.fileUrl || '',
        type: data.type || 'pdf',
        createdAt: data.createdAt,
      };
    };

    try {
      const colRef = collection(db, 'reports');
      const qUser = query(colRef, where('userId', '==', patientId));
      const qPatient = query(colRef, where('patientId', '==', patientId));

      const unsubUser = onSnapshot(
        qUser,
        (snap) => {
          reportsByUser = snap.docs.map(mapReportDoc);
          emitReports();
        },
        (err) => console.warn('Reports by userId error:', err)
      );

      const unsubPatient = onSnapshot(
        qPatient,
        (snap) => {
          reportsByPatient = snap.docs.map(mapReportDoc);
          emitReports();
        },
        (err) => console.warn('Reports by patientId error:', err)
      );

      return () => {
        unsubUser();
        unsubPatient();
      };
    } catch (err) {
      console.error('Failed to subscribe to patient reports:', err);
    }
  }, [patientId]);

  // 4. Listen to real-time payments & invoices for this patient (by userId / patientId)
  useEffect(() => {
    if (!patientId) return;

    let payUser: PaymentRecord[] = [];
    let payPatient: PaymentRecord[] = [];

    const emitPay = () => {
      const map = new Map<string, PaymentRecord>();
      [...payUser, ...payPatient].forEach((item) => map.set(item.id, item));
      setPayments(Array.from(map.values()));
    };

    try {
      const payColRef = collection(db, 'payments');
      const qPayUser = query(payColRef, where('userId', '==', patientId));
      const qPayPatient = query(payColRef, where('patientId', '==', patientId));

      const unsubPayUser = onSnapshot(
        qPayUser,
        (snap) => {
          payUser = snap.docs.map((d) => mapDocToPayment(d.id, d.data()));
          emitPay();
        },
        (err) => console.warn('Payments snapshot by userId error:', err)
      );

      const unsubPayPatient = onSnapshot(
        qPayPatient,
        (snap) => {
          payPatient = snap.docs.map((d) => mapDocToPayment(d.id, d.data()));
          emitPay();
        },
        (err) => console.warn('Payments snapshot by patientId error:', err)
      );

      // Invoices listener
      const invColRef = collection(db, 'invoices');
      const qInv = query(invColRef, where('patientId', '==', patientId));

      const unsubInv = onSnapshot(
        qInv,
        (snap) => {
          const list = snap.docs.map((d) => mapDocToInvoice(d.id, d.data()));
          setInvoices(list);
        },
        (err) => console.warn('Invoices snapshot error:', err)
      );

      return () => {
        unsubPayUser();
        unsubPayPatient();
        unsubInv();
      };
    } catch (err) {
      console.error('Failed to subscribe to patient payments/invoices:', err);
    }
  }, [patientId]);

  // 5. Listen to real-time appointments for this patient (by userId / patientId)
  useEffect(() => {
    if (!patientId) return;

    let apptUser: any[] = [];
    let apptPatient: any[] = [];

    const emitAppt = () => {
      const map = new Map<string, any>();
      [...apptUser, ...apptPatient].forEach((item) => map.set(item.id, item));
      setAppointments(Array.from(map.values()));
    };

    try {
      const apptColRef = collection(db, 'appointments');
      const qApptUser = query(apptColRef, where('userId', '==', patientId));
      const qApptPatient = query(apptColRef, where('patientId', '==', patientId));

      const unsubUser = onSnapshot(
        qApptUser,
        (snap) => {
          apptUser = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          emitAppt();
        },
        (err) => console.warn('Appointments snapshot by userId error:', err)
      );

      const unsubPatient = onSnapshot(
        qApptPatient,
        (snap) => {
          apptPatient = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          emitAppt();
        },
        (err) => console.warn('Appointments snapshot by patientId error:', err)
      );

      return () => {
        unsubUser();
        unsubPatient();
      };
    } catch (err) {
      console.error('Failed to subscribe to patient appointments:', err);
    }
  }, [patientId]);

  // 6. Listen to patient activity logs, progress, medical history, clinical notes
  useEffect(() => {
    if (!patientId) return;

    const unsubLogs = subscribeToPatientActivityLogs(patientId, setActivityLogs);
    const unsubProgress = subscribeToPatientProgress(patientId, setProgressRecords);
    const unsubHistory = subscribeToPatientMedicalHistory(patientId, setMedicalHistoryList);
    const unsubNotes = subscribeToPatientNotes(patientId, setClinicalNotesList);

    return () => {
      unsubLogs();
      unsubProgress();
      unsubHistory();
      unsubNotes();
    };
  }, [patientId]);

  // Action Helpers

  /**
   * Upload and associate a report document with this patient in Firestore
   */
  const uploadReport = useCallback(
    async (fileData: {
      name: string;
      category: 'Assessment' | 'Imaging' | 'Progress' | 'Lab Results' | 'Summary';
      size: string;
      summaryText?: string;
      fileUrl?: string;
      status?: 'VERIFIED' | 'PENDING';
      typeIcon?: 'teal' | 'purple' | 'blue' | 'amber';
    }) => {
      const now = new Date().toISOString();
      const colRef = collection(db, 'reports');
      const docRef = await addDoc(colRef, {
        userId: patientId,
        patientId,
        patientName: patient.name,
        name: fileData.name,
        title: fileData.name,
        category: fileData.category,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        size: fileData.size,
        status: fileData.status || 'PENDING',
        typeIcon: fileData.typeIcon || 'teal',
        summaryText: fileData.summaryText || `Uploaded clinical document for ${patient.name}.`,
        fileUrl: fileData.fileUrl || '',
        type: 'pdf',
        createdAt: now,
        updatedAt: now,
      });

      await addPatientActivityLog(patientId, {
        action: 'Report created',
        description: `Uploaded document: ${fileData.name}`,
        performedBy: 'Admin',
      });

      return docRef.id;
    },
    [patientId, patient.name]
  );

  /**
   * Assign a program to this patient
   */
  const assignProgram = useCallback(
    async (programId: string, programTitle: string, totalWeeks = 8) => {
      const res = await assignPatientToProgram(
        programId,
        programTitle,
        {
          id: patientId,
          name: patient.name,
          avatar: patient.avatarUrl,
          condition: patient.condition,
          email: patient.email,
          phone: patient.phone,
        },
        totalWeeks
      );

      await addPatientActivityLog(patientId, {
        action: 'Program assigned',
        description: `Assigned program "${programTitle}"`,
        performedBy: 'Admin',
      });

      return res;
    },
    [patientId, patient]
  );

  /**
   * Computed Dynamic Cards Metrics
   */
  const computedMetrics = useMemo(() => {
    // Total Appointments
    const totalAppointments = appointments.length;
    
    // Completed Sessions
    const completedAppointmentsCount = appointments.filter(
      (a) => (a.status || '').toLowerCase() === 'completed'
    ).length;
    const completedSessionsFromPrograms = assignedPrograms.reduce(
      (acc, p) => acc + (p.completedSessions || 0),
      0
    );
    const sessionsCompleted = Math.max(
      completedAppointmentsCount,
      completedSessionsFromPrograms,
      patient.sessionsCompleted || 0
    );

    const totalSessionsFromPrograms = assignedPrograms.reduce(
      (acc, p) => acc + (p.totalSessions || 0),
      0
    );
    const sessionsTotal = totalSessionsFromPrograms > 0 ? totalSessionsFromPrograms : (patient.sessionsTotal || 0);

    // Active Programs Count & Progress
    const activePrograms = assignedPrograms.filter((p) => p.status === 'active');
    const programsCount = assignedPrograms.length;

    let avgProgramProgress = 0;
    if (activePrograms.length > 0) {
      avgProgramProgress = Math.round(
        activePrograms.reduce((acc, p) => acc + (p.progressPercent || 0), 0) / activePrograms.length
      );
    } else if (assignedPrograms.length > 0) {
      avgProgramProgress = Math.round(
        assignedPrograms.reduce((acc, p) => acc + (p.progressPercent || 0), 0) / assignedPrograms.length
      );
    } else if (progressRecords.length > 0) {
      avgProgramProgress = Number(progressRecords[0].assessmentScore) || 0;
    } else {
      avgProgramProgress = Number(patient.recoveryScore) || 0;
    }

    // Financial Metrics
    let totalPaid = 0;
    let pendingAmount = 0;

    payments.forEach((p) => {
      if (p.paymentStatus === 'Paid' || p.status === 'PAID') {
        totalPaid += Number(p.amount) || 0;
      } else if (p.paymentStatus === 'Pending' || p.status === 'PENDING') {
        pendingAmount += Number(p.amount) || 0;
      }
    });

    invoices.forEach((inv) => {
      if (inv.status === 'Pending' || inv.status === 'Overdue') {
        pendingAmount += Number(inv.totalAmount || inv.amount) || 0;
      } else if (inv.status === 'Paid') {
        totalPaid += Number(inv.totalAmount || inv.amount) || 0;
      }
    });

    // Total Reports
    const totalReportsCount = reports.length;

    return {
      totalAppointments,
      sessionsCompleted,
      sessionsTotal,
      programsCount,
      avgProgramProgress,
      totalPaid,
      pendingAmount,
      totalReportsCount,
    };
  }, [appointments, assignedPrograms, payments, invoices, reports, progressRecords, patient]);

  // Combined Merged Patient Data
  const mergedPatient: Patient = useMemo(() => {
    return {
      ...patient,
      ...patientDocData,
      sessionsCompleted: computedMetrics.sessionsCompleted,
      sessionsTotal: computedMetrics.sessionsTotal,
      programsAssignedCount: computedMetrics.programsCount,
      recoveryScore: computedMetrics.avgProgramProgress,
      reports: reports as any,
    };
  }, [patient, patientDocData, computedMetrics, reports]);

  return {
    patient: mergedPatient,
    assignedPrograms,
    reports,
    payments,
    invoices,
    appointments,
    activityLogs,
    progressRecords,
    medicalHistoryList,
    clinicalNotesList,
    computedMetrics,
    isLoading,
    error,
    uploadReport,
    assignProgram,
    addClinicalNote: (noteData: any) => saveClinicalNote(patientId, noteData),
    removeClinicalNote: (noteId: string) => deleteClinicalNote(noteId, patientId),
    addProgress: (progressData: any) => addProgressRecord(patientId, progressData),
    addMedicalHistory: (medData: any) => saveMedicalHistoryRecord(patientId, medData),
    logActivity: (logData: any) => addPatientActivityLog(patientId, logData),
  };
}

