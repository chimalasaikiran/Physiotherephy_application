import { collection, getDocs, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '@/auth/config/firebase';
import {
  PAYMENTS_COLLECTION,
  INVOICES_COLLECTION,
  TRANSACTIONS_COLLECTION,
  PACKAGES_COLLECTION,
  REFUNDS_COLLECTION,
  PAYOUTS_COLLECTION,
} from '@/services/paymentService';

import type { MetricCardData } from './types';

export const METRIC_CARDS_DATA: MetricCardData[] = [
  {
    title: 'REVENUE',
    value: '₹68,500',
    subtext: '+12% vs last period',
    badgeType: 'success',
    iconType: 'trend',
  },
  {
    title: 'OUTSTANDING',
    badge: 'ATTENTION',
    value: '₹19,200',
    subtext: 'Due from 3 patients',
    badgeType: 'warning',
    iconType: 'attention',
  },
  {
    title: 'COLLECTED TODAY',
    value: '₹13,300',
    subtext: '2 transactions',
    iconType: 'today',
  },
  {
    title: 'PENDING REFUNDS',
    value: '2',
    subtext: 'Awaiting approval',
    iconType: 'refunds',
  },
  {
    title: 'THERAPIST PAYOUTS',
    value: '₹45,200',
    subtext: 'Pending settlement',
    iconType: 'payouts',
    isHighlighted: true,
  },
];

export const UPCOMING_PAYOUTS_DATA = [
  {
    id: 'therapist_001',
    name: 'Dr. Arjun Mehta',
    role: 'Senior Physiotherapist',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150',
    accumulatedAmount: 27040,
    targetPercentage: 85,
  },
  {
    id: 'therapist_002',
    name: 'Dr. Priya Desai',
    role: 'Spine Specialist',
    avatarUrl: 'https://images.unsplash.com/photo-1594824813566-88855ce78907?w=150',
    accumulatedAmount: 18160,
    targetPercentage: 65,
  },
  {
    id: 'therapist_003',
    name: 'Dr. Sneha Iyer',
    role: 'Sports Rehabilitation',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
    accumulatedAmount: 14400,
    targetPercentage: 50,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Seed Demo Data — populates Firestore when collections are empty
// ─────────────────────────────────────────────────────────────────────────────

const now = new Date();
const daysAgo = (d: number) => {
  const date = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
  return date.toISOString();
};
const dateStr = (d: number) => {
  const date = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
  return date.toISOString().split('T')[0];
};
const futureDate = (d: number) => {
  const date = new Date(now.getTime() + d * 24 * 60 * 60 * 1000);
  return date.toISOString().split('T')[0];
};

const SEED_PAYMENTS = [
  { patientId: 'patient_001', userId: 'patient_001', patientName: 'Sanya Malhotra', therapistId: 'therapist_001', therapistName: 'Dr. Arjun Mehta', doctor: 'Dr. Arjun Mehta', doctorId: 'therapist_001', amount: 14500, paymentMethod: 'UPI', paymentStatus: 'Paid', status: 'PAID', title: 'ACL Recovery Session', invoiceNumber: 'INV-202608-0001', transactionId: 'TXN-SEED-001', paidAt: daysAgo(1) },
  { patientId: 'patient_002', userId: 'patient_002', patientName: 'Rahul Sharma', therapistId: 'therapist_002', therapistName: 'Dr. Priya Desai', doctor: 'Dr. Priya Desai', doctorId: 'therapist_002', amount: 8200, paymentMethod: 'Credit Card', paymentStatus: 'Paid', status: 'PAID', title: 'Spine Rehabilitation', invoiceNumber: 'INV-202608-0002', transactionId: 'TXN-SEED-002', paidAt: daysAgo(2) },
  { patientId: 'patient_003', userId: 'patient_003', patientName: 'Neha Kapoor', therapistId: 'therapist_001', therapistName: 'Dr. Arjun Mehta', doctor: 'Dr. Arjun Mehta', doctorId: 'therapist_001', amount: 5000, paymentMethod: 'UPI', paymentStatus: 'Paid', status: 'PAID', title: 'Post-Surgery Rehab', invoiceNumber: 'INV-202608-0003', transactionId: 'TXN-SEED-003', paidAt: daysAgo(3) },
  { patientId: 'patient_004', userId: 'patient_004', patientName: 'Vikram Patel', therapistId: 'therapist_003', therapistName: 'Dr. Sneha Iyer', doctor: 'Dr. Sneha Iyer', doctorId: 'therapist_003', amount: 12000, paymentMethod: 'Net Banking', paymentStatus: 'Paid', status: 'PAID', title: 'Full Physical Therapy', invoiceNumber: 'INV-202608-0004', transactionId: 'TXN-SEED-004', paidAt: daysAgo(5) },
  { patientId: 'patient_005', userId: 'patient_005', patientName: 'Ananya Singh', therapistId: 'therapist_002', therapistName: 'Dr. Priya Desai', doctor: 'Dr. Priya Desai', doctorId: 'therapist_002', amount: 3500, paymentMethod: 'Cash', paymentStatus: 'Paid', status: 'PAID', title: 'Ergonomic Assessment', invoiceNumber: 'INV-202608-0005', transactionId: 'TXN-SEED-005', paidAt: daysAgo(0) },
  { patientId: 'patient_006', userId: 'patient_006', patientName: 'Rohan Gupta', therapistId: 'therapist_001', therapistName: 'Dr. Arjun Mehta', doctor: 'Dr. Arjun Mehta', doctorId: 'therapist_001', amount: 9800, paymentMethod: 'UPI', paymentStatus: 'Paid', status: 'PAID', title: 'Shoulder Rehab', invoiceNumber: 'INV-202608-0006', transactionId: 'TXN-SEED-006', paidAt: daysAgo(0) },
  { patientId: 'patient_007', userId: 'patient_007', patientName: 'Meera Joshi', therapistId: 'therapist_003', therapistName: 'Dr. Sneha Iyer', doctor: 'Dr. Sneha Iyer', doctorId: 'therapist_003', amount: 6000, paymentMethod: 'Debit Card', paymentStatus: 'Paid', status: 'PAID', title: 'Sports Injury Recovery', invoiceNumber: 'INV-202608-0007', transactionId: 'TXN-SEED-007', paidAt: daysAgo(8) },
  { patientId: 'patient_008', userId: 'patient_008', patientName: 'Aditya Reddy', therapistId: 'therapist_002', therapistName: 'Dr. Priya Desai', doctor: 'Dr. Priya Desai', doctorId: 'therapist_002', amount: 15000, paymentMethod: 'Credit Card', paymentStatus: 'Paid', status: 'PAID', title: 'Comprehensive Rehab Package', invoiceNumber: 'INV-202608-0008', transactionId: 'TXN-SEED-008', paidAt: daysAgo(12) },
  { patientId: 'patient_009', userId: 'patient_009', patientName: 'Priyanka Das', therapistId: 'therapist_001', therapistName: 'Dr. Arjun Mehta', doctor: 'Dr. Arjun Mehta', doctorId: 'therapist_001', amount: 4500, paymentMethod: 'UPI', paymentStatus: 'Pending', status: 'PENDING', title: 'Knee Assessment', invoiceNumber: 'INV-202608-0009', transactionId: 'TXN-SEED-009', paidAt: '' },
  { patientId: 'patient_010', userId: 'patient_010', patientName: 'Karan Khanna', therapistId: 'therapist_003', therapistName: 'Dr. Sneha Iyer', doctor: 'Dr. Sneha Iyer', doctorId: 'therapist_003', amount: 7200, paymentMethod: 'Net Banking', paymentStatus: 'Pending', status: 'PENDING', title: 'Back Pain Therapy', invoiceNumber: 'INV-202608-0010', transactionId: 'TXN-SEED-010', paidAt: '' },
  { patientId: 'patient_001', userId: 'patient_001', patientName: 'Sanya Malhotra', therapistId: 'therapist_002', therapistName: 'Dr. Priya Desai', doctor: 'Dr. Priya Desai', doctorId: 'therapist_002', amount: 11000, paymentMethod: 'UPI', paymentStatus: 'Paid', status: 'PAID', title: 'Follow-up Session', invoiceNumber: 'INV-202608-0011', transactionId: 'TXN-SEED-011', paidAt: daysAgo(15) },
  { patientId: 'patient_003', userId: 'patient_003', patientName: 'Neha Kapoor', therapistId: 'therapist_003', therapistName: 'Dr. Sneha Iyer', doctor: 'Dr. Sneha Iyer', doctorId: 'therapist_003', amount: 2800, paymentMethod: 'Cash', paymentStatus: 'Paid', status: 'PAID', title: 'Stretching Session', invoiceNumber: 'INV-202608-0012', transactionId: 'TXN-SEED-012', paidAt: daysAgo(20) },
];

const SEED_INVOICES = [
  { invoiceNumber: 'INV-202608-0001', patientId: 'patient_001', patientName: 'Sanya Malhotra', therapistId: 'therapist_001', therapistName: 'Dr. Arjun Mehta', description: 'ACL Recovery Session (8 visits)', amount: 14500, totalAmount: 14500, currency: 'INR', status: 'Paid', paymentMethod: 'UPI', issueDate: dateStr(5), dueDate: dateStr(-5), paidDate: daysAgo(1) },
  { invoiceNumber: 'INV-202608-0002', patientId: 'patient_002', patientName: 'Rahul Sharma', therapistId: 'therapist_002', therapistName: 'Dr. Priya Desai', description: 'Spine Rehabilitation Program', amount: 8200, totalAmount: 8200, currency: 'INR', status: 'Paid', paymentMethod: 'Credit Card', issueDate: dateStr(7), dueDate: dateStr(-2), paidDate: daysAgo(2) },
  { invoiceNumber: 'INV-202608-0003', patientId: 'patient_009', patientName: 'Priyanka Das', therapistId: 'therapist_001', therapistName: 'Dr. Arjun Mehta', description: 'Knee Assessment & Initial Consultation', amount: 4500, totalAmount: 4500, currency: 'INR', status: 'Pending', issueDate: dateStr(3), dueDate: futureDate(7) },
  { invoiceNumber: 'INV-202608-0004', patientId: 'patient_010', patientName: 'Karan Khanna', therapistId: 'therapist_003', therapistName: 'Dr. Sneha Iyer', description: 'Back Pain Therapy (5 Sessions)', amount: 7200, totalAmount: 7200, currency: 'INR', status: 'Pending', issueDate: dateStr(2), dueDate: futureDate(12) },
  { invoiceNumber: 'INV-202608-0005', patientId: 'patient_006', patientName: 'Rohan Gupta', therapistId: 'therapist_001', therapistName: 'Dr. Arjun Mehta', description: 'Shoulder Rehabilitation', amount: 9800, totalAmount: 9800, currency: 'INR', status: 'Paid', paymentMethod: 'UPI', issueDate: dateStr(4), dueDate: dateStr(0), paidDate: daysAgo(0) },
  { invoiceNumber: 'INV-202608-0006', patientId: 'patient_004', patientName: 'Vikram Patel', therapistId: 'therapist_003', therapistName: 'Dr. Sneha Iyer', description: 'Full Physical Therapy Assessment', amount: 12000, totalAmount: 12000, currency: 'INR', status: 'Overdue', issueDate: dateStr(20), dueDate: dateStr(5) },
  { invoiceNumber: 'INV-202608-0007', patientId: 'patient_005', patientName: 'Ananya Singh', therapistId: 'therapist_002', therapistName: 'Dr. Priya Desai', description: 'Ergonomic Counseling Package', amount: 3500, totalAmount: 3500, currency: 'INR', status: 'Paid', paymentMethod: 'Cash', issueDate: dateStr(1), dueDate: dateStr(0), paidDate: daysAgo(0) },
];

const SEED_PACKAGES = [
  { packageName: 'ACL Recovery Pro — 12 Sessions', description: 'Intensive ACL recovery program with progressive exercises', patientId: 'patient_001', patientName: 'Sanya Malhotra', therapistId: 'therapist_001', therapistName: 'Dr. Arjun Mehta', totalSessions: 12, completedSessions: 8, remainingSessions: 4, totalAmount: 36000, paidAmount: 36000, currency: 'INR', validityDays: 90, startDate: dateStr(45), expiryDate: futureDate(45), status: 'Active', isActive: true },
  { packageName: 'Spine Rehab Standard — 8 Sessions', description: 'Standard spine rehabilitation program', patientId: 'patient_002', patientName: 'Rahul Sharma', therapistId: 'therapist_002', therapistName: 'Dr. Priya Desai', totalSessions: 8, completedSessions: 5, remainingSessions: 3, totalAmount: 24000, paidAmount: 16000, currency: 'INR', validityDays: 60, startDate: dateStr(30), expiryDate: futureDate(30), status: 'Active', isActive: true },
  { packageName: 'Sports Injury Recovery — 6 Sessions', description: 'Specialized sports injury treatment plan', patientId: 'patient_007', patientName: 'Meera Joshi', therapistId: 'therapist_003', therapistName: 'Dr. Sneha Iyer', totalSessions: 6, completedSessions: 6, remainingSessions: 0, totalAmount: 18000, paidAmount: 18000, currency: 'INR', validityDays: 45, startDate: dateStr(50), expiryDate: dateStr(5), status: 'Completed', isActive: false },
];

const SEED_REFUNDS = [
  { paymentId: 'TXN-SEED-007', patientId: 'patient_007', patientName: 'Meera Joshi', therapistId: 'therapist_003', therapistName: 'Dr. Sneha Iyer', amount: 3000, originalAmount: 6000, currency: 'INR', reason: 'Patient rescheduled — partial sessions unused', status: 'Awaiting Approval', requestDate: dateStr(1) },
  { paymentId: 'TXN-SEED-008', patientId: 'patient_008', patientName: 'Aditya Reddy', therapistId: 'therapist_002', therapistName: 'Dr. Priya Desai', amount: 15000, originalAmount: 15000, currency: 'INR', reason: 'Treatment plan changed, full refund requested', status: 'Awaiting Approval', requestDate: dateStr(3) },
];

const SEED_PAYOUTS = [
  { therapistId: 'therapist_001', therapistName: 'Dr. Arjun Mehta', therapistRole: 'Senior Physiotherapist', period: 'Aug 1-14, 2026', sessionCount: 18, grossEarnings: 33800, platformFeePercent: 20, platformDeduction: 6760, netPayout: 27040, currency: 'INR', status: 'Pending', dueDate: futureDate(3) },
  { therapistId: 'therapist_002', therapistName: 'Dr. Priya Desai', therapistRole: 'Spine Specialist', period: 'Aug 1-14, 2026', sessionCount: 12, grossEarnings: 22700, platformFeePercent: 20, platformDeduction: 4540, netPayout: 18160, currency: 'INR', status: 'Scheduled', dueDate: futureDate(5) },
  { therapistId: 'therapist_003', therapistName: 'Dr. Sneha Iyer', therapistRole: 'Sports Rehabilitation', period: 'Jul 15-31, 2026', sessionCount: 10, grossEarnings: 18000, platformFeePercent: 20, platformDeduction: 3600, netPayout: 14400, currency: 'INR', status: 'Paid', dueDate: dateStr(5), paidDate: daysAgo(2) },
];

/**
 * Seed demo payment data into Firestore when collections are empty.
 * Safe to call multiple times — only seeds on first run.
 */
export const seedDemoPaymentData = async (): Promise<void> => {
  try {
    // Check if payments already exist
    const existingPayments = await getDocs(collection(db, PAYMENTS_COLLECTION));
    if (existingPayments.size > 0) {
      console.log('[seedPayments] Payment data already exists, skipping seed.');
      return;
    }

    console.log('[seedPayments] Seeding demo payment data...');
    const nowIso = new Date().toISOString();

    // Seed Payments
    for (const p of SEED_PAYMENTS) {
      const payId = `seed-pay-${Math.random().toString(36).slice(2, 10)}`;
      await setDoc(doc(db, PAYMENTS_COLLECTION, payId), {
        id: payId,
        paymentId: payId,
        ...p,
        invoiceNo: p.invoiceNumber,
        numericAmount: p.amount,
        currency: 'INR',
        paymentMode: p.paymentMethod === 'Cash' ? 'clinic' : 'online',
        createdAt: p.paidAt || nowIso,
        updatedAt: nowIso,
      });
    }

    // Seed Invoices
    for (const inv of SEED_INVOICES) {
      await addDoc(collection(db, INVOICES_COLLECTION), {
        ...inv,
        lineItems: [],
        taxAmount: 0,
        discountAmount: 0,
        notes: '',
        createdAt: nowIso,
        updatedAt: nowIso,
      });
    }

    // Seed Transactions (derived from payments)
    for (const p of SEED_PAYMENTS) {
      await addDoc(collection(db, TRANSACTIONS_COLLECTION), {
        transactionId: p.transactionId,
        type: 'Payment',
        patientId: p.patientId,
        patientName: p.patientName,
        therapistId: p.therapistId,
        therapistName: p.therapistName,
        invoiceNumber: p.invoiceNumber,
        amount: p.amount,
        currency: 'INR',
        method: p.paymentMethod,
        status: p.paymentStatus === 'Paid' ? 'Completed' : 'Pending',
        description: `${p.title} — ₹${p.amount.toLocaleString('en-IN')}`,
        timestamp: p.paidAt || nowIso,
        createdAt: p.paidAt || nowIso,
      });
    }

    // Seed Packages
    for (const pkg of SEED_PACKAGES) {
      await addDoc(collection(db, PACKAGES_COLLECTION), {
        ...pkg,
        createdAt: nowIso,
        updatedAt: nowIso,
      });
    }

    // Seed Refunds
    for (const r of SEED_REFUNDS) {
      const refundId = `RFD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      await addDoc(collection(db, REFUNDS_COLLECTION), {
        ...r,
        refundId,
        processedDate: '',
        processedBy: '',
        notes: '',
        createdAt: nowIso,
        updatedAt: nowIso,
      });
    }

    // Seed Payouts
    for (const po of SEED_PAYOUTS) {
      await addDoc(collection(db, PAYOUTS_COLLECTION), {
        ...po,
        paymentReference: '',
        appointmentIds: [],
        createdAt: nowIso,
        updatedAt: nowIso,
      });
    }

    console.log('[seedPayments] ✅ Demo payment data seeded successfully.');
  } catch (err) {
    console.error('[seedPayments] ❌ Error seeding demo payment data:', err);
  }
};
