import {
  collection,
  onSnapshot,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/auth/config/firebase';
import type { Patient } from '@/patients/types';
import type { AppointmentItem } from '@/schedule/components/AppointmentsTable';
import type { PaymentRecord, InvoiceDocument } from '@/payments/types';

export const REPORTS_COLLECTION = 'reports';
export const EXPORTS_ARCHIVE_COLLECTION = 'exports_archive';

export interface FirestoreReportRecord {
  id: string;
  title: string;
  category: string; // 'Clinical' | 'Progress' | 'Financial' | 'Assessment' | 'Patient Care' | 'Internal Ops'
  patientId?: string;
  patientName?: string;
  therapistId?: string;
  therapistName?: string;
  appointmentId?: string;
  invoiceId?: string;
  status: 'Verified' | 'Needs Review' | 'Draft' | 'Ready' | 'Generating';
  author: string | { name: string; avatarUrl: string };
  date: string;
  iconType?: 'document' | 'chart' | 'user' | 'compliance' | 'vitals' | 'assessment';
  fileFormat?: 'PDF' | 'Excel' | 'CSV';
  isPinned?: boolean;
  summaryText?: string;
  details?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface FirestoreExportArchiveItem {
  id: string;
  fileName: string;
  format: 'CSV' | 'PDF' | 'EXCEL' | 'ZIP';
  size: string;
  status: 'Completed' | 'Expiring Soon' | 'Processing' | 'Failed';
  dateCreated: string;
  downloadUrl?: string;
  reportType?: string;
  recordsCount?: number;
  createdAt: string;
}

const safeDateIso = (val: any): string => {
  if (!val) return new Date().toISOString();
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && typeof val.toDate === 'function') {
    try {
      return val.toDate().toISOString();
    } catch {}
  }
  return new Date().toISOString();
};

export const mapDocToReportRecord = (id: string, data: Record<string, any>): FirestoreReportRecord => ({
  id,
  title: data.title || 'Untitled Report',
  category: data.category || 'Clinical',
  patientId: data.patientId || '',
  patientName: data.patientName || '',
  therapistId: data.therapistId || '',
  therapistName: data.therapistName || '',
  appointmentId: data.appointmentId || '',
  invoiceId: data.invoiceId || '',
  status: data.status || 'Verified',
  author: data.author || 'Dr. Sarah Jenkins',
  date: data.date || 'Today',
  iconType: data.iconType || 'document',
  fileFormat: data.fileFormat || 'PDF',
  isPinned: !!data.isPinned,
  summaryText: data.summaryText || '',
  details: data.details || {},
  createdAt: safeDateIso(data.createdAt),
  updatedAt: safeDateIso(data.updatedAt),
});

export const mapDocToExportArchiveItem = (id: string, data: Record<string, any>): FirestoreExportArchiveItem => ({
  id,
  fileName: data.fileName || 'export_file.csv',
  format: (data.format || 'CSV').toUpperCase() as any,
  size: data.size || '1.2 MB',
  status: data.status || 'Completed',
  dateCreated: data.dateCreated || 'Just now',
  downloadUrl: data.downloadUrl || '',
  reportType: data.reportType || 'General',
  recordsCount: Number(data.recordsCount || 0),
  createdAt: safeDateIso(data.createdAt),
});

// Seed data if collection is empty
const INITIAL_DEMO_REPORTS: Omit<FirestoreReportRecord, 'id'>[] = [
  {
    title: 'Q3 Patient Recovery & Mobility Analysis',
    category: 'Clinical',
    status: 'Verified',
    author: 'Dr. Sarah Jenkins',
    date: 'Oct 14, 2026',
    iconType: 'chart',
    fileFormat: 'PDF',
    isPinned: true,
    summaryText: 'Consolidated report evaluating recovery rate improvements across 42 patients.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    title: 'Monthly Financial & Revenue Breakdown',
    category: 'Financial',
    status: 'Ready',
    author: 'Admin Team',
    date: 'Oct 10, 2026',
    iconType: 'document',
    fileFormat: 'Excel',
    isPinned: true,
    summaryText: 'Financial statement summarizing collected clinic fees, pending invoices, and therapist payouts.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    title: 'Initial Intake Assessment Report',
    category: 'Assessment',
    status: 'Verified',
    author: {
      name: 'Dr. Sarah Chen',
      avatarUrl: 'https://images.unsplash.com/photo-1594824813566-7885a3964478?auto=format&fit=crop&q=80&w=150',
    },
    date: 'Oct 12, 2026',
    iconType: 'assessment',
    fileFormat: 'PDF',
    isPinned: false,
    summaryText: 'Baseline ROM and functional outcome score assessment.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_DEMO_EXPORTS: Omit<FirestoreExportArchiveItem, 'id'>[] = [
  {
    fileName: 'patient_reports_q3_2026.csv',
    format: 'CSV',
    size: '2.4 MB',
    status: 'Completed',
    dateCreated: 'Oct 15, 2026',
    reportType: 'Patient Reports',
    recordsCount: 45,
    createdAt: new Date().toISOString(),
  },
  {
    fileName: 'financial_summary_october.xlsx',
    format: 'EXCEL',
    size: '4.1 MB',
    status: 'Completed',
    dateCreated: 'Oct 14, 2026',
    reportType: 'Financial Reports',
    recordsCount: 120,
    createdAt: new Date().toISOString(),
  },
  {
    fileName: 'treatment_history_archive.pdf',
    format: 'PDF',
    size: '8.7 MB',
    status: 'Expiring Soon',
    dateCreated: 'Oct 10, 2026',
    reportType: 'Treatment Reports',
    recordsCount: 88,
    createdAt: new Date().toISOString(),
  },
];

/**
 * Real-time listener for Reports collection in Firestore
 */
export const subscribeToReports = (
  onData: (reports: FirestoreReportRecord[]) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  try {
    const colRef = collection(db, REPORTS_COLLECTION);
    return onSnapshot(
      colRef,
      async (snapshot) => {
        if (snapshot.empty) {
          // Auto-seed demo reports if empty
          try {
            for (const r of INITIAL_DEMO_REPORTS) {
              await addDoc(colRef, r);
            }
          } catch (e) {
            console.warn('Auto-seed reports error:', e);
          }
          return;
        }

        const reports = snapshot.docs.map((d) => mapDocToReportRecord(d.id, d.data()));
        onData(reports);
      },
      (err) => {
        console.warn('Firestore reports snapshot error:', err);
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    console.error('Failed to subscribe to reports:', err);
    if (onError) onError(err);
    return () => {};
  }
};

/**
 * Real-time listener for Exports Archive in Firestore
 */
export const subscribeToExportsArchive = (
  onData: (items: FirestoreExportArchiveItem[]) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  try {
    const colRef = collection(db, EXPORTS_ARCHIVE_COLLECTION);
    return onSnapshot(
      colRef,
      async (snapshot) => {
        if (snapshot.empty) {
          try {
            for (const item of INITIAL_DEMO_EXPORTS) {
              await addDoc(colRef, item);
            }
          } catch (e) {
            console.warn('Auto-seed export archive error:', e);
          }
          return;
        }

        const items = snapshot.docs.map((d) => mapDocToExportArchiveItem(d.id, d.data()));
        onData(items);
      },
      (err) => {
        console.warn('Firestore exports archive snapshot error:', err);
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    console.error('Failed to subscribe to exports archive:', err);
    if (onError) onError(err);
    return () => {};
  }
};

/**
 * Create a new report document in Firestore
 */
export const createReportRecord = async (
  data: Omit<FirestoreReportRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const now = new Date().toISOString();
  const colRef = collection(db, REPORTS_COLLECTION);
  const docRef = await addDoc(colRef, {
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
};

/**
 * Toggle pinned status for a report
 */
export const togglePinReport = async (id: string, currentPinned: boolean): Promise<void> => {
  const docRef = doc(db, REPORTS_COLLECTION, id);
  await updateDoc(docRef, {
    isPinned: !currentPinned,
    updatedAt: new Date().toISOString(),
  });
};

/**
 * Delete a report from Firestore
 */
export const deleteReportRecord = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, REPORTS_COLLECTION, id));
};

/**
 * Add a record into the exports archive in Firestore
 */
export const createExportArchiveItem = async (
  item: Omit<FirestoreExportArchiveItem, 'id' | 'createdAt'>
): Promise<string> => {
  const now = new Date().toISOString();
  const colRef = collection(db, EXPORTS_ARCHIVE_COLLECTION);
  const docRef = await addDoc(colRef, {
    ...item,
    createdAt: now,
  });
  return docRef.id;
};

/**
 * Delete an item from exports archive in Firestore
 */
export const deleteExportArchiveItem = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, EXPORTS_ARCHIVE_COLLECTION, id));
};

/**
 * Dynamic calculation of dashboard KPI cards combining Firestore collections
 */
export const calculateReportsDashboardMetrics = (
  patients: Patient[],
  schedules: AppointmentItem[],
  payments: PaymentRecord[],
  invoices: InvoiceDocument[],
  reports: FirestoreReportRecord[],
  exportsArchive: FirestoreExportArchiveItem[]
) => {
  // Financial totals
  let totalRevenue = 0;
  let totalPaid = 0;
  let totalPending = 0;

  // Revenue from paid payments
  payments.forEach((p) => {
    const amt = Number(p.amount || p.numericAmount || 0);
    if (p.paymentStatus === 'Paid' || p.status === 'PAID') {
      totalPaid += amt;
      totalRevenue += amt;
    } else if (p.paymentStatus === 'Pending' || p.status === 'PENDING') {
      totalPending += amt;
    }
  });

  // Revenue from invoices not mirrored in payments
  invoices.forEach((inv) => {
    const amt = Number(inv.totalAmount || inv.amount || 0);
    if (inv.status === 'Paid') {
      // Check if invoice already counted in payments
      const inPayments = payments.some((p) => p.invoiceId === inv.id || p.invoiceNumber === inv.invoiceNumber);
      if (!inPayments) {
        totalPaid += amt;
        totalRevenue += amt;
      }
    } else if (inv.status === 'Pending' || inv.status === 'Overdue') {
      const inPayments = payments.some((p) => p.invoiceId === inv.id || p.invoiceNumber === inv.invoiceNumber);
      if (!inPayments) {
        totalPending += amt;
      }
    }
  });

  // Counts by category
  const patientReportsCount = reports.filter(
    (r) => r.category === 'Clinical' || r.category === 'Assessment' || r.category === 'Patient Care' || !!r.patientId
  ).length + (patients.length > 0 ? 1 : 0);

  const treatmentReportsCount = reports.filter(
    (r) => r.category === 'Progress' || r.category === 'Clinical' || !!r.appointmentId
  ).length + schedules.filter((s) => s.status === 'Completed').length;

  const financialReportsCount = reports.filter((r) => r.category === 'Financial').length + payments.length + invoices.length;

  const totalReports = reports.length + schedules.filter((s) => s.status === 'Completed').length;

  const exportsCount = exportsArchive.length;

  // Approximate storage calculation
  const totalMB = exportsArchive.reduce((acc, item) => {
    const numericSize = parseFloat(item.size.replace(/[^0-9.]/g, '')) || 1.5;
    return acc + numericSize;
  }, 12.5);

  return {
    totalReports: totalReports || 1,
    patientReportsCount,
    treatmentReportsCount,
    financialReportsCount,
    totalRevenue,
    totalPaid,
    totalPending,
    exportsCount,
    storageUsedMB: Number(totalMB.toFixed(1)),
    storageUsedGBStr: (totalMB / 1024).toFixed(2),
  };
};
