import {getApp} from '@react-native-firebase/app';
import {
  getMessaging,
  requestPermission,
  getToken,
  onMessage,
  setBackgroundMessageHandler,
  onNotificationOpenedApp,
  getInitialNotification,
  onTokenRefresh,
  hasPermission,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import {Platform, Alert} from 'react-native';
import moEngageService from '../services/moengageService';

/**
 * Comprehensive Push Notification Handler
 * This is MISSING from the current implementation and is CRITICAL for push notifications to work
 */

let isInitialized = false;
let backgroundHandler = null;

/**
 * Initialize push notification handlers
 * This MUST be called during app startup
 */
export const initializePushNotificationHandlers = async () => {
  if (isInitialized) {
    console.log('🔔 Push notification handlers already initialized');
    return true;
  }

  try {
    console.log('🔔 Initializing push notification handlers...');

    // Get Firebase messaging instance using modular API
    const app = getApp();
    const messagingInstance = getMessaging(app);
    if (!messagingInstance) {
      console.error('❌ Firebase messaging not available');
      return false;
    }

    // Request permission for notifications
    const authStatus = await requestPermission(messagingInstance, {
      alert: true,
      announcement: false,
      badge: true,
      carPlay: true,
      provisional: false,
      sound: true,
    });

    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.warn('⚠️ Push notification permission denied');
      return false;
    }

    // Get FCM token
    const fcmToken = await getToken(messagingInstance);
    console.log('📬 FCM Token:', fcmToken);

    // CRITICAL: Forward FCM token to MoEngage
    if (fcmToken && moEngageService.isAvailable()) {
      try {
        // MoEngage needs the FCM token to send push notifications
        console.log('🔄 Forwarding FCM token to MoEngage...');

        const tokenResult = await moEngageService.registerPushToken(fcmToken);
        if (tokenResult) {
          console.log('✅ FCM token successfully registered with MoEngage');
        } else {
          console.warn('⚠️ FCM token registration with MoEngage failed');
        }
      } catch (error) {
        console.error('❌ Failed to set FCM token in MoEngage:', error);
      }
    }

    // Set up foreground message handler
    const unsubscribeForeground = onMessage(
      messagingInstance,
      async remoteMessage => {
        console.log('📱 Foreground message received:', remoteMessage);

        // Handle MoEngage messages
        if (
          remoteMessage.data?.source === 'moengage' ||
          remoteMessage.from?.includes('moengage')
        ) {
          console.log('📧 MoEngage foreground message');
          // MoEngage should handle this automatically, but we can add custom logic here
        }

        // Show notification in foreground for non-MoEngage messages
        if (Platform.OS === 'ios') {
          Alert.alert(
            remoteMessage.notification?.title || 'Notification',
            remoteMessage.notification?.body || 'You have a new message',
          );
        }
      },
    );

    // Set up background message handler
    backgroundHandler = setBackgroundMessageHandler(
      messagingInstance,
      async remoteMessage => {
        console.log('📱 Background message received:', remoteMessage);

        // Handle background processing here
        // This is important for analytics and data syncing

        if (remoteMessage.data?.source === 'moengage') {
          console.log('📧 MoEngage background message');
          // Track background message received
          try {
            // Note: Background handlers have limited execution time
            console.log('Background message from MoEngage processed');
          } catch (error) {
            console.error(
              'Error processing background MoEngage message:',
              error,
            );
          }
        }
      },
    );

    // Handle notification opened app (when app was in background/quit)
    onNotificationOpenedApp(messagingInstance, remoteMessage => {
      console.log('📱 Notification opened app from background:', remoteMessage);
      handleNotificationOpened(remoteMessage);
    });

    // Check if app was opened from a notification (when app was quit)
    const initialNotification = await getInitialNotification(messagingInstance);
    if (initialNotification) {
      console.log(
        '📱 App opened from notification (quit state):',
        initialNotification,
      );
      handleNotificationOpened(initialNotification);
    }

    // Handle token refresh
    const unsubscribeTokenRefresh = onTokenRefresh(
      messagingInstance,
      async fcmToken => {
        console.log('📬 FCM Token refreshed:', fcmToken);

        // Forward new token to MoEngage
        if (moEngageService.isAvailable()) {
          console.log('🔄 Forwarding refreshed FCM token to MoEngage...');
          const tokenResult = await moEngageService.registerPushToken(fcmToken);
          if (tokenResult) {
            console.log('✅ Refreshed FCM token registered with MoEngage');
          } else {
            console.warn('⚠️ Refreshed FCM token registration failed');
          }
        }
      },
    );

    isInitialized = true;
    console.log('✅ Push notification handlers initialized successfully');

    return {
      unsubscribeForeground,
      unsubscribeTokenRefresh,
      fcmToken,
      authStatus,
    };
  } catch (error) {
    console.error('❌ Failed to initialize push notification handlers:', error);
    return false;
  }
};

/**
 * Handle notification opened (when user taps on notification)
 */
const handleNotificationOpened = remoteMessage => {
  try {
    console.log('🎯 Handling notification opened:', remoteMessage);

    // Extract navigation data
    const data = remoteMessage.data || {};

    // Handle MoEngage notification opened
    if (
      data.source === 'moengage' ||
      remoteMessage.from?.includes('moengage')
    ) {
      console.log('📧 MoEngage notification opened');

      // Track notification opened event
      try {
        moEngageService.trackEvent('Push_Notification_Opened', {
          notification_id: data.notification_id || 'unknown',
          campaign_id: data.campaign_id || 'unknown',
          source: 'moengage',
          opened_at: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Failed to track notification opened:', error);
      }
    }

    // Handle deep linking or navigation
    if (data.route || data.screen) {
      console.log('🔗 Navigation data found in notification:', {
        route: data.route,
        screen: data.screen,
      });

      // TODO: Add navigation logic here based on your navigation setup
      // Example: navigationRef.navigate(data.screen, data.params);
    }
  } catch (error) {
    console.error('❌ Error handling notification opened:', error);
  }
};

/**
 * Get current FCM token
 */
export const getCurrentFCMToken = async () => {
  try {
    const app = getApp();
    const messagingInstance = getMessaging(app);
    const fcmToken = await getToken(messagingInstance);
    console.log('📬 Current FCM Token:', fcmToken);
    return fcmToken;
  } catch (error) {
    console.error('❌ Failed to get FCM token:', error);
    return null;
  }
};

/**
 * Check notification permission status
 */
export const checkNotificationPermission = async () => {
  try {
    const app = getApp();
    const messagingInstance = getMessaging(app);
    const authStatus = await hasPermission(messagingInstance);
    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;

    console.log('🔔 Notification permission status:', {
      authStatus,
      enabled,
    });

    return {
      authStatus,
      enabled,
    };
  } catch (error) {
    console.error('❌ Failed to check notification permission:', error);
    return {
      authStatus: null,
      enabled: false,
    };
  }
};

/**
 * Test push notification functionality
 */
export const testPushNotification = async () => {
  try {
    console.log('🧪 Testing push notification functionality...');

    // Check permission
    const permission = await checkNotificationPermission();
    console.log('📋 Permission check:', permission);

    // Get FCM token
    const fcmToken = await getCurrentFCMToken();
    console.log(
      '📋 FCM Token check:',
      fcmToken ? 'Available' : 'Not available',
    );

    // Check MoEngage availability
    const moEngageAvailable = moEngageService.isAvailable();
    console.log('📋 MoEngage availability:', moEngageAvailable);

    // Test event tracking
    if (moEngageAvailable) {
      const testResult = moEngageService.trackEvent('Push_Test_Event', {
        test: true,
        timestamp: new Date().toISOString(),
        fcm_token_available: !!fcmToken,
        permission_granted: permission.enabled,
      });
      console.log('📋 MoEngage test event:', testResult ? 'Success' : 'Failed');
    }

    const results = {
      permission: permission,
      fcmToken: fcmToken,
      moEngageAvailable: moEngageAvailable,
      handlersInitialized: isInitialized,
    };

    console.log('📋 Push notification test results:', results);
    return results;
  } catch (error) {
    console.error('❌ Push notification test failed:', error);
    return {
      error: error.message,
      permission: false,
      fcmToken: null,
      moEngageAvailable: false,
      handlersInitialized: false,
    };
  }
};

/**
 * Debug push notification setup
 */
export const debugPushNotificationSetup = () => {
  console.log('🔍 Debug: Push Notification Setup');
  console.log('📱 Platform:', Platform.OS);
  console.log('🔔 Handlers initialized:', isInitialized);
  console.log('📧 MoEngage available:', moEngageService.isAvailable());

  try {
    const app = getApp();
    const messagingInstance = getMessaging(app);
    console.log('🔥 Firebase messaging available:', !!messagingInstance);
  } catch (error) {
    console.log('🔥 Firebase messaging available:', false);
    console.error('Firebase messaging error:', error);
  }

  // Test MoEngage service state
  if (moEngageService.getServiceState) {
    const serviceState = moEngageService.getServiceState();
    console.log('📧 MoEngage service state:', serviceState);
  }
};

export default {
  initializePushNotificationHandlers,
  getCurrentFCMToken,
  checkNotificationPermission,
  testPushNotification,
  debugPushNotificationSetup,
  handleNotificationOpened,
};
