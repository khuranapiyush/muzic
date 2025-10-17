import './utils/backHandlerPolyfill';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import React, {useEffect, useMemo, useState, useCallback} from 'react';
import {
  StatusBar,
  Platform,
  View,
  Text,
  StyleSheet,
  AppState,
} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import SplashScreen from 'react-native-splash-screen';
import {Provider, useDispatch} from 'react-redux';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {ThemeContext} from './context/ThemeContext';
import AppNavigator from './navigator/AppNavigator';
import {persistor, store} from './stores';
import {PersistGate} from 'redux-persist/integration/react';
import GlobalPlayer from './components/common/GlobalPlayer';
import {fetchCreditSettings} from './services/creditSettingsService';
import {
  setCreditsPerSong,
  setLoading,
  setError,
} from './stores/slices/creditSettings';
import analyticsUtils from './utils/analytics';
import tagManagerUtils from './utils/tagManager';
import facebookEvents from './utils/facebookEvents';
import {initializeFirebase} from './utils/firebase';
import {getApp} from '@react-native-firebase/app';
import {
  getMessaging,
  requestPermission,
  getToken,
} from '@react-native-firebase/messaging';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import moEngageService from './services/moengageService';
import useMoEngageUser from './hooks/useMoEngageUser';
import branch from 'react-native-branch';
import {
  configureBranchTimeouts,
  initializeBranchWithRetry,
  checkBranchStatus,
} from './utils/branchUtils';

import ErrorBoundary from './components/common/ErrorBoundary';
import {initializePushNotificationHandlers} from './utils/pushNotificationHandler';
import mixpanelAnalytics from './utils/mixpanelAnalytics';
import {requestTrackingPermission} from 'react-native-tracking-transparency';

// Default credit settings in case API fails
const DEFAULT_CREDIT_SETTINGS = {
  creditsPerSong: 5,
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
    mutations: {
      retry: 1,
    },
  },
});

if (!store) {
  console.error('Redux store is not properly initialized');
}

const AppContent = () => {
  const dispatch = useDispatch();
  // Mount global MoEngage user tracking
  const {isUserIdentified, currentUserId} = useMoEngageUser();
  const [theme, setTheme] = useState({
    mode: 'dark',
  });
  const [isInitialized, setIsInitialized] = useState(false); // reserved for future use
  const [initError, setInitError] = useState(null);
  const [splashHidden, setSplashHidden] = useState(false);

  // Better splash screen handling function
  const hideSplash = useCallback(() => {
    if (!splashHidden) {
      try {
        // Check if SplashScreen has the hide method before calling it
        if (SplashScreen && typeof SplashScreen.hide === 'function') {
          SplashScreen.hide();
        }
        setSplashHidden(true);
      } catch (error) {
        setSplashHidden(true); // Mark as hidden anyway to prevent retries
      }
    }
  }, [splashHidden]);

  // Force hide splash screen after a timeout as a fallback
  useEffect(() => {
    // Ensure splash screen is hidden after a timeout regardless of other operations
    const splashTimer = setTimeout(() => {
      hideSplash();
    }, 3000);

    return () => clearTimeout(splashTimer);
  }, [hideSplash]);

  const updateTheme = () => {
    setTheme({mode: 'dark'});
  };

  // Initialize app services - should only be called once at app startup
  const initializeApp = useCallback(async () => {
    try {
      // iOS: Request ATT permission early to enable IDFA for SAN claims
      if (Platform.OS === 'ios') {
        try {
          const status = await requestTrackingPermission();
          if (__DEV__) {
            console.log('[ATT] Authorization status:', status);
          }
        } catch (e) {
          if (__DEV__) {
            console.log('[ATT] Request error:', e?.message || e);
          }
        }
      }
      // Initialize Firebase
      await initializeFirebase();
      // Runtime notification permission and token (platform-aware)
      try {
        if (Platform.OS === 'android') {
          // Always attempt to request POST_NOTIFICATIONS when available, regardless of SDK version
          try {
            if (PERMISSIONS?.ANDROID?.POST_NOTIFICATIONS) {
              const status = await check(
                PERMISSIONS.ANDROID.POST_NOTIFICATIONS,
              );
              if (status !== RESULTS.GRANTED) {
                await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
              }
            }
          } catch (permErr) {
            console.warn(
              '[App] POST_NOTIFICATIONS check/request error:',
              permErr?.message || permErr,
            );
          }
        } else {
          // iOS permission via Messaging API
          const app = getApp();
          const messagingInstance = getMessaging(app);
          await requestPermission(messagingInstance);
          // On iOS, record permission state into MoEngage as pushEnabled attribute
          try {
            const pushEnabled = true; // requesting permission on iOS implies user accepted in most flows
            if (moEngageService && moEngageService.setUserAttributes) {
              moEngageService.setUserAttributes({pushEnabled});
            }
          } catch (e) {
            // best effort only
          }
        }
        const app = getApp();
        const messagingInstance = getMessaging(app);
        const fcmToken = await getToken(messagingInstance);
        console.log('[App] FCM token:', fcmToken);
      } catch (e) {
        console.warn(
          '[App] Unable to request notification permission or fetch token:',
          e?.message || e,
        );
      }

      // Initialize Facebook SDK
      try {
        facebookEvents.initializeFacebookSDK();
        // facebookEvents.logAppOpen();
      } catch (fbError) {
        // Silent error handling
      }

      // Initialize Analytics
      try {
        await analyticsUtils.initializeAnalytics();
      } catch (analyticsError) {
        // Silent error handling
      }

      // Initialize Mixpanel (ATT-aware on iOS)
      try {
        const result = await mixpanelAnalytics.initializeMixpanel();
        if (__DEV__) {
          console.log('Mixpanel init result:', result);
        }
        // Try to identify user and set profile if already logged in
        try {
          await mixpanelAnalytics.ensureMixpanelUserIdentified();
        } catch (_) {}
      } catch (mpError) {
        // Silent error handling for Mixpanel
      }

      // Initialize Tag Manager
      try {
        await tagManagerUtils.initializeTagManager();
      } catch (tagError) {
        // Silent error handling
      }

      // Fetch app settings
      try {
        dispatch(setLoading(true));
        const data = await fetchCreditSettings();
        dispatch(setCreditsPerSong(data.creditsPerSong));
      } catch (settingsError) {
        dispatch(setError(settingsError.message));

        // Use default settings when API fails
        dispatch(setCreditsPerSong(DEFAULT_CREDIT_SETTINGS.creditsPerSong));
      } finally {
        dispatch(setLoading(false));
      }

      // Initialize MoEngage using modernized service with retry logic
      try {
        console.log('🚀 Starting MoEngage initialization...');

        // Reset any previous failed attempts
        moEngageService.resetInitializationState();

        // Try to initialize with retry logic
        const moengageInitialized = await moEngageService.initializeWithRetry(
          3,
          1500,
        );
        if (moengageInitialized) {
          console.log('✅ MoEngage initialized successfully for Muzic app');

          // Track app open event after a short delay
          setTimeout(() => {
            moEngageService.trackAppOpen();

            // Test MoEngage event (only in debug builds)
            if (__DEV__) {
              moEngageService.trackEvent('App_Initialized_Debug', {
                source: 'debug_test',
                timestamp: Date.now(),
              });
              console.log('✅ MoEngage test event sent');
            }
          }, 500);
        } else {
          console.warn(
            '⚠️ MoEngage initialization failed after retries, continuing without MoEngage',
          );
        }
      } catch (moeError) {
        console.warn('❌ MoEngage initialization failed:', moeError.message);
      }

      // Initialize Push Notification Handlers (CRITICAL FOR PUSH NOTIFICATIONS)
      try {
        console.log('🔔 Initializing push notification handlers...');
        const pushResult = await initializePushNotificationHandlers();
        if (pushResult) {
          console.log('✅ Push notification handlers initialized successfully');
        } else {
          console.warn('⚠️ Push notification handlers initialization failed');
        }
      } catch (pushError) {
        console.warn(
          '❌ Push notification initialization failed:',
          pushError.message,
        );
      }

      // Hide splash screen after all initialization is complete
      hideSplash();

      // Update status bar appearance
      StatusBar.setBarStyle('light-content');

      // Track app initialization success
      analyticsUtils.trackCustomEvent('app_initialized', {
        timestamp: new Date().toISOString(),
        platform: Platform.OS,
      });

      // Sanity events to verify Firebase and Facebook capture pipelines
      try {
        analyticsUtils.trackScreenView('AppRoot', 'AppRoot');
      } catch (_) {}
      try {
        facebookEvents.logCustomEvent('app_initialized_fb', {ts: Date.now()});
      } catch (_) {}

      // Mark app as initialized
      setIsInitialized(true);
    } catch (error) {
      setInitError(error.message || 'Failed to initialize app');

      // Hide splash screen even if there's an error
      hideSplash();

      // Mark as initialized anyway to show error UI
      setIsInitialized(true);
    }
  }, [dispatch, hideSplash]);

  // Handle app state changes
  const handleAppStateChange = useCallback(nextAppState => {
    if (nextAppState === 'active') {
      // App came to foreground, log event
      analyticsUtils.trackCustomEvent('app_foregrounded', {
        timestamp: new Date().toISOString(),
      });
    } else if (nextAppState === 'background') {
      // App went to background, log event
      analyticsUtils.trackCustomEvent('app_backgrounded', {
        timestamp: new Date().toISOString(),
      });
    }
  }, []);

  useEffect(() => {
    // Initialize app on startup
    initializeApp();

    // Set up app state change listener
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      // Clean up app state listener
      subscription.remove();
    };
  }, [initializeApp, handleAppStateChange]);

  // Optional: log identification state changes for debugging
  useEffect(() => {
    if (isUserIdentified && currentUserId) {
      console.log('[MoEngage] User identified globally:', currentUserId);
    }
  }, [isUserIdentified, currentUserId]);

  useEffect(() => {
    // Initialize Branch with timeout configuration - but don't block app startup
    const initBranch = async () => {
      try {
        // Add a short delay to ensure native modules are ready
        await new Promise(resolve => setTimeout(resolve, 1000));

        configureBranchTimeouts();
        const branchInitialized = await initializeBranchWithRetry(2, 3000); // Reduce retries for faster startup
        if (branchInitialized) {
          console.log('✅ Branch initialization completed successfully');

          // Check Branch status and environment
          await checkBranchStatus();

          // Test Branch event tracking (only in debug builds)
          if (__DEV__) {
            try {
              console.log('🧪 Testing Branch event tracking...');
              const {trackBranchEvent, trackBranchPurchase} = await import(
                './utils/branchUtils'
              );

              // Test basic event
              await trackBranchEvent('App_Initialized', {
                source: 'debug_test',
                timestamp: Date.now(),
              });
              console.log('✅ Branch test event sent');

              // Test purchase event
              await trackBranchPurchase({
                revenue: 5.99,
                currency: 'INR',
                product_id: 'test_app_init_purchase',
                transaction_id: `test_init_${Date.now()}`,
                source: 'debug_test',
              });
              console.log('✅ Branch test purchase sent');
            } catch (error) {
              console.warn('⚠️ Branch test events failed:', error);
            }
          }
        } else {
          console.warn(
            '⚠️ Branch initialization failed, continuing without Branch features',
          );
        }
      } catch (error) {
        console.error('🚨 Branch initialization error:', error);
        // Don't let Branch errors crash the app
      }
    };

    // Don't await Branch initialization - let it happen in background
    initBranch();

    // MoEngage tracking is now handled in the main initialization above
    // No need for duplicate tracking calls
  }, []);

  const appThemeProviderValue = useMemo(() => ({theme, updateTheme}), [theme]);

  // Branch deep link subscription with enhanced error handling
  useEffect(() => {
    let subscriptionActive = true;
    let unsubscribe = null;

    const setupBranchSubscription = async () => {
      // Wait a bit for Branch to be potentially initialized
      await new Promise(resolve => setTimeout(resolve, 3000));

      if (!subscriptionActive) {
        return;
      }

      try {
        console.log('🔗 Setting up Branch subscription...');

        unsubscribe = branch.subscribe({
          onOpenStart: ({uri, cachedInitialEvent}) => {
            console.log(
              '🌟 Branch opening:',
              uri,
              'cached?',
              cachedInitialEvent,
            );
          },
          onOpenComplete: ({error, params, uri}) => {
            if (error) {
              console.error('❌ Branch open error:', error);

              // Don't retry subscription on errors - just log them
              // The native initialization should handle retries
              return;
            }

            console.log('✅ Branch opened successfully');

            // Minimal safe handling for existing users: just open Home if logged in
            try {
              const {navigate} = require('./utils/NavigationService').default;
              const state = store.getState();
              const isLoggedIn =
                state?.user?.isLoggedIn || state?.auth?.isLoggedIn;

              if (isLoggedIn) {
                navigate('HomeStack');
                return; // short-circuit further deep link handling
              }

              // Not logged in → send to Auth
              navigate('AuthStack');
              return; // short-circuit further deep link handling
            } catch (safeRouteErr) {
              console.warn('⚠️ Safe deep link routing failed:', safeRouteErr);
              return; // fail-safe: do nothing else to avoid crashes
            }
          },
        });

        console.log('✅ Branch subscription established');
      } catch (subscriptionError) {
        console.error('🚨 Branch subscription failed:', subscriptionError);
        // Don't retry - the subscription might work on next app launch
      }
    };

    // Setup subscription with a delay
    setupBranchSubscription();

    return () => {
      subscriptionActive = false;
      if (unsubscribe && typeof unsubscribe === 'function') {
        try {
          unsubscribe();
          console.log('🔗 Branch subscription cleaned up');
        } catch (error) {
          console.warn('⚠️ Branch unsubscribe error:', error);
        }
      }
    };
  }, []);

  // If app initialization failed, show error screen
  if (initError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to start app</Text>
        <Text style={styles.errorDescription}>{initError}</Text>
      </View>
    );
  }

  // Show normal app UI
  return (
    <ThemeContext.Provider value={appThemeProviderValue}>
      <GestureHandlerRootView style={{flex: 1}}>
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <BottomSheetModalProvider>
            <AppNavigator />
            <GlobalPlayer />
          </BottomSheetModalProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ThemeContext.Provider>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <PersistGate loading={null} persistor={persistor}>
            <AppContent />
          </PersistGate>
        </QueryClientProvider>
      </Provider>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    padding: 20,
  },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FE954A',
    marginBottom: 10,
  },
  errorDescription: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
  },
});

export default App;
