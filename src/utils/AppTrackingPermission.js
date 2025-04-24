/**
 * App Tracking Transparency utility for iOS
 */
import {Platform} from 'react-native';

// We'll use optional imports to prevent errors on Android
let TrackingTransparency;
let TrackingStatus;

// Only import the module on iOS to prevent errors on Android
if (Platform.OS === 'ios') {
  try {
    // Dynamic import to handle the case where the package isn't installed yet
    TrackingTransparency = require('react-native-tracking-transparency');
    TrackingStatus = TrackingTransparency.TrackingStatus;
  } catch (error) {
    console.error(
      'Failed to import react-native-tracking-transparency:',
      error,
    );
  }
}

/**
 * Check the current tracking authorization status
 * @returns {Promise<string>} Status ('unavailable', 'denied', 'authorized', 'restricted', or 'not-determined')
 */
export const getTrackingStatus = async () => {
  try {
    if (Platform.OS !== 'ios' || !TrackingTransparency) {
      return 'unavailable';
    }

    return await TrackingTransparency.getTrackingStatus();
  } catch (error) {
    console.error('Error getting tracking status:', error);
    return 'unavailable';
  }
};

/**
 * Request app tracking transparency permission on iOS
 * This shows the system prompt to the user
 * @returns {Promise<string>} Result status
 */
export const requestTrackingPermission = async () => {
  try {
    if (Platform.OS !== 'ios' || !TrackingTransparency) {
      console.log('App tracking transparency is only available on iOS');
      return 'unavailable';
    }

    // First check the current status to avoid showing the prompt if not needed
    const currentStatus = await TrackingTransparency.getTrackingStatus();
    console.log('Current tracking status:', currentStatus);

    // Only request if not determined yet
    if (currentStatus === TrackingStatus.NOT_DETERMINED) {
      console.log('Requesting tracking permission...');
      const status = await TrackingTransparency.request();
      console.log('Tracking permission result:', status);
      return status;
    }

    return currentStatus;
  } catch (error) {
    console.error('Error requesting tracking permission:', error);
    return 'error';
  }
};

/**
 * Check if tracking is authorized
 * @returns {Promise<boolean>} Whether tracking is authorized
 */
export const isTrackingAuthorized = async () => {
  const status = await getTrackingStatus();
  return status === TrackingStatus?.AUTHORIZED;
};

/**
 * Initialize tracking permissions as early as possible in the app
 */
export const initializeTracking = async () => {
  if (Platform.OS === 'ios') {
    try {
      const status = await requestTrackingPermission();
      console.log('Tracking permission initialized with status:', status);
      return status;
    } catch (error) {
      console.error('Failed to initialize tracking:', error);
      return 'error';
    }
  }
  return 'unavailable';
};

export default {
  getTrackingStatus,
  requestTrackingPermission,
  isTrackingAuthorized,
  initializeTracking,
};
