import {Platform} from 'react-native';
import {
  request,
  getTrackingStatus,
  TrackingStatus,
} from 'react-native-tracking-transparency';

// Implementation for permissions with real ATT support
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

  // Check a permission with special handling for tracking permission
  static async check(permission) {
    console.log(`[PermissionsManager] Checking permission: ${permission}`);

    // If it's the tracking permission on iOS, use the tracking transparency module
    if (
      Platform.OS === 'ios' &&
      permission === this.PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY
    ) {
      try {
        const trackingStatus = await getTrackingStatus();
        switch (trackingStatus) {
          case TrackingStatus.UNAVAILABLE:
            return this.RESULTS.UNAVAILABLE;
          case TrackingStatus.DENIED:
            return this.RESULTS.DENIED;
          case TrackingStatus.AUTHORIZED:
            return this.RESULTS.GRANTED;
          case TrackingStatus.RESTRICTED:
            return this.RESULTS.BLOCKED;
          case TrackingStatus.NOT_DETERMINED:
          default:
            return this.RESULTS.DENIED;
        }
      } catch (error) {
        console.error(
          '[PermissionsManager] Error checking tracking permission:',
          error,
        );
        return this.RESULTS.DENIED;
      }
    }

    // For other permissions use a mock for now
    return this.RESULTS.GRANTED;
  }

  // Request permission with special handling for tracking permission
  static async request(permission) {
    console.log(`[PermissionsManager] Requesting permission: ${permission}`);

    // If it's the tracking permission on iOS, use the tracking transparency module
    if (
      Platform.OS === 'ios' &&
      permission === this.PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY
    ) {
      try {
        const trackingStatus = await request();
        switch (trackingStatus) {
          case TrackingStatus.UNAVAILABLE:
            return this.RESULTS.UNAVAILABLE;
          case TrackingStatus.DENIED:
            return this.RESULTS.DENIED;
          case TrackingStatus.AUTHORIZED:
            return this.RESULTS.GRANTED;
          case TrackingStatus.RESTRICTED:
            return this.RESULTS.BLOCKED;
          case TrackingStatus.NOT_DETERMINED:
          default:
            return this.RESULTS.DENIED;
        }
      } catch (error) {
        console.error(
          '[PermissionsManager] Error requesting tracking permission:',
          error,
        );
        return this.RESULTS.DENIED;
      }
    }

    // For other permissions use a mock for now
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

    for (const permission of permissions) {
      result[permission] = await this.request(permission);
    }

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
