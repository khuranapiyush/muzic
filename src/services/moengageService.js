import {Platform, NativeEventEmitter, NativeModules} from 'react-native';
import {MOENGAGE_CONFIG, getMoEngageAppId} from '../constants/moEngageConfig';

// MoEngage imports with comprehensive error handling
let ReactMoE, MoEProperties, MoEInitConfig, MoEUserAttribute;
try {
  const MoEngageModule = require('react-native-moengage');
  ReactMoE =
    MoEngageModule.default || MoEngageModule.ReactMoE || MoEngageModule;
  MoEProperties = MoEngageModule.MoEProperties;
  MoEInitConfig = MoEngageModule.MoEInitConfig;
  MoEUserAttribute = MoEngageModule.MoEUserAttribute;

  // Fallback checks for different export patterns
  if (!MoEProperties && ReactMoE) {
    MoEProperties = ReactMoE.MoEProperties;
  }
  if (!MoEUserAttribute && ReactMoE) {
    MoEUserAttribute = ReactMoE.MoEUserAttribute;
  }

  console.log('✅ MoEngage module loaded successfully with methods:', {
    hasReactMoE: !!ReactMoE,
    hasMoEProperties: !!MoEProperties,
    hasMoEInitConfig: !!MoEInitConfig,
    hasMoEUserAttribute: !!MoEUserAttribute,
    availableMethods: ReactMoE
      ? Object.keys(ReactMoE).filter(key => typeof ReactMoE[key] === 'function')
      : [],
  });
} catch (error) {
  console.warn('MoEngage module not available:', error.message);
  ReactMoE = null;
  MoEProperties = null;
  MoEInitConfig = null;
  MoEUserAttribute = null;
}

// Service state management
let serviceState = {
  eventEmitter: null,
  isInitialized: false,
  lastUserIdTracked: null,
  initializationAttempts: 0,
  lastInitializationAttempt: 0,
};

const APP_ID = getMoEngageAppId();

/**
 * Check if MoEngage is available and initialized
 */
const isAvailable = () => {
  if (!ReactMoE) {
    console.warn('⚠️ MoEngage SDK not available');
    return false;
  }
  if (!serviceState.isInitialized) {
    console.warn('⚠️ MoEngage not initialized');
    return false;
  }
  return true;
};

/**
 * Initialize MoEngage event listeners for in-app messaging
 */
const initializeEventListeners = () => {
  try {
    // Initialize event emitter for in-app messaging events
    if (NativeModules.RNMoEngageInApp) {
      serviceState.eventEmitter = new NativeEventEmitter(
        NativeModules.RNMoEngageInApp,
      );

      // Listen for in-app message events
      serviceState.eventEmitter.addListener('inAppShown', onInAppShown);
      serviceState.eventEmitter.addListener('inAppClicked', onInAppClicked);
      serviceState.eventEmitter.addListener('inAppDismissed', onInAppDismissed);

      console.log('✅ MoEngage event listeners initialized');
    }
  } catch (error) {
    console.log('⚠️ MoEngage event listeners setup error:', error);
  }
};

/**
 * Event handlers for in-app messaging
 */
const onInAppShown = data => {
  console.log('📱 MoEngage: In-app message shown', data);
  // Track in-app message shown event for analytics
  trackEvent(MOENGAGE_CONFIG.EVENTS.NOTIFICATION_CLICKED, {
    type: 'in_app_message_shown',
    message_id: data?.messageId,
    campaign_id: data?.campaignId,
  });
};

const onInAppClicked = data => {
  console.log('👆 MoEngage: In-app message clicked', data);
  // Track in-app message click event for analytics
  trackEvent(MOENGAGE_CONFIG.EVENTS.NOTIFICATION_CLICKED, {
    type: 'in_app_message_clicked',
    message_id: data?.messageId,
    campaign_id: data?.campaignId,
    action: data?.action,
  });
};

const onInAppDismissed = data => {
  console.log('❌ MoEngage: In-app message dismissed', data);
  // Track in-app message dismissed event for analytics
  trackEvent(MOENGAGE_CONFIG.EVENTS.NOTIFICATION_CLICKED, {
    type: 'in_app_message_dismissed',
    message_id: data?.messageId,
    campaign_id: data?.campaignId,
  });
};

/**
 * Initialize MoEngage SDK with better error handling and timing
 */
const initialize = () => {
  try {
    // Check if already initialized successfully
    if (serviceState.isInitialized) {
      console.log('✅ MoEngage: Already initialized, skipping...');
      return true;
    }

    // Prevent too frequent initialization attempts (minimum 2 seconds between attempts)
    const now = Date.now();
    if (now - serviceState.lastInitializationAttempt < 2000) {
      console.log('⏰ MoEngage: Too soon for another initialization attempt');
      return false;
    }

    serviceState.lastInitializationAttempt = now;

    if (!ReactMoE) {
      console.log(
        '⚠️ MoEngage: ReactMoE not available, skipping initialization',
      );
      return false;
    }

    if (serviceState.initializationAttempts >= 5) {
      // Increased from 3 to 5
      console.log('⚠️ MoEngage: Maximum initialization attempts reached');
      return false;
    }

    serviceState.initializationAttempts++;
    console.log(
      `🔄 MoEngage: Initialization attempt ${serviceState.initializationAttempts}/5`,
    );

    if (APP_ID) {
      // Check if ReactMoE.initialize is available
      if (typeof ReactMoE.initialize !== 'function') {
        console.log(
          '⚠️ MoEngage: initialize method not available, available methods:',
          Object.keys(ReactMoE),
        );
        return false;
      }

      // Initialize MoEngage (data center is set in native Android/iOS config)
      ReactMoE.initialize(APP_ID);
      serviceState.isInitialized = true;
      console.log(
        '✅ MoEngage initialized successfully with App ID:',
        APP_ID,
        'and Data Center: DATA_CENTER_4',
      );

      // Initialize event listeners
      setTimeout(() => {
        initializeEventListeners();
        setBasicAttributes();
        // Force flush to ensure events are sent
        if (typeof ReactMoE.flush === 'function') {
          ReactMoE.flush();
        }
      }, 100); // Small delay to ensure initialization is complete

      return true;
    } else {
      console.log(
        '⚠️ MoEngage App ID not configured. Please check moEngageConfig.js',
      );
      serviceState.isInitialized = false;
      return false;
    }
  } catch (error) {
    console.log('❌ MoEngage initialization error:', error.message);
    serviceState.isInitialized = false;

    // Don't immediately fail - try again on next call
    if (serviceState.initializationAttempts < 5) {
      console.log('🔄 MoEngage: Will retry on next call');
    }

    return false;
  }
};

/**
 * Register push token with MoEngage
 */
const registerPushToken = async fcmToken => {
  try {
    if (!fcmToken) {
      console.warn('⚠️ MoEngage: No FCM token provided for push registration');
      return false;
    }

    if (typeof ReactMoE.setPushToken === 'function') {
      await ReactMoE.setPushToken(fcmToken);
      console.log('✅ MoEngage: Push token registered successfully');
      return true;
    } else {
      console.warn('⚠️ MoEngage: setPushToken method not available');
      return false;
    }
  } catch (error) {
    console.error('❌ MoEngage: Failed to register push token:', error);
    return false;
  }
};

/**
 * Reset initialization state (for debugging purposes)
 */
const resetInitializationState = () => {
  serviceState.initializationAttempts = 0;
  serviceState.isInitialized = false;
  serviceState.lastInitializationAttempt = 0;
  console.log('🔄 MoEngage: Initialization state reset');
};

/**
 * Try to initialize MoEngage with retry logic
 */
const initializeWithRetry = async (maxRetries = 3, delay = 2000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`🔄 MoEngage: Retry attempt ${attempt}/${maxRetries}`);

    const result = initialize();
    if (result) {
      console.log('✅ MoEngage: Initialization successful');
      return true;
    }

    if (attempt < maxRetries) {
      console.log(`⏰ MoEngage: Waiting ${delay}ms before next attempt`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  console.log('❌ MoEngage: All retry attempts failed');
  return false;
};

/**
 * Set basic app attributes
 */
const setBasicAttributes = () => {
  if (!isAvailable()) {
    return;
  }

  try {
    if (ReactMoE.setUserAttribute) {
      ReactMoE.setUserAttribute(
        MOENGAGE_CONFIG.USER_ATTRIBUTES.APP_VERSION,
        '2.0.0',
      );
      ReactMoE.setUserAttribute(
        MOENGAGE_CONFIG.USER_ATTRIBUTES.PLATFORM,
        Platform.OS,
      );
      ReactMoE.setUserAttribute(
        MOENGAGE_CONFIG.USER_ATTRIBUTES.DEVICE_TYPE,
        Platform.OS,
      );
      ReactMoE.setUserAttribute('app_name', 'Muzic');
      ReactMoE.setUserAttribute('environment', MOENGAGE_CONFIG.ENVIRONMENT);
      // Persist a synthetic push enabled flag until iOS JS layer updates it after permission prompt
      if (typeof ReactMoE.setUserAttribute === 'function') {
        const assumedPushEnabled = Platform.OS === 'android' ? true : null;
        if (assumedPushEnabled !== null) {
          ReactMoE.setUserAttribute(
            MOENGAGE_CONFIG.USER_ATTRIBUTES.PUSH_ENABLED,
            assumedPushEnabled,
          );
        }
      }
      console.log('✅ Basic MoEngage attributes set');
    }
  } catch (error) {
    console.error('❌ Failed to set basic attributes:', error);
  }
};

/**
 * Set user unique ID
 * @param {string} userId - Unique user identifier
 */
const setUserId = userId => {
  try {
    if (!userId || typeof userId !== 'string') {
      console.error('❌ Invalid userId provided:', userId);
      return false;
    }

    console.log('🔍 MoEngage: setUserId called with userId:', userId);
    ReactMoE.identifyUser(userId);
    serviceState.lastUserIdTracked = userId;
    console.log('✅ MoEngage: User ID set successfully:', userId);
    return true;
  } catch (error) {
    console.log('❌ MoEngage setUserId error:', error);
    return false;
  }
};

/**
 * Set user attributes
 * @param {Object} userAttributes - User attributes object
 */
const setUserAttributes = userAttributes => {
  try {
    if (!isAvailable()) {
      return false;
    }

    if (userAttributes.firstName) {
      ReactMoE.setUserFirstName(userAttributes.firstName);
    }
    if (userAttributes.lastName) {
      ReactMoE.setUserLastName(userAttributes.lastName);
    }
    if (userAttributes.email) {
      ReactMoE.setUserEmailID(userAttributes.email);
    }
    if (userAttributes.phoneNumber) {
      ReactMoE.setUserContactNumber(userAttributes.phoneNumber);
    }
    if (userAttributes.gender) {
      ReactMoE.setUserGender(userAttributes.gender);
    }
    if (userAttributes.birthday) {
      ReactMoE.setUserBirthday(userAttributes.birthday);
    }

    // Set custom attributes
    if (ReactMoE.setUserAttribute) {
      Object.keys(userAttributes).forEach(key => {
        if (
          ![
            'firstName',
            'lastName',
            'email',
            'phoneNumber',
            'gender',
            'birthday',
          ].includes(key)
        ) {
          ReactMoE.setUserAttribute(key, userAttributes[key]);
        }
      });
    }

    console.log('✅ MoEngage: User attributes set successfully');
    return true;
  } catch (error) {
    console.log('❌ MoEngage setUserAttributes error:', error);
    return false;
  }
};

/**
 * Track custom event
 * @param {string} eventName - Event name
 * @param {Object} eventAttributes - Event attributes
 */
const trackEvent = (eventName, eventAttributes = {}) => {
  try {
    if (!isAvailable()) {
      return false;
    }

    if (!eventName || typeof eventName !== 'string') {
      console.error('❌ Invalid event name:', eventName);
      return false;
    }

    if (MoEProperties && ReactMoE.trackEvent) {
      const properties = new MoEProperties();

      // Add attributes to properties
      if (eventAttributes && typeof eventAttributes === 'object') {
        Object.keys(eventAttributes).forEach(key => {
          const value = eventAttributes[key];
          try {
            if (typeof value === 'string') {
              properties.addAttribute(key, value);
            } else if (typeof value === 'number') {
              properties.addAttribute(key, value);
            } else if (typeof value === 'boolean') {
              properties.addAttribute(key, value);
            } else if (value !== null && value !== undefined) {
              properties.addAttribute(key, JSON.stringify(value));
            }
          } catch (propError) {
            console.warn(`❌ Failed to add property ${key}:`, propError);
          }
        });
      }

      // Add default properties
      properties.addAttribute('timestamp', new Date().toISOString());
      properties.addAttribute('platform', Platform.OS);
      properties.addAttribute('app_version', '2.0.0');

      ReactMoE.trackEvent(eventName, properties);
      console.log(`✅ Event tracked: ${eventName}`);

      // Force flush to ensure event is sent immediately
      if (typeof ReactMoE.flush === 'function') {
        ReactMoE.flush();
      }
      return true;
    } else if (ReactMoE.trackEvent) {
      // Fallback without properties
      ReactMoE.trackEvent(eventName, null);
      console.log(`✅ Event tracked (no props): ${eventName}`);

      // Force flush to ensure event is sent immediately
      if (typeof ReactMoE.flush === 'function') {
        ReactMoE.flush();
      }
      return true;
    } else {
      console.warn('❌ trackEvent method not available');
      return false;
    }
  } catch (error) {
    console.error(`❌ Failed to track event ${eventName}:`, error);
    return false;
  }
};

/**
 * Manually show in-app message
 */
const showInAppMessage = () => {
  try {
    if (!isAvailable()) {
      return false;
    }

    ReactMoE.showInApp();
    console.log('📱 MoEngage: In-app message triggered');
    return true;
  } catch (error) {
    console.log('❌ MoEngage showInAppMessage error:', error);
    return false;
  }
};

/**
 * Track user login with comprehensive data
 * @param {string} userId - User ID
 * @param {Object} userAttributes - User attributes
 */
const trackUserLogin = (userId, userAttributes = {}) => {
  try {
    console.log('🔍 MoEngage: Starting user login tracking for:', userId);

    // Set unique user identifier (creates user profile in dashboard)
    setUserId(userId);

    // Set user attributes (enriches user profile)
    setUserAttributes(userAttributes);

    // Track login event
    trackEvent(MOENGAGE_CONFIG.EVENTS.USER_LOGIN, {
      user_id: userId,
      login_time: new Date().toISOString(),
      login_method: userAttributes.method || 'unknown',
      ...userAttributes,
    });

    console.log('✅ MoEngage: User login tracking complete');
    return true;
  } catch (error) {
    console.log('❌ MoEngage trackUserLogin error:', error);
    return false;
  }
};

/**
 * Track user logout
 */
const trackUserLogout = () => {
  try {
    trackEvent(MOENGAGE_CONFIG.EVENTS.USER_LOGOUT, {
      logout_time: new Date().toISOString(),
      user_id: serviceState.lastUserIdTracked,
    });

    // Clear tracked user
    serviceState.lastUserIdTracked = null;
    return true;
  } catch (error) {
    console.log('❌ MoEngage trackUserLogout error:', error);
    return false;
  }
};

/**
 * Track user registration
 * @param {string} userId - User ID
 * @param {Object} userAttributes - User attributes
 */
const trackUserRegistration = (userId, userAttributes = {}) => {
  try {
    setUserId(userId);
    setUserAttributes(userAttributes);

    trackEvent(MOENGAGE_CONFIG.EVENTS.USER_REGISTRATION, {
      user_id: userId,
      registration_time: new Date().toISOString(),
      registration_method: userAttributes.method || 'unknown',
      ...userAttributes,
    });
    return true;
  } catch (error) {
    console.log('❌ MoEngage trackUserRegistration error:', error);
    return false;
  }
};

/**
 * Track purchase event
 * @param {Object} purchaseData - Purchase data
 */
const trackPurchase = purchaseData => {
  try {
    trackEvent(MOENGAGE_CONFIG.EVENTS.CREDITS_PURCHASED, {
      amount: purchaseData.amount,
      currency: purchaseData.currency || 'USD',
      product_id: purchaseData.productId,
      transaction_id: purchaseData.transactionId,
      purchase_time: new Date().toISOString(),
      user_id: serviceState.lastUserIdTracked,
      ...purchaseData,
    });
    return true;
  } catch (error) {
    console.log('❌ MoEngage trackPurchase error:', error);
    return false;
  }
};

/**
 * Track app open
 */
const trackAppOpen = () => {
  try {
    trackEvent(MOENGAGE_CONFIG.EVENTS.APP_OPEN, {
      app_open_time: new Date().toISOString(),
      user_id: serviceState.lastUserIdTracked,
    });
    return true;
  } catch (error) {
    console.log('❌ MoEngage trackAppOpen error:', error);
    return false;
  }
};

/**
 * Register a real user from login (Google/Apple/Email/Phone)
 * Enhanced version with better data extraction and validation
 */
const registerUserFromLogin = (userLoginData, loginSource = 'unknown') => {
  if (!isAvailable()) {
    return false;
  }

  try {
    // Validate input
    if (!userLoginData || typeof userLoginData !== 'object') {
      console.warn('❌ Invalid user login data provided');
      return false;
    }

    // Extract user info from login response with multiple fallbacks
    const userId =
      userLoginData._id ||
      userLoginData.id ||
      userLoginData.userId ||
      userLoginData.user?.id ||
      userLoginData.user?._id;
    const email = userLoginData.email || userLoginData.user?.email;
    const name =
      userLoginData.name ||
      userLoginData.user?.name ||
      userLoginData.fullName ||
      userLoginData.user?.fullName;
    const firstName =
      userLoginData.firstName ||
      userLoginData.user?.firstName ||
      userLoginData.user?.given_name;
    const lastName =
      userLoginData.lastName ||
      userLoginData.user?.lastName ||
      userLoginData.user?.family_name;
    const phoneNumber =
      userLoginData.phoneNumber ||
      userLoginData.mobile ||
      userLoginData.phone ||
      userLoginData.user?.phoneNumber;

    // Validate we have essential data
    if (!userId && !email) {
      console.warn(
        '❌ No valid user ID or email found for MoEngage registration',
      );
      return false;
    }

    // Use user ID, fallback to email-based ID only if no original ID
    const moEngageUserId = String(userId || email);

    // Prepare user details with comprehensive data
    const userDetails = {
      email: email,
      name: name || `${firstName || ''} ${lastName || ''}`.trim() || undefined,
      firstName: firstName,
      lastName: lastName,
      phoneNumber: phoneNumber,
      method: loginSource,
      userType: 'registered_user',
      signupDate: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    // Remove undefined/null/empty values
    Object.keys(userDetails).forEach(key => {
      if (
        userDetails[key] === undefined ||
        userDetails[key] === null ||
        userDetails[key] === ''
      ) {
        delete userDetails[key];
      }
    });

    console.log('🔍 MoEngage: Registering user from login:', {
      userId: moEngageUserId,
      source: loginSource,
      hasEmail: !!email,
      hasName: !!name,
    });

    // Use the enhanced login tracking
    const success = trackUserLogin(moEngageUserId, userDetails);

    if (success) {
      console.log('✅ User registered successfully in MoEngage:', {
        userId: moEngageUserId,
        email: email,
        source: loginSource,
      });
    }

    return success;
  } catch (error) {
    console.error('❌ Failed to register user from login:', error);
    return false;
  }
};

/**
 * Debug method to verify user identification
 * @param {string} userId - User ID to verify
 */
const debugUserIdentification = userId => {
  try {
    console.log('🔍 MoEngage Debug: Verifying user identification...');
    console.log('🔍 User ID:', userId);
    console.log('🔍 SDK Initialized:', serviceState.isInitialized);
    console.log('🔍 App ID:', APP_ID);
    console.log('🔍 Last User Tracked:', serviceState.lastUserIdTracked);

    // Set user ID and track test event
    if (userId) {
      setUserId(userId);
      trackEvent('Debug_User_Test', {
        debug: true,
        test_timestamp: new Date().toISOString(),
      });
    }

    console.log('✅ MoEngage Debug: User identification complete');
    console.log('📊 Check MoEngage Dashboard > People > Users in 1-2 minutes');
    return true;
  } catch (error) {
    console.log('❌ MoEngage debugUserIdentification error:', error);
    return false;
  }
};

/**
 * Clean up event listeners
 */
const cleanup = () => {
  try {
    if (serviceState.eventEmitter) {
      serviceState.eventEmitter.removeAllListeners('inAppShown');
      serviceState.eventEmitter.removeAllListeners('inAppClicked');
      serviceState.eventEmitter.removeAllListeners('inAppDismissed');
      serviceState.eventEmitter = null;
    }
    console.log('✅ MoEngage event listeners cleaned up');
  } catch (error) {
    console.log('❌ MoEngage cleanup error:', error);
  }
};

/**
 * Get service state (for debugging)
 */
const getServiceState = () => {
  return {
    isInitialized: serviceState.isInitialized,
    hasEventEmitter: !!serviceState.eventEmitter,
    appId: APP_ID,
    lastUserIdTracked: serviceState.lastUserIdTracked,
    initializationAttempts: serviceState.initializationAttempts,
    sdkAvailable: !!ReactMoE,
    propertiesAvailable: !!MoEProperties,
    platform: Platform.OS,
    availableMethods: ReactMoE
      ? Object.keys(ReactMoE).filter(key => typeof ReactMoE[key] === 'function')
      : [],
  };
};

// Don't auto-initialize when module loads - let the app control it
// initialize();

// Export all functions as a modern service object
const moEngageService = {
  // Core functions
  initialize,
  initializeWithRetry,
  resetInitializationState,
  registerPushToken,
  setUserId,
  setUserAttributes,
  trackEvent,
  showInAppMessage,

  // User lifecycle tracking
  trackUserLogin,
  trackUserLogout,
  trackUserRegistration,
  registerUserFromLogin, // Backward compatibility

  // Business events
  trackPurchase,
  trackAppOpen,

  // Debug and utility functions
  debugUserIdentification,
  cleanup,
  getServiceState,
  isAvailable,

  // Event handlers (exposed for potential customization)
  onInAppShown,
  onInAppClicked,
  onInAppDismissed,

  // Legacy compatibility
  trackAppOpened: trackAppOpen,
  getStatus: getServiceState,
};

export default moEngageService;
