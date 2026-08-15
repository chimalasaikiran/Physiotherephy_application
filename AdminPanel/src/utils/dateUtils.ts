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
  const d = parseSafeDate(val);
  if (d) {
    try {
      return d.toISOString().split('T')[0];
    } catch {
      // ignore
    }
  }
  return fallbackYmd || new Date().toISOString().split('T')[0];
}
