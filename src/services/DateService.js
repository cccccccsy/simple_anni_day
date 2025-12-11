import {
  differenceInDays,
  format,
  isToday as isTodayFns,
  parseISO,
  startOfDay,
  addYears,
  isBefore,
  isAfter,
  addMonths,
} from 'date-fns';
import { REMINDER_CYCLES } from '../models/Anniversary';

/**
 * DateService - Date calculation and formatting utilities
 *
 * Provides date operations for anniversary tracking including countdown
 * calculations, formatting, and notification timing logic.
 */

/**
 * Calculate days until the next occurrence of an anniversary
 *
 * Takes the anniversary date and calculates how many days until its next occurrence.
 * If the date has passed this year, calculates for next year.
 *
 * @param {string|Date} date - ISO date string or Date object
 * @returns {number} Number of days until anniversary (0 if today, negative if in the past)
 */
export function calculateDaysUntil(date) {
  try {
    const today = startOfDay(new Date());
    const targetDate = typeof date === 'string' ? parseISO(date) : date;

    // Get the anniversary date for this year
    const thisYear = new Date().getFullYear();
    let anniversaryThisYear = new Date(
      thisYear,
      targetDate.getMonth(),
      targetDate.getDate()
    );
    anniversaryThisYear = startOfDay(anniversaryThisYear);

    // If the anniversary has already passed this year, use next year's date
    let nextAnniversary;
    if (isBefore(anniversaryThisYear, today)) {
      nextAnniversary = addYears(anniversaryThisYear, 1);
    } else {
      nextAnniversary = anniversaryThisYear;
    }

    const days = differenceInDays(nextAnniversary, today);
    return days;
  } catch (error) {
    console.error('Error calculating days until anniversary:', error);
    return 0;
  }
}

/**
 * Format countdown as human-readable string
 *
 * @param {number} days - Number of days until anniversary
 * @returns {string} Formatted countdown string
 */
export function formatCountdown(days) {
  if (days === 0) {
    return 'Today';
  } else if (days === 1) {
    return '1 day';
  } else if (days === -1) {
    return '1 day ago';
  } else if (days < 0) {
    return `${Math.abs(days)} days ago`;
  } else {
    return `${days} days`;
  }
}

/**
 * Check if a date is today
 *
 * @param {string|Date} date - ISO date string or Date object
 * @returns {boolean} True if date is today
 */
export function isToday(date) {
  try {
    const targetDate = typeof date === 'string' ? parseISO(date) : date;
    return isTodayFns(targetDate);
  } catch (error) {
    console.error('Error checking if date is today:', error);
    return false;
  }
}

/**
 * Check if anniversary is approaching within threshold days
 *
 * @param {string|Date} date - ISO date string or Date object
 * @param {number} threshold - Number of days to consider "approaching" (default: 7)
 * @returns {boolean} True if anniversary is within threshold days
 */
export function isApproaching(date, threshold = 7) {
  try {
    const days = calculateDaysUntil(date);
    return days >= 0 && days <= threshold;
  } catch (error) {
    console.error('Error checking if date is approaching:', error);
    return false;
  }
}

/**
 * Check if an anniversary should trigger a notification now
 *
 * Evaluates if a notification should be shown based on:
 * - Reminders are enabled
 * - Current time matches the configured time of day
 * - Days until anniversary matches one of the configured timings
 *
 * @param {Anniversary} anniversary - Anniversary object with reminderSettings
 * @param {Date} [now] - Current date/time (defaults to now)
 * @returns {boolean} True if notification should be triggered
 */
function getCycleIntervalMonths(cycle, customMonths) {
  switch (cycle) {
    case REMINDER_CYCLES.MONTHLY:
      return 1;
    case REMINDER_CYCLES.HALF_YEARLY:
      return 6;
    case REMINDER_CYCLES.YEARLY:
      return 12;
    case REMINDER_CYCLES.CUSTOM:
      return Math.min(Math.max(Number(customMonths) || 0, 1), 60);
    default:
      return null;
  }
}

export function getNextReminderDate(anniversary, now = new Date()) {
  try {
    const { reminderSettings } = anniversary;
    if (!reminderSettings || !reminderSettings.enabled) {
      return null;
    }

    const cycle = reminderSettings.cycle || REMINDER_CYCLES.YEARLY;
    const targetDate =
      typeof anniversary.date === 'string'
        ? parseISO(anniversary.date)
        : anniversary.date;
    const today = startOfDay(now);

    if (!targetDate) {
      return null;
    }

    // One-time reminders only fire on the original date
    if (cycle === REMINDER_CYCLES.ONCE) {
      const oneTimeDate = startOfDay(targetDate);
      if (isBefore(oneTimeDate, today)) {
        return null;
      }
      return oneTimeDate;
    }

    const intervalMonths = getCycleIntervalMonths(
      cycle,
      reminderSettings.customMonths
    );

    // Fallback to yearly if interval is invalid
    const safeInterval = intervalMonths || 12;

    let nextDate = startOfDay(targetDate);
    while (isBefore(nextDate, today)) {
      nextDate = addMonths(nextDate, safeInterval);
    }

    return nextDate;
  } catch (error) {
    console.error('Error getting next reminder date:', error);
    return null;
  }
}

export function shouldNotify(anniversary, now = new Date()) {
  try {
    const { reminderSettings } = anniversary;

    // Check if reminders are enabled
    if (!reminderSettings || !reminderSettings.enabled) {
      return false;
    }

    // Check if current time matches the configured time of day
    const currentTime = format(now, 'HH:mm');
    const targetTime = reminderSettings.timeOfDay || '09:00';

    // Allow a 5-minute window for notification
    const [targetHour, targetMinute] = targetTime.split(':').map(Number);
    const [currentHour, currentMinute] = currentTime.split(':').map(Number);

    const timeMatches =
      currentHour === targetHour && Math.abs(currentMinute - targetMinute) <= 5;

    if (!timeMatches) {
      return false;
    }

    // Determine the next reminder date based on the configured cycle
    const nextReminderDate = getNextReminderDate(anniversary, now);

    if (!nextReminderDate) {
      return false;
    }

    const daysUntil = differenceInDays(startOfDay(nextReminderDate), startOfDay(now));
    const timings = reminderSettings.timings || [0];

    return timings.includes(daysUntil);
  } catch (error) {
    console.error('Error checking if should notify:', error);
    return false;
  }
}

/**
 * Format date for display
 *
 * @param {string|Date} date - ISO date string or Date object
 * @param {string} [formatString] - date-fns format string (default: 'MMM d, yyyy')
 * @returns {string} Formatted date string
 */
export function formatDate(date, formatString = 'MMM d, yyyy') {
  try {
    const targetDate = typeof date === 'string' ? parseISO(date) : date;
    return format(targetDate, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

/**
 * Calculate the age/years since an anniversary date
 *
 * @param {string|Date} date - Original anniversary date
 * @returns {number} Number of years since the date
 */
export function calculateYearsSince(date) {
  try {
    const targetDate = typeof date === 'string' ? parseISO(date) : date;
    const today = new Date();
    const years = today.getFullYear() - targetDate.getFullYear();

    // Check if this year's anniversary has passed
    const thisYearAnniversary = new Date(
      today.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate()
    );

    if (isBefore(today, thisYearAnniversary)) {
      return years - 1;
    }

    return years;
  } catch (error) {
    console.error('Error calculating years since date:', error);
    return 0;
  }
}

/**
 * Get the next occurrence date of an anniversary
 *
 * @param {string|Date} date - Original anniversary date
 * @returns {Date} Next occurrence date
 */
export function getNextOccurrence(date) {
  try {
    const today = startOfDay(new Date());
    const targetDate = typeof date === 'string' ? parseISO(date) : date;

    const thisYear = new Date().getFullYear();
    let anniversaryThisYear = new Date(
      thisYear,
      targetDate.getMonth(),
      targetDate.getDate()
    );
    anniversaryThisYear = startOfDay(anniversaryThisYear);

    if (isBefore(anniversaryThisYear, today)) {
      return addYears(anniversaryThisYear, 1);
    }

    return anniversaryThisYear;
  } catch (error) {
    console.error('Error getting next occurrence:', error);
    return new Date();
  }
}

/**
 * Sort anniversaries by days until next occurrence
 *
 * @param {Anniversary[]} anniversaries - Array of anniversary objects
 * @param {boolean} ascending - Sort order (default: true for ascending)
 * @returns {Anniversary[]} Sorted array
 */
export function sortByDaysUntil(anniversaries, ascending = true) {
  try {
    return [...anniversaries].sort((a, b) => {
      const daysA = calculateDaysUntil(a.date);
      const daysB = calculateDaysUntil(b.date);

      return ascending ? daysA - daysB : daysB - daysA;
    });
  } catch (error) {
    console.error('Error sorting anniversaries:', error);
    return anniversaries;
  }
}

export default {
  calculateDaysUntil,
  formatCountdown,
  isToday,
  isApproaching,
  shouldNotify,
  formatDate,
  calculateYearsSince,
  getNextOccurrence,
  getNextReminderDate,
  sortByDaysUntil,
};
