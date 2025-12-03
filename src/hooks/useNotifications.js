import { useState, useEffect, useCallback } from 'react';
import {
  isNotificationSupported,
  getPermissionStatus,
  requestPermission as requestNotificationPermission,
  checkAndFireNotifications as checkNotifications,
} from '../services/NotificationService';

/**
 * useNotifications - Custom hook for managing browser notifications
 *
 * Manages notification permission state, provides functions to request permission,
 * and handles periodic checking for notifications to fire.
 *
 * @param {Anniversary[]} anniversaries - Array of anniversaries to monitor
 * @param {number} [checkInterval] - Interval in milliseconds to check for notifications (default: 60000 = 1 minute)
 * @returns {Object} Notification state and controls
 */
function useNotifications(anniversaries = [], checkInterval = 60000) {
  const [isSupported] = useState(isNotificationSupported());
  const [permission, setPermission] = useState(getPermissionStatus());
  const [lastCheck, setLastCheck] = useState(null);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    const granted = await requestNotificationPermission();
    setPermission(getPermissionStatus());
    return granted;
  }, []);

  // Check and fire notifications
  const checkAndFire = useCallback(() => {
    if (permission === 'granted' && Array.isArray(anniversaries)) {
      const count = checkNotifications(anniversaries);
      setLastCheck(new Date());
      return count;
    }
    return 0;
  }, [permission, anniversaries]);

  // Set up periodic notification checking
  useEffect(() => {
    if (!isSupported || permission !== 'granted' || !anniversaries.length) {
      return;
    }

    // Check immediately on mount
    checkAndFire();

    // Set up interval for periodic checks
    const intervalId = setInterval(() => {
      checkAndFire();
    }, checkInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [isSupported, permission, anniversaries, checkInterval, checkAndFire]);

  // Listen for permission changes (though this is rare in practice)
  useEffect(() => {
    if (!isSupported) {
      return;
    }

    // Check permission status periodically in case it changed externally
    const checkPermissionInterval = setInterval(() => {
      const currentPermission = getPermissionStatus();
      if (currentPermission !== permission) {
        setPermission(currentPermission);
      }
    }, 5000); // Check every 5 seconds

    return () => {
      clearInterval(checkPermissionInterval);
    };
  }, [isSupported, permission]);

  return {
    isSupported,
    permission,
    requestPermission,
    checkAndFire,
    lastCheck,
    isGranted: permission === 'granted',
    isDenied: permission === 'denied',
    isDefault: permission === 'default',
  };
}

export default useNotifications;
