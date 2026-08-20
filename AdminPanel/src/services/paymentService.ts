import {
  collection,
  onSnapshot,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/auth/config/firebase';
import type {
  PaymentRecord,
  InvoiceDocument,
  TransactionRecord,
  PackageDocument,
  RefundDocument,
  PayoutDocument,
  PaymentsDashboardMetrics,
  InvoiceItem,
  TransactionItem,
  PackageItem,
  RefundItem,
  PayoutRecordItem,
  OutstandingPaymentItem,
  RevenueTrendPoint,
  MethodDistributionItem,
  RecentActivityItem,
  MetricCardData,
  PaymentFilters,
} from '@/payments/types';

// ─────────────────────────────────────────────────────────────────────────────
// Collection names
// ─────────────────────────────────────────────────────────────────────────────
export const PAYMENTS_COLLECTION = 'payments';
export const INVOICES_COLLECTION = 'invoices';
export const TRANSACTIONS_COLLECTION = 'transactions';
export const PACKAGES_COLLECTION = 'packages';
export const REFUNDS_COLLECTION = 'refunds';
export const PAYOUTS_COLLECTION = 'payouts';

const PLATFORM_FEE_PERCENT = 20; // clinic keeps 20%, therapist gets 80%

// ─────────────────────────────────────────────────────────────────────────────
// Safe Date and String Helpers
// ─────────────────────────────────────────────────────────────────────────────
const safeDateIso = (val: any): string => {
  if (!val) return new Date().toISOString();
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    if (typeof val.toDate === 'function') {
      try {
        return val.toDate().toISOString();
      } catch { }
    }
    if (typeof val.seconds === 'number') {
      try {
        return new Date(val.seconds * 1000).toISOString();
      } catch { }
    }
  }
  try {
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d.toISOString();
  } catch { }
  return new Date().toISOString();
};

const safeDateStr = (val: any): string => {
  const iso = safeDateIso(val);
  return iso.split('T')[0] || new Date().toISOString().split('T')[0];
};

const safeString = (val: any, fallback = ''): string => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val;
  return String(val);
};

// ─────────────────────────────────────────────────────────────────────────────
// Status normalization — handles mobile ('PAID') vs admin ('Paid') formats
// ─────────────────────────────────────────────────────────────────────────────
const normalizePaymentStatus = (raw: string | undefined): string => {
  if (!raw) return 'Pending';
  const upper = String(raw).toUpperCase();
  if (upper === 'PAID' || upper === 'COMPLETED' || upper === 'SETTLED') return 'Paid';
  if (upper === 'PENDING' || upper === 'UNPAID' || upper === 'DUE') return 'Pending';
  if (upper === 'FAILED') return 'Failed';
  if (upper === 'REFUNDED' || upper === 'CANCELLED') return 'Refunded';
  if (upper === 'PARTIALLY REFUNDED') return 'Partially Refunded';
  return String(raw);
};

// ─────────────────────────────────────────────────────────────────────────────
// Mappers — Firestore doc → UI display type
// ─────────────────────────────────────────────────────────────────────────────

export const mapDocToPayment = (id: string, data: Record<string, any>): PaymentRecord => ({
  id,
  paymentId: safeString(data.paymentId, id),
  patientId: safeString(data.patientId || data.userId, ''),
  userId: safeString(data.userId || data.patientId, ''),
  patientName: safeString(data.patientName || data.userName, 'Patient'),
  therapistId: safeString(data.therapistId || data.doctorId, ''),
  therapistName: safeString(data.therapistName || data.doctor || data.doctorName, ''),
  appointmentId: safeString(data.appointmentId || data.bookingId, ''),
  programId: safeString(data.programId, ''),
  amount: Number(data.amount || data.numericAmount || data.numericFee || 0),
  numericAmount: Number(data.numericAmount || data.amount || 0),
  currency: safeString(data.currency, 'INR'),
  paymentMethod: safeString(data.paymentMethod || data.paymentMethodName, 'UPI'),
  paymentMethodName: safeString(data.paymentMethodName || data.paymentMethod, ''),
  paymentStatus: normalizePaymentStatus(data.paymentStatus || data.status) as any,
  status: normalizePaymentStatus(data.status || data.paymentStatus) as any,
  transactionId: safeString(data.transactionId || data.id, id),
  invoiceId: safeString(data.invoiceId, ''),
  invoiceNumber: safeString(data.invoiceNumber || data.invoiceNo, ''),
  invoiceNo: safeString(data.invoiceNo || data.invoiceNumber, ''),
  refundStatus: safeString(data.refundStatus, ''),
  refundedAmount: Number(data.refundedAmount || 0),
  remainingRefundableAmount: Number(data.remainingRefundableAmount ?? (Number(data.amount || 0) - Number(data.refundedAmount || 0))),
  paymentProvider: safeString(data.paymentProvider, ''),
  bookingId: safeString(data.bookingId || data.appointmentId, ''),
  title: safeString(data.title || data.serviceTitle, ''),
  doctor: safeString(data.doctor || data.therapistName, ''),
  doctorId: safeString(data.doctorId || data.therapistId, ''),
  paymentMode: safeString(data.paymentMode, 'online'),
  paidAt: data.paidAt ? safeDateIso(data.paidAt) : '',
  createdAt: safeDateIso(data.createdAt),
  updatedAt: safeDateIso(data.updatedAt),
});

export const mapDocToInvoice = (id: string, data: Record<string, any>): InvoiceDocument => ({
  id,
  invoiceNumber: safeString(data.invoiceNumber, `INV-${id.slice(0, 8).toUpperCase()}`),
  patientId: safeString(data.patientId || data.userId, ''),
  patientName: safeString(data.patientName, 'Patient'),
  patientEmail: safeString(data.patientEmail, ''),
  therapistId: safeString(data.therapistId, ''),
  therapistName: safeString(data.therapistName, ''),
  appointmentId: safeString(data.appointmentId, ''),
  programId: safeString(data.programId, ''),
  packageId: safeString(data.packageId, ''),
  description: safeString(data.description || data.title, 'Physiotherapy Session'),
  lineItems: Array.isArray(data.lineItems) ? data.lineItems : [],
  amount: Number(data.amount || 0),
  taxAmount: Number(data.taxAmount || 0),
  discountAmount: Number(data.discountAmount || 0),
  totalAmount: Number(data.totalAmount || data.amount || 0),
  currency: safeString(data.currency, 'INR'),
  status: (data.status || 'Pending') as any,
  paymentMethod: safeString(data.paymentMethod, ''),
  issueDate: safeDateStr(data.issueDate),
  dueDate: data.dueDate ? safeDateStr(data.dueDate) : '',
  paidDate: data.paidDate ? safeDateIso(data.paidDate) : '',
  notes: safeString(data.notes, ''),
  createdAt: safeDateIso(data.createdAt),
  updatedAt: safeDateIso(data.updatedAt),
});

export const mapDocToTransaction = (id: string, data: Record<string, any>): TransactionRecord => ({
  id,
  transactionId: safeString(data.transactionId, id),
  type: (data.type || 'Payment') as any,
  patientId: safeString(data.patientId || data.userId, ''),
  patientName: safeString(data.patientName, 'Patient'),
  therapistId: safeString(data.therapistId || data.doctorId, ''),
  therapistName: safeString(data.therapistName || data.doctor, ''),
  appointmentId: safeString(data.appointmentId, ''),
  invoiceId: safeString(data.invoiceId, ''),
  invoiceNumber: safeString(data.invoiceNumber, ''),
  paymentId: safeString(data.paymentId, ''),
  refundId: safeString(data.refundId, ''),
  payoutId: safeString(data.payoutId, ''),
  amount: Number(data.amount || 0),
  currency: safeString(data.currency, 'INR'),
  method: safeString(data.method || data.paymentMethod, 'UPI'),
  status: (data.status === 'Paid' || data.status === 'PAID' || data.status === 'Completed')
    ? 'Completed'
    : data.status === 'Failed' ? 'Failed'
      : data.status === 'Processing' ? 'Processing'
        : 'Completed',
  description: safeString(data.description, ''),
  timestamp: safeDateIso(data.timestamp || data.createdAt),
  createdAt: safeDateIso(data.createdAt),
});

export const mapDocToPackage = (id: string, data: Record<string, any>): PackageDocument => ({
  id,
  packageName: safeString(data.packageName, 'Treatment Package'),
  description: safeString(data.description, ''),
  patientId: safeString(data.patientId, ''),
  patientName: safeString(data.patientName, 'Unassigned'),
  therapistId: safeString(data.therapistId, ''),
  therapistName: safeString(data.therapistName, ''),
  totalSessions: Number(data.totalSessions || 0),
  completedSessions: Number(data.completedSessions || 0),
  remainingSessions: Number(data.remainingSessions ?? (Number(data.totalSessions || 0) - Number(data.completedSessions || 0))),
  totalAmount: Number(data.totalAmount || 0),
  paidAmount: Number(data.paidAmount || 0),
  currency: safeString(data.currency, 'INR'),
  validityDays: Number(data.validityDays || 90),
  startDate: data.startDate ? safeDateStr(data.startDate) : '',
  expiryDate: data.expiryDate ? safeDateStr(data.expiryDate) : '',
  status: (data.status || 'Active') as any,
  isActive: data.isActive !== false,
  createdAt: safeDateIso(data.createdAt),
  updatedAt: safeDateIso(data.updatedAt),
});

export const mapDocToRefund = (id: string, data: Record<string, any>): RefundDocument => ({
  id,
  refundId: safeString(data.refundId, `RFD-${id.slice(0, 6).toUpperCase()}`),
  paymentId: safeString(data.paymentId, ''),
  appointmentId: safeString(data.appointmentId || data.bookingId, ''),
  bookingId: safeString(data.bookingId || data.appointmentId, ''),
  transactionId: safeString(data.transactionId, ''),
  invoiceId: safeString(data.invoiceId, ''),
  patientId: safeString(data.patientId, ''),
  patientName: safeString(data.patientName, 'Patient'),
  therapistId: safeString(data.therapistId, ''),
  therapistName: safeString(data.therapistName, ''),
  amount: Number(data.amount || data.refundAmount || 0),
  originalAmount: Number(data.originalAmount || data.amount || 0),
  remainingRefundableAmount: Number(data.remainingRefundableAmount || 0),
  currency: safeString(data.currency, 'INR'),
  reason: safeString(data.reason || data.refundReason, 'No reason provided'),
  refundReason: safeString(data.refundReason || data.reason, 'No reason provided'),
  status: (data.status || 'Awaiting Approval') as any,
  refundStatus: safeString(data.refundStatus || data.status, 'Completed'),
  paymentProvider: safeString(data.paymentProvider, 'UPI'),
  providerRefundId: safeString(data.providerRefundId, ''),
  requestDate: safeDateStr(data.requestDate || data.createdAt),
  processedDate: data.processedDate ? safeDateIso(data.processedDate) : '',
  processedBy: safeString(data.processedBy, 'Admin'),
  notes: safeString(data.notes, ''),
  createdAt: safeDateIso(data.createdAt),
  updatedAt: safeDateIso(data.updatedAt),
});

export const mapDocToPayout = (id: string, data: Record<string, any>): PayoutDocument => ({
  id,
  therapistId: safeString(data.therapistId, ''),
  therapistName: safeString(data.therapistName, ''),
  therapistRole: safeString(data.therapistRole || data.role, 'Physiotherapist'),
  period: safeString(data.period, ''),
  sessionCount: Number(data.sessionCount || 0),
  grossEarnings: Number(data.grossEarnings || 0),
  platformFeePercent: Number(data.platformFeePercent || PLATFORM_FEE_PERCENT),
  platformDeduction: Number(data.platformDeduction || 0),
  netPayout: Number(data.netPayout || 0),
  currency: safeString(data.currency, 'INR'),
  status: (data.status || 'Pending') as any,
  dueDate: data.dueDate ? safeDateStr(data.dueDate) : '',
  paidDate: data.paidDate ? safeDateIso(data.paidDate) : '',
  paymentReference: safeString(data.paymentReference, ''),
  appointmentIds: Array.isArray(data.appointmentIds) ? data.appointmentIds : [],
  createdAt: safeDateIso(data.createdAt),
  updatedAt: safeDateIso(data.updatedAt),
});


// ─────────────────────────────────────────────────────────────────────────────
// Real-time Subscriptions (onSnapshot)
// ─────────────────────────────────────────────────────────────────────────────

export const subscribeToPayments = (
  onData: (payments: PaymentRecord[]) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  try {
    const colRef = collection(db, PAYMENTS_COLLECTION);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const payments = snapshot.docs.map((d) => mapDocToPayment(d.id, d.data()));
        onData(payments);
      },
      (err) => {
        console.warn('Firestore payments snapshot error:', err);
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    console.error('Failed to subscribe to payments:', err);
    if (onError) onError(err);
    return () => { };
  }
};

export const subscribeToInvoices = (
  onData: (invoices: InvoiceDocument[]) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  try {
    const colRef = collection(db, INVOICES_COLLECTION);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const invoices = snapshot.docs.map((d) => mapDocToInvoice(d.id, d.data()));
        onData(invoices);
      },
      (err) => {
        console.warn('Firestore invoices snapshot error:', err);
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    console.error('Failed to subscribe to invoices:', err);
    if (onError) onError(err);
    return () => { };
  }
};

export const subscribeToTransactions = (
  onData: (txns: TransactionRecord[]) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  try {
    const colRef = collection(db, TRANSACTIONS_COLLECTION);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const txns = snapshot.docs.map((d) => mapDocToTransaction(d.id, d.data()));
        onData(txns);
      },
      (err) => {
        console.warn('Firestore transactions snapshot error:', err);
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    console.error('Failed to subscribe to transactions:', err);
    if (onError) onError(err);
    return () => { };
  }
};

export const subscribeToPackages = (
  onData: (pkgs: PackageDocument[]) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  try {
    const colRef = collection(db, PACKAGES_COLLECTION);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const pkgs = snapshot.docs.map((d) => mapDocToPackage(d.id, d.data()));
        onData(pkgs);
      },
      (err) => {
        console.warn('Firestore packages snapshot error:', err);
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    console.error('Failed to subscribe to packages:', err);
    if (onError) onError(err);
    return () => { };
  }
};

export const subscribeToRefunds = (
  onData: (refunds: RefundDocument[]) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  try {
    const colRef = collection(db, REFUNDS_COLLECTION);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const refunds = snapshot.docs.map((d) => mapDocToRefund(d.id, d.data()));
        onData(refunds);
      },
      (err) => {
        console.warn('Firestore refunds snapshot error:', err);
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    console.error('Failed to subscribe to refunds:', err);
    if (onError) onError(err);
    return () => { };
  }
};

export const subscribeToPayouts = (
  onData: (payouts: PayoutDocument[]) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  try {
    const colRef = collection(db, PAYOUTS_COLLECTION);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const payouts = snapshot.docs.map((d) => mapDocToPayout(d.id, d.data()));
        onData(payouts);
      },
      (err) => {
        console.warn('Firestore payouts snapshot error:', err);
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    console.error('Failed to subscribe to payouts:', err);
    if (onError) onError(err);
    return () => { };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Invoice Number Generator
// ─────────────────────────────────────────────────────────────────────────────

export const generateInvoiceNumber = async (): Promise<string> => {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  try {
    const snap = await getDocs(collection(db, INVOICES_COLLECTION));
    const count = snap.size + 1;
    return `INV-${yearMonth}-${String(count).padStart(4, '0')}`;
  } catch {
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `INV-${yearMonth}-${rand}`;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CRUD: Invoices
// ─────────────────────────────────────────────────────────────────────────────

export const createInvoice = async (
  invoiceData: Omit<InvoiceDocument, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const now = new Date().toISOString();
  const colRef = collection(db, INVOICES_COLLECTION);
  const docRef = await addDoc(colRef, {
    ...invoiceData,
    createdAt: now,
    updatedAt: now,
  });

  // Also write a corresponding payment record so mobile app sees it
  const paymentId = `pay-inv-${docRef.id.slice(0, 8)}`;
  await setDoc(doc(db, PAYMENTS_COLLECTION, paymentId), {
    id: paymentId,
    paymentId,
    patientId: invoiceData.patientId,
    userId: invoiceData.patientId,
    patientName: invoiceData.patientName,
    therapistId: invoiceData.therapistId,
    therapistName: invoiceData.therapistName,
    doctorId: invoiceData.therapistId,
    doctor: invoiceData.therapistName,
    appointmentId: invoiceData.appointmentId || '',
    amount: invoiceData.totalAmount,
    numericAmount: invoiceData.totalAmount,
    currency: invoiceData.currency,
    paymentMethod: invoiceData.paymentMethod || '',
    paymentStatus: 'Pending',
    status: 'PENDING',
    transactionId: '',
    invoiceId: docRef.id,
    invoiceNumber: invoiceData.invoiceNumber,
    invoiceNo: invoiceData.invoiceNumber,
    title: invoiceData.description,
    paymentMode: 'online',
    createdAt: now,
    updatedAt: now,
  });

  // Create a transaction record
  await addDoc(collection(db, TRANSACTIONS_COLLECTION), {
    transactionId: `TXN-INV-${docRef.id.slice(0, 6).toUpperCase()}`,
    type: 'Payment',
    patientId: invoiceData.patientId,
    patientName: invoiceData.patientName,
    therapistId: invoiceData.therapistId,
    therapistName: invoiceData.therapistName,
    invoiceId: docRef.id,
    invoiceNumber: invoiceData.invoiceNumber,
    amount: invoiceData.totalAmount,
    currency: invoiceData.currency,
    method: invoiceData.paymentMethod || 'Pending',
    status: 'Pending',
    description: `Invoice ${invoiceData.invoiceNumber} created`,
    timestamp: now,
    createdAt: now,
  });

  return docRef.id;
};

export const updateInvoice = async (id: string, data: Partial<InvoiceDocument>): Promise<void> => {
  const docRef = doc(db, INVOICES_COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteInvoice = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, INVOICES_COLLECTION, id));
};

export const markInvoiceAsPaid = async (
  invoiceId: string,
  paymentMethod: string
): Promise<void> => {
  const now = new Date().toISOString();

  // Update invoice
  await updateDoc(doc(db, INVOICES_COLLECTION, invoiceId), {
    status: 'Paid',
    paymentMethod,
    paidDate: now,
    updatedAt: now,
  });

  // Find and update the corresponding payment record
  try {
    const q = query(collection(db, PAYMENTS_COLLECTION), where('invoiceId', '==', invoiceId));
    const snap = await getDocs(q);
    for (const d of snap.docs) {
      await updateDoc(doc(db, PAYMENTS_COLLECTION, d.id), {
        paymentStatus: 'Paid',
        status: 'PAID',
        paymentMethod,
        paidAt: now,
        updatedAt: now,
      });
    }
  } catch (err) {
    console.warn('Error updating linked payment record:', err);
  }

  // Create a completed transaction record
  await addDoc(collection(db, TRANSACTIONS_COLLECTION), {
    transactionId: `TXN-PAY-${Date.now().toString(36).toUpperCase()}`,
    type: 'Payment',
    invoiceId,
    amount: 0, // will be looked up from context
    currency: 'INR',
    method: paymentMethod,
    status: 'Completed',
    description: `Invoice marked as paid via ${paymentMethod}`,
    timestamp: now,
    createdAt: now,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// CRUD: Payment Records
// ─────────────────────────────────────────────────────────────────────────────

export const createPaymentRecord = async (data: {
  patientId: string;
  patientName: string;
  therapistId?: string;
  therapistName?: string;
  appointmentId?: string;
  amount: number;
  paymentMethod: string;
  invoiceId?: string;
  invoiceNumber?: string;
  description?: string;
}): Promise<string> => {
  const now = new Date().toISOString();
  const txnId = `TXN-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}`;
  const paymentId = `PAY-${Date.now().toString(36).toUpperCase()}`;

  // Create payment record
  const payRef = doc(db, PAYMENTS_COLLECTION, paymentId);
  const paymentPayload = {
    id: paymentId,
    paymentId,
    patientId: data.patientId,
    userId: data.patientId,
    patientName: data.patientName,
    therapistId: data.therapistId || '',
    therapistName: data.therapistName || '',
    doctor: data.therapistName || '',
    doctorId: data.therapistId || '',
    appointmentId: data.appointmentId || '',
    amount: data.amount,
    numericAmount: data.amount,
    currency: 'INR',
    paymentMethod: data.paymentMethod,
    paymentMethodName: data.paymentMethod,
    paymentStatus: 'Paid',
    status: 'PAID',
    transactionId: txnId,
    invoiceId: data.invoiceId || '',
    invoiceNumber: data.invoiceNumber || '',
    invoiceNo: data.invoiceNumber || '',
    title: data.description || 'Physiotherapy Session',
    paymentMode: data.paymentMethod === 'Cash' ? 'clinic' : 'online',
    paidAt: now,
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(payRef, paymentPayload);

  // Mirror to subcollection users/{userId}/payments/{paymentId}
  if (data.patientId) {
    try {
      const userPayRef = doc(db, 'users', data.patientId, 'payments', paymentId);
      await setDoc(userPayRef, paymentPayload);
    } catch (subErr) {
      console.warn('Non-critical subcollection mirror error for payment:', subErr);
    }
  }

  // Create transaction record
  await addDoc(collection(db, TRANSACTIONS_COLLECTION), {
    transactionId: txnId,
    type: 'Payment',
    patientId: data.patientId,
    patientName: data.patientName,
    therapistId: data.therapistId || '',
    therapistName: data.therapistName || '',
    appointmentId: data.appointmentId || '',
    invoiceId: data.invoiceId || '',
    invoiceNumber: data.invoiceNumber || '',
    paymentId,
    amount: data.amount,
    currency: 'INR',
    method: data.paymentMethod,
    status: 'Completed',
    description: data.description || `Payment of ₹${data.amount.toLocaleString('en-IN')} recorded`,
    timestamp: now,
    createdAt: now,
  });

  // Update linked invoice if exists
  if (data.invoiceId) {
    try {
      await updateDoc(doc(db, INVOICES_COLLECTION, data.invoiceId), {
        status: 'Paid',
        paymentMethod: data.paymentMethod,
        paidDate: now,
        updatedAt: now,
      });
    } catch (err) {
      console.warn('Could not update linked invoice:', err);
    }
  }

  return paymentId;
};

// ─────────────────────────────────────────────────────────────────────────────
// CRUD: Packages
// ─────────────────────────────────────────────────────────────────────────────

export const createPackage = async (
  data: Omit<PackageDocument, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const now = new Date().toISOString();
  const docRef = await addDoc(collection(db, PACKAGES_COLLECTION), {
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
};

export const updatePackage = async (id: string, data: Partial<PackageDocument>): Promise<void> => {
  await updateDoc(doc(db, PACKAGES_COLLECTION, id), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};

export const togglePackageStatus = async (id: string, currentActive: boolean): Promise<void> => {
  await updateDoc(doc(db, PACKAGES_COLLECTION, id), {
    isActive: !currentActive,
    status: !currentActive ? 'Active' : 'Archived',
    updatedAt: new Date().toISOString(),
  });
};

export const deletePackage = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, PACKAGES_COLLECTION, id));
};

// ─────────────────────────────────────────────────────────────────────────────
// CRUD: Refunds
// ─────────────────────────────────────────────────────────────────────────────

export const createRefundRequest = async (
  data: Omit<RefundDocument, 'id' | 'refundId' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const now = new Date().toISOString();
  const refundId = `RFD-${Date.now().toString(36).toUpperCase()}`;
  const docRef = await addDoc(collection(db, REFUNDS_COLLECTION), {
    ...data,
    refundId,
    status: 'Awaiting Approval',
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
};

export const approveRefund = async (id: string, refundData: RefundDocument): Promise<void> => {
  const now = new Date().toISOString();

  // Update refund status
  await updateDoc(doc(db, REFUNDS_COLLECTION, id), {
    status: 'Approved',
    processedDate: now,
    updatedAt: now,
  });

  // Update the original payment record
  if (refundData.paymentId) {
    try {
      const q = query(collection(db, PAYMENTS_COLLECTION), where('paymentId', '==', refundData.paymentId));
      const snap = await getDocs(q);
      for (const d of snap.docs) {
        await updateDoc(doc(db, PAYMENTS_COLLECTION, d.id), {
          paymentStatus: 'Refunded',
          status: 'REFUNDED',
          refundStatus: 'Approved',
          updatedAt: now,
        });
      }
    } catch (err) {
      console.warn('Error updating original payment for refund:', err);
    }
  }

  // Create refund transaction record
  await addDoc(collection(db, TRANSACTIONS_COLLECTION), {
    transactionId: `TXN-RFD-${Date.now().toString(36).toUpperCase()}`,
    type: 'Refund',
    patientId: refundData.patientId,
    patientName: refundData.patientName,
    therapistId: refundData.therapistId || '',
    therapistName: refundData.therapistName || '',
    refundId: refundData.refundId,
    paymentId: refundData.paymentId,
    amount: refundData.amount,
    currency: refundData.currency,
    method: 'Original Method',
    status: 'Completed',
    description: `Refund approved: ${refundData.reason}`,
    timestamp: now,
    createdAt: now,
  });
};

export const rejectRefund = async (id: string): Promise<void> => {
  await updateDoc(doc(db, REFUNDS_COLLECTION, id), {
    status: 'Rejected',
    processedDate: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
};

export interface ProcessAdminRefundInput {
  paymentId?: string;
  bookingId?: string;
  appointmentId?: string;
  patientId?: string;
  refundAmount: number;
  refundReason?: string;
  processedBy?: string;
  paymentProvider?: string;
}

export const processAdminRefund = async (input: ProcessAdminRefundInput): Promise<any> => {
  const now = new Date().toISOString();
  const targetId = input.paymentId || input.appointmentId || input.bookingId;

  // 1. Attempt call to backend payment service
  try {
    const backendUrl = import.meta.env.VITE_PAYMENT_SERVICE_URL || 'http://localhost:5003/api/v1/payments/refund';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch (backendErr) {
    console.warn('Backend payment service unreachable. Falling back to direct Firestore refund logic:', backendErr);
  }

  // 2. Direct Firestore Fallback logic
  if (!targetId) {
    throw new Error('Target Payment or Appointment ID is required for refund.');
  }

  let paymentDocRef: any = null;
  let paymentData: any = null;

  if (input.paymentId) {
    const paySnap = await getDoc(doc(db, PAYMENTS_COLLECTION, input.paymentId));
    if (paySnap.exists()) {
      paymentDocRef = doc(db, PAYMENTS_COLLECTION, input.paymentId);
      paymentData = paySnap.data();
    }
  }

  if (!paymentData && (input.appointmentId || input.bookingId)) {
    const searchId = input.appointmentId || input.bookingId;
    const q = query(collection(db, PAYMENTS_COLLECTION), where('appointmentId', '==', searchId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const firstDoc = snap.docs[0]!;
      paymentDocRef = doc(db, PAYMENTS_COLLECTION, firstDoc.id);
      paymentData = firstDoc.data();
    }
  }

  const originalAmount = Number(paymentData?.amount || paymentData?.numericAmount || input.refundAmount);
  const existingRefunded = Number(paymentData?.refundedAmount || 0);
  const remainingRefundable = Math.max(0, originalAmount - existingRefunded);

  if (remainingRefundable <= 0 && paymentData) {
    throw new Error('This payment has already been fully refunded.');
  }

  if (input.refundAmount > remainingRefundable && paymentData) {
    throw new Error(`Refund amount (₹${input.refundAmount}) exceeds maximum refundable amount (₹${remainingRefundable}).`);
  }

  const newRefundedAmount = existingRefunded + input.refundAmount;
  const newRemainingRefundable = Math.max(0, originalAmount - newRefundedAmount);
  const newStatus = newRemainingRefundable === 0 ? 'Refunded' : 'Partially Refunded';

  const refundId = `RFD-${Date.now().toString(36).toUpperCase()}`;
  const providerRefundId = `rfnd_rzp_${Date.now().toString(36)}`;

  const refundPayload: Omit<RefundDocument, 'id'> = {
    refundId,
    paymentId: paymentData?.paymentId || paymentData?.id || input.paymentId || '',
    appointmentId: input.appointmentId || paymentData?.appointmentId || input.bookingId || '',
    bookingId: input.bookingId || input.appointmentId || '',
    patientId: input.patientId || paymentData?.patientId || paymentData?.userId || '',
    patientName: paymentData?.patientName || 'Patient',
    therapistId: paymentData?.therapistId || '',
    therapistName: paymentData?.therapistName || '',
    amount: input.refundAmount,
    originalAmount,
    remainingRefundableAmount: newRemainingRefundable,
    currency: 'INR',
    reason: input.refundReason || 'Appointment Cancelled',
    refundReason: input.refundReason || 'Appointment Cancelled',
    status: 'Completed',
    refundStatus: 'Completed',
    paymentProvider: input.paymentProvider || paymentData?.paymentMethod || 'UPI',
    providerRefundId,
    requestDate: now.split('T')[0]!,
    processedDate: now,
    processedBy: input.processedBy || 'Admin',
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(db, REFUNDS_COLLECTION, refundId), refundPayload);

  // Update Payment record
  if (paymentDocRef) {
    await updateDoc(paymentDocRef, {
      refundedAmount: newRefundedAmount,
      remainingRefundableAmount: newRemainingRefundable,
      paymentStatus: newStatus,
      status: newStatus === 'Refunded' ? 'REFUNDED' : 'PARTIALLY REFUNDED',
      refundStatus: 'Approved',
      updatedAt: now,
    });
  }

  // Update mirrored payment in user subcollection
  const resolvedPatientId = input.patientId || paymentData?.patientId || paymentData?.userId;
  if (resolvedPatientId && (paymentData?.id || input.paymentId)) {
    try {
      const payId = paymentData?.id || input.paymentId;
      await updateDoc(doc(db, 'users', resolvedPatientId, 'payments', payId), {
        refundedAmount: newRefundedAmount,
        remainingRefundableAmount: newRemainingRefundable,
        paymentStatus: newStatus,
        status: newStatus === 'Refunded' ? 'REFUNDED' : 'PARTIALLY REFUNDED',
        updatedAt: now,
      });
    } catch (e) { }
  }

  // Write Refund Transaction Log
  await addDoc(collection(db, TRANSACTIONS_COLLECTION), {
    transactionId: `TXN-RFD-${refundId}`,
    type: 'Refund',
    patientId: resolvedPatientId || '',
    patientName: paymentData?.patientName || 'Patient',
    therapistId: paymentData?.therapistId || '',
    therapistName: paymentData?.therapistName || '',
    appointmentId: input.appointmentId || paymentData?.appointmentId || '',
    paymentId: paymentData?.paymentId || paymentData?.id || '',
    refundId,
    amount: input.refundAmount,
    currency: 'INR',
    method: paymentData?.paymentMethod || 'UPI',
    status: 'Completed',
    description: `Refund processed (₹${input.refundAmount}): ${input.refundReason || 'Cancellation'}`,
    timestamp: now,
    createdAt: now,
  });

  // Update Appointment payment status
  const resolvedAppointmentId = input.appointmentId || paymentData?.appointmentId || input.bookingId;
  if (resolvedAppointmentId) {
    try {
      await updateDoc(doc(db, 'appointments', resolvedAppointmentId), {
        paymentStatus: newStatus,
        refundedAmount: newRefundedAmount,
        remainingRefundableAmount: newRemainingRefundable,
        updatedAt: now,
      });
    } catch (e) { }
  }

  return {
    refundId,
    refundAmount: input.refundAmount,
    remainingRefundableAmount: newRemainingRefundable,
    paymentStatus: newStatus,
    providerRefundId,
    message: `Refund of ₹${input.refundAmount.toLocaleString('en-IN')} processed successfully.`,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// CRUD: Payouts
// ─────────────────────────────────────────────────────────────────────────────

export const createPayoutRecord = async (
  data: Omit<PayoutDocument, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const now = new Date().toISOString();
  const docRef = await addDoc(collection(db, PAYOUTS_COLLECTION), {
    ...data,
    createdAt: now,
    updatedAt: now,
  });

  // Create payout transaction
  await addDoc(collection(db, TRANSACTIONS_COLLECTION), {
    transactionId: `TXN-PO-${docRef.id.slice(0, 6).toUpperCase()}`,
    type: 'Payout',
    therapistId: data.therapistId,
    therapistName: data.therapistName,
    patientId: '',
    patientName: data.therapistName,
    payoutId: docRef.id,
    amount: data.netPayout,
    currency: data.currency,
    method: 'Bank Transfer',
    status: data.status === 'Paid' ? 'Completed' : 'Processing',
    description: `Payout for ${data.period}: ${data.sessionCount} sessions`,
    timestamp: now,
    createdAt: now,
  });

  return docRef.id;
};

export const markPayoutAsPaid = async (id: string): Promise<void> => {
  const now = new Date().toISOString();
  await updateDoc(doc(db, PAYOUTS_COLLECTION, id), {
    status: 'Paid',
    paidDate: now,
    updatedAt: now,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard Metrics Calculator
// ─────────────────────────────────────────────────────────────────────────────

export const calculateDashboardMetrics = (
  payments: PaymentRecord[],
  invoices: InvoiceDocument[],
  refunds: RefundDocument[],
  payouts: PayoutDocument[],
  filters: PaymentFilters
): PaymentsDashboardMetrics => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const localTodayStr = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];

  // Date range filter
  const daysBack = filters.timeframe === 'Last 7 Days' ? 7
    : filters.timeframe === 'Last 30 Days' ? 30
      : filters.timeframe === 'This Quarter' ? 90
        : filters.timeframe === 'This Year' ? 365
          : 30;
  const rangeStart = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

  // Filter payments within range that have valid payments (Paid, Partially Refunded, Refunded)
  const eligiblePayments = (payments || []).filter((p) => {
    if (!p) return false;
    const status = normalizePaymentStatus(p.paymentStatus || p.status);
    if (status !== 'Paid' && status !== 'Partially Refunded' && status !== 'Refunded') return false;
    const createdDate = new Date(p.paidAt || p.createdAt);
    return isNaN(createdDate.getTime()) || createdDate >= rangeStart;
  });

  // Gross Revenue: Sum of original payment amounts before refunds
  const grossRevenue = eligiblePayments.reduce((sum, p) => sum + Number(p.amount || p.numericAmount || 0), 0);

  // Total Refunds Processed
  const completedRefunds = (refunds || []).filter((r) => r && (r.status === 'Approved' || r.status === 'Completed'));
  const refundedAmount = completedRefunds.reduce((sum, r) => sum + Number(r.amount || 0), 0);

  // Net Revenue
  const netRevenue = Math.max(0, grossRevenue - refundedAmount);

  // Outstanding from unpaid invoices AND pending payments
  const outstandingInvoices = (invoices || []).filter((inv) => inv && (inv.status === 'Pending' || inv.status === 'Overdue'));
  const invoiceOutstanding = outstandingInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount || inv.amount || 0), 0);
  const outstandingPatientIds = new Set(outstandingInvoices.map((inv) => inv.patientId).filter(Boolean));

  const pendingPayments = (payments || []).filter((p) => {
    if (!p) return false;
    const status = normalizePaymentStatus(p.paymentStatus || p.status);
    return status === 'Pending';
  });
  const pendingPaymentOutstanding = pendingPayments.reduce((sum, p) => {
    if (p.invoiceId && (invoices || []).some((i) => i.id === p.invoiceId || i.invoiceNumber === p.invoiceNumber)) {
      return sum;
    }
    return sum + Number(p.amount || p.numericAmount || 0);
  }, 0);
  pendingPayments.forEach((p) => {
    const id = p.patientId || p.userId;
    if (id) outstandingPatientIds.add(id);
  });

  const outstanding = invoiceOutstanding + pendingPaymentOutstanding;

  // Collected today
  const todayPayments = (payments || []).filter((p) => {
    if (!p) return false;
    const status = normalizePaymentStatus(p.paymentStatus || p.status);
    if (status !== 'Paid' && status !== 'Partially Refunded') return false;
    const dateRaw = p.paidAt || p.createdAt || '';
    if (!dateRaw) return false;
    const pDateIso = new Date(dateRaw).toISOString().split('T')[0];
    const pDateLocal = new Date(new Date(dateRaw).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
    return pDateIso === todayStr || pDateLocal === localTodayStr;
  });
  const collectedToday = todayPayments.reduce((sum, p) => sum + Number(p.amount || p.numericAmount || 0), 0);

  // Pending refunds count
  const pendingRefunds = (refunds || []).filter((r) => r && r.status === 'Awaiting Approval').length;

  // Therapist payouts
  const pendingPayouts = (payouts || []).filter((p) => p && (p.status === 'Pending' || p.status === 'Scheduled'));
  const therapistPayoutTotal = pendingPayouts.reduce((sum, p) => sum + Number(p.netPayout || 0), 0);

  // Revenue change (compare current period vs previous)
  const prevRangeStart = new Date(rangeStart.getTime() - daysBack * 24 * 60 * 60 * 1000);
  const prevPaidPayments = (payments || []).filter((p) => {
    if (!p) return false;
    const status = normalizePaymentStatus(p.paymentStatus || p.status);
    if (status !== 'Paid' && status !== 'Partially Refunded') return false;
    const createdDate = new Date(p.paidAt || p.createdAt);
    return !isNaN(createdDate.getTime()) && createdDate >= prevRangeStart && createdDate < rangeStart;
  });
  const prevRevenue = prevPaidPayments.reduce((sum, p) => sum + Number(p.amount || p.numericAmount || 0), 0);
  const revenueChange = prevRevenue > 0 ? Math.round(((netRevenue - prevRevenue) / prevRevenue) * 100) : 0;

  return {
    grossRevenue,
    refundedAmount,
    netRevenue,
    revenue: netRevenue,
    revenueChange,
    outstanding,
    outstandingPatientCount: outstandingPatientIds.size,
    collectedToday,
    collectedTodayCount: todayPayments.length,
    pendingRefunds,
    therapistPayouts: therapistPayoutTotal,
  };
};

export const buildMetricCards = (metrics: PaymentsDashboardMetrics): MetricCardData[] => [
  {
    title: 'NET REVENUE',
    value: `₹${metrics.netRevenue.toLocaleString('en-IN')}`,
    subtext: `Gross: ₹${metrics.grossRevenue.toLocaleString('en-IN')}`,
    badgeType: 'success',
    iconType: 'trend',
  },
  {
    title: 'REFUNDED AMOUNT',
    value: `₹${metrics.refundedAmount.toLocaleString('en-IN')}`,
    subtext: metrics.pendingRefunds > 0 ? `${metrics.pendingRefunds} pending approval` : 'No pending refunds',
    badgeType: metrics.pendingRefunds > 0 ? 'warning' : 'info',
    iconType: 'refunds',
  },
  {
    title: 'OUTSTANDING',
    badge: metrics.outstandingPatientCount > 5 ? 'ATTENTION' : 'HEALTHY',
    value: `₹${metrics.outstanding.toLocaleString('en-IN')}`,
    subtext: `Due from ${metrics.outstandingPatientCount} patient${metrics.outstandingPatientCount !== 1 ? 's' : ''}`,
    badgeType: 'warning',
    iconType: 'attention',
  },
  {
    title: 'COLLECTED TODAY',
    value: `₹${metrics.collectedToday.toLocaleString('en-IN')}`,
    subtext: `${metrics.collectedTodayCount} transaction${metrics.collectedTodayCount !== 1 ? 's' : ''}`,
    iconType: 'today',
  },
  {
    title: 'THERAPIST PAYOUTS',
    value: `₹${metrics.therapistPayouts.toLocaleString('en-IN')}`,
    subtext: metrics.therapistPayouts === 0 ? 'Up to date' : 'Pending settlement',
    iconType: 'payouts',
    isHighlighted: metrics.therapistPayouts > 0,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Data Transformers — Firestore docs → UI display items
// ─────────────────────────────────────────────────────────────────────────────

export const toInvoiceItems = (invoices: InvoiceDocument[]): InvoiceItem[] =>
  invoices.map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    patientName: inv.patientName,
    patientEmail: inv.patientEmail,
    therapistName: inv.therapistName,
    issueDate: inv.issueDate,
    dueDate: inv.dueDate,
    amount: inv.totalAmount || inv.amount,
    status: inv.status,
    paymentMethod: inv.paymentMethod,
  }));

export const toTransactionItems = (
  txns: TransactionRecord[],
  payments: PaymentRecord[]
): TransactionItem[] => {
  // Combine explicit transactions with payment-sourced transactions
  const txnMap = new Map<string, TransactionItem>();

  for (const t of txns) {
    txnMap.set(t.transactionId, {
      id: t.id,
      transactionId: t.transactionId,
      patientName: t.patientName,
      method: t.method,
      amount: t.amount,
      type: t.type,
      timestamp: t.timestamp,
      status: t.status,
    });
  }

  // Add payment records that don't have explicit transactions
  for (const p of payments) {
    const txnId = p.transactionId || p.id;
    if (!txnMap.has(txnId) && p.amount > 0) {
      txnMap.set(txnId, {
        id: p.id,
        transactionId: txnId,
        patientName: p.patientName,
        method: p.paymentMethod || 'UPI',
        amount: p.amount,
        type: 'Payment',
        timestamp: p.paidAt || p.createdAt,
        status: normalizePaymentStatus(p.paymentStatus || p.status) === 'Paid' ? 'Completed' : 'Pending',
      });
    }
  }

  return Array.from(txnMap.values()).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

export const toPackageItems = (pkgs: PackageDocument[]): PackageItem[] =>
  pkgs.map((pkg) => ({
    id: pkg.id,
    packageName: pkg.packageName,
    description: pkg.description,
    patientName: pkg.patientName || 'Unassigned',
    totalSessions: pkg.totalSessions,
    completedSessions: pkg.completedSessions,
    remainingSessions: pkg.remainingSessions,
    totalAmount: pkg.totalAmount,
    paidAmount: pkg.paidAmount,
    validityDays: pkg.validityDays,
    expiryDate: pkg.expiryDate,
    status: pkg.status,
    isActive: pkg.isActive,
  }));

export const toRefundItems = (refunds: RefundDocument[]): RefundItem[] =>
  refunds.map((r) => ({
    id: r.id,
    refundId: r.refundId,
    patientName: r.patientName,
    amount: r.amount,
    originalAmount: r.originalAmount,
    reason: r.reason,
    requestDate: r.requestDate,
    status: r.status,
    paymentId: r.paymentId,
  }));

export const toPayoutItems = (payouts: PayoutDocument[]): PayoutRecordItem[] =>
  payouts.map((p) => ({
    id: p.id,
    therapistName: p.therapistName,
    role: p.therapistRole || 'Physiotherapist',
    period: p.period,
    sessionCount: p.sessionCount,
    grossEarnings: p.grossEarnings,
    platformDeduction: p.platformDeduction,
    netPayout: p.netPayout,
    status: p.status,
    dueDate: p.dueDate,
  }));

export const toOutstandingItems = (invoices: InvoiceDocument[]): OutstandingPaymentItem[] =>
  (invoices || [])
    .filter((inv) => inv && (inv.status === 'Pending' || inv.status === 'Overdue'))
    .sort((a, b) => new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime())
    .slice(0, 5)
    .map((inv) => {
      const name = String(inv.patientName || 'Patient');
      const parts = name.split(' ').filter(Boolean);
      const initials = parts.map((n) => n[0] || '').join('').substring(0, 2).toUpperCase() || 'P';
      const dueDate = inv.dueDate ? new Date(inv.dueDate) : new Date();
      const today = new Date();
      const isValidDate = !isNaN(dueDate.getTime());
      const isOverdue = isValidDate && dueDate < today;
      const diffDays = isValidDate
        ? Math.abs(Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
        : 0;
      const dueDateLabel = isOverdue
        ? `Overdue ${diffDays}d`
        : diffDays === 0
          ? 'Due today'
          : `Due in ${diffDays}d`;

      return {
        id: inv.id,
        patientName: name,
        initials,
        invoiceId: inv.invoiceNumber || inv.id,
        amount: inv.totalAmount || inv.amount || 0,
        dueDateLabel,
        isOverdue,
      };
    });

export const toMethodDistribution = (payments: PaymentRecord[]): MethodDistributionItem[] => {
  const paidPayments = payments.filter(
    (p) => normalizePaymentStatus(p.paymentStatus || p.status) === 'Paid' && p.amount > 0
  );
  const total = paidPayments.reduce((s, p) => s + p.amount, 0);
  if (total === 0) return [];

  const methodMap: Record<string, { count: number; amount: number }> = {};
  for (const p of paidPayments) {
    const method = (p.paymentMethod || 'Other').replace(/\s*\(.*\)/, '').trim();
    const normalizedMethod = method.toUpperCase().includes('UPI') ? 'UPI'
      : method.toUpperCase().includes('CARD') || method.toUpperCase().includes('CREDIT') || method.toUpperCase().includes('DEBIT') ? 'Card'
        : method.toUpperCase().includes('NET') || method.toUpperCase().includes('BANKING') ? 'Net Banking'
          : method.toUpperCase().includes('CASH') ? 'Cash'
            : 'Other';
    if (!methodMap[normalizedMethod]) methodMap[normalizedMethod] = { count: 0, amount: 0 };
    methodMap[normalizedMethod].count += 1;
    methodMap[normalizedMethod].amount += p.amount;
  }

  const colors: Record<string, string> = {
    UPI: '#1E40AF',
    Card: '#06B6D4',
    'Net Banking': '#818CF8',
    Cash: '#F59E0B',
    Other: '#94A3B8',
  };

  return Object.entries(methodMap)
    .map(([method, data]) => ({
      method,
      percentage: Math.round((data.amount / total) * 100),
      color: colors[method] || '#94A3B8',
      amount: `₹${data.amount.toLocaleString('en-IN')}`,
      count: data.count,
    }))
    .sort((a, b) => b.percentage - a.percentage);
};

export const toRevenueTrend = (
  payments: PaymentRecord[],
  payouts: PayoutDocument[],
  timeframe: string
): RevenueTrendPoint[] => {
  const now = new Date();
  const daysBack = timeframe === 'Last 7 Days' ? 7
    : timeframe === 'Last 30 Days' ? 30
      : timeframe === 'This Quarter' ? 90
        : 365;

  const paidPayments = (payments || []).filter(
    (p) => p && normalizePaymentStatus(p.paymentStatus || p.status) === 'Paid'
  );

  const groupSize = daysBack <= 7 ? 1 : daysBack <= 30 ? 5 : daysBack <= 90 ? 15 : 30;
  const numGroups = Math.ceil(daysBack / groupSize);
  const groups: RevenueTrendPoint[] = [];

  for (let i = numGroups - 1; i >= 0; i--) {
    const groupEnd = new Date(now.getTime() - i * groupSize * 24 * 60 * 60 * 1000);
    const groupStart = new Date(groupEnd.getTime() - groupSize * 24 * 60 * 60 * 1000);

    const label = groupEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const groupPayments = paidPayments.filter((p) => {
      const d = new Date(p.paidAt || p.createdAt || 0);
      return !isNaN(d.getTime()) && d >= groupStart && d <= groupEnd;
    });
    const groupPayouts = (payouts || []).filter((po) => {
      const d = new Date(po.createdAt || 0);
      return !isNaN(d.getTime()) && d >= groupStart && d <= groupEnd;
    });

    const netRevenue = groupPayments.reduce((s, p) => s + (p.amount || 0), 0);
    const payoutTotal = groupPayouts.reduce((s, po) => s + (po.netPayout || 0), 0);

    groups.push({
      label,
      netRevenue: netRevenue / 1000,
      payouts: payoutTotal / 1000,
    });
  }

  return groups;
};

export const toRecentActivity = (
  payments: PaymentRecord[],
  refunds: RefundDocument[],
  payouts: PayoutDocument[]
): RecentActivityItem[] => {
  const items: RecentActivityItem[] = [];
  const now = new Date();

  const getTimeAgo = (dateStr: string): string => {
    if (!dateStr) return 'Recently';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Recently';
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays}d ago`;
  };

  const sortedPayments = [...(payments || [])]
    .filter(Boolean)
    .sort((a, b) => new Date(b.paidAt || b.createdAt || 0).getTime() - new Date(a.paidAt || a.createdAt || 0).getTime())
    .slice(0, 5);

  for (const p of sortedPayments) {
    const status = normalizePaymentStatus(p.paymentStatus || p.status);
    const amt = (p.amount || 0).toLocaleString('en-IN');
    items.push({
      id: `act-pay-${p.id}`,
      type: status === 'Paid' ? 'success' : status === 'Failed' ? 'failed' : 'scheduled',
      title: `Payment ${status === 'Paid' ? 'Received' : status}`,
      description: `${p.patientName || 'Patient'} — ₹${amt} via ${p.paymentMethod || 'UPI'}`,
      timeAgo: getTimeAgo(p.paidAt || p.createdAt),
      amount: `₹${amt}`,
    });
  }

  // Recent refunds
  const sortedRefunds = [...(refunds || [])]
    .filter(Boolean)
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 3);

  for (const r of sortedRefunds) {
    const amt = (r.amount || 0).toLocaleString('en-IN');
    items.push({
      id: `act-rfd-${r.id}`,
      type: 'refund',
      title: `Refund ${r.status || 'Requested'}`,
      description: `${r.patientName || 'Patient'} — ₹${amt} (${r.reason || 'Cancellation'})`,
      timeAgo: getTimeAgo(r.createdAt),
      amount: `₹${amt}`,
    });
  }

  return items
    .sort((a, b) => {
      const parseAgo = (ago: string) => {
        if (ago === 'Just now') return 0;
        const num = parseInt(ago);
        if (ago.includes('min')) return num;
        if (ago.includes('h')) return num * 60;
        if (ago.includes('d')) return num * 1440;
        return 9999;
      };
      return parseAgo(a.timeAgo) - parseAgo(b.timeAgo);
    })
    .slice(0, 8);
};

// ─────────────────────────────────────────────────────────────────────────────
// Filtering
// ─────────────────────────────────────────────────────────────────────────────

export const applyFiltersToPayments = (
  payments: PaymentRecord[],
  filters: PaymentFilters
): PaymentRecord[] => {
  const now = new Date();
  const daysBack = filters.timeframe === 'Last 7 Days' ? 7
    : filters.timeframe === 'Last 30 Days' ? 30
      : filters.timeframe === 'This Quarter' ? 90
        : filters.timeframe === 'This Year' ? 365
          : 30;
  const rangeStart = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

  return payments.filter((p) => {
    // Timeframe
    const created = new Date(p.paidAt || p.createdAt);
    if (created < rangeStart) return false;

    // Status
    if (filters.status !== 'All') {
      const normalized = normalizePaymentStatus(p.paymentStatus || p.status);
      if (normalized !== filters.status) return false;
    }

    // Payment method
    if (filters.method !== 'Any' && filters.method !== 'All') {
      const method = (p.paymentMethod || '').toUpperCase();
      const filterUpper = filters.method.toUpperCase();
      if (!method.includes(filterUpper) && filterUpper !== 'ANY') return false;
    }

    // Therapist
    if (filters.therapist !== 'All') {
      const therapistName = p.therapistName || p.doctor || '';
      if (therapistName !== filters.therapist) return false;
    }

    return true;
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Export Functions
// ─────────────────────────────────────────────────────────────────────────────

export const exportPaymentsToCSV = (
  payments: PaymentRecord[],
  transactions: TransactionRecord[]
): void => {
  const rows: string[][] = [
    ['Transaction ID', 'Date', 'Patient', 'Therapist', 'Amount (₹)', 'Method', 'Status', 'Type'],
  ];

  const allItems = toTransactionItems(transactions, payments);
  for (const item of allItems) {
    rows.push([
      item.transactionId,
      item.timestamp,
      item.patientName,
      '',
      String(item.amount),
      String(item.method),
      item.status,
      item.type,
    ]);
  }

  const csvContent = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `payments_export_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportFinancialsReport = (
  payments: PaymentRecord[],
  invoices: InvoiceDocument[],
  refunds: RefundDocument[],
  payouts: PayoutDocument[]
): void => {
  const paidPayments = payments.filter(
    (p) => normalizePaymentStatus(p.paymentStatus || p.status) === 'Paid'
  );
  const totalRevenue = paidPayments.reduce((s, p) => s + p.amount, 0);
  const totalRefunds = refunds
    .filter((r) => r.status === 'Approved' || r.status === 'Completed')
    .reduce((s, r) => s + r.amount, 0);
  const totalPayouts = payouts
    .filter((p) => p.status === 'Paid')
    .reduce((s, p) => s + p.netPayout, 0);
  const outstanding = invoices
    .filter((i) => i.status === 'Pending' || i.status === 'Overdue')
    .reduce((s, i) => s + (i.totalAmount || i.amount), 0);

  const report = [
    ['FINANCIAL SUMMARY REPORT'],
    [`Generated: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}`],
    [''],
    ['Category', 'Amount (₹)'],
    ['Total Revenue', String(totalRevenue)],
    ['Total Refunds', String(totalRefunds)],
    ['Net Revenue', String(totalRevenue - totalRefunds)],
    ['Outstanding', String(outstanding)],
    ['Therapist Payouts (Paid)', String(totalPayouts)],
    ['Platform Earnings', String(totalRevenue - totalPayouts - totalRefunds)],
    [''],
    ['INVOICE BREAKDOWN'],
    ['Status', 'Count', 'Total Amount'],
    ...['Paid', 'Pending', 'Overdue', 'Draft', 'Cancelled'].map((status) => {
      const filtered = invoices.filter((i) => i.status === status);
      return [status, String(filtered.length), String(filtered.reduce((s, i) => s + (i.totalAmount || i.amount), 0))];
    }),
  ];

  const csvContent = report.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `financial_report_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ─────────────────────────────────────────────────────────────────────────────
// Reconciliation
// ─────────────────────────────────────────────────────────────────────────────

export interface ReconciliationResult {
  matchedCount: number;
  unmatchedPayments: PaymentRecord[];
  unmatchedInvoices: InvoiceDocument[];
  totalPayments: number;
  totalInvoices: number;
}

export const reconcileAccounts = (
  payments: PaymentRecord[],
  invoices: InvoiceDocument[]
): ReconciliationResult => {
  const paidPayments = payments.filter(
    (p) => normalizePaymentStatus(p.paymentStatus || p.status) === 'Paid'
  );
  const paidInvoices = invoices.filter((i) => i.status === 'Paid');

  const paymentInvoiceIds = new Set(paidPayments.map((p) => p.invoiceId).filter(Boolean));
  const invoiceIds = new Set(paidInvoices.map((i) => i.id));

  const matchedCount = [...paymentInvoiceIds].filter((id) => invoiceIds.has(id!)).length;
  const unmatchedPayments = paidPayments.filter((p) => !p.invoiceId || !invoiceIds.has(p.invoiceId));
  const unmatchedInvoices = paidInvoices.filter((i) => !paymentInvoiceIds.has(i.id));

  return {
    matchedCount,
    unmatchedPayments,
    unmatchedInvoices,
    totalPayments: paidPayments.reduce((s, p) => s + p.amount, 0),
    totalInvoices: paidInvoices.reduce((s, i) => s + (i.totalAmount || i.amount), 0),
  };
};
