import {Platform} from 'react-native';
// Replace the react-native-permissions import with our custom implementation
// import { PERMISSIONS, RESULTS, check, request } from 'react-native-permissions';
import PermissionsManager from './PermissionsManager';
const {PERMISSIONS, RESULTS, check, request} = PermissionsManager;

// Define the permissions needed for your app
export const REQUIRED_PERMISSIONS = Platform.select({
  ios: [
    PERMISSIONS.IOS.CAMERA,
    PERMISSIONS.IOS.MICROPHONE,
    PERMISSIONS.IOS.PHOTO_LIBRARY,
    PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY,
  ],
  android: [
    PERMISSIONS.ANDROID.CAMERA,
    PERMISSIONS.ANDROID.RECORD_AUDIO,
    PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
    PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
  ],
});

// Function to check and request permissions
export const checkAndRequestPermissions = async () => {
  try {
    const statuses = {};

    for (const permission of REQUIRED_PERMISSIONS) {
      // First check the status
      const status = await check(permission);

      // If not granted, request it
      if (status !== RESULTS.GRANTED) {
        statuses[permission] = await request(permission);
      } else {
        statuses[permission] = status;
      }
    }

    return statuses;
  } catch (error) {
    console.error('Error checking/requesting permissions:', error);
    return null;
  }
};

// Call this function early in your app's lifecycle
export const setupPermissions = async () => {
  return await checkAndRequestPermissions();
};
