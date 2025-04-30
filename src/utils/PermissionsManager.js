import {Platform} from 'react-native';
import {PERMISSIONS, RESULTS, check, request} from 'react-native-permissions';

// Implementation for permissions with focus on microphone access
class PermissionsManager {
  static PERMISSIONS = PERMISSIONS;
  static RESULTS = RESULTS;

  // Check a permission
  static async check(permission) {
    console.log(`[PermissionsManager] Checking permission: ${permission}`);

    try {
      return await check(permission);
    } catch (error) {
      console.error('[PermissionsManager] Error checking permission:', error);
      return this.RESULTS.DENIED;
    }
  }

  // Request permission with proper error handling
  static async request(permission) {
    console.log(`[PermissionsManager] Requesting permission: ${permission}`);

    try {
      return await request(permission);
    } catch (error) {
      console.error('[PermissionsManager] Error requesting permission:', error);
      return this.RESULTS.DENIED;
    }
  }

  // Check if microphone permission is granted
  static async checkMicrophonePermission() {
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.MICROPHONE
        : PERMISSIONS.ANDROID.RECORD_AUDIO;

    return await this.check(permission);
  }

  // Request microphone permission
  static async requestMicrophonePermission() {
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.MICROPHONE
        : PERMISSIONS.ANDROID.RECORD_AUDIO;

    return await this.request(permission);
  }

  // Get platform permissions
  static getPlatformPermissions() {
    return Platform.OS === 'ios'
      ? this.PERMISSIONS.IOS || {}
      : this.PERMISSIONS.ANDROID || {};
  }
}

export default PermissionsManager;
