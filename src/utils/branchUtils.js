import branch from 'react-native-branch';
import {store} from '../stores';
import DeviceInfo from 'react-native-device-info';

/**
 * Global helper to ensure Branch user identity is set before tracking events
 * This should be called before any Branch event to ensure proper attribution
 */
export const ensureBranchIdentity = async () => {
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
      return String(userId);
    } else {
      // For users without login, use device-based identity
      const deviceId = await DeviceInfo.getUniqueId();
      const guestId = `guest_${deviceId}`;
      await branch.setIdentity(guestId);
      console.log('✅ Branch guest identity set:', guestId);
      return guestId;
    }
  } catch (error) {
    console.warn('⚠️ Branch identity setup failed:', error);
    return null;
  }
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
 */
export const trackBranchPurchase = async purchaseData => {
  const {revenue, currency, product_id, ...otherData} = purchaseData;

  // Validate required purchase data
  if (!revenue || !currency || !product_id) {
    console.warn('⚠️ Invalid purchase data for Branch tracking:', purchaseData);
    return false;
  }

  return await trackBranchEvent('PURCHASE', {
    revenue: Number(revenue),
    currency: String(currency),
    product_id: String(product_id),
    ...otherData,
  });
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

export default {
  ensureBranchIdentity,
  trackBranchEvent,
  trackBranchPurchase,
  trackBranchPurchaseInitiation,
  trackBranchLogin,
  trackBranchRegistration,
  trackBranchAIEvent,
};

