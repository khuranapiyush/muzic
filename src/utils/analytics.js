import {Platform} from 'react-native';
import {
  getAnalytics,
  logEvent,
  setAnalyticsCollectionEnabled,
} from '@react-native-firebase/analytics';

// Flag for debugging analytics - set to true to see log messages
const DEBUG_ANALYTICS = __DEV__;

// Helper function to enable analytics collection
export const initializeAnalytics = async () => {
  try {
    // Enable analytics collection using modular SDK
    const analytics = getAnalytics();
    await setAnalyticsCollectionEnabled(analytics, true);

    if (DEBUG_ANALYTICS) {
      console.log('Firebase Analytics initialized successfully');
    }
    return true;
  } catch (error) {
    console.error('Error initializing Firebase Analytics:', error);
    // Return false to indicate initialization failed
    return false;
  }
};

// Helper function to log analytics events safely - never throws errors
const logAnalyticsEvent = (eventName, params) => {
  try {
    const analyticsParams = {
      ...params,
      timestamp: Date.now(),
      platform: Platform.OS,
    };

    // Use Firebase Analytics with modular SDK
    if (DEBUG_ANALYTICS) {
      console.log(`📊 ANALYTICS EVENT: ${eventName}`, analyticsParams);
    }

    const analytics = getAnalytics();
    return logEvent(analytics, eventName, analyticsParams);
  } catch (error) {
    // Silent fail for analytics errors, never block app functionality
    console.log(`Failed to log event ${eventName}:`, error);
    return Promise.resolve();
  }
};

// Track app screen views
export const trackScreenView = (screenName, screenClass) => {
  return logAnalyticsEvent('screen_view', {
    screen_name: screenName,
    screen_class: screenClass,
  });
};

// Track user login method
export const trackLogin = method => {
  return logAnalyticsEvent('login', {method});
};

// Track sign up
export const trackSignUp = method => {
  return logAnalyticsEvent('sign_up', {method});
};

// Track mobile number entry
export const trackMobileNumberEntry = params => {
  return logAnalyticsEvent('mobile_number_entry', params);
};

// Track OTP verification shown
export const trackOtpVerificationShown = params => {
  return logAnalyticsEvent('otp_verification_shown', params);
};

// Track OTP verification success
export const trackOtpVerificationSuccess = params => {
  return logAnalyticsEvent('otp_verification_success', params);
};

// Track button click
export const trackButtonClick = (buttonName, params = {}) => {
  return logAnalyticsEvent('button_click', {
    button_name: buttonName,
    ...params,
  });
};

// Track song prompt creation
export const trackSongPromptCreation = (promptText, params = {}) => {
  return logAnalyticsEvent('song_prompt_creation', {
    prompt_text: promptText,
    word_count: promptText ? promptText.split(' ').length : 0,
    ...params,
  });
};

// Track AI Cover URL paste
export const trackAiCoverUrlPaste = (urlType, params = {}) => {
  return logAnalyticsEvent('ai_cover_url_paste', {
    url_type: urlType,
    ...params,
  });
};

// Track add new recording
export const trackAddNewRecording = params => {
  return logAnalyticsEvent('add_new_recording', params);
};

// Track start recording
export const trackStartRecording = (recordingType, params = {}) => {
  return logAnalyticsEvent('start_recording', {
    recording_type: recordingType,
    ...params,
  });
};

// Track purchase initiated
export const trackPurchaseInitiated = (source, params = {}) => {
  return logAnalyticsEvent('purchase_initiated', {
    source: source,
    ...params,
  });
};

// Track voice upload
export const trackVoiceUpload = (uploadType, params = {}) => {
  return logAnalyticsEvent('voice_upload', {
    upload_type: uploadType,
    ...params,
  });
};

// Track purchases
export const trackPurchase = params => {
  return logAnalyticsEvent('purchase', params);
};

// Track custom events
export const trackCustomEvent = (eventName, params = {}) => {
  return logAnalyticsEvent(eventName, params);
};

export default {
  initializeAnalytics,
  trackScreenView,
  trackLogin,
  trackSignUp,
  trackPurchase,
  trackCustomEvent,
  trackMobileNumberEntry,
  trackOtpVerificationShown,
  trackOtpVerificationSuccess,
  trackButtonClick,
  trackSongPromptCreation,
  trackAiCoverUrlPaste,
  trackAddNewRecording,
  trackStartRecording,
  trackPurchaseInitiated,
  trackVoiceUpload,
};
