import { validateAnniversary } from '../models/Anniversary';

/**
 * StorageService - localStorage abstraction layer for managing anniversary data
 *
 * Provides CRUD operations, import/export functionality, and error handling
 * for anniversary data persistence using browser localStorage.
 */

const STORAGE_KEY = 'anniversary-app-data';
const TRASH_KEY = 'anniversary-app-trash';
const STORAGE_VERSION = '1.0';

/**
 * Storage wrapper with version info
 *
 * @typedef {Object} StorageData
 * @property {string} version - Data format version
 * @property {Anniversary[]} anniversaries - Array of anniversary objects
 * @property {string} lastUpdated - ISO datetime of last update
 */

/**
 * Load all anniversaries from localStorage
 *
 * @returns {Anniversary[]} Array of anniversary objects (empty array if none exist)
 */
export function loadAnniversaries() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);

    if (!data) {
      return [];
    }

    const parsed = JSON.parse(data);

    // Validate data structure
    if (!parsed.anniversaries || !Array.isArray(parsed.anniversaries)) {
      console.error('Invalid data structure in localStorage');
      return [];
    }

    // Validate each anniversary
    const validAnniversaries = parsed.anniversaries.filter((anniversary) => {
      try {
        validateAnniversary(anniversary);
        return true;
      } catch (error) {
        console.error('Invalid anniversary in storage:', error.message);
        return false;
      }
    });

    return validAnniversaries;
  } catch (error) {
    console.error('Error loading anniversaries from localStorage:', error);
    return [];
  }
}

/**
 * Save anniversaries to localStorage
 *
 * @param {Anniversary[]} anniversaries - Array of anniversary objects to save
 * @throws {Error} If localStorage quota is exceeded
 */
export function saveAnniversaries(anniversaries) {
  try {
    if (!Array.isArray(anniversaries)) {
      throw new Error('Anniversaries must be an array');
    }

    const data = {
      version: STORAGE_VERSION,
      anniversaries,
      lastUpdated: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      throw new Error(
        'Storage quota exceeded. Please delete some anniversaries or export your data.'
      );
    }
    throw new Error(`Error saving anniversaries: ${error.message}`);
  }
}

/**
 * Get a single anniversary by ID
 *
 * @param {string} id - Anniversary ID
 * @returns {Anniversary|null} Anniversary object or null if not found
 */
export function getAnniversary(id) {
  try {
    const anniversaries = loadAnniversaries();
    return anniversaries.find((anniversary) => anniversary.id === id) || null;
  } catch (error) {
    console.error('Error getting anniversary:', error);
    return null;
  }
}

/**
 * Add a new anniversary
 *
 * @param {Anniversary} anniversary - Anniversary object to add
 * @returns {Anniversary[]} Updated array of all anniversaries
 * @throws {Error} If anniversary is invalid or storage fails
 */
export function addAnniversary(anniversary) {
  try {
    validateAnniversary(anniversary);

    const anniversaries = loadAnniversaries();

    // Check for duplicate ID
    if (anniversaries.some((a) => a.id === anniversary.id)) {
      throw new Error('Anniversary with this ID already exists');
    }

    anniversaries.push(anniversary);
    saveAnniversaries(anniversaries);

    return anniversaries;
  } catch (error) {
    throw new Error(`Error adding anniversary: ${error.message}`);
  }
}

/**
 * Update an existing anniversary
 *
 * @param {string} id - Anniversary ID to update
 * @param {Object} updates - Fields to update
 * @returns {Anniversary[]} Updated array of all anniversaries
 * @throws {Error} If anniversary not found or update fails
 */
export function updateAnniversary(id, updates) {
  try {
    const anniversaries = loadAnniversaries();
    const index = anniversaries.findIndex((a) => a.id === id);

    if (index === -1) {
      throw new Error('Anniversary not found');
    }

    // Update the anniversary
    anniversaries[index] = {
      ...anniversaries[index],
      ...updates,
      id: anniversaries[index].id, // Preserve ID
      createdAt: anniversaries[index].createdAt, // Preserve creation time
      updatedAt: new Date().toISOString(), // Update timestamp
    };

    // Validate updated anniversary
    validateAnniversary(anniversaries[index]);

    saveAnniversaries(anniversaries);

    return anniversaries;
  } catch (error) {
    throw new Error(`Error updating anniversary: ${error.message}`);
  }
}

/**
 * Delete an anniversary
 *
 * @param {string} id - Anniversary ID to delete
 * @returns {Anniversary[]} Updated array of all anniversaries
 * @throws {Error} If delete fails
 */
export function deleteAnniversary(id) {
  try {
    const anniversaries = loadAnniversaries();
    const filtered = anniversaries.filter((a) => a.id !== id);

    saveAnniversaries(filtered);

    return filtered;
  } catch (error) {
    throw new Error(`Error deleting anniversary: ${error.message}`);
  }
}

/**
 * Export all anniversaries to JSON string
 *
 * @returns {string} JSON string of all anniversaries with metadata
 */
export function exportToJSON() {
  try {
    const anniversaries = loadAnniversaries();

    const exportData = {
      version: STORAGE_VERSION,
      exportedAt: new Date().toISOString(),
      count: anniversaries.length,
      anniversaries,
    };

    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    throw new Error(`Error exporting data: ${error.message}`);
  }
}

/**
 * Import anniversaries from JSON string
 *
 * @param {string} jsonString - JSON string containing anniversaries
 * @param {boolean} replace - If true, replace existing data; if false, merge with existing
 * @returns {Anniversary[]} Updated array of all anniversaries
 * @throws {Error} If JSON is invalid or import fails
 */
export function importFromJSON(jsonString, replace = false) {
  try {
    const parsed = JSON.parse(jsonString);

    // Validate import data structure
    if (!parsed.anniversaries || !Array.isArray(parsed.anniversaries)) {
      throw new Error('Invalid import data: missing anniversaries array');
    }

    // Validate each anniversary
    const validAnniversaries = [];
    const errors = [];

    parsed.anniversaries.forEach((anniversary, index) => {
      try {
        validateAnniversary(anniversary);
        validAnniversaries.push(anniversary);
      } catch (error) {
        errors.push(`Anniversary ${index + 1}: ${error.message}`);
      }
    });

    if (errors.length > 0) {
      console.warn('Some anniversaries were invalid:', errors);
    }

    if (validAnniversaries.length === 0) {
      throw new Error('No valid anniversaries found in import data');
    }

    // Load existing anniversaries if merging
    let finalAnniversaries;
    if (replace) {
      finalAnniversaries = validAnniversaries;
    } else {
      const existing = loadAnniversaries();
      const existingIds = new Set(existing.map((a) => a.id));

      // Only add anniversaries that don't already exist
      const newAnniversaries = validAnniversaries.filter((a) => !existingIds.has(a.id));
      finalAnniversaries = [...existing, ...newAnniversaries];
    }

    saveAnniversaries(finalAnniversaries);

    return finalAnniversaries;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON format');
    }
    throw new Error(`Error importing data: ${error.message}`);
  }
}

/**
 * Clear all anniversaries from storage
 *
 * @returns {void}
 */
export function clearAll() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    throw new Error(`Error clearing data: ${error.message}`);
  }
}

/**
 * Get storage usage information
 *
 * @returns {Object} Storage stats
 */
export function getStorageInfo() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const anniversaries = loadAnniversaries();

    return {
      count: anniversaries.length,
      size: data ? data.length : 0,
      sizeKB: data ? (data.length / 1024).toFixed(2) : 0,
      lastUpdated: data ? JSON.parse(data).lastUpdated : null,
    };
  } catch (error) {
    console.error('Error getting storage info:', error);
    return {
      count: 0,
      size: 0,
      sizeKB: 0,
      lastUpdated: null,
    };
  }
}

/**
 * Load all items from trash
 *
 * @returns {Anniversary[]} Array of deleted anniversary objects
 */
export function loadTrash() {
  try {
    const data = localStorage.getItem(TRASH_KEY);

    if (!data) {
      return [];
    }

    const parsed = JSON.parse(data);

    if (!parsed.items || !Array.isArray(parsed.items)) {
      console.error('Invalid trash data structure in localStorage');
      return [];
    }

    return parsed.items;
  } catch (error) {
    console.error('Error loading trash from localStorage:', error);
    return [];
  }
}

/**
 * Save trash items to localStorage
 *
 * @param {Anniversary[]} items - Array of deleted anniversary objects
 */
export function saveTrash(items) {
  try {
    if (!Array.isArray(items)) {
      throw new Error('Trash items must be an array');
    }

    const data = {
      version: STORAGE_VERSION,
      items,
      lastUpdated: new Date().toISOString(),
    };

    localStorage.setItem(TRASH_KEY, JSON.stringify(data));
  } catch (error) {
    throw new Error(`Error saving trash: ${error.message}`);
  }
}

/**
 * Move an anniversary to trash (soft delete)
 *
 * @param {string} id - Anniversary ID to move to trash
 * @returns {Object} Object containing updated anniversaries and trash
 */
export function moveToTrash(id) {
  try {
    const anniversaries = loadAnniversaries();
    const trash = loadTrash();

    const anniversaryIndex = anniversaries.findIndex((a) => a.id === id);

    if (anniversaryIndex === -1) {
      throw new Error('Anniversary not found');
    }

    // Add deletedAt timestamp
    const deletedAnniversary = {
      ...anniversaries[anniversaryIndex],
      deletedAt: new Date().toISOString(),
    };

    // Remove from anniversaries and add to trash
    const updatedAnniversaries = anniversaries.filter((a) => a.id !== id);
    const updatedTrash = [...trash, deletedAnniversary];

    saveAnniversaries(updatedAnniversaries);
    saveTrash(updatedTrash);

    return {
      anniversaries: updatedAnniversaries,
      trash: updatedTrash,
    };
  } catch (error) {
    throw new Error(`Error moving to trash: ${error.message}`);
  }
}

/**
 * Restore an anniversary from trash
 *
 * @param {string} id - Anniversary ID to restore
 * @returns {Object} Object containing updated anniversaries and trash
 */
export function restoreFromTrash(id) {
  try {
    const anniversaries = loadAnniversaries();
    const trash = loadTrash();

    const trashIndex = trash.findIndex((a) => a.id === id);

    if (trashIndex === -1) {
      throw new Error('Anniversary not found in trash');
    }

    // Remove deletedAt timestamp
    const { deletedAt, ...restoredAnniversary } = trash[trashIndex];

    // Remove from trash and add back to anniversaries
    const updatedTrash = trash.filter((a) => a.id !== id);
    const updatedAnniversaries = [...anniversaries, restoredAnniversary];

    saveAnniversaries(updatedAnniversaries);
    saveTrash(updatedTrash);

    return {
      anniversaries: updatedAnniversaries,
      trash: updatedTrash,
    };
  } catch (error) {
    throw new Error(`Error restoring from trash: ${error.message}`);
  }
}

/**
 * Permanently delete an anniversary from trash
 *
 * @param {string} id - Anniversary ID to permanently delete
 * @returns {Anniversary[]} Updated trash array
 */
export function permanentDelete(id) {
  try {
    const trash = loadTrash();
    const updatedTrash = trash.filter((a) => a.id !== id);

    saveTrash(updatedTrash);

    return updatedTrash;
  } catch (error) {
    throw new Error(`Error permanently deleting: ${error.message}`);
  }
}

/**
 * Clear all items from trash
 *
 * @returns {void}
 */
export function clearTrash() {
  try {
    localStorage.removeItem(TRASH_KEY);
  } catch (error) {
    throw new Error(`Error clearing trash: ${error.message}`);
  }
}

export default {
  loadAnniversaries,
  saveAnniversaries,
  getAnniversary,
  addAnniversary,
  updateAnniversary,
  deleteAnniversary,
  exportToJSON,
  importFromJSON,
  clearAll,
  getStorageInfo,
  // Trash operations
  loadTrash,
  saveTrash,
  moveToTrash,
  restoreFromTrash,
  permanentDelete,
  clearTrash,
};
