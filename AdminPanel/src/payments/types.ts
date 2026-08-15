// ─────────────────────────────────────────────────────────────────────────────
// Payment Status Types
// ─────────────────────────────────────────────────────────────────────────────

export type PaymentStatus = 'Paid' | 'Pending' | 'Failed' | 'Refunded' | 'Partially Refunded' | 'Cancelled';
export type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue' | 'Draft' | 'Cancelled';
export type RefundStatus = 'Awaiting Approval' | 'Approved' | 'Rejected' | 'Processing' | 'Completed';
export type PayoutStatus = 'Paid' | 'Scheduled' | 'Processing' | 'Pending';
export type PackageStatus = 'Active' | 'Completed' | 'Pending Payment' | 'Expired' | 'Archived';
export type TransactionType = 'Payment' | 'Refund' | 'Payout';
export type PaymentMethodType = 'UPI' | 'Credit Card' | 'Debit Card' | 'Card' | 'Net Banking' | 'Cash' | 'Other';

// ─────────────────────────────────────────────────────────────────────────────
// Firestore Document Types
// ─────────────────────────────────────────────────────────────────────────────

export interface PaymentRecord {
  id: string;
  paymentId: string;
  patientId: string;
  userId?: string; // mobile app uses userId
  patientName: string;
  therapistId: string;
  therapistName: string;
  appointmentId?: string;
  programId?: string;
  amount: number;
  numericAmount?: number; // mobile compat
  currency: string;
  paymentMethod: PaymentMethodType | string;
  paymentMethodName?: string; // mobile compat
  paymentStatus: PaymentStatus;
  status?: string; // mobile compat (PAID/PENDING)
  transactionId: string;
  invoiceId?: string;
  invoiceNumber?: string;
  invoiceNo?: string; // mobile compat
  refundStatus?: RefundStatus | string;
  bookingId?: string; // mobile compat
  title?: string; // mobile compat (service description)
  doctor?: string; // mobile compat
  doctorId?: string; // mobile compat
  paymentMode?: string; // online/clinic
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceDocument {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  patientEmail?: string;
  therapistId: string;
  therapistName: string;
  appointmentId?: string;
  programId?: string;
  packageId?: string;
  description: string;
  lineItems?: InvoiceLineItem[];
  amount: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount: number;
  currency: string;
  status: InvoiceStatus;
  paymentMethod?: string;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface TransactionRecord {
  id: string;
  transactionId: string;
  type: TransactionType;
  patientId: string;
  patientName: string;
  therapistId?: string;
  therapistName?: string;
  appointmentId?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  paymentId?: string;
  refundId?: string;
  payoutId?: string;
  amount: number;
  currency: string;
  method: PaymentMethodType | string;
  status: 'Completed' | 'Failed' | 'Processing' | 'Pending';
  description?: string;
  timestamp: string;
  createdAt: string;
}

export interface PackageDocument {
  id: string;
  packageName: string;
  description?: string;
  patientId?: string;
  patientName?: string;
  therapistId?: string;
  therapistName?: string;
  totalSessions: number;
  completedSessions: number;
  remainingSessions: number;
  totalAmount: number;
  paidAmount: number;
  currency: string;
  validityDays: number;
  startDate?: string;
  expiryDate?: string;
  status: PackageStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RefundDocument {
  id: string;
  refundId: string;
  paymentId: string;
  transactionId?: string;
  invoiceId?: string;
  patientId: string;
  patientName: string;
  therapistId?: string;
  therapistName?: string;
  amount: number;
  originalAmount: number;
  currency: string;
  reason: string;
  status: RefundStatus;
  requestDate: string;
  processedDate?: string;
  processedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayoutDocument {
  id: string;
  therapistId: string;
  therapistName: string;
  therapistRole?: string;
  period: string;
  sessionCount: number;
  grossEarnings: number;
  platformFeePercent: number;
  platformDeduction: number;
  netPayout: number;
  currency: string;
  status: PayoutStatus;
  dueDate: string;
  paidDate?: string;
  paymentReference?: string;
  appointmentIds?: string[];
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard / UI Display Types (existing — backward compatible)
// ─────────────────────────────────────────────────────────────────────────────

export interface MetricCardData {
  title: string;
  value: string;
  subtext: string;
  badge?: string;
  badgeType?: 'success' | 'warning' | 'info' | 'accent';
  iconType: 'trend' | 'attention' | 'today' | 'refunds' | 'payouts';
  isHighlighted?: boolean;
}

export interface RevenueTrendPoint {
  label: string;
  netRevenue: number;
  payouts: number;
}

export interface OutstandingPaymentItem {
  id: string;
  patientName: string;
  initials: string;
  invoiceId: string;
  amount: number;
  dueDateLabel: string;
  isOverdue?: boolean;
}

export interface MethodDistributionItem {
  method: string;
  percentage: number;
  color: string;
  amount: string;
  count: number;
}

export interface TherapistPayoutItem {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  accumulatedAmount: number;
  targetPercentage: number;
}

export interface RecentActivityItem {
  id: string;
  type: 'success' | 'failed' | 'scheduled' | 'refund';
  title: string;
  description: string;
  timeAgo: string;
  amount?: string;
}

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  patientName: string;
  patientEmail?: string;
  therapistName: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: InvoiceStatus;
  paymentMethod?: string;
}

export interface TransactionItem {
  id: string;
  transactionId: string;
  patientName: string;
  method: PaymentMethodType | string;
  amount: number;
  type: TransactionType;
  timestamp: string;
  status: 'Completed' | 'Failed' | 'Processing' | 'Pending';
}

export interface PackageItem {
  id: string;
  packageName: string;
  description?: string;
  patientName: string;
  totalSessions: number;
  completedSessions: number;
  remainingSessions: number;
  totalAmount: number;
  paidAmount: number;
  validityDays?: number;
  expiryDate?: string;
  status: PackageStatus;
  isActive: boolean;
}

export interface RefundItem {
  id: string;
  refundId: string;
  patientName: string;
  amount: number;
  originalAmount: number;
  reason: string;
  requestDate: string;
  status: RefundStatus;
  paymentId?: string;
}

export interface PayoutRecordItem {
  id: string;
  therapistName: string;
  role: string;
  period: string;
  sessionCount: number;
  grossEarnings: number;
  platformDeduction: number;
  netPayout: number;
  status: PayoutStatus;
  dueDate: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard Metrics Computed Type
// ─────────────────────────────────────────────────────────────────────────────

export interface PaymentsDashboardMetrics {
  revenue: number;
  revenueChange: number; // percentage vs last period
  outstanding: number;
  outstandingPatientCount: number;
  collectedToday: number;
  collectedTodayCount: number;
  pendingRefunds: number;
  therapistPayouts: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Filter State Type
// ─────────────────────────────────────────────────────────────────────────────

export interface PaymentFilters {
  timeframe: string;
  status: string;
  method: string;
  therapist: string;
}
