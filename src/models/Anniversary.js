import { v4 as uuidv4 } from 'uuid';

/**
 * Anniversary Data Model
 *
 * Represents a single anniversary with all its properties and reminder settings.
 *
 * @typedef {Object} Anniversary
 * @property {string} id - Unique identifier (UUID)
 * @property {string} title - Name/title of the anniversary
 * @property {string} date - ISO date string (YYYY-MM-DD)
 * @property {string} [description] - Optional description/notes
 * @property {('birthday'|'wedding'|'work'|'other')} category - Anniversary category
 * @property {ReminderSettings} reminderSettings - Notification preferences
 * @property {string} createdAt - ISO datetime string of creation
 * @property {string} updatedAt - ISO datetime string of last update
 */

/**
 * Reminder Settings for an anniversary
 *
 * @typedef {Object} ReminderSettings
 * @property {boolean} enabled - Whether reminders are enabled
 * @property {number[]} timings - Array of days before anniversary to remind (e.g., [1, 7, 30])
 * @property {string} timeOfDay - Time to send reminder in HH:mm format (e.g., "09:00")
 */

/**
 * Default reminder settings
 */
const DEFAULT_REMINDER_SETTINGS = {
  enabled: true,
  timings: [0, 1, 7], // Today, 1 day before, 7 days before
  timeOfDay: '09:00',
};

/**
 * Valid anniversary categories
 */
export const ANNIVERSARY_CATEGORIES = {
  BIRTHDAY: 'birthday',
  WEDDING: 'wedding',
  WORK: 'work',
  OTHER: 'other',
};

/**
 * Factory function to create a new Anniversary object with defaults
 *
 * @param {Object} data - Anniversary data
 * @param {string} data.title - Title of the anniversary (required)
 * @param {string|Date} data.date - Date of the anniversary (required)
 * @param {string} [data.description] - Optional description
 * @param {string} [data.category] - Category (defaults to 'other')
 * @param {ReminderSettings} [data.reminderSettings] - Custom reminder settings
 * @returns {Anniversary} New anniversary object
 * @throws {Error} If required fields are missing or invalid
 */
export function createAnniversary(data) {
  // Validate required fields
  if (!data.title || typeof data.title !== 'string' || data.title.trim() === '') {
    throw new Error('Anniversary title is required');
  }

  if (!data.date) {
    throw new Error('Anniversary date is required');
  }

  // Convert date to ISO string if it's a Date object
  let dateString;
  if (data.date instanceof Date) {
    dateString = data.date.toISOString().split('T')[0];
  } else if (typeof data.date === 'string') {
    dateString = data.date;
  } else {
    throw new Error('Invalid date format');
  }

  // Validate category
  const category = data.category || ANNIVERSARY_CATEGORIES.OTHER;
  if (!Object.values(ANNIVERSARY_CATEGORIES).includes(category)) {
    throw new Error(`Invalid category: ${category}`);
  }

  const now = new Date().toISOString();

  return {
    id: uuidv4(),
    title: data.title.trim(),
    date: dateString,
    description: data.description ? data.description.trim() : '',
    category,
    reminderSettings: data.reminderSettings
      ? { ...DEFAULT_REMINDER_SETTINGS, ...data.reminderSettings }
      : { ...DEFAULT_REMINDER_SETTINGS },
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Updates an existing anniversary with new data
 *
 * @param {Anniversary} anniversary - Existing anniversary object
 * @param {Object} updates - Fields to update
 * @returns {Anniversary} Updated anniversary object
 */
export function updateAnniversary(anniversary, updates) {
  const updated = {
    ...anniversary,
    ...updates,
    id: anniversary.id, // Preserve ID
    createdAt: anniversary.createdAt, // Preserve creation time
    updatedAt: new Date().toISOString(), // Update timestamp
  };

  // Validate if date is being updated
  if (updates.date) {
    if (updates.date instanceof Date) {
      updated.date = updates.date.toISOString().split('T')[0];
    } else if (typeof updates.date !== 'string') {
      throw new Error('Invalid date format');
    }
  }

  // Validate if category is being updated
  if (updates.category && !Object.values(ANNIVERSARY_CATEGORIES).includes(updates.category)) {
    throw new Error(`Invalid category: ${updates.category}`);
  }

  return updated;
}

/**
 * Validates an anniversary object
 *
 * @param {Anniversary} anniversary - Anniversary to validate
 * @returns {boolean} True if valid
 * @throws {Error} If validation fails
 */
export function validateAnniversary(anniversary) {
  if (!anniversary.id || typeof anniversary.id !== 'string') {
    throw new Error('Invalid anniversary: missing or invalid id');
  }

  if (!anniversary.title || typeof anniversary.title !== 'string') {
    throw new Error('Invalid anniversary: missing or invalid title');
  }

  if (!anniversary.date || typeof anniversary.date !== 'string') {
    throw new Error('Invalid anniversary: missing or invalid date');
  }

  if (!Object.values(ANNIVERSARY_CATEGORIES).includes(anniversary.category)) {
    throw new Error('Invalid anniversary: invalid category');
  }

  if (!anniversary.reminderSettings || typeof anniversary.reminderSettings !== 'object') {
    throw new Error('Invalid anniversary: missing or invalid reminderSettings');
  }

  return true;
}

export default {
  createAnniversary,
  updateAnniversary,
  validateAnniversary,
  ANNIVERSARY_CATEGORIES,
};
