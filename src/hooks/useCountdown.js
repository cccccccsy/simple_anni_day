import { useState, useEffect } from 'react';
import { calculateDaysUntil, formatCountdown } from '../services/DateService';

/**
 * useCountdown - Custom hook for real-time countdown to a date
 *
 * Calculates and maintains a live countdown to a specific date, automatically
 * updating at midnight each day.
 *
 * @param {string|Date} date - Target date for countdown
 * @param {boolean} [autoUpdate] - Whether to automatically update at midnight (default: true)
 * @returns {Object} Countdown information
 */
function useCountdown(date, autoUpdate = true) {
  // Calculate initial countdown
  const [daysUntil, setDaysUntil] = useState(() => calculateDaysUntil(date));
  const [countdown, setCountdown] = useState(() => formatCountdown(daysUntil));

  // Update countdown
  useEffect(() => {
    if (!date) {
      return;
    }

    // Recalculate immediately
    const days = calculateDaysUntil(date);
    setDaysUntil(days);
    setCountdown(formatCountdown(days));

    if (!autoUpdate) {
      return;
    }

    // Calculate milliseconds until next midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow - now;

    // Set up timer to update at midnight
    const midnightTimer = setTimeout(() => {
      const newDays = calculateDaysUntil(date);
      setDaysUntil(newDays);
      setCountdown(formatCountdown(newDays));

      // Set up daily interval after first midnight
      const dailyInterval = setInterval(() => {
        const updatedDays = calculateDaysUntil(date);
        setDaysUntil(updatedDays);
        setCountdown(formatCountdown(updatedDays));
      }, 24 * 60 * 60 * 1000); // 24 hours

      // Store interval ID for cleanup
      return () => clearInterval(dailyInterval);
    }, msUntilMidnight);

    return () => {
      clearTimeout(midnightTimer);
    };
  }, [date, autoUpdate]);

  // Determine status
  const isToday = daysUntil === 0;
  const isPast = daysUntil < 0;
  const isFuture = daysUntil > 0;
  const isApproaching = daysUntil > 0 && daysUntil <= 7;

  return {
    daysUntil,
    countdown,
    isToday,
    isPast,
    isFuture,
    isApproaching,
  };
}

export default useCountdown;
