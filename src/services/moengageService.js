import {Platform} from 'react-native';

// MoEngage imports with error handling
let MoEReact, MoEProperties, MoEInitConfig;
try {
  const MoEngageModule = require('react-native-moengage');
  MoEReact = MoEngageModule.default || MoEngageModule.MoEReact;
  MoEProperties = MoEngageModule.MoEProperties;
  MoEInitConfig = MoEngageModule.MoEInitConfig;

  // Fallback if MoEProperties is not in named exports
  if (!MoEProperties && MoEReact) {
    MoEProperties = MoEReact.MoEProperties;
  }

  console.log('✅ MoEngage module loaded successfully');
} catch (error) {
  console.warn('MoEngage module not available:', error.message);
  MoEReact = null;
  MoEProperties = null;
  MoEInitConfig = null;
}

// Module state
let isInitialized = false;
const APP_ID = 'BUP4RKUJZXQL8R2J9N61ZKEL';

/**
 * Check if MoEngage is available and initialized
 */
const isAvailable = () => {
  if (!MoEReact) {
    console.warn('⚠️ MoEngage SDK not available');
    return false;
  }
  if (!isInitialized) {
    console.warn('⚠️ MoEngage not initialized');
    return false;
  }
  return true;
};

/**
 * Set data environment for production
 */
const setDataEnvironment = () => {
  if (!MoEReact) return;

  try {
    // Set data environment to production for dashboard visibility
    if (MoEReact.setDataCenter) {
      MoEReact.setDataCenter('DATA_CENTER_4'); // Use string instead of enum
      console.log('✅ MoEngage data center configured');
    }

    // Disable debug logs for production
    if (MoEReact.enableLogs) {
      MoEReact.enableLogs(false);
      console.log('✅ MoEngage logging disabled for production');
    }

    // Ensure app status is LIVE for production tracking
    if (MoEReact.setAppStatus) {
      MoEReact.setAppStatus('LIVE');
      console.log('✅ MoEngage app status set to LIVE');
    }
  } catch (error) {
    console.error('❌ Failed to configure data environment:', error);
  }
};

/**
 * Set basic app attributes
 */
const setBasicAttributes = () => {
  if (!isAvailable()) return;

  try {
    if (MoEReact.setUserAttribute) {
      MoEReact.setUserAttribute('app_name', 'Muzic');
      MoEReact.setUserAttribute('platform', Platform.OS);
      MoEReact.setUserAttribute('app_version', '2.0.0');
      MoEReact.setUserAttribute('environment', 'production');
      console.log('✅ Basic MoEngage attributes set');
    }
  } catch (error) {
    console.error('❌ Failed to set basic attributes:', error);
  }
};

/**
 * Register for push notifications
 */
const registerPushNotifications = () => {
  if (!isAvailable()) return;

  try {
    if (Platform.OS === 'ios') {
      if (MoEReact.registerForPush) {
        MoEReact.registerForPush();
        console.log('✅ iOS push registration initiated');
      }

      if (MoEReact.requestPushPermission) {
        MoEReact.requestPushPermission();
        console.log('✅ iOS push permission requested');
      }
    } else if (Platform.OS === 'android') {
      if (MoEReact.enablePushKit) {
        MoEReact.enablePushKit(true);
        console.log('✅ Android push kit enabled');
      }
    }
  } catch (error) {
    console.error('❌ Push registration failed:', error);
  }
};

/**
 * Initialize MoEngage SDK for production
 */
const initialize = async () => {
  try {
    if (!MoEReact) {
      console.warn('MoEngage SDK not available');
      return false;
    }

    console.log('🚀 Initializing MoEngage for production with APP_ID:', APP_ID);

    // Use config-based initialization if available
    if (MoEInitConfig && MoEReact.initializeWithConfig) {
      const config = new MoEInitConfig(APP_ID);
      if (config.setDataCenter) {
        config.setDataCenter('DATA_CENTER_4');
      }
      MoEReact.initializeWithConfig(config);
      console.log('✅ MoEngage initialized with config');
    } else if (MoEReact.initialize) {
      // Fallback to simple initialization
      MoEReact.initialize(APP_ID);
      console.log('✅ MoEngage initialized with simple method');
    } else {
      console.error('❌ No initialization method available');
      return false;
    }

    // Wait a bit for initialization to complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    isInitialized = true;

    // Configure for production after initialization
    setDataEnvironment();
    setBasicAttributes();
    registerPushNotifications();

    // Flush events
    if (MoEReact.flush) {
      MoEReact.flush();
      console.log('✅ MoEngage events flushed');
    }

    return true;
  } catch (error) {
    console.error('❌ MoEngage initialization failed:', error);
    isInitialized = false;
    return false;
  }
};

/**
 * Identify user with unique ID and details
 */
const identifyUser = (userId, userDetails = {}) => {
  if (!isAvailable()) return false;

  try {
    // Validate userId
    if (!userId || typeof userId !== 'string') {
      console.error('❌ Invalid userId provided:', userId);
      return false;
    }

    // Set unique user ID
    if (MoEReact.identifyUser) {
      MoEReact.identifyUser(userId);
      console.log('✅ User identified:', userId);
    }

    // Set user details with real data
    if (userDetails.email && MoEReact.setUserEmailID) {
      MoEReact.setUserEmailID(userDetails.email);
    }
    if (userDetails.name && MoEReact.setUserName) {
      MoEReact.setUserName(userDetails.name);
    }
    if (userDetails.firstName && MoEReact.setUserFirstName) {
      MoEReact.setUserFirstName(userDetails.firstName);
    }
    if (userDetails.lastName && MoEReact.setUserLastName) {
      MoEReact.setUserLastName(userDetails.lastName);
    }

    // Set additional attributes only if method exists
    if (MoEReact.setUserAttribute) {
      if (userDetails.phoneNumber) {
        MoEReact.setUserAttribute('phone_number', userDetails.phoneNumber);
      }
      MoEReact.setUserAttribute('user_type', userDetails.type || 'app_user');
      MoEReact.setUserAttribute('last_login', new Date().toISOString());
      MoEReact.setUserAttribute(
        'login_source',
        userDetails.login_source || 'unknown',
      );
    }

    // Flush user data
    if (MoEReact.flush) {
      MoEReact.flush();
      console.log('✅ User data flushed to MoEngage');
    }

    return true;
  } catch (error) {
    console.error('❌ Failed to identify user:', error);
    return false;
  }
};

/**
 * Register a real user from login (Google/Apple/Email)
 */
const registerUserFromLogin = (userLoginData, loginSource = 'unknown') => {
  if (!isAvailable()) return false;

  try {
    // Validate input
    if (!userLoginData || typeof userLoginData !== 'object') {
      console.warn('❌ Invalid user login data provided');
      return false;
    }

    // Extract user info from login response - using original data
    const userId =
      userLoginData.userId || userLoginData.id || userLoginData.user?.id;
    const email = userLoginData.email || userLoginData.user?.email;
    const name =
      userLoginData.name || userLoginData.user?.name || userLoginData.fullName;
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
      userLoginData.user?.phoneNumber ||
      userLoginData.phone;

    // Validate we have essential data
    if (!userId && !email) {
      console.warn(
        '❌ No valid user ID or email found for MoEngage registration',
      );
      return false;
    }

    // Use original user ID, fallback to email-based ID only if no original ID
    const moEngageUserId = String(userId || email);

    // Prepare user details with original data
    const userDetails = {
      email: email,
      name: name || `${firstName || ''} ${lastName || ''}`.trim() || undefined,
      firstName: firstName,
      lastName: lastName,
      phoneNumber: phoneNumber,
      type: 'real_user',
      login_source: loginSource,
      registration_date: new Date().toISOString(),
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

    // Identify user in MoEngage with original ID
    const success = identifyUser(moEngageUserId, userDetails);

    if (success) {
      // Track login event
      trackEvent('User_Login', {
        login_source: loginSource,
        user_id: moEngageUserId,
        email: email,
        timestamp: Date.now(),
        platform: Platform.OS,
      });

      console.log('✅ Real user registered in MoEngage:', {
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
 * Track event with properties
 */
const trackEvent = (eventName, properties = {}) => {
  if (!isAvailable()) return false;

  try {
    // Validate event name
    if (!eventName || typeof eventName !== 'string') {
      console.error('❌ Invalid event name:', eventName);
      return false;
    }

    if (MoEProperties && MoEReact.trackEvent) {
      // Create properties object
      const props = new MoEProperties();

      // Add custom properties
      Object.keys(properties).forEach(key => {
        const value = properties[key];
        try {
          if (typeof value === 'string') {
            props.addAttribute(key, value);
          } else if (typeof value === 'number') {
            props.addAttribute(key, value);
          } else if (typeof value === 'boolean') {
            props.addAttribute(key, value);
          } else if (value !== null && value !== undefined) {
            props.addAttribute(key, JSON.stringify(value));
          }
        } catch (propError) {
          console.warn(`❌ Failed to add property ${key}:`, propError);
        }
      });

      // Add default properties
      props.addAttribute('timestamp', new Date().toISOString());
      props.addAttribute('platform', Platform.OS);
      props.addAttribute('environment', 'production');

      MoEReact.trackEvent(eventName, props);
      console.log(`✅ Event tracked: ${eventName}`);
    } else if (MoEReact.trackEvent) {
      // Fallback without properties
      MoEReact.trackEvent(eventName, null);
      console.log(`✅ Event tracked (no props): ${eventName}`);
    } else {
      console.warn('❌ trackEvent method not available');
      return false;
    }

    // Flush events
    if (MoEReact.flush) {
      MoEReact.flush();
    }

    return true;
  } catch (error) {
    console.error(`❌ Failed to track event ${eventName}:`, error);
    return false;
  }
};

/**
 * Track app opened event
 */
const trackAppOpened = (screen = 'Unknown') => {
  return trackEvent('App_Opened', {
    screen,
    app_version: '2.0.0',
    session_start: true,
    open_time: Date.now(),
  });
};

/**
 * Get MoEngage status
 */
const getStatus = () => {
  return {
    sdkAvailable: !!MoEReact,
    propertiesAvailable: !!MoEProperties,
    initConfigAvailable: !!MoEInitConfig,
    initialized: isInitialized,
    appId: APP_ID,
    platform: Platform.OS,
    environment: 'production',
    timestamp: new Date().toISOString(),
    availableMethods: MoEReact
      ? Object.keys(MoEReact).filter(key => typeof MoEReact[key] === 'function')
      : [],
  };
};

/**
 * Reset initialization state (for debugging)
 */
const reset = () => {
  isInitialized = false;
  console.log('⚠️ MoEngage service reset');
};

// Create service object with production functions only
const MoEngageService = {
  initialize,
  identifyUser,
  registerUserFromLogin,
  trackEvent,
  trackAppOpened,
  getStatus,
  isAvailable,
  reset, // For debugging purposes
};

// Export as default
export default MoEngageService;
