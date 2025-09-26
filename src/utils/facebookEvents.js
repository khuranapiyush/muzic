/**
 * Facebook SDK event tracking utility
 *
 * This file provides methods to track events using the Facebook SDK
 */

import {AppEventsLogger, Settings} from 'react-native-fbsdk-next';
import {Platform} from 'react-native';
import {requestTrackingPermission} from 'react-native-tracking-transparency';

/**
 * Initialize the Facebook SDK
 * This should be called at app startup
 */
export const initializeFacebookSDK = async () => {
  try {
    // Ensure SDK is initialized (safe to call multiple times)
    if (Settings && typeof Settings.initializeSDK === 'function') {
      try {
        Settings.initializeSDK();
      } catch (_) {}
    }

    // Enable auto log app events explicitly
    if (Settings && typeof Settings.setAutoLogAppEventsEnabled === 'function') {
      Settings.setAutoLogAppEventsEnabled(true);
    }

    // iOS 14+ requires ATT for advertiser tracking
    if (Platform.OS === 'ios') {
      try {
        const status = await requestTrackingPermission();
        const allowed = status === 'authorized' || status === 'unavailable';
        if (
          Settings &&
          typeof Settings.setAdvertiserTrackingEnabled === 'function'
        ) {
          Settings.setAdvertiserTrackingEnabled(Boolean(allowed));
        }
      } catch (e) {
        // Best-effort only
      }
    }

    console.log('Facebook SDK initialized');
  } catch (error) {
    console.warn('Facebook SDK initialization error:', error?.message || error);
  }
};

/**
 * Log a custom event to Facebook Analytics
 *
 * @param {string} eventName - Name of the event
 * @param {Object} parameters - Optional parameters for the event
 */
export const logCustomEvent = (eventName, parameters = {}) => {
  try {
    AppEventsLogger.logEvent(eventName, parameters);
    console.log(`Facebook event logged: ${eventName}`, parameters);
  } catch (error) {
    console.error('Error logging Facebook event:', error);
  }
};

/**
 * Log app open event
 */
export const logAppOpen = () => {
  try {
    AppEventsLogger.logEvent('fb_mobile_app_open');
    console.log('Facebook app open event logged');
  } catch (error) {
    console.error('Error logging Facebook app open event:', error);
  }
};

/**
 * Log user registration complete
 *
 * @param {string} registrationMethod - Method used for registration (email, phone, etc.)
 */
export const logUserRegistration = (registrationMethod = 'email') => {
  try {
    AppEventsLogger.logEvent('fb_mobile_complete_registration', {
      registration_method: registrationMethod,
    });
    console.log('Facebook registration event logged');
  } catch (error) {
    console.error('Error logging Facebook registration event:', error);
  }
};

/**
 * Log in-app purchase event
 *
 * @param {number} amount - Purchase amount
 * @param {string} currency - Currency code (e.g., 'USD')
 * @param {string} contentId - ID of the purchased content
 */
export const logPurchase = (amount, currency, contentId) => {
  try {
    // Validate parameters to prevent NullPointerException
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      console.warn('Invalid amount for Facebook purchase event:', amount);
      return;
    }

    if (!currency || typeof currency !== 'string') {
      console.warn('Invalid currency for Facebook purchase event:', currency);
      return;
    }

    const parameters = contentId ? {content_id: contentId} : {};

    AppEventsLogger.logPurchase(amount, currency, parameters);
    console.log(`Facebook purchase event logged: ${amount} ${currency}`);
  } catch (error) {
    console.error('Error logging Facebook purchase event:', error);
  }
};

/**
 * Log song play event
 *
 * @param {string} songId - ID of the song
 * @param {string} songName - Name of the song
 */
export const logSongPlay = (songId, songName) => {
  try {
    AppEventsLogger.logEvent('song_played', {
      song_id: songId,
      song_name: songName,
    });
    console.log(`Facebook song play event logged: ${songName}`);
  } catch (error) {
    console.error('Error logging Facebook song play event:', error);
  }
};

export default {
  initializeFacebookSDK,
  logCustomEvent,
  logAppOpen,
  logUserRegistration,
  logPurchase,
  logSongPlay,
};
