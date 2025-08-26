import {Platform} from 'react-native';
import {store} from '../stores';
import moEngageService from '../services/moengageService';

/**
 * Enhanced MoEngage utilities to fix common tracking issues
 */

/**
 * Get current user information from Redux store
 */
const getCurrentUser = () => {
  try {
    const state = store.getState();

    // Try multiple locations for user data
    const userId =
      state?.auth?.user?.userId ||
      state?.auth?.user?.id ||
      state?.auth?.userId ||
      state?.user?.userId ||
      state?.user?.id ||
      state?.user?.user?.id ||
      state?.user?.user?.userId;

    const userInfo =
      state?.auth?.user || state?.user?.user || state?.user || {};

    return {
      userId: userId ? String(userId) : null,
      email: userInfo.email,
      firstName: userInfo.firstName || userInfo.first_name,
      lastName: userInfo.lastName || userInfo.last_name,
      phoneNumber: userInfo.phoneNumber || userInfo.phone || userInfo.mobile,
      isLoggedIn: state?.auth?.isLoggedIn || state?.user?.isLoggedIn || false,
      ...userInfo,
    };
  } catch (error) {
    console.warn('⚠️ Error getting current user:', error);
    return {userId: null, isLoggedIn: false};
  }
};

/**
 * Ensure MoEngage user is properly identified before tracking events
 */
export const ensureMoEngageUserIdentified = async () => {
  try {
    const user = getCurrentUser();

    if (!user.isLoggedIn || !user.userId) {
      console.log(
        '🔍 MoEngage: No logged-in user found, skipping identification',
      );
      return false;
    }

    // Set user ID first
    const userIdSet = moEngageService.setUserId(user.userId);
    if (!userIdSet) {
      console.warn('⚠️ MoEngage: Failed to set user ID');
      return false;
    }

    // Set user attributes
    const userAttributes = {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      platform: Platform.OS,
      app_version: '2.0.0',
      last_login: new Date().toISOString(),
      user_type: 'registered_user',
    };

    // Remove undefined/null values
    Object.keys(userAttributes).forEach(key => {
      if (
        userAttributes[key] === undefined ||
        userAttributes[key] === null ||
        userAttributes[key] === ''
      ) {
        delete userAttributes[key];
      }
    });

    const attributesSet = moEngageService.setUserAttributes(userAttributes);
    if (!attributesSet) {
      console.warn('⚠️ MoEngage: Failed to set user attributes');
    }

    console.log('✅ MoEngage: User identified successfully:', user.userId);
    return true;
  } catch (error) {
    console.error('❌ MoEngage user identification failed:', error);
    return false;
  }
};

/**
 * Enhanced event tracking with automatic user identification
 */
export const trackMoEngageEvent = async (eventName, eventAttributes = {}) => {
  try {
    // Ensure user is identified first
    await ensureMoEngageUserIdentified();

    // Add enhanced metadata
    const enhancedAttributes = {
      ...eventAttributes,
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
      app_version: '2.0.0',
      event_source: 'enhanced_tracking',
    };

    // Track the event
    const success = moEngageService.trackEvent(eventName, enhancedAttributes);

    if (success) {
      console.log(
        `✅ MoEngage event tracked: ${eventName}`,
        enhancedAttributes,
      );
    } else {
      console.warn(`⚠️ MoEngage event tracking failed: ${eventName}`);
    }

    return success;
  } catch (error) {
    console.error(`❌ MoEngage event tracking error: ${eventName}`, error);
    return false;
  }
};

/**
 * Enhanced user login tracking
 */
export const trackMoEngageUserLogin = async (
  userData,
  loginMethod = 'unknown',
) => {
  try {
    if (!userData) {
      console.warn('⚠️ No user data provided for login tracking');
      return false;
    }

    // Extract user ID with multiple fallbacks
    const userId = String(
      userData._id ||
        userData.id ||
        userData.userId ||
        userData.user?.id ||
        userData.user?._id,
    );

    if (!userId || userId === 'undefined') {
      console.warn('⚠️ No valid user ID found for login tracking');
      return false;
    }

    // Set user ID
    const userIdSet = moEngageService.setUserId(userId);
    if (!userIdSet) {
      console.warn('⚠️ Failed to set MoEngage user ID during login');
      return false;
    }

    // Prepare comprehensive user attributes
    const userAttributes = {
      email: userData.email || userData.user?.email,
      firstName:
        userData.firstName ||
        userData.user?.firstName ||
        userData.user?.given_name,
      lastName:
        userData.lastName ||
        userData.user?.lastName ||
        userData.user?.family_name,
      phoneNumber:
        userData.phoneNumber ||
        userData.mobile ||
        userData.phone ||
        userData.user?.phoneNumber,
      method: loginMethod,
      platform: Platform.OS,
      app_version: '2.0.0',
      last_login: new Date().toISOString(),
      user_type: 'registered_user',
      login_timestamp: new Date().toISOString(),
    };

    // Remove undefined/null values
    Object.keys(userAttributes).forEach(key => {
      if (
        userAttributes[key] === undefined ||
        userAttributes[key] === null ||
        userAttributes[key] === ''
      ) {
        delete userAttributes[key];
      }
    });

    // Set user attributes
    const attributesSet = moEngageService.setUserAttributes(userAttributes);

    // Track login event
    const loginTracked = moEngageService.trackUserLogin(userId, userAttributes);

    console.log('✅ MoEngage user login tracked:', {
      userId,
      method: loginMethod,
      attributesSet,
      loginTracked,
    });

    return loginTracked;
  } catch (error) {
    console.error('❌ MoEngage login tracking failed:', error);
    return false;
  }
};

/**
 * Enhanced user registration tracking
 */
export const trackMoEngageUserRegistration = async (
  userData,
  registrationMethod = 'unknown',
) => {
  try {
    if (!userData) {
      console.warn('⚠️ No user data provided for registration tracking');
      return false;
    }

    // Use the login tracker as it handles registration too
    const loginResult = await trackMoEngageUserLogin(
      userData,
      registrationMethod,
    );

    if (loginResult) {
      // Also track specific registration event
      const userId = String(
        userData._id ||
          userData.id ||
          userData.userId ||
          userData.user?.id ||
          userData.user?._id,
      );

      const registrationTracked = moEngageService.trackUserRegistration(
        userId,
        {
          method: registrationMethod,
          registration_timestamp: new Date().toISOString(),
          platform: Platform.OS,
        },
      );

      console.log('✅ MoEngage user registration tracked:', userId);
      return registrationTracked;
    }

    return false;
  } catch (error) {
    console.error('❌ MoEngage registration tracking failed:', error);
    return false;
  }
};

/**
 * Force sync user data - useful for debugging
 */
export const forceSyncMoEngageUser = async () => {
  try {
    console.log('🔄 Forcing MoEngage user sync...');

    const user = getCurrentUser();
    console.log('👤 Current user data:', user);

    if (!user.isLoggedIn || !user.userId) {
      console.log('❌ No user to sync');
      return false;
    }

    // Force set user ID
    moEngageService.setUserId(user.userId);

    // Force set attributes
    const attributes = {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      platform: Platform.OS,
      sync_timestamp: new Date().toISOString(),
      force_sync: true,
    };

    moEngageService.setUserAttributes(attributes);

    // Track a test event
    await trackMoEngageEvent('Debug_User_Sync', {
      debug: true,
      user_id: user.userId,
      sync_timestamp: new Date().toISOString(),
    });

    console.log('✅ MoEngage user sync completed');
    return true;
  } catch (error) {
    console.error('❌ MoEngage user sync failed:', error);
    return false;
  }
};

/**
 * Debug function to check MoEngage status
 */
export const debugMoEngageStatus = () => {
  try {
    const user = getCurrentUser();
    const serviceStatus = moEngageService.getServiceState();

    console.log('🔍 MoEngage Debug Status:', {
      user: {
        userId: user.userId,
        isLoggedIn: user.isLoggedIn,
        email: user.email,
      },
      service: serviceStatus,
      timestamp: new Date().toISOString(),
    });

    return {
      user,
      service: serviceStatus,
    };
  } catch (error) {
    console.error('❌ MoEngage debug failed:', error);
    return null;
  }
};

export default {
  ensureMoEngageUserIdentified,
  trackMoEngageEvent,
  trackMoEngageUserLogin,
  trackMoEngageUserRegistration,
  forceSyncMoEngageUser,
  debugMoEngageStatus,
};
