import {initializeApp, getApps} from '@react-native-firebase/app';
import {Platform} from 'react-native';

// Firebase configuration for makemysong-4af52 project
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
 * Initialize Firebase with explicit configuration
 * @returns {Promise<boolean>} Whether initialization was successful
 */
export const initializeFirebase = async () => {
  try {
    // Check if Firebase is already initialized
    if (getApps().length === 0) {
      console.log('Initializing Firebase with explicit configuration...');

      // Initialize with explicit config instead of relying on GoogleService-Info.plist
      await initializeApp(firebaseConfig);

      console.log('Firebase initialized successfully with explicit config');
      return true;
    } else {
      console.log('Firebase already initialized');
      return true;
    }
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return false;
  }
};

export default {
  initializeFirebase,
  firebaseConfig,
};
