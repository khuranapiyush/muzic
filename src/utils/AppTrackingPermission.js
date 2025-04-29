/**
 * App Tracking Transparency utility for iOS
 * Updated for compatibility with iOS 18.4.1
 */
import {Platform} from 'react-native';

// We'll use optional imports to prevent errors on Android
let TrackingTransparencyModule;
let TrackingStatus;

// Only import the module on iOS to prevent errors on Android
if (Platform.OS === 'ios') {
  try {
    // Import the module directly - it exports both the native module and helper functions
    TrackingTransparencyModule = require('react-native-tracking-transparency');
    TrackingStatus = TrackingTransparencyModule.TrackingStatus;

    console.log(
      'TrackingTransparencyModule methods:',
      Object.keys(TrackingTransparencyModule),
    );
  } catch (error) {
    console.error(
      'Failed to import react-native-tracking-transparency:',
      error,
    );
  }
}

// Define fallback status constants in case TrackingStatus is undefined
const TRACKING_STATUS = {
  UNAVAILABLE: 'unavailable',
  DENIED: TrackingStatus?.DENIED || 'denied',
  AUTHORIZED: TrackingStatus?.AUTHORIZED || 'authorized',
  RESTRICTED: TrackingStatus?.RESTRICTED || 'restricted',
  NOT_DETERMINED: TrackingStatus?.NOT_DETERMINED || 'not-determined',
};

/**
 * Check the current tracking authorization status
 * @returns {Promise<string>} Status ('unavailable', 'denied', 'authorized', 'restricted', or 'not-determined')
 */
export const getTrackingStatus = async () => {
  try {
    if (Platform.OS !== 'ios' || !TrackingTransparencyModule) {
      return TRACKING_STATUS.UNAVAILABLE;
    }

    // Use the getTrackingStatus function exported directly from the module
    return await TrackingTransparencyModule.getTrackingStatus();
  } catch (error) {
    console.error('Error getting tracking status:', error);
    return TRACKING_STATUS.UNAVAILABLE;
  }
};

/**
 * Request app tracking transparency permission on iOS
 * This shows the system prompt to the user
 * @returns {Promise<string>} Result status
 */
export const requestTrackingPermission = async () => {
  try {
    if (Platform.OS !== 'ios' || !TrackingTransparencyModule) {
      console.log('App tracking transparency is only available on iOS');
      return TRACKING_STATUS.UNAVAILABLE;
    }

    console.log('About to request tracking authorization...');

    // Use the requestTrackingPermission function exported directly from the module
    const status = await TrackingTransparencyModule.requestTrackingPermission();
    console.log('Tracking permission result:', status);
    return status;
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
  return status === TRACKING_STATUS.AUTHORIZED;
};

/**
 * Initialize tracking permissions early in the app lifecycle
 * Designed to work with iOS 18.4.1 and above
 */
export const initializeTracking = async () => {
  if (Platform.OS === 'ios') {
    try {
      console.log('Initializing App Tracking Transparency...');
      // On first app launch, explicitly show the permission request
      const status = await requestTrackingPermission();
      console.log('Tracking permission initialized with status:', status);
      return status;
    } catch (error) {
      console.error('Failed to initialize tracking:', error);
      return 'error';
    }
  }
  return TRACKING_STATUS.UNAVAILABLE;
};

export default {
  getTrackingStatus,
  requestTrackingPermission,
  isTrackingAuthorized,
  initializeTracking,
};
