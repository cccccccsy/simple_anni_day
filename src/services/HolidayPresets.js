/**
 * Holiday Presets Service
 *
 * Provides common holiday dates and information for quick-fill functionality
 */

/**
 * Common holidays with their dates
 * Format: { month, day } where month is 1-12
 */
export const HOLIDAY_PRESETS = [
  // Chinese Holidays
  {
    id: 'new-year',
    name: '元旦 (New Year)',
    emoji: '🎊',
    month: 1,
    day: 1,
    category: 'other',
    description: '新年快乐！'
  },
  {
    id: 'valentines',
    name: '情人节 (Valentine\'s Day)',
    emoji: '💝',
    month: 2,
    day: 14,
    category: 'other',
    description: '爱意满满的日子'
  },
  {
    id: 'womens-day',
    name: '妇女节 (Women\'s Day)',
    emoji: '👩',
    month: 3,
    day: 8,
    category: 'other',
    description: '女性节日快乐'
  },
  {
    id: 'labor-day',
    name: '劳动节 (Labor Day)',
    emoji: '🎉',
    month: 5,
    day: 1,
    category: 'other',
    description: '劳动最光荣'
  },
  {
    id: 'childrens-day',
    name: '儿童节 (Children\'s Day)',
    emoji: '🎈',
    month: 6,
    day: 1,
    category: 'birthday',
    description: '快乐童年'
  },
  {
    id: 'national-day',
    name: '国庆节 (National Day)',
    emoji: '🇨🇳',
    month: 10,
    day: 1,
    category: 'other',
    description: '祖国万岁'
  },
  {
    id: 'halloween',
    name: '万圣节 (Halloween)',
    emoji: '🎃',
    month: 10,
    day: 31,
    category: 'other',
    description: '不给糖就捣蛋'
  },
  {
    id: 'singles-day',
    name: '光棍节 (Singles Day)',
    emoji: '1️⃣',
    month: 11,
    day: 11,
    category: 'other',
    description: '购物狂欢节'
  },
  {
    id: 'christmas',
    name: '圣诞节 (Christmas)',
    emoji: '🎄',
    month: 12,
    day: 25,
    category: 'other',
    description: '圣诞快乐！'
  },
];

/**
 * Get holiday by ID
 * @param {string} id - Holiday ID
 * @returns {Object|null} Holiday object or null if not found
 */
export function getHolidayById(id) {
  return HOLIDAY_PRESETS.find(holiday => holiday.id === id) || null;
}

/**
 * Get holiday date for the current or next occurrence
 * @param {Object} holiday - Holiday preset object
 * @param {number} [year] - Optional specific year, defaults to current/next year
 * @returns {string} ISO date string (YYYY-MM-DD)
 */
export function getHolidayDate(holiday, year = null) {
  const now = new Date();
  const currentYear = now.getFullYear();

  // Use provided year or calculate next occurrence
  let targetYear = year || currentYear;

  // If no year specified, check if holiday already passed this year
  if (!year) {
    const holidayThisYear = new Date(currentYear, holiday.month - 1, holiday.day);
    if (holidayThisYear < now) {
      // Holiday passed, use next year
      targetYear = currentYear + 1;
    }
  }

  // Create date string in YYYY-MM-DD format
  const month = String(holiday.month).padStart(2, '0');
  const day = String(holiday.day).padStart(2, '0');

  return `${targetYear}-${month}-${day}`;
}

/**
 * Get all holidays grouped by season/quarter
 * @returns {Object} Holidays grouped by season
 */
export function getHolidaysBySeason() {
  const seasons = {
    spring: [], // 3-5月
    summer: [], // 6-8月
    autumn: [], // 9-11月
    winter: [], // 12-2月
  };

  HOLIDAY_PRESETS.forEach(holiday => {
    if (holiday.month >= 3 && holiday.month <= 5) {
      seasons.spring.push(holiday);
    } else if (holiday.month >= 6 && holiday.month <= 8) {
      seasons.summer.push(holiday);
    } else if (holiday.month >= 9 && holiday.month <= 11) {
      seasons.autumn.push(holiday);
    } else {
      seasons.winter.push(holiday);
    }
  });

  return seasons;
}

export default {
  HOLIDAY_PRESETS,
  getHolidayById,
  getHolidayDate,
  getHolidaysBySeason,
};
