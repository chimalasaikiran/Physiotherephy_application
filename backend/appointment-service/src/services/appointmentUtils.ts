/**
 * Backend Appointment & Payment Business Logic Utilities
 */

export type AppointmentType = 'HOME_VISIT' | 'CLINIC_VISIT' | 'ONLINE';

export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'EXPIRED';

export type PaymentMethod = 'ONLINE' | 'CASH';

export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'PARTIAL'
  | 'REFUND_PENDING'
  | 'REFUNDED';

export interface LocationData {
  type: AppointmentType;
  clinicId?: string;
  clinicName?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  meetingId?: string;
  meetingUrl?: string;
  provider?: string;
}

export interface PricingData {
  baseAmount: number;
  visitFee: number;
  travelFee: number;
  discount: number;
  tax: number;
  totalAmount: number;
}

export interface PricingInput {
  appointmentType: AppointmentType | string;
  baseAmount?: number;
  homeVisitFee?: number;
  travelFee?: number;
  discount?: number;
  taxRate?: number;
  patientLat?: number;
  patientLng?: number;
  clinicLat?: number;
  clinicLng?: number;
}

export function normalizeAppointmentType(typeStr?: string): AppointmentType {
  if (!typeStr) return 'CLINIC_VISIT';
  const str = typeStr.toString().trim().toUpperCase().replace(/\s+/g, '_');
  if (str.includes('HOME')) return 'HOME_VISIT';
  if (str.includes('ONLINE') || str.includes('VIRTUAL') || str.includes('TELE')) return 'ONLINE';
  return 'CLINIC_VISIT';
}

export function normalizeAppointmentStatus(statusStr?: string): AppointmentStatus {
  if (!statusStr) return 'CONFIRMED';
  const str = statusStr.toString().trim().toUpperCase().replace(/\s+/g, '_');
  if (str === 'SCHEDULED' || str === 'CONFIRMED' || str === 'ACTIVE_/_TODAY' || str === 'UPCOMING') return 'CONFIRMED';
  if (str === 'IN_PROGRESS' || str === 'INPROGRESS' || str === 'ACTIVE') return 'IN_PROGRESS';
  if (str === 'COMPLETED' || str === 'FINISHED') return 'COMPLETED';
  if (str === 'CANCELLED' || str === 'CANCELED') return 'CANCELLED';
  if (str === 'NO_SHOW' || str === 'NOSHOW') return 'NO_SHOW';
  if (str === 'EXPIRED') return 'EXPIRED';
  return 'PENDING';
}

export function normalizePaymentStatus(statusStr?: string): PaymentStatus {
  if (!statusStr) return 'PENDING';
  const str = statusStr.toString().trim().toUpperCase().replace(/\s+/g, '_');
  if (str === 'PAID' || str === 'COMPLETED' || str === 'SUCCESS') return 'PAID';
  if (str === 'FAILED') return 'FAILED';
  if (str === 'PARTIAL' || str === 'PARTIALLY_REFUNDED') return 'PARTIAL';
  if (str === 'REFUND_PENDING') return 'REFUND_PENDING';
  if (str === 'REFUNDED') return 'REFUNDED';
  return 'PENDING';
}

export function normalizePaymentMethod(methodStr?: string): PaymentMethod {
  if (!methodStr) return 'ONLINE';
  const str = methodStr.toString().trim().toUpperCase();
  if (str.includes('CASH') || str.includes('CLINIC')) return 'CASH';
  return 'ONLINE';
}

export function calculateDistanceKm(
  lat1?: number,
  lon1?: number,
  lat2?: number,
  lon2?: number
): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 5.0;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function calculateAppointmentPricing(input: PricingInput): PricingData {
  const type = normalizeAppointmentType(input.appointmentType);
  const baseAmount = Number(input.baseAmount ?? 1500);
  const discount = Number(input.discount ?? 0);
  const taxRate = Number(input.taxRate ?? 0.05);

  let visitFee = 0;
  let travelFee = 0;

  if (type === 'HOME_VISIT') {
    visitFee = Number(input.homeVisitFee ?? 300);
    if (input.travelFee !== undefined) {
      travelFee = Number(input.travelFee);
    } else {
      const distKm = calculateDistanceKm(
        input.clinicLat ?? 12.9716,
        input.clinicLng ?? 77.5946,
        input.patientLat,
        input.patientLng
      );
      travelFee = Math.round(100 + distKm * 20);
    }
  }

  const subtotal = baseAmount + visitFee + travelFee;
  const afterDiscount = Math.max(0, subtotal - discount);
  const tax = Math.round(afterDiscount * taxRate);
  const totalAmount = afterDiscount + tax;

  return {
    baseAmount,
    visitFee,
    travelFee,
    discount,
    tax,
    totalAmount,
  };
}

export function validateStatusTransition(
  currentStatus: AppointmentStatus,
  targetStatus: AppointmentStatus
): { valid: boolean; error?: string } {
  if (currentStatus === targetStatus) {
    return { valid: true };
  }

  const allowedTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
    PENDING: ['CONFIRMED', 'CANCELLED', 'EXPIRED'],
    CONFIRMED: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'EXPIRED'],
    IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
    NO_SHOW: [],
    EXPIRED: [],
  };

  const allowed = allowedTransitions[currentStatus] || [];
  if (!allowed.includes(targetStatus)) {
    return {
      valid: false,
      error: `Invalid status transition from ${currentStatus} to ${targetStatus}.`,
    };
  }

  return { valid: true };
}

export function calculateRefundPolicy(
  appointmentDateStr: string,
  appointmentTimeSlot: string,
  paymentMethodStr: string,
  paymentStatusStr: string,
  totalAmount: number,
  cancelTime: Date = new Date()
): {
  refundEligible: boolean;
  refundPercentage: number;
  refundAmount: number;
  cancellationFee: number;
  reason: string;
} {
  const method = normalizePaymentMethod(paymentMethodStr);
  const payStatus = normalizePaymentStatus(paymentStatusStr);

  if (method === 'CASH' || payStatus !== 'PAID') {
    return {
      refundEligible: false,
      refundPercentage: 0,
      refundAmount: 0,
      cancellationFee: 0,
      reason: 'Payment method is CASH or Payment is PENDING. No refund required.',
    };
  }

  const parts = appointmentDateStr.split('-').map((p) => parseInt(p, 10));
  let apptDate: Date;
  if (parts.length === 3 && !parts.some(isNaN)) {
    apptDate = new Date(parts[0], parts[1] - 1, parts[2], 10, 0, 0);
  } else {
    apptDate = new Date(appointmentDateStr);
  }

  if (isNaN(apptDate.getTime())) {
    apptDate = new Date();
  }

  const diffMs = apptDate.getTime() - cancelTime.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours >= 24) {
    return {
      refundEligible: true,
      refundPercentage: 100,
      refundAmount: totalAmount,
      cancellationFee: 0,
      reason: 'Cancelled more than 24 hours in advance. Full 100% refund applied.',
    };
  } else if (diffHours >= 12) {
    const refundAmount = Math.round(totalAmount * 0.5);
    const cancellationFee = totalAmount - refundAmount;
    return {
      refundEligible: true,
      refundPercentage: 50,
      refundAmount,
      cancellationFee,
      reason: 'Cancelled between 12 and 24 hours prior. 50% refund applied (50% fee).',
    };
  } else {
    return {
      refundEligible: false,
      refundPercentage: 0,
      refundAmount: 0,
      cancellationFee: totalAmount,
      reason: 'Cancelled less than 12 hours prior. Non-refundable per policy.',
    };
  }
}

export function generateOnlineSessionInfo(): {
  meetingId: string;
  meetingUrl: string;
  provider: string;
} {
  const meetingId = `meet_physio_${Math.random().toString(36).slice(2, 9)}`;
  return {
    meetingId,
    meetingUrl: `https://meet.physioadmin.com/${meetingId}`,
    provider: 'TeleHealth HD Video',
  };
}
