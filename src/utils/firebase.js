import {getApps} from '@react-native-firebase/app';
import {Platform} from 'react-native';

// Firebase configuration for the native applications
// This is used as a fallback in case the GoogleService-Info.plist
// or google-services.json files aren't properly loaded
const firebaseConfig = {
  apiKey: 'AIzaSyClMnC-5uhmdNsfg2d0QwVC1Pr_UpenUpk',
  authDomain: 'makemysong-4af52.firebaseapp.com',
  projectId: 'makemysong-4af52',
  storageBucket: 'makemysong-4af52.firebasestorage.app',
  messagingSenderId: '22319693149',
  appId: '1:22319693149:ios:f9f880166aa83b1c7d3cb4',
  databaseURL: 'https://makemysong-4af52.firebaseio.com',
};

/**
 * Initialize Firebase for native platforms
 *
 * Firebase should be auto-initialized through the native SDKs with
 * google-services.json and GoogleService-Info.plist, but we check
 * that initialization happened correctly.
 *
 * @returns {Promise<boolean>} Whether Firebase is properly set up
 */
export const initializeFirebase = async () => {
  try {
    // For native platforms, Firebase initialization happens automatically
    // through the native Firebase SDK with google-services.json and GoogleService-Info.plist
    const apps = getApps();
    if (apps.length > 0) {
      console.log('Firebase is initialized in native mode');
      return true;
    } else {
      console.error('Firebase app not found - check native configuration');
      return false;
    }
  } catch (error) {
    console.error('Error checking Firebase initialization:', error);
    return false;
  }
};

export default {
  initializeFirebase,
  firebaseConfig,
};
