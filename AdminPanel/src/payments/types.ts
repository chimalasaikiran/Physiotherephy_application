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
  netRevenue: number; // in thousands/millions
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
  method: 'UPI' | 'Card' | 'Net Banking';
  percentage: number;
  color: string;
  amount: string;
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
  patientEmail: string;
  therapistName: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Draft';
  paymentMethod?: string;
}

export interface TransactionItem {
  id: string;
  transactionId: string;
  patientName: string;
  method: 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Cash';
  amount: number;
  type: 'Payment' | 'Refund' | 'Payout';
  timestamp: string;
  status: 'Completed' | 'Failed' | 'Processing';
}

export interface PackageItem {
  id: string;
  packageName: string;
  patientName: string;
  totalSessions: number;
  completedSessions: number;
  totalAmount: number;
  paidAmount: number;
  status: 'Active' | 'Completed' | 'Pending Payment';
}

export interface RefundItem {
  id: string;
  refundId: string;
  patientName: string;
  amount: number;
  reason: string;
  requestDate: string;
  status: 'Awaiting Approval' | 'Approved' | 'Rejected';
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
  status: 'Paid' | 'Scheduled' | 'Processing';
  dueDate: string;
}
