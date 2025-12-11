import {
  shouldNotify as shouldNotifyDate,
  formatCountdown,
  calculateDaysUntil,
  getNextReminderDate,
} from './DateService';
import { startOfDay } from 'date-fns';

/**
 * NotificationService - Browser notification management
 *
 * Handles browser notification API interactions including permission requests,
 * scheduling, and displaying notifications for anniversaries.
 */

/**
 * Check if browser supports notifications
 *
 * @returns {boolean} True if Notification API is supported
 */
export function isNotificationSupported() {
  return 'Notification' in window;
}

/**
 * Get current notification permission status
 *
 * @returns {string} Permission status: 'granted', 'denied', or 'default'
 */
export function getPermissionStatus() {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }

  return Notification.permission;
}

/**
 * Request notification permission from user
 *
 * @returns {Promise<boolean>} True if permission granted
 */
export async function requestPermission() {
  if (!isNotificationSupported()) {
    console.warn('Notifications are not supported in this browser');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    console.warn('Notification permission was previously denied');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

/**
 * Show a browser notification
 *
 * @param {string} title - Notification title
 * @param {string} body - Notification body text
 * @param {Object} [options] - Additional notification options
 * @returns {Notification|null} Notification object or null if failed
 */
export function showNotification(title, body, options = {}) {
  if (!isNotificationSupported()) {
    console.warn('Notifications are not supported');
    return null;
  }

  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted');
    return null;
  }

  try {
    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: options.tag || 'anniversary-notification',
      requireInteraction: false,
      silent: false,
      ...options,
    });

    // Auto-close after 10 seconds
    setTimeout(() => {
      notification.close();
    }, 10000);

    return notification;
  } catch (error) {
    console.error('Error showing notification:', error);
    return null;
  }
}

/**
 * Schedule a notification for an anniversary
 *
 * Note: This creates a notification immediately if conditions are met.
 * For true scheduling, use checkAndFireNotifications in a periodic check.
 *
 * @param {Anniversary} anniversary - Anniversary object
 * @returns {Notification|null} Notification object if shown
 */
export function scheduleNotification(anniversary) {
  if (!anniversary.reminderSettings || !anniversary.reminderSettings.enabled) {
    return null;
  }

  const now = new Date();
  const shouldNotify = shouldNotifyDate(anniversary, now);

  if (!shouldNotify) {
    return null;
  }

  const nextReminderDate = getNextReminderDate(anniversary, now);
  const daysUntil = nextReminderDate
    ? Math.max(0, Math.round((startOfDay(nextReminderDate) - startOfDay(now)) / (1000 * 60 * 60 * 24)))
    : calculateDaysUntil(anniversary.date);
  const countdown = formatCountdown(daysUntil);

  let title;
  let body;

  if (daysUntil === 0) {
    title = `Today: ${anniversary.title}`;
    body = anniversary.description || 'This anniversary is today!';
  } else if (daysUntil === 1) {
    title = `Tomorrow: ${anniversary.title}`;
    body = anniversary.description || 'This anniversary is tomorrow!';
  } else {
    title = `Upcoming: ${anniversary.title}`;
    body = `${countdown} until this anniversary${
      anniversary.description ? ' - ' + anniversary.description : ''
    }`;
  }

  return showNotification(title, body, {
    tag: `anniversary-${anniversary.id}-${daysUntil}`,
    data: {
      anniversaryId: anniversary.id,
      daysUntil,
    },
  });
}

/**
 * Check all anniversaries and fire notifications as needed
 *
 * This should be called periodically (e.g., every minute) to check if any
 * anniversaries need notifications based on their reminder settings.
 *
 * @param {Anniversary[]} anniversaries - Array of anniversary objects
 * @returns {number} Number of notifications triggered
 */
export function checkAndFireNotifications(anniversaries) {
  if (!Array.isArray(anniversaries)) {
    console.error('Invalid anniversaries array');
    return 0;
  }

  if (Notification.permission !== 'granted') {
    return 0;
  }

  let notificationCount = 0;
  const now = new Date();

  anniversaries.forEach((anniversary) => {
    if (shouldNotifyDate(anniversary, now)) {
      const notification = scheduleNotification(anniversary);
      if (notification) {
        notificationCount++;

        // Handle notification click
        notification.onclick = () => {
          window.focus();
          notification.close();

          // Emit custom event for app to handle
          window.dispatchEvent(
            new CustomEvent('anniversaryNotificationClick', {
              detail: {
                anniversaryId: anniversary.id,
              },
            })
          );
        };
      }
    }
  });

  return notificationCount;
}

/**
 * Test notification (for testing purposes)
 *
 * @returns {Notification|null} Test notification
 */
export function showTestNotification() {
  return showNotification(
    'Test Notification',
    'This is a test notification from the Anniversary App',
    {
      tag: 'test-notification',
    }
  );
}

/**
 * Clear notification by tag
 *
 * Note: Browser API doesn't support clearing notifications programmatically,
 * but this function exists for potential future use or browser-specific implementations.
 *
 * @param {string} tag - Notification tag to clear
 */
export function clearNotification(tag) {
  // Browser Notification API doesn't provide a way to clear notifications
  // This is here for documentation and potential future use
  console.log(`Notification with tag "${tag}" would be cleared if supported`);
}

/**
 * Get a summary of upcoming notifications for an anniversary
 *
 * @param {Anniversary} anniversary - Anniversary object
 * @returns {Object[]} Array of scheduled notification info
 */
export function getUpcomingNotifications(anniversary) {
  if (!anniversary.reminderSettings || !anniversary.reminderSettings.enabled) {
    return [];
  }

  const nextReminderDate = getNextReminderDate(anniversary);
  if (!nextReminderDate) {
    return [];
  }

  const daysUntil = Math.max(
    0,
    Math.round((startOfDay(nextReminderDate) - startOfDay(new Date())) / (1000 * 60 * 60 * 24))
  );
  const timings = anniversary.reminderSettings.timings || [];
  const timeOfDay = anniversary.reminderSettings.timeOfDay || '09:00';

  return timings
    .filter((timing) => timing >= daysUntil)
    .map((timing) => ({
      daysUntil: timing,
      countdown: formatCountdown(timing),
      timeOfDay,
      date: new Date(
        Date.now() + (timing - daysUntil) * 24 * 60 * 60 * 1000
      ).toISOString(),
    }));
}

export default {
  isNotificationSupported,
  getPermissionStatus,
  requestPermission,
  showNotification,
  scheduleNotification,
  checkAndFireNotifications,
  showTestNotification,
  clearNotification,
  getUpcomingNotifications,
};
