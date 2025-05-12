import {
  getAnalytics as firebaseGetAnalytics,
  logEvent,
  logScreenView,
  logPurchase,
  setAnalyticsCollectionEnabled,
  setUserProperty,
} from '@react-native-firebase/analytics';
import {initializeApp, getApps} from '@react-native-firebase/app';
import {Platform} from 'react-native';

// Enable analytics debug mode in development
const isDebug = __DEV__;

// Helper function to enable debug collection - call this in your app initialization
export const initializeAnalytics = async () => {
  try {
    // Make sure Firebase is initialized
    if (getApps().length === 0) {
      console.log('Firebase not initialized, initializing...');
      await initializeApp();
    }

    // Get the analytics instance
    const analyticsInstance = firebaseGetAnalytics();

    // Make sure analytics collection is enabled - no need to check first
    console.log('Enabling analytics collection...');
    await setAnalyticsCollectionEnabled(analyticsInstance, true);

    // Set user properties that might help debugging
    await setUserProperty(
      analyticsInstance,
      'debug_mode',
      isDebug ? 'true' : 'false',
    );
    await setUserProperty(analyticsInstance, 'platform', Platform.OS);
    await setUserProperty(
      analyticsInstance,
      'app_version',
      Platform.Version.toString(),
    );

    // Log a test event to verify setup
    await logEvent(analyticsInstance, 'analytics_initialized', {
      timestamp: Date.now(),
      platform: Platform.OS,
      debug_mode: isDebug,
    });

    console.log('📊 Firebase Analytics initialized and test event sent');
    return true;
  } catch (error) {
    console.error('❌ Error initializing Firebase Analytics:', error);
    return false;
  }
};

// Helper function to get analytics instance safely
const getAnalytics = () => {
  try {
    return firebaseGetAnalytics();
  } catch (error) {
    console.error('Error getting analytics instance:', error);
    // Initialize Firebase if not already initialized
    if (getApps().length === 0) {
      initializeApp();
    }
    return firebaseGetAnalytics();
  }
};

// Helper function to log analytics events in development
const logAnalyticsEvent = (eventName, params) => {
  try {
    const analyticsParams = {
      ...params,
      timestamp: Date.now(),
      platform: Platform.OS,
    };

    if (isDebug) {
      console.log(
        `📊 ANALYTICS EVENT: ${eventName}`,
        JSON.stringify(analyticsParams, null, 2),
      );
    }

    return logEvent(getAnalytics(), eventName, analyticsParams);
  } catch (error) {
    console.error(`❌ Error logging event ${eventName}:`, error);
    return Promise.reject(error);
  }
};

/**
 * Track screen views in the app
 * @param {string} screenName - Name of the screen being viewed
 * @param {Object} screenParams - Additional parameters for the screen
 */
export const trackScreenView = async (screenName, screenParams = {}) => {
  try {
    console.log(`📱 Screen View: ${screenName}`);
    await logScreenView(getAnalytics(), {
      screen_name: screenName,
      screen_class: screenName,
      ...screenParams,
    });
    if (isDebug) {
      console.log(`✅ Screen view logged: ${screenName}`, screenParams);
    }
  } catch (error) {
    console.error('❌ Error tracking screen view:', error);
  }
};

/**
 * Track button clicks in the app
 * @param {string} buttonName - Name of the button clicked
 * @param {Object} params - Additional parameters for the event
 */
export const trackButtonClick = async (buttonName, params = {}) => {
  try {
    console.log(`👆 Button Click: ${buttonName}`);
    await logAnalyticsEvent('button_click', {
      button_name: buttonName,
      ...params,
    });
    if (isDebug) {
      console.log(`✅ Button click logged: ${buttonName}`, params);
    }
  } catch (error) {
    console.error('❌ Error tracking button click:', error);
  }
};

/**
 * Track purchase events in the app
 * @param {number} value - Value of the purchase
 * @param {string} currency - Currency code (e.g., 'USD')
 * @param {Object} params - Additional parameters for the event
 */
export const trackPurchase = async (value, currency = 'USD', params = {}) => {
  try {
    console.log(`💰 Purchase: ${value} ${currency}`);
    await logPurchase(getAnalytics(), {
      value,
      currency,
      ...params,
    });
    if (isDebug) {
      console.log(`✅ Purchase logged: ${value} ${currency}`, params);
    }
  } catch (error) {
    console.error('❌ Error tracking purchase:', error);
  }
};

/**
 * Track custom events
 * @param {string} eventName - Name of the custom event
 * @param {Object} params - Parameters for the event
 */
export const trackCustomEvent = async (eventName, params = {}) => {
  try {
    console.log(`🔷 Custom Event: ${eventName}`);
    await logAnalyticsEvent(eventName, params);
    if (isDebug) {
      console.log(`✅ Custom event logged: ${eventName}`, params);
    }
  } catch (error) {
    console.error(`❌ Error tracking ${eventName}:`, error);
  }
};

// User Journey Specific Events

/**
 * Track app install (typically automatically tracked by Firebase, but can be manually triggered)
 */
export const trackAppInstall = async () => {
  try {
    console.log(`📲 App Install`);
    await logAnalyticsEvent('app_install', {
      timestamp: new Date().toISOString(),
    });
    if (isDebug) {
      console.log(`✅ App install logged`);
    }
  } catch (error) {
    console.error('❌ Error tracking app install:', error);
  }
};

/**
 * Track when user enters mobile number for sign-up
 * @param {Object} params - Additional parameters
 */
export const trackMobileNumberEntry = async (params = {}) => {
  try {
    console.log(`📱 Mobile Number Entry`);
    await logAnalyticsEvent('mobile_number_entry', params);
    if (isDebug) {
      console.log(`✅ Mobile number entry logged`, params);
    }
  } catch (error) {
    console.error('❌ Error tracking mobile number entry:', error);
  }
};

/**
 * Track when OTP verification screen is shown
 * @param {Object} params - Additional parameters
 */
export const trackOtpVerificationShown = async (params = {}) => {
  try {
    console.log(`🔢 OTP Verification Shown`);
    await logAnalyticsEvent('otp_verification_shown', params);
    if (isDebug) {
      console.log(`✅ OTP verification shown logged`, params);
    }
  } catch (error) {
    console.error('❌ Error tracking OTP verification shown:', error);
  }
};

/**
 * Track when OTP verification is successful
 * @param {Object} params - Additional parameters
 */
export const trackOtpVerificationSuccess = async (params = {}) => {
  try {
    console.log(`✅ OTP Verification Success`);
    await logAnalyticsEvent('otp_verification_success', params);
    if (isDebug) {
      console.log(`✅ OTP verification success logged`, params);
    }
  } catch (error) {
    console.error('❌ Error tracking OTP verification success:', error);
  }
};

/**
 * Track when user creates a custom song prompt
 * @param {string} promptText - The prompt text entered by user
 * @param {Object} params - Additional parameters
 */
export const trackSongPromptCreation = async (promptText, params = {}) => {
  try {
    console.log(`🎵 Song Prompt Creation`);
    await logAnalyticsEvent('song_prompt_creation', {
      prompt_text: promptText,
      prompt_length: promptText?.length || 0,
      ...params,
    });
    if (isDebug) {
      console.log(`✅ Song prompt creation logged`, {promptText, ...params});
    }
  } catch (error) {
    console.error('❌ Error tracking song prompt creation:', error);
  }
};

/**
 * Track when user pastes URL for AI Cover
 * @param {string} urlType - Type of URL (youtube, spotify, etc.)
 * @param {Object} params - Additional parameters
 */
export const trackAiCoverUrlPaste = async (
  urlType = 'unknown',
  params = {},
) => {
  try {
    console.log(`📋 AI Cover URL Paste: ${urlType}`);
    await logAnalyticsEvent('ai_cover_url_paste', {
      url_type: urlType,
      ...params,
    });
    if (isDebug) {
      console.log(`✅ AI Cover URL paste logged: ${urlType}`, params);
    }
  } catch (error) {
    console.error('❌ Error tracking AI Cover URL paste:', error);
  }
};

/**
 * Track when user adds a new voice recording
 * @param {Object} params - Additional parameters
 */
export const trackAddNewRecording = async (params = {}) => {
  try {
    console.log(`🎙️ Add New Recording`);
    await logAnalyticsEvent('add_new_recording', params);
    if (isDebug) {
      console.log(`✅ Add new recording logged`, params);
    }
  } catch (error) {
    console.error('❌ Error tracking add new recording:', error);
  }
};

/**
 * Track when user starts recording their voice
 * @param {string} recordingType - Type of recording (cover, original, etc.)
 * @param {Object} params - Additional parameters
 */
export const trackStartRecording = async (
  recordingType = 'vocal',
  params = {},
) => {
  try {
    console.log(`🎤 Start Recording: ${recordingType}`);
    await logAnalyticsEvent('start_recording', {
      recording_type: recordingType,
      ...params,
    });
    if (isDebug) {
      console.log(`✅ Start recording logged: ${recordingType}`, params);
    }
  } catch (error) {
    console.error('❌ Error tracking start recording:', error);
  }
};

/**
 * Track when user clicks on purchase/subscription options
 * @param {string} source - Where the user initiated the purchase from
 * @param {Object} params - Additional parameters
 */
export const trackPurchaseInitiated = async (source, params = {}) => {
  try {
    console.log(`💲 Purchase Initiated: ${source}`);
    await logAnalyticsEvent('purchase_initiated', {
      source: source, // 'top_right_logo', 'settings', 'insufficient_credits'
      ...params,
    });
    if (isDebug) {
      console.log(`✅ Purchase initiated logged: ${source}`, params);
    }
  } catch (error) {
    console.error('❌ Error tracking purchase initiated:', error);
  }
};

/**
 * Track when user uploads their own voice or song
 * @param {string} uploadType - Type of upload (voice, song)
 * @param {Object} params - Additional parameters
 */
export const trackVoiceUpload = async (uploadType = 'voice', params = {}) => {
  try {
    console.log(`📤 Voice Upload: ${uploadType}`);
    await logAnalyticsEvent('voice_upload', {
      upload_type: uploadType,
      ...params,
    });
    if (isDebug) {
      console.log(`✅ Voice upload logged: ${uploadType}`, params);
    }
  } catch (error) {
    console.error('❌ Error tracking voice upload:', error);
  }
};

export default {
  initializeAnalytics,
  trackScreenView,
  trackButtonClick,
  trackPurchase,
  trackCustomEvent,
  // User Journey Events
  trackAppInstall,
  trackMobileNumberEntry,
  trackOtpVerificationShown,
  trackOtpVerificationSuccess,
  trackSongPromptCreation,
  trackAiCoverUrlPaste,
  trackAddNewRecording,
  trackStartRecording,
  trackPurchaseInitiated,
  trackVoiceUpload,
};
