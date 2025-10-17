import {Platform} from 'react-native';
import {Mixpanel} from 'mixpanel-react-native';
import {getMixpanelConfig} from '../constants/mixpanelConfig';
import {requestTrackingPermission} from 'react-native-tracking-transparency';
import {store} from '../stores';

let mixpanelInstance = null;
let isInitialized = false;
let hasIdentifiedUser = false;

const getCurrentUser = () => {
  try {
    const state = store.getState?.() || {};
    const userState =
      state?.auth?.user || state?.user?.user || state?.user || {};
    const userId =
      state?.auth?.user?.userId ||
      state?.auth?.user?.id ||
      state?.auth?.userId ||
      state?.user?.userId ||
      state?.user?.id ||
      state?.user?.user?.id ||
      state?.user?.user?.userId ||
      userState?._id ||
      userState?.id ||
      null;

    const isLoggedIn =
      state?.auth?.isLoggedIn || state?.user?.isLoggedIn || false;

    return {
      userId: userId ? String(userId) : null,
      email: userState?.email,
      firstName: userState?.firstName || userState?.first_name,
      lastName: userState?.lastName || userState?.last_name,
      username: userState?.username || userState?.userName || userState?.name,
      phone: userState?.phoneNumber || userState?.phone || userState?.mobile,
      subscription_status:
        userState?.subscription_status ||
        userState?.subscriptionStatus ||
        userState?.subscription?.status,
      plan_type:
        userState?.plan_type ||
        userState?.planType ||
        userState?.subscription?.plan?.type,
      plan_duration:
        userState?.plan_duration ||
        userState?.planDuration ||
        userState?.subscription?.plan?.duration,
      isLoggedIn,
    };
  } catch (_) {
    return {userId: null, isLoggedIn: false};
  }
};

export const initializeMixpanel = async () => {
  try {
    if (isInitialized && mixpanelInstance) {
      return {success: true, alreadyInitialized: true};
    }

    const mixpanelConfig = getMixpanelConfig();

    // ATT gate on iOS
    if (Platform.OS === 'ios') {
      try {
        const status = await requestTrackingPermission();
        const allowed = status === 'authorized' || status === 'unavailable';
        if (!allowed) {
          // Initialize anyway but opt-out tracking to be explicit
          mixpanelInstance = new Mixpanel(
            mixpanelConfig.PROJECT_TOKEN,
            mixpanelConfig.TRACK_AUTOMATIC_EVENTS,
            mixpanelConfig.USE_NATIVE,
          );
          await mixpanelInstance.init();
          await mixpanelInstance.optOutTracking(true);
          isInitialized = true;
          return {success: true, optedOut: true};
        }
      } catch (_) {
        // Continue with initialization best-effort
      }
    }

    mixpanelInstance = new Mixpanel(
      mixpanelConfig.PROJECT_TOKEN,
      mixpanelConfig.TRACK_AUTOMATIC_EVENTS,
      mixpanelConfig.USE_NATIVE,
    );
    await mixpanelInstance.init();

    if (mixpanelConfig.DEBUG) {
      mixpanelInstance.setLoggingEnabled(true);
    }
    if (mixpanelConfig.BATCH_SIZE) {
      mixpanelInstance.setFlushBatchSize(mixpanelConfig.BATCH_SIZE);
    }
    if (mixpanelConfig.FLUSH_INTERVAL_MS) {
      try {
        mixpanelInstance.setFlushInterval(mixpanelConfig.FLUSH_INTERVAL_MS);
      } catch (_) {}
    }

    // Register baseline super properties
    await mixpanelInstance.registerSuperProperties(
      mixpanelConfig.SUPER_PROPERTIES || {},
    );

    // Track initialization
    await trackEvent('mixpanel_initialized', {
      project_token: mixpanelConfig.PROJECT_TOKEN,
      platform: Platform.OS,
      ts: Date.now(),
    });

    isInitialized = true;
    return {success: true};
  } catch (error) {
    return {success: false, error: error?.message || String(error)};
  }
};

export const identify = async userId => {
  try {
    if (!mixpanelInstance || !isInitialized || !userId) {
      return false;
    }
    await mixpanelInstance.identify(userId);
    return true;
  } catch (_) {
    return false;
  }
};

export const setUserProperties = async properties => {
  try {
    if (!mixpanelInstance || !isInitialized || !properties) {
      return false;
    }
    const people = mixpanelInstance.getPeople();
    await people.set(properties);
    return true;
  } catch (_) {
    return false;
  }
};

export const ensureMixpanelUserIdentified = async explicitUser => {
  try {
    if (!mixpanelInstance || !isInitialized) {
      return false;
    }

    const user = explicitUser || getCurrentUser();
    if (!user?.isLoggedIn || !user?.userId) {
      return false;
    }

    await mixpanelInstance.identify(user.userId);
    hasIdentifiedUser = true;

    const profileProps = {
      $name:
        [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
        undefined,
      $email: user.email || undefined,
      first_name: user.firstName || undefined,
      last_name: user.lastName || undefined,
      username: user.username || undefined,
      phone: user.phone || undefined,
      subscription_status: user.subscription_status || undefined,
      plan_type: user.plan_type || undefined,
      plan_duration: user.plan_duration || undefined,
      platform: Platform.OS,
      last_login: new Date().toISOString(),
      user_type: 'registered_user',
    };
    Object.keys(profileProps).forEach(k => {
      if (
        profileProps[k] === undefined ||
        profileProps[k] === null ||
        profileProps[k] === ''
      ) {
        delete profileProps[k];
      }
    });
    if (Object.keys(profileProps).length > 0) {
      const people = mixpanelInstance.getPeople();
      await people.set(profileProps);
    }

    const userSuper = {
      user_id: user.userId,
      user_email: user.email || undefined,
      user_first_name: user.firstName || undefined,
      user_last_name: user.lastName || undefined,
      username: user.username || undefined,
      phone: user.phone || undefined,
      subscription_status: user.subscription_status || undefined,
      plan_type: user.plan_type || undefined,
      plan_duration: user.plan_duration || undefined,
    };
    Object.keys(userSuper).forEach(k => {
      if (
        userSuper[k] === undefined ||
        userSuper[k] === null ||
        userSuper[k] === ''
      ) {
        delete userSuper[k];
      }
    });
    if (Object.keys(userSuper).length > 0) {
      await mixpanelInstance.registerSuperProperties(userSuper);
    }

    return true;
  } catch (_) {
    return false;
  }
};

export const incrementUserProperties = async increments => {
  try {
    if (!mixpanelInstance || !isInitialized || !increments) {
      return false;
    }
    const people = mixpanelInstance.getPeople();
    await people.increment(increments);
    return true;
  } catch (_) {
    return false;
  }
};

export const trackRevenue = async (amount, properties = {}) => {
  try {
    if (!mixpanelInstance || !isInitialized || typeof amount !== 'number') {
      return false;
    }
    const people = mixpanelInstance.getPeople();
    await people.trackCharge(amount, properties);
    return true;
  } catch (_) {
    return false;
  }
};

export const registerSuperProperties = async props => {
  try {
    if (!mixpanelInstance || !isInitialized || !props) {
      return false;
    }
    await mixpanelInstance.registerSuperProperties(props);
    return true;
  } catch (_) {
    return false;
  }
};

export const clearSuperProperties = async () => {
  try {
    if (!mixpanelInstance || !isInitialized) {
      return false;
    }
    await mixpanelInstance.clearSuperProperties();
    return true;
  } catch (_) {
    return false;
  }
};

export const reset = async () => {
  try {
    if (!mixpanelInstance || !isInitialized) {
      return false;
    }
    await mixpanelInstance.reset();
    return true;
  } catch (_) {
    return false;
  }
};

export const flush = async () => {
  try {
    if (!mixpanelInstance || !isInitialized) {
      return false;
    }
    await mixpanelInstance.flush();
    return true;
  } catch (_) {
    return false;
  }
};

export const setOptOut = async (optOut = true) => {
  try {
    if (!mixpanelInstance || !isInitialized) {
      return false;
    }
    await mixpanelInstance.optOutTracking(optOut);
    return true;
  } catch (_) {
    return false;
  }
};

export const getOptOutStatus = async () => {
  try {
    if (!mixpanelInstance || !isInitialized) {
      return null;
    }
    return await mixpanelInstance.hasOptedOutTracking();
  } catch (_) {
    return null;
  }
};

export const getDistinctId = async () => {
  try {
    if (!mixpanelInstance || !isInitialized) {
      return null;
    }
    return await mixpanelInstance.getDistinctId();
  } catch (_) {
    return null;
  }
};

export const trackEvent = async (eventName, properties = {}) => {
  try {
    if (!mixpanelInstance || !isInitialized || !eventName) {
      return false;
    }
    if (!hasIdentifiedUser) {
      try {
        await ensureMixpanelUserIdentified();
      } catch (_) {}
    }
    const user = getCurrentUser();
    const userProps = {};
    if (user?.userId) {
      userProps.user_id = user.userId;
    }
    if (user?.email) {
      userProps.user_email = user.email;
    }
    if (user?.username) {
      userProps.username = user.username;
    }
    if (user?.phone) {
      userProps.phone = user.phone;
    }
    if (user?.subscription_status) {
      userProps.subscription_status = user.subscription_status;
    }
    if (user?.plan_type) {
      userProps.plan_type = user.plan_type;
    }
    if (user?.plan_duration) {
      userProps.plan_duration = user.plan_duration;
    }
    const payload = {
      ...properties,
      ...userProps,
      timestamp: Date.now(),
      platform: Platform.OS,
      event_source: 'mobile_app',
    };
    await mixpanelInstance.track(eventName, payload);
    return true;
  } catch (_) {
    return false;
  }
};

export default {
  initializeMixpanel,
  trackEvent,
  identify,
  setUserProperties,
  ensureMixpanelUserIdentified,
  incrementUserProperties,
  trackRevenue,
  registerSuperProperties,
  clearSuperProperties,
  reset,
  flush,
  setOptOut,
  getOptOutStatus,
  getDistinctId,
};
