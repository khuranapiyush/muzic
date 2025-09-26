/**
 * Direct Firebase Analytics event logging utility
 * This utility allows you to log events directly to Firebase without any abstractions
 */

import analytics from '@react-native-firebase/analytics';
import {Platform} from 'react-native';

/**
 * Log an event directly to Firebase Analytics
 * @param {string} eventName - Name of the event to log
 * @param {Object} eventParams - Parameters for the event
 * @returns {Promise} - Promise that resolves when the event is logged
 */
export async function logDirectEvent(eventName, eventParams = {}) {
  try {
    // Create standard parameters
    const standardParams = {
      timestamp: Date.now(),
      platform: Platform.OS,
      platform_version: Platform.Version.toString(),
      ...eventParams,
    };

    // Log the event directly
    await analytics().logEvent(eventName, standardParams);

    return true;
  } catch (error) {
    console.error(`❌ Error logging direct event ${eventName}:`, error);
    return false;
  }
}

export default {
  logDirectEvent,
};
