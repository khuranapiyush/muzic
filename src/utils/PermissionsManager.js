import {Platform} from 'react-native';

// Mock implementation for RNPermissions when the native module is not available
class PermissionsManager {
  static PERMISSIONS = {
    IOS: {
      CAMERA: 'ios.permission.CAMERA',
      MICROPHONE: 'ios.permission.MICROPHONE',
      PHOTO_LIBRARY: 'ios.permission.PHOTO_LIBRARY',
      APP_TRACKING_TRANSPARENCY: 'ios.permission.APP_TRACKING_TRANSPARENCY',
    },
    ANDROID: {
      CAMERA: 'android.permission.CAMERA',
      RECORD_AUDIO: 'android.permission.RECORD_AUDIO',
      READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
      WRITE_EXTERNAL_STORAGE: 'android.permission.WRITE_EXTERNAL_STORAGE',
    },
  };

  static RESULTS = {
    UNAVAILABLE: 'unavailable',
    DENIED: 'denied',
    GRANTED: 'granted',
    BLOCKED: 'blocked',
  };

  // Simulate checking a permission - assumes permissions are granted
  static async check(permission) {
    console.log(`[PermissionsManager] Checking permission: ${permission}`);
    return this.RESULTS.GRANTED;
  }

  // Simulate requesting a permission - assumes permissions are granted
  static async request(permission) {
    console.log(`[PermissionsManager] Requesting permission: ${permission}`);
    return this.RESULTS.GRANTED;
  }

  // Simulate requesting multiple permissions
  static async requestMultiple(permissions) {
    console.log(
      `[PermissionsManager] Requesting multiple permissions: ${permissions.join(
        ', ',
      )}`,
    );
    const result = {};
    permissions.forEach(permission => {
      result[permission] = this.RESULTS.GRANTED;
    });
    return result;
  }

  // Simulate notification permissions
  static async requestNotifications(options) {
    console.log(`[PermissionsManager] Requesting notification permissions`);
    return {
      status: this.RESULTS.GRANTED,
    };
  }

  // Get platform permissions
  static getPlatformPermissions() {
    return Platform.OS === 'ios'
      ? this.PERMISSIONS.IOS
      : this.PERMISSIONS.ANDROID;
  }
}

export default PermissionsManager;
