import {
  getAnalytics,
  logEvent,
  setUserProperties,
} from '@react-native-firebase/analytics';
import {getApp} from '@react-native-firebase/app';
import {Platform, NativeModules} from 'react-native';

// Get the native GTM Container Bridge module if available
const {GTMContainerBridge} = NativeModules;

// Flag to enable/disable tag manager
const ENABLE_TAG_MANAGER = true;

// Create a mock tag manager for testing and when Firebase is not available
const createMockTagManager = () => ({
  push: event => {
    console.log('📊 MOCK TAG MANAGER:', event);
    return Promise.resolve();
  },
});

// Store a mock tag manager instance
const mockTagManager = createMockTagManager();

/**
 * Check if the GTM Container Bridge is available
 * @returns {boolean}
 */
const isContainerAvailable = () => {
  return Platform.OS === 'ios' && !!GTMContainerBridge;
};

/**
 * Initialize Tag Manager using Firebase Analytics
 * @returns {Promise<boolean>} Whether initialization was successful
 */
export const initializeTagManager = async () => {
  if (!ENABLE_TAG_MANAGER) {
    console.log('Tag Manager is disabled');
    return false;
  }

  try {
    // In modular API, enabling collection is usually global; keep default behavior
    // Call getAnalytics to ensure analytics is initialized
    const app = getApp();
    getAnalytics(app);

    if (isContainerAvailable()) {
      console.log('Google Tag Manager initialized via native container');
    } else {
      console.log('Google Tag Manager initialized via Firebase Analytics');
    }

    return true;
  } catch (error) {
    console.error('Error initializing Tag Manager:', error);
    return false;
  }
};

/**
 * Push an event to Tag Manager
 * @param {string} eventName - The name of the event
 * @param {Object} params - Event parameters
 * @returns {Promise<void>}
 */
export const pushEvent = async (eventName, params = {}) => {
  try {
    if (!ENABLE_TAG_MANAGER) {
      // Use mock implementation if tag manager is disabled
      return mockTagManager.push({eventName, params});
    }

    // Add platform and timestamp to all events
    const enhancedParams = {
      ...params,
      platform: Platform.OS,
      timestamp: Date.now(),
    };

    // Use RNFirebase analytics instance

    // Check if we should use the native container
    if (isContainerAvailable()) {
      try {
        // Check if the event should fire based on container triggers
        const shouldFire = await GTMContainerBridge.shouldFireEvent(eventName);

        if (shouldFire) {
          // Get any additional parameters from the container
          const containerParams = await GTMContainerBridge.getEventParameters(
            eventName,
          );

          // Merge container parameters with the provided ones (prioritizing provided params)
          const mergedParams = {
            ...containerParams,
            ...enhancedParams,
          };

          // Log the event using Firebase Analytics (modular)
          const app = getApp();
          const analytics = getAnalytics(app);
          await logEvent(analytics, eventName, mergedParams);

          if (__DEV__) {
            console.log(
              `📊 TAG MANAGER EVENT (from container): ${eventName}`,
              mergedParams,
            );
          }
        } else {
          if (__DEV__) {
            console.log(
              `📊 TAG MANAGER EVENT BLOCKED BY CONTAINER: ${eventName}`,
            );
          }
        }
      } catch (containerError) {
        console.log(
          'Error using container, falling back to default:',
          containerError,
        );
        // Fallback to direct Firebase Analytics if container fails (modular)
        const app = getApp();
        const analytics = getAnalytics(app);
        await logEvent(analytics, eventName, enhancedParams);
      }
    } else {
      // Use Firebase Analytics directly (modular)
      const app = getApp();
      const analytics = getAnalytics(app);
      await logEvent(analytics, eventName, enhancedParams);

      if (__DEV__) {
        console.log(`📊 TAG MANAGER EVENT: ${eventName}`, enhancedParams);
      }
    }

    return Promise.resolve();
  } catch (error) {
    // Silent fail for tag manager errors, never block app functionality
    console.log(`Failed to push tag manager event ${eventName}:`, error);
    return mockTagManager.push({eventName, params});
  }
};

/**
 * Set a user property
 * @param {string} name - The name of the user property
 * @param {string} value - The value of the user property
 * @returns {Promise<void>}
 */
export const setUserProperty = async (name, value) => {
  try {
    if (!ENABLE_TAG_MANAGER) {
      return Promise.resolve();
    }

    // Check if we should use container values
    if (isContainerAvailable()) {
      try {
        // Try to get the variable value from the container
        const containerValue = await GTMContainerBridge.getVariableValue(name);

        // If the container has a value for this variable, use it instead
        if (containerValue) {
          await analytics().setUserProperties({[name]: String(containerValue)});

          if (__DEV__) {
            console.log(
              `📊 TAG MANAGER USER PROPERTY (from container): ${name}=${containerValue}`,
            );
          }

          return Promise.resolve();
        }
      } catch (containerError) {
        console.log('Error getting variable from container:', containerError);
      }
    }

    // Default behavior - use the provided value (modular)
    const app = getApp();
    const analytics = getAnalytics(app);
    await setUserProperties(analytics, {[name]: String(value)});

    if (__DEV__) {
      console.log(`📊 TAG MANAGER USER PROPERTY: ${name}=${value}`);
    }

    return Promise.resolve();
  } catch (error) {
    console.log(`Failed to set user property ${name}:`, error);
    return Promise.resolve();
  }
};

export default {
  initializeTagManager,
  pushEvent,
  setUserProperty,
};
