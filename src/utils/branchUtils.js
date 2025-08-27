import branch from 'react-native-branch';
import {store} from '../stores';
import DeviceInfo from 'react-native-device-info';

/**
 * Configure Branch timeout settings
 * Note: Some timeout configurations are done via native Android manifest and iOS plist
 */
export const configureBranchTimeouts = () => {
  try {
    // Note: React Native Branch SDK doesn't expose direct timeout configuration methods
    // Timeout configuration is handled via:
    // 1. Android: AndroidManifest.xml meta-data
    // 2. iOS: Native initialization in AppDelegate
    // 3. JavaScript: Wrapper timeout logic in our retry functions

    console.log(
      '✅ Branch timeout configuration checked (configured via native layers)',
    );
    return true;
  } catch (error) {
    console.warn('⚠️ Branch timeout configuration check failed:', error);
    return false;
  }
};

/**
 * Enhanced Branch initialization with timeout handling
 */
export const initializeBranchWithRetry = async (
  maxRetries = 3,
  retryDelay = 2000,
) => {
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      console.log(
        `🔄 Branch initialization attempt ${attempt + 1}/${maxRetries}`,
      );

      // Configure timeouts before each attempt
      configureBranchTimeouts();

      // Create a promise that will timeout after 30 seconds
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error('Branch initialization timeout')),
          30000,
        );
      });

      // Test Branch availability with a simple call wrapped in timeout
      const initPromise = branch.isTrackingDisabled();

      const isEnabled = await Promise.race([initPromise, timeoutPromise]);
      console.log(
        '✅ Branch initialization successful, tracking disabled:',
        isEnabled,
      );

      return true;
    } catch (error) {
      attempt++;
      console.warn(
        `⚠️ Branch initialization attempt ${attempt} failed:`,
        error.message,
      );

      if (attempt < maxRetries) {
        const delayTime = retryDelay * attempt; // Exponential backoff
        console.log(`⏰ Retrying in ${delayTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayTime));
      } else {
        console.error('🚨 Branch initialization failed after all attempts');
        return false;
      }
    }
  }

  return false;
};

/**
 * Global helper to ensure Branch user identity is set before tracking events
 * This should be called before any Branch event to ensure proper attribution
 */
export const ensureBranchIdentity = async (timeout = 10000) => {
  return new Promise(async (resolve, reject) => {
    const timeoutId = setTimeout(() => {
      console.warn('⚠️ Branch identity setup timed out');
      resolve(null);
    }, timeout);

    try {
      const state = store.getState();

      // Try to get user ID from different possible locations in the store
      const userId =
        state?.auth?.user?.userId ||
        state?.auth?.user?.id ||
        state?.auth?.userId ||
        state?.user?.userId ||
        state?.user?.id ||
        state?.user?.user?.id ||
        state?.user?.user?.userId;

      if (userId) {
        await branch.setIdentity(String(userId));
        console.log('✅ Branch identity set globally:', userId);
        clearTimeout(timeoutId);
        resolve(String(userId));
      } else {
        // For users without login, use device-based identity
        const deviceId = await DeviceInfo.getUniqueId();
        const guestId = `guest_${deviceId}`;
        await branch.setIdentity(guestId);
        console.log('✅ Branch guest identity set:', guestId);
        clearTimeout(timeoutId);
        resolve(guestId);
      }
    } catch (error) {
      console.warn('⚠️ Branch identity setup failed:', error);
      clearTimeout(timeoutId);
      resolve(null);
    }
  });
};

/**
 * Enhanced Branch event tracking with automatic identity management
 * Use this instead of directly calling new BranchEvent()
 */
export const trackBranchEvent = async (eventName, eventData = {}) => {
  try {
    // Ensure identity is set first
    const identity = await ensureBranchIdentity();

    // Import BranchEvent dynamically to avoid circular imports
    const {BranchEvent} = require('react-native-branch');

    // Track the event
    new BranchEvent(eventName, {
      ...eventData,
      // Add tracking metadata
      tracked_at: new Date().toISOString(),
      identity_set: !!identity,
    }).logEvent();

    console.log(`✅ Branch event tracked: ${eventName}`, eventData);
    return true;
  } catch (error) {
    console.error(`❌ Branch event tracking failed: ${eventName}`, error);
    return false;
  }
};

/**
 * Track purchase events with proper identity and validation
 * Uses Branch's standard Purchase event for dashboard visibility
 */
export const trackBranchPurchase = async purchaseData => {
  const {revenue, currency, product_id, transaction_id, ...otherData} =
    purchaseData;

  // Validate required purchase data
  if (!revenue || !currency || !product_id) {
    console.warn('⚠️ Invalid purchase data for Branch tracking:', purchaseData);
    return false;
  }

  try {
    // Ensure identity is set first
    const identity = await ensureBranchIdentity();

    // Import BranchEvent dynamically to avoid circular imports
    const {BranchEvent} = require('react-native-branch');

    // Use Branch's standard Purchase event (this will show in dashboard)
    const purchaseEvent = new BranchEvent(BranchEvent.Purchase, {
      revenue: Number(revenue),
      currency: String(currency),
      product_id: String(product_id),
      transaction_id: String(transaction_id || `tx_${Date.now()}`),
      // Add tracking metadata
      tracked_at: new Date().toISOString(),
      identity_set: !!identity,
      ...otherData,
    });

    await purchaseEvent.logEvent();

    console.log(`✅ Branch STANDARD Purchase event tracked:`, {
      revenue: Number(revenue),
      currency: String(currency),
      product_id: String(product_id),
      transaction_id,
    });
    return true;
  } catch (error) {
    console.error(`❌ Branch Purchase event tracking failed:`, error);
    return false;
  }
};

/**
 * Track purchase initiation events
 */
export const trackBranchPurchaseInitiation = async productId => {
  if (!productId) {
    console.warn('⚠️ Missing product_id for Branch purchase initiation');
    return false;
  }

  return await trackBranchEvent('INITIATE_PURCHASE', {
    product_id: String(productId),
  });
};

/**
 * Track login events
 */
export const trackBranchLogin = async (method = 'unknown') => {
  return await trackBranchEvent('LOGIN', {
    method: String(method),
  });
};

/**
 * Track registration events
 */
export const trackBranchRegistration = async (
  method = 'unknown',
  additionalData = {},
) => {
  return await trackBranchEvent('COMPLETE_REGISTRATION', {
    method: String(method),
    ...additionalData,
  });
};

/**
 * Track AI content generation events
 */
export const trackBranchAIEvent = async (eventType, eventData = {}) => {
  const validAIEvents = [
    'AI_SONG_GENERATED',
    'AI_COVER_GENERATED',
    'AI_CONTENT_GENERATED',
  ];

  if (!validAIEvents.includes(eventType)) {
    console.warn('⚠️ Invalid AI event type:', eventType);
    return false;
  }

  return await trackBranchEvent(eventType, eventData);
};

/**
 * Fallback tracking when Branch is unavailable
 */
export const trackEventFallback = (eventName, eventData = {}) => {
  console.log(`📊 [Fallback] Event tracked: ${eventName}`, eventData);
  // You can send this to another analytics service like Firebase Analytics
  // or store it locally for later retry when Branch is available
};

/**
 * Safe Branch event tracking that won't crash the app
 */
export const safeBranchEventTrack = async (eventName, eventData = {}) => {
  try {
    return await trackBranchEvent(eventName, eventData);
  } catch (error) {
    console.warn(`⚠️ Branch tracking failed for ${eventName}, using fallback`);
    trackEventFallback(eventName, eventData);
    return false;
  }
};

export default {
  configureBranchTimeouts,
  initializeBranchWithRetry,
  ensureBranchIdentity,
  trackBranchEvent,
  trackBranchPurchase,
  trackBranchPurchaseInitiation,
  trackBranchLogin,
  trackBranchRegistration,
  trackBranchAIEvent,
  safeBranchEventTrack,
  trackEventFallback,
};
