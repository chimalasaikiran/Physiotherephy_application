/**
 * Safely parse any date representation (string, number, Date, or Firestore Timestamp object)
 * into a valid JavaScript Date object, or null if invalid.
 */
export function parseSafeDate(val: any): Date | null {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;

  // Handles Firestore Timestamp objects with .toDate() method
  if (typeof val?.toDate === 'function') {
    try {
      const d = val.toDate();
      return isNaN(d.getTime()) ? null : d;
    } catch {
      // Fallback
    }
  }

  // Handles raw Firestore Timestamp JSON objects { seconds, nanoseconds } or { _seconds, _nanoseconds }
  if (typeof val === 'object') {
    const seconds = val.seconds ?? val._seconds;
    if (typeof seconds === 'number') {
      const d = new Date(seconds * 1000);
      return isNaN(d.getTime()) ? null : d;
    }
  }

  // Handles numbers (timestamps) and string representations
  if (typeof val === 'number' || typeof val === 'string') {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}

/**
 * Safely convert any date value to an ISO String (e.g., "2026-08-14T10:00:00.000Z"),
 * falling back to fallback string or current time string if invalid.
 */
export function toIsoStringSafe(val: any, fallbackStr?: string): string {
  const d = parseSafeDate(val);
  if (d) {
    try {
      return d.toISOString();
    } catch {
      // ignore
    }
  }
  return fallbackStr || new Date().toISOString();
}

/**
 * Safely format date into YYYY-MM-DD string
 */
export function toYmdStringSafe(val: any, fallbackYmd?: string): string {
  if (typeof val === 'string') {
    const trimmed = val.trim();
    const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return match[0];
    }
  }
  const d = parseSafeDate(val);
  if (d) {
    try {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      // ignore
    }
  }
  return fallbackYmd || new Date().toISOString().split('T')[0];
}

/**
 * Helper to parse time slot strings like "01:45 PM", "10:00 AM", "14:30"
 */
export function parseTimeSlot(timeStr?: string): { hours: number; minutes: number } {
  if (!timeStr) return { hours: 10, minutes: 0 };
  const str = timeStr.trim();
  const match = str.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3]?.toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return { hours: Math.min(23, Math.max(0, hours)), minutes: Math.min(59, Math.max(0, minutes)) };
  }
  return { hours: 10, minutes: 0 };
}

/**
 * Parse full appointment date (YYYY-MM-DD or Timestamp) and time slot into a precise local Date object.
 */
export function parseAppointmentDateTime(fullDateVal: any, timeSlotVal?: string): Date | null {
  if (!fullDateVal) return null;

  if (typeof fullDateVal === 'string') {
    const trimmed = fullDateVal.trim();
    const ymdMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (ymdMatch) {
      const year = parseInt(ymdMatch[1], 10);
      const month = parseInt(ymdMatch[2], 10);
      const day = parseInt(ymdMatch[3], 10);
      const { hours, minutes } = parseTimeSlot(timeSlotVal);
      return new Date(year, month - 1, day, hours, minutes, 0, 0);
    }

    if (trimmed.includes('T')) {
      const d = parseSafeDate(trimmed);
      if (d) {
        if (timeSlotVal) {
          const { hours, minutes } = parseTimeSlot(timeSlotVal);
          d.setHours(hours, minutes, 0, 0);
        }
        return d;
      }
    }
  }

  const ymd = toYmdStringSafe(fullDateVal);
  const parts = ymd.split('-').map((p) => parseInt(p, 10));
  if (parts.length < 3 || parts.some(isNaN)) {
    const d = parseSafeDate(fullDateVal);
    if (d && timeSlotVal) {
      const { hours, minutes } = parseTimeSlot(timeSlotVal);
      d.setHours(hours, minutes, 0, 0);
    }
    return d;
  }

  const [year, month, day] = parts;
  const { hours, minutes } = parseTimeSlot(timeSlotVal);

  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

/**
 * Helper to parse session duration in minutes
 */
export function parseSessionDurationMinutes(durationVal?: string | number): number {
  if (typeof durationVal === 'number') return durationVal;
  if (!durationVal) return 45;
  const match = durationVal.toString().match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 45;
}

/**
 * Dynamically resolves appointment status in real-time.
 * Status rules:
 * - Completed -> Completed
 * - Cancelled -> Cancelled
 * - Confirmed / Scheduled / Pending -> Confirmed / Scheduled / Pending
 * - Scheduled Date + Time currently active -> Active / Today
 * - Scheduled Date + Time in future -> Upcoming
 */
export function resolveAppointmentStatus(
  appt?: {
    status?: string;
    appointmentStatus?: string;
    fullDate?: any;
    date?: any;
    appointmentDate?: any;
    createdAt?: any;
    timeSlot?: string;
    time?: string;
    sessionDuration?: string | number;
  },
  now: Date = new Date()
): 'Upcoming' | 'Active / Today' | 'Completed' | 'Cancelled' | 'Confirmed' | 'Pending' | 'Scheduled' {
  if (!appt) return 'Scheduled';
  const rawStatus = (appt.status || appt.appointmentStatus || '').trim();

  if (rawStatus === 'Completed' || rawStatus === 'COMPLETED') return 'Completed';
  if (rawStatus === 'Cancelled' || rawStatus === 'CANCELLED') return 'Cancelled';
  if (rawStatus === 'Confirmed' || rawStatus === 'CONFIRMED') return 'Confirmed';
  if (rawStatus === 'Pending' || rawStatus === 'PENDING') return 'Pending';
  if (rawStatus === 'Scheduled' || rawStatus === 'SCHEDULED') return 'Scheduled';
  if (rawStatus === 'In Progress' || rawStatus === 'IN_PROGRESS') return 'Active / Today';

  const dateVal = appt.fullDate || appt.date || appt.appointmentDate || appt.createdAt;
  const timeVal = appt.timeSlot || appt.time;
  const startTime = parseAppointmentDateTime(dateVal, timeVal);

  if (!startTime) {
    return 'Confirmed';
  }

  const durationMin = parseSessionDurationMinutes(appt.sessionDuration);
  const endTime = new Date(startTime.getTime() + durationMin * 60 * 1000);

  if (now <= endTime) {
    if (now >= startTime && now <= endTime) {
      return 'Active / Today';
    }
    return 'Upcoming';
  }

  return 'Confirmed';
}

/**
 * Helper to check if a date falls within a specific timeline filter.
 */
export function isDateInTimelineFilter(
  val: any,
  timeframeFilter?: string,
  customStart?: Date | null,
  customEnd?: Date | null,
  now: Date = new Date()
): boolean {
  const d = parseSafeDate(val);
  if (!d) return false;

  const tf = (timeframeFilter || 'all').toString().toLowerCase().trim();

  if (tf === 'all' || !tf) return true;

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  if (tf === 'today') {
    return d >= startOfToday && d <= endOfToday;
  }

  if (tf === 'yesterday') {
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const endOfYesterday = new Date(endOfToday);
    endOfYesterday.setDate(endOfYesterday.getDate() - 1);
    return d >= startOfYesterday && d <= endOfYesterday;
  }

  if (tf === 'this week' || tf === 'thisweek') {
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    return d >= startOfWeek && d <= endOfWeek;
  }

  if (tf === 'last 7 days' || tf === 'last 7') {
    const start7 = new Date(startOfToday);
    start7.setDate(start7.getDate() - 6);
    return d >= start7 && d <= endOfToday;
  }

  if (tf === 'this month' || tf === 'thismonth' || tf === 'last 30 days' || tf === '30 days') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return d >= startOfMonth && d <= endOfMonth;
  }

  if (tf === 'this year' || tf === 'thisyear') {
    const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    return d >= startOfYear && d <= endOfYear;
  }

  if (tf === 'custom' && customStart && customEnd) {
    return d >= customStart && d <= customEnd;
  }

  return true;
}

export interface PatientGrowthBucket {
  label: string;
  newPatients: number;
  returningPatients: number;
  totalPatients: number;
}

/**
 * Computes Patient Growth statistics (New vs Returning) grouped by day, month, or year from Firestore patient and appointment lists.
 */
export function calculatePatientGrowthStats(
  patients: any[] = [],
  appointments: any[] = [],
  grouping: 'day' | 'month' | 'year' = 'month',
  now: Date = new Date()
): PatientGrowthBucket[] {
  const safePatients = Array.isArray(patients) ? patients : [];
  const safeAppointments = Array.isArray(appointments) ? appointments : [];

  if (grouping === 'day') {
    // Last 7 days bucket
    const result: PatientGrowthBucket[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
      const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

      let newCount = 0;
      let returningCount = 0;

      safePatients.forEach((p) => {
        const pDate = parseSafeDate(p.createdAt || p.joinedDate);
        if (pDate && pDate >= startOfDay && pDate <= endOfDay) {
          newCount++;
        } else if (pDate && pDate < startOfDay) {
          const pId = p.id || p.patientId;
          const hasAppt = safeAppointments.some((a) => {
            const aPid = a.patientId || a.userId;
            if (aPid !== pId) return false;
            const aDate = parseSafeDate(a.fullDate || a.date || a.createdAt);
            return aDate && aDate >= startOfDay && aDate <= endOfDay;
          });
          if (hasAppt) returningCount++;
        }
      });

      result.push({
        label: dayLabel,
        newPatients: newCount,
        returningPatients: returningCount,
        totalPatients: newCount + returningCount,
      });
    }
    return result;
  }

  if (grouping === 'year') {
    // 5 years view (current year - 4 to current year)
    const result: PatientGrowthBucket[] = [];
    const currentYear = now.getFullYear();

    for (let yr = currentYear - 4; yr <= currentYear; yr++) {
      let newCount = 0;
      let returningCount = 0;

      safePatients.forEach((p) => {
        const pDate = parseSafeDate(p.createdAt || p.joinedDate);
        if (pDate && pDate.getFullYear() === yr) {
          newCount++;
        } else if (pDate && pDate.getFullYear() < yr) {
          const pId = p.id || p.patientId;
          const hasAppt = safeAppointments.some((a) => {
            const aPid = a.patientId || a.userId;
            if (aPid !== pId) return false;
            const aDate = parseSafeDate(a.fullDate || a.date || a.createdAt);
            return aDate && aDate.getFullYear() === yr;
          });
          if (hasAppt) returningCount++;
        }
      });

      result.push({
        label: yr.toString(),
        newPatients: newCount,
        returningPatients: returningCount,
        totalPatients: newCount + returningCount,
      });
    }
    return result;
  }

  // Default: Month view (6 months JAN to JUN)
  const monthLabels = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'];
  const result: PatientGrowthBucket[] = [];
  const currYear = now.getFullYear();
  const startMonthIndex = 0;

  for (let m = startMonthIndex; m < startMonthIndex + 6; m++) {
    const monthName = monthLabels[m % 12];
    const startOfMonth = new Date(currYear, m, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(currYear, m + 1, 0, 23, 59, 59, 999);

    let newCount = 0;
    let returningCount = 0;

    safePatients.forEach((p) => {
      const pDate = parseSafeDate(p.createdAt || p.joinedDate);
      if (pDate && pDate >= startOfMonth && pDate <= endOfMonth) {
        newCount++;
      } else if (pDate && pDate < startOfMonth) {
        const pId = p.id || p.patientId;
        const hasAppt = safeAppointments.some((a) => {
          const aPid = a.patientId || a.userId;
          if (aPid !== pId) return false;
          const aDate = parseSafeDate(a.fullDate || a.date || a.createdAt);
          return aDate && aDate >= startOfMonth && aDate <= endOfMonth;
        });
        if (hasAppt) returningCount++;
      }
    });

    result.push({
      label: monthName,
      newPatients: newCount,
      returningPatients: returningCount,
      totalPatients: newCount + returningCount,
    });
  }

  return result;
}

