import {Platform} from 'react-native';

// Flag to completely disable Firebase - set to true to avoid Firebase initialization errors
const DISABLE_FIREBASE = true;

// Create mock analytics object for when Firebase is not available
const createMockAnalytics = () => ({
  logEvent: () => Promise.resolve(),
  setAnalyticsCollectionEnabled: () => Promise.resolve(),
  setUserProperty: () => Promise.resolve(),
  logScreenView: () => Promise.resolve(),
  logPurchase: () => Promise.resolve(),
});

// Store a mock analytics instance
const mockAnalytics = createMockAnalytics();

// Helper function to enable debug collection - call this in your app initialization
export const initializeAnalytics = async () => {
  // Return immediately with success, but using mock implementations
  console.log('Using mock Firebase Analytics implementation');
  return true;
};

// Helper function to log analytics events safely - never throws errors
const logAnalyticsEvent = (eventName, params) => {
  try {
    const analyticsParams = {
      ...params,
      timestamp: Date.now(),
      platform: Platform.OS,
    };

    if (__DEV__) {
      console.log(`📊 MOCK ANALYTICS EVENT: ${eventName}`, analyticsParams);
    }

    return Promise.resolve();
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
};
