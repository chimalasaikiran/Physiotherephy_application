export interface DynamicBookingDate {
  id: string;
  label: string;
  dateStr: string;
  fullDate: string;
  isoDate: string;
  timestamp: number;
  isToday: boolean;
  isPast: boolean;
}

const MONTH_NAMES_SHORT = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const MONTH_NAMES_FULL = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];
const DAY_NAMES_SHORT = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Format a Date object to YYYY-MM-DD string in local timezone
 */
export const formatIsoDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Generate a list of available booking dates starting from today.
 * Past dates are excluded or marked as isPast = true.
 */
export const getDynamicBookingDates = (daysCount: number = 7): DynamicBookingDate[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = formatIsoDate(today);

  const result: DynamicBookingDate[] = [];

  for (let i = 0; i < daysCount; i++) {
    const curr = new Date(today);
    curr.setDate(today.getDate() + i);

    const isoDate = formatIsoDate(curr);
    const dayOfMonth = curr.getDate();
    const monthShort = MONTH_NAMES_SHORT[curr.getMonth()];
    const monthFull = MONTH_NAMES_FULL[curr.getMonth()];
    const dayOfWeekShort = DAY_NAMES_SHORT[curr.getDay()];
    const dayOfWeekFull = DAY_NAMES_FULL[curr.getDay()];

    let label: string;
    let fullDate: string;
    const isToday = i === 0;

    if (i === 0) {
      label = 'TODAY';
      fullDate = `Today, ${monthFull} ${dayOfMonth}`;
    } else if (i === 1) {
      label = 'TOMORROW';
      fullDate = `Tomorrow, ${monthFull} ${dayOfMonth}`;
    } else {
      label = dayOfWeekShort;
      fullDate = `${dayOfWeekFull}, ${monthFull} ${dayOfMonth}`;
    }

    result.push({
      id: `d_${isoDate}`,
      label,
      dateStr: `${dayOfMonth} ${monthShort}`,
      fullDate,
      isoDate,
      timestamp: curr.getTime(),
      isToday,
      isPast: false,
    });
  }

  return result;
};

/**
 * Parses time string like "10:00 AM", "04:30 PM" into hours and minutes
 */
export const parseTimeString = (timeStr: string): { hours: number; minutes: number } | null => {
  if (!timeStr) return null;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours < 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  return { hours, minutes };
};

/**
 * Checks if a given time slot (e.g., "10:00 AM") on a specific ISO date (e.g. "2026-08-15") has already passed.
 */
export const isTimeSlotPast = (timeStr: string, dateIsoStr: string): boolean => {
  const today = new Date();
  const todayIso = formatIsoDate(today);

  // If date is before today, it's definitely past
  if (dateIsoStr < todayIso) {
    return true;
  }

  // If date is after today, it's in the future
  if (dateIsoStr > todayIso) {
    return false;
  }

  // If date is today, compare slot time with current time
  const parsed = parseTimeString(timeStr);
  if (!parsed) return false;

  const currentHours = today.getHours();
  const currentMinutes = today.getMinutes();

  if (parsed.hours < currentHours) {
    return true;
  }
  if (parsed.hours === currentHours && parsed.minutes <= currentMinutes) {
    return true;
  }

  return false;
};
