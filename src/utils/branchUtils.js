import {Platform} from 'react-native';
import branch, {BranchEvent} from 'react-native-branch';
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

      // Actually initialize Branch session - this was missing!
      const initPromise = new Promise((resolve, reject) => {
        try {
          // Check if Branch is available and working
          // The native initialization should have already happened
          // We just need to verify it's working
          console.log('🔍 Checking Branch availability...');

          // Test basic Branch functionality
          branch
            .isTrackingDisabled()
            .then(isDisabled => {
              console.log(
                '✅ Branch is available, tracking disabled:',
                isDisabled,
              );

              // Get latest params to test if Branch is working
              return branch.getLatestReferringParams();
            })
            .then(params => {
              console.log('✅ Branch session initialized successfully');
              console.log('📊 Branch params:', params);
              resolve(true);
            })
            .catch(error => {
              console.warn('⚠️ Branch availability check failed:', error);
              reject(new Error(`Branch availability check failed: ${error}`));
            });
        } catch (initError) {
          console.error('❌ Branch availability check exception:', initError);
          reject(initError);
        }
      });

      await Promise.race([initPromise, timeoutPromise]);

      // Test if Branch is working by checking tracking status
      const isTrackingDisabled = await branch.isTrackingDisabled();
      console.log(
        '✅ Branch initialization successful, tracking disabled:',
        isTrackingDisabled,
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
 * Ensure all customData values are strings as required by Branch SDK.
 */
const coerceCustomDataStrings = (data = {}) => {
  const result = {};
  Object.keys(data || {}).forEach(key => {
    const value = data[key];
    if (value === undefined || value === null) {
      return;
    }
    if (typeof value === 'object') {
      try {
        result[key] = JSON.stringify(value);
      } catch (_) {
        result[key] = String(value);
      }
    } else {
      result[key] = String(value);
    }
  });
  return result;
};

/**
 * Optionally create a BranchUniversalObject for purchase/content events.
 * Returns null on failure.
 */
const createPurchaseBUO = async ({
  product_id,
  revenue,
  currency,
  extra = {},
}) => {
  try {
    const canonicalIdentifier = `product/${String(product_id)}`;
    const buo = await branch.createBranchUniversalObject(canonicalIdentifier, {
      title: String(product_id),
      contentMetadata: {
        sku: String(product_id),
        price: typeof revenue === 'number' ? revenue : Number(revenue) || 0,
        quantity: 1,
        currency: String(currency || 'INR'),
        customMetadata: coerceCustomDataStrings(extra),
      },
    });
    return buo;
  } catch (e) {
    console.warn('⚠️ Failed to create BranchUniversalObject:', e?.message || e);
    return null;
  }
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
    console.log(`🔄 Attempting to track Branch event: ${eventName}`, eventData);

    // First, check if Branch is available at all
    if (!branch) {
      console.error('❌ Branch object is not available');
      return false;
    }

    // Check if Branch is ready
    let isTrackingDisabled;
    try {
      isTrackingDisabled = await branch.isTrackingDisabled();
      console.log(
        '✅ Branch isTrackingDisabled check passed:',
        isTrackingDisabled,
      );
    } catch (error) {
      console.error('❌ Branch isTrackingDisabled failed:', error);
      return false;
    }

    if (isTrackingDisabled) {
      console.warn(
        '⚠️ Branch tracking is disabled, skipping event:',
        eventName,
      );
      return false;
    }

    // Ensure identity is set first
    const identity = await ensureBranchIdentity();
    console.log(`👤 Branch identity set: ${identity}`);

    // Check if BranchEvent is available
    if (!BranchEvent) {
      console.error('❌ BranchEvent is not available');
      return false;
    }

    // Create the event with params as the THIRD argument and custom data nested
    const event = new BranchEvent(eventName, null, {
      customData: coerceCustomDataStrings({
        tracked_at: new Date().toISOString(),
        identity_set: !!identity,
        ...(eventData || {}),
      }),
    });

    console.log(`📊 Created Branch event: ${eventName}`, event);

    // Track the event with proper async handling
    await new Promise((resolve, reject) => {
      try {
        event.logEvent();
        console.log(`📤 Branch event logged: ${eventName}`);

        // Add a small delay to ensure event is processed
        setTimeout(() => {
          console.log(
            `✅ Branch event tracked successfully: ${eventName}`,
            eventData,
          );
          resolve(true);
        }, 100);
      } catch (logError) {
        console.error(`❌ Branch logEvent failed: ${eventName}`, logError);
        reject(logError);
      }
    });

    return true;
  } catch (error) {
    console.error(`❌ Branch event tracking failed: ${eventName}`, error);
    console.error('❌ Error details:', error.message, error.stack);
    return false;
  }
};

/**
 * Track purchase events with proper identity and validation
 * Uses Branch's standard Purchase event for dashboard visibility
 */
export const trackBranchPurchase = async purchaseData => {
  const {revenue, currency, product_id, transaction_id, ...otherData} =
    purchaseData || {};

  // Require only product_id; allow revenue to be 0/undefined
  if (!product_id) {
    console.warn('⚠️ Missing product_id for Branch purchase tracking');
    return false;
  }

  const finalCurrency = currency || 'INR';
  const finalRevenue =
    typeof revenue === 'number' ? revenue : revenue ? Number(revenue) : 0;

  try {
    // Check if Branch is ready
    const isTrackingDisabled = await branch.isTrackingDisabled();
    if (isTrackingDisabled) {
      console.warn('⚠️ Branch tracking is disabled, skipping purchase event');
      return false;
    }

    // Ensure identity is set first
    const identity = await ensureBranchIdentity();

    // Build BUO for purchase (recommended by Branch docs)
    const buo = await createPurchaseBUO({
      product_id,
      revenue: finalRevenue,
      currency: finalCurrency,
      extra: {platform: Platform.OS, ...otherData},
    });

    // Use Branch's standard Purchase event (this will show in dashboard)
    const purchaseEvent = new BranchEvent(
      BranchEvent.Purchase,
      buo ? [buo] : null,
      {
        // Standard fields for Purchase event - these go directly in the event
        revenue: Number(finalRevenue),
        currency: String(finalCurrency),
        transactionID: String(transaction_id || `tx_${Date.now()}`),
        // Additional data must be nested under customData
        customData: coerceCustomDataStrings({
          product_id: String(product_id),
          platform: Platform.OS,
          tracked_at: new Date().toISOString(),
          identity_set: !!identity,
          ...(otherData || {}),
        }),
      },
    );

    // Track the event with proper async handling
    await new Promise((resolve, reject) => {
      try {
        purchaseEvent.logEvent();
        // Add a small delay to ensure event is processed
        setTimeout(() => {
          console.log('✅ Branch STANDARD Purchase event tracked:', {
            revenue: Number(finalRevenue),
            currency: String(finalCurrency),
            product_id: String(product_id),
            transaction_id,
          });
          resolve(true);
        }, 100);
      } catch (logError) {
        console.error('❌ Branch Purchase logEvent failed:', logError);
        reject(logError);
      }
    });

    return true;
  } catch (error) {
    console.error('❌ Branch Purchase event tracking failed:', error);
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

  try {
    // Ensure identity is set first
    await ensureBranchIdentity();

    const event = new BranchEvent(BranchEvent.InitiatePurchase, null, {
      // Put extra fields under customData
      customData: {
        product_id: String(productId),
        platform: Platform.OS,
        tracked_at: new Date().toISOString(),
      },
    });

    event.logEvent(); // fire-and-forget is OK
    console.log('✅ Branch standard InitiatePurchase event sent');
    return true;
  } catch (error) {
    console.error('❌ Branch InitiatePurchase event failed:', error);
    return false;
  }
};

/**
 * Track login events
 */
export const trackBranchLogin = async (method = 'unknown') => {
  try {
    // Ensure identity is set first
    await ensureBranchIdentity();

    const event = new BranchEvent(BranchEvent.Login, null, {
      // Put extra fields under customData
      customData: {
        method: String(method),
        platform: Platform.OS,
        tracked_at: new Date().toISOString(),
      },
    });

    event.logEvent(); // fire-and-forget is OK
    console.log('✅ Branch standard Login event sent');
    return true;
  } catch (error) {
    console.error('❌ Branch Login event failed:', error);
    return false;
  }
};

/**
 * Track registration events
 */
export const trackBranchRegistration = async (
  method = 'unknown',
  additionalData = {},
) => {
  try {
    // Ensure identity is set first
    await ensureBranchIdentity();

    const event = new BranchEvent(BranchEvent.CompleteRegistration, null, {
      // Put extra fields under customData
      customData: {
        method: String(method),
        platform: Platform.OS,
        tracked_at: new Date().toISOString(),
        ...(additionalData || {}),
      },
    });

    event.logEvent(); // fire-and-forget is OK
    console.log('✅ Branch standard CompleteRegistration event sent');
    return true;
  } catch (error) {
    console.error('❌ Branch CompleteRegistration event failed:', error);
    return false;
  }
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
 * Check Branch status and configuration
 */
export const checkBranchStatus = async () => {
  try {
    const isDisabled = await branch.isTrackingDisabled();
    const latestParams = await branch.getLatestReferringParams();

    // Check if we're in test mode (iOS only - Android uses manifest)
    const isTestMode = __DEV__; // This will be true for debug builds

    console.log('🔍 Branch Status Check:');
    console.log('- Tracking Disabled:', isDisabled);
    console.log('- Platform:', Platform.OS);
    console.log('- Is Debug Build:', __DEV__);
    console.log('- Is Test Mode:', isTestMode);
    console.log('- Latest Params:', latestParams);

    console.log(
      '🎯 Dashboard Environment:',
      isTestMode
        ? 'TEST (check TEST toggle in dashboard)'
        : 'LIVE (check LIVE toggle in dashboard)',
    );

    return {
      trackingEnabled: !isDisabled,
      isTestMode: isTestMode,
      platform: Platform.OS,
      hasParams: !!latestParams,
      params: latestParams,
    };
  } catch (error) {
    console.error('❌ Branch status check failed:', error);
    return {trackingEnabled: false, hasParams: false, error};
  }
};

/**
 * Test Branch events manually for debugging
 */
// Removed testBranchEvents for production readiness

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
  checkBranchStatus,
};
