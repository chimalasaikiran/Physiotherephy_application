import { useState, useEffect, useMemo } from 'react';
import { subscribeToPatients } from '@/services/patientService';
import { subscribeToTherapists } from '@/services/therapistService';
import { subscribeToSchedules, resolvePatientName } from '@/services/scheduleService';
import { subscribeToPayments, subscribeToRefunds } from '@/services/paymentService';
import { parseSafeDate, toYmdStringSafe } from '@/utils/dateUtils';

import type { Patient } from '@/patients/types';
import type { Therapist } from '@/therapists/types';
import type { AppointmentItem } from '@/schedule/components/AppointmentsTable';
import type { PaymentRecord, RefundDocument } from '@/payments/types';

export interface DashboardMetricsSummary {
  totalTherapists: number;
  activeTherapists: number;
  totalPatients: number;
  activePatients: number;
  totalAppointments: number;
  completedAppointments: number;
  scheduledAppointments: number;
  cancelledAppointments: number;
  totalRevenue: number;
  paidPaymentsTotal: number;
  pendingPaymentsTotal: number;
}

export interface RevenueTrendPoint {
  label: string;
  netRevenue: number;
  paymentsCount: number;
}

export interface AppointmentTrendPoint {
  label: string;
  count: number;
  scheduled: number;
  completed: number;
  cancelled: number;
}

export function useDashboardData() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [rawAppointmentDocs, setRawAppointmentDocs] = useState<any[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [refunds, setRefunds] = useState<RefundDocument[]>([]);

  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [isLoadingTherapists, setIsLoadingTherapists] = useState(true);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to real-time Firestore listeners
  useEffect(() => {
    const unsubPatients = subscribeToPatients(
      (data) => {
        setPatients(data || []);
        setIsLoadingPatients(false);
      },
      (err) => {
        console.warn('Patients snapshot error:', err);
        setIsLoadingPatients(false);
      }
    );

    const unsubTherapists = subscribeToTherapists(
      (data) => {
        setTherapists(data || []);
        setIsLoadingTherapists(false);
      },
      (err) => {
        console.warn('Therapists snapshot error:', err);
        setIsLoadingTherapists(false);
      }
    );

    const unsubSchedules = subscribeToSchedules(
      (mapped, raw) => {
        setAppointments(mapped || []);
        setRawAppointmentDocs(raw || []);
        setIsLoadingAppointments(false);
      },
      (err) => {
        console.warn('Schedules snapshot error:', err);
        setIsLoadingAppointments(false);
      }
    );

    const unsubPayments = subscribeToPayments(
      (data) => {
        setPayments(data || []);
        setIsLoadingPayments(false);
      },
      (err) => {
        console.warn('Payments snapshot error:', err);
        setIsLoadingPayments(false);
      }
    );

    const unsubRefunds = subscribeToRefunds(
      (data) => {
        setRefunds(data || []);
      },
      (err) => {
        console.warn('Refunds snapshot error:', err);
      }
    );

    return () => {
      unsubPatients();
      unsubTherapists();
      unsubSchedules();
      unsubPayments();
      unsubRefunds();
    };
  }, []);

  const isLoading = isLoadingPatients || isLoadingTherapists || isLoadingAppointments || isLoadingPayments;

  // Compute live summary metrics directly from source of truth Firestore data
  const summaryMetrics: DashboardMetricsSummary = useMemo(() => {
    const totalTherapists = therapists.length;
    const activeTherapists = therapists.filter(
      (t) => (t.status as string) === 'ACTIVE' || (t.status as string) === 'Active' || !t.status
    ).length;

    const totalPatients = patients.length;
    const activePatients = patients.filter(
      (p) => (p.status as string) === 'Active Treatment' || (p.status as string) === 'active' || (p.status as string) === 'ACTIVE'
    ).length;

    const totalAppointments = appointments.length;
    const completedAppointments = appointments.filter((a) => a.status === 'Completed').length;
    const cancelledAppointments = appointments.filter((a) => a.status === 'Cancelled').length;
    const scheduledAppointments = appointments.filter(
      (a) => a.status === 'Confirmed' || (a.status as string) === 'Scheduled' || (a.status as string) === 'In Progress'
    ).length;

    // Revenue calculations: paid payments minus approved refunds
    let paidPaymentsTotal = 0;
    let pendingPaymentsTotal = 0;

    payments.forEach((p) => {
      const status = (p.paymentStatus || p.status || '').toString().toUpperCase();
      const amount = Number(p.amount || p.numericAmount || 0);

      if (status === 'PAID' || status === 'COMPLETED' || status === 'SETTLED') {
        paidPaymentsTotal += amount;
      } else if (status === 'PENDING' || status === 'UNPAID' || status === 'DUE') {
        pendingPaymentsTotal += amount;
      }
    });

    let approvedRefundsTotal = 0;
    refunds.forEach((r) => {
      if (r.status === 'Approved') {
        approvedRefundsTotal += Number(r.amount || 0);
      }
    });

    const totalRevenue = Math.max(0, paidPaymentsTotal - approvedRefundsTotal);

    return {
      totalTherapists,
      activeTherapists,
      totalPatients,
      activePatients,
      totalAppointments,
      completedAppointments,
      scheduledAppointments,
      cancelledAppointments,
      totalRevenue,
      paidPaymentsTotal,
      pendingPaymentsTotal,
    };
  }, [therapists, patients, appointments, payments, refunds]);

  // Central Patients Lookup Map
  const patientsMap = useMemo(() => {
    const map: Record<string, string> = {};
    patients.forEach((p) => {
      if (p.id) map[p.id] = p.name;
      if (p.patientId) map[p.patientId] = p.name;
    });
    return map;
  }, [patients]);

  // Today's Schedule filtering based on local date YYYY-MM-DD or dateLabel
  const todaysSchedule = useMemo(() => {
    const now = new Date();
    const todayStr = toYmdStringSafe(now); // "YYYY-MM-DD"
    const todayDisplay = now.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }); // e.g. "Fri, Aug 14"

    return rawAppointmentDocs
      .filter((rawDoc) => {
        const fDate = rawDoc.fullDate || '';
        const dLabel = rawDoc.dateLabel || rawDoc.date || '';
        const status = rawDoc.status || '';

        if (status === 'Cancelled') return false;

        if (fDate === todayStr) return true;
        if (dLabel && dLabel.toLowerCase().includes(todayDisplay.toLowerCase())) return true;

        // Check if createdAt or date matches today
        if (rawDoc.createdAt) {
          const createdDate = toYmdStringSafe(rawDoc.createdAt, '');
          if (createdDate && createdDate === todayStr && !fDate) return true;
        }

        return false;
      })
      .map((rawDoc) => {
        const patientName = resolvePatientName(rawDoc, patientsMap);
        return {
          id: rawDoc.id,
          patientName,
          patientSubtitle: rawDoc.patientSubtitle || rawDoc.patientCondition || rawDoc.type || 'General Rehab',
          therapistName: rawDoc.therapistName || rawDoc.doctorName || 'Dr. Specialist',
          time: rawDoc.timeSlot || rawDoc.time || '10:00 AM',
          date: rawDoc.dateLabel || rawDoc.fullDate || todayStr,
          type: rawDoc.type || rawDoc.visitType || 'Clinic Visit',
          status: rawDoc.status || 'Confirmed',
          fullDate: rawDoc.fullDate || todayStr,
        };
      });
  }, [rawAppointmentDocs, patientsMap]);

  // Sorted Recent Appointments
  const recentAppointments = useMemo(() => {
    return [...rawAppointmentDocs]
      .sort((a, b) => {
        const dateA = parseSafeDate(a.createdAt || a.updatedAt || a.fullDate);
        const dateB = parseSafeDate(b.createdAt || b.updatedAt || b.fullDate);
        const timeA = dateA ? dateA.getTime() : 0;
        const timeB = dateB ? dateB.getTime() : 0;
        return timeB - timeA;
      })
      .slice(0, 10)
      .map((rawDoc) => {
        const patientName = resolvePatientName(rawDoc, patientsMap);
        const avatarInitials = patientName
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase();

        return {
          id: rawDoc.id,
          patientName,
          avatarInitials: avatarInitials || 'PT',
          avatarBg: 'bg-blue-100 text-blue-700',
          therapistName: rawDoc.therapistName || rawDoc.doctorName || 'Specialist',
          type: rawDoc.type || rawDoc.visitType || 'Clinic Visit',
          typeBg: rawDoc.type === 'Online' ? 'bg-purple-50' : rawDoc.type === 'Home Visit' ? 'bg-amber-50' : 'bg-blue-50',
          typeColor: rawDoc.type === 'Online' ? 'text-purple-700' : rawDoc.type === 'Home Visit' ? 'text-amber-700' : 'text-blue-700',
          status: (rawDoc.status || 'Confirmed') as any,
          statusColor: rawDoc.status === 'Completed' ? 'text-emerald-700' : rawDoc.status === 'Cancelled' ? 'text-rose-700' : 'text-blue-700',
          dotColor: rawDoc.status === 'Completed' ? 'bg-emerald-500' : rawDoc.status === 'Cancelled' ? 'bg-rose-500' : 'bg-blue-500',
          time: `${rawDoc.dateLabel || rawDoc.fullDate || 'Today'} • ${rawDoc.timeSlot || rawDoc.time || '10:00 AM'}`,
          raw: rawDoc,
        };
      });
  }, [rawAppointmentDocs, patientsMap]);

  // Trend Datasets Generator helper
  const getRevenueTrend = (timeframe: string): RevenueTrendPoint[] => {
    const days = timeframe === 'Last 7 Days' ? 7 : timeframe === 'This Quarter' ? 90 : 30;
    const pointsMap: { [key: string]: { netRevenue: number; count: number } } = {};

    const now = new Date();
    const result: RevenueTrendPoint[] = [];

    if (days <= 7) {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
        const isoDate = toYmdStringSafe(d);
        pointsMap[isoDate] = { netRevenue: 0, count: 0 };
        result.push({ label: dayLabel, netRevenue: 0, paymentsCount: 0 });
      }
    } else {
      for (let w = 4; w >= 1; w--) {
        result.push({ label: `WK ${5 - w}`, netRevenue: 0, paymentsCount: 0 });
      }
    }

    payments.forEach((p) => {
      const status = (p.paymentStatus || p.status || '').toString().toUpperCase();
      if (status !== 'PAID' && status !== 'COMPLETED' && status !== 'SETTLED') return;

      const amt = Number(p.amount || p.numericAmount || 0);
      const pDate = parseSafeDate(p.paidAt || p.createdAt);
      if (!pDate) return;

      const diffDays = Math.floor((now.getTime() - pDate.getTime()) / (1000 * 3600 * 24));

      if (diffDays >= 0 && diffDays < days) {
        if (days <= 7) {
          const idx = 6 - diffDays;
          if (idx >= 0 && idx < result.length) {
            result[idx].netRevenue += amt;
            result[idx].paymentsCount += 1;
          }
        } else {
          const weekIdx = Math.min(3, Math.floor(diffDays / 7));
          const idx = 3 - weekIdx;
          if (idx >= 0 && idx < result.length) {
            result[idx].netRevenue += amt;
            result[idx].paymentsCount += 1;
          }
        }
      }
    });

    return result;
  };

  const getAppointmentsTrend = (timeframe: string): AppointmentTrendPoint[] => {
    const days = timeframe === 'Last 7 Days' ? 7 : timeframe === 'This Quarter' ? 90 : 30;
    const now = new Date();
    const result: AppointmentTrendPoint[] = [];

    if (days <= 7) {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
        result.push({ label: dayLabel, count: 0, scheduled: 0, completed: 0, cancelled: 0 });
      }
    } else {
      for (let w = 4; w >= 1; w--) {
        result.push({ label: `WK ${5 - w}`, count: 0, scheduled: 0, completed: 0, cancelled: 0 });
      }
    }

    rawAppointmentDocs.forEach((docSnap) => {
      const apptDate = parseSafeDate(docSnap.fullDate || docSnap.createdAt);
      if (!apptDate) return;

      const diffDays = Math.floor((now.getTime() - apptDate.getTime()) / (1000 * 3600 * 24));

      if (diffDays >= 0 && diffDays < days) {
        const status = docSnap.status || 'Confirmed';
        let idx = 0;

        if (days <= 7) {
          idx = 6 - diffDays;
        } else {
          const weekIdx = Math.min(3, Math.floor(diffDays / 7));
          idx = 3 - weekIdx;
        }

        if (idx >= 0 && idx < result.length) {
          result[idx].count += 1;
          if (status === 'Completed') result[idx].completed += 1;
          else if (status === 'Cancelled') result[idx].cancelled += 1;
          else result[idx].scheduled += 1;
        }
      }
    });

    return result;
  };

  return {
    patients,
    therapists,
    appointments,
    rawAppointmentDocs,
    payments,
    refunds,
    summaryMetrics,
    todaysSchedule,
    recentAppointments,
    isLoading,
    error,
    getRevenueTrend,
    getAppointmentsTrend,
  };
}
