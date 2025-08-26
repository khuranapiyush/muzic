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
import branch, {BranchEvent} from 'react-native-branch';

import ErrorBoundary from './components/common/ErrorBoundary';
import {initializePushNotificationHandlers} from './utils/pushNotificationHandler';

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
  const [isInitialized, setIsInitialized] = useState(false);
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
      // Initialize Firebase
      const firebaseReady = await initializeFirebase();
      // Runtime notification permission and token (platform-aware)
      try {
        if (Platform.OS === 'android') {
          // Only request POST_NOTIFICATIONS on Android 13+ (API 33)
          const sdk = Platform.Version;
          const canRequestPostNotifications =
            typeof sdk === 'number' &&
            sdk >= 33 &&
            PERMISSIONS?.ANDROID?.POST_NOTIFICATIONS;
          if (canRequestPostNotifications) {
            try {
              const status = await check(
                PERMISSIONS.ANDROID.POST_NOTIFICATIONS,
              );
              if (status !== RESULTS.GRANTED) {
                await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
              }
            } catch (permErr) {
              console.warn(
                '[App] POST_NOTIFICATIONS check/request error:',
                permErr?.message || permErr,
              );
            }
          } else {
            console.log('[App] Skipping POST_NOTIFICATIONS (SDK < 33)');
          }
        } else {
          // iOS permission via Messaging API
          const app = getApp();
          const messagingInstance = getMessaging(app);
          await requestPermission(messagingInstance);
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

      // Initialize MoEngage using modernized service
      try {
        const moengageInitialized = moEngageService.initialize();
        if (moengageInitialized) {
          console.log('✅ MoEngage initialized successfully for Muzic app');

          // Track app open event
          moEngageService.trackAppOpen();
        } else {
          console.warn('⚠️ MoEngage initialization returned false');
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
    // Track app opened event using MoEngage service
    try {
      // This will be called after initialization, so service should be ready
      setTimeout(() => {
        moEngageService.trackAppOpen();
      }, 2000); // Small delay to ensure initialization is complete
    } catch (moeError) {
      console.warn('MoEngage event tracking failed:', moeError.message);
    }
  }, []);

  const appThemeProviderValue = useMemo(() => ({theme, updateTheme}), [theme]);

  // Branch deep link subscription
  useEffect(() => {
    const unsubscribe = branch.subscribe({
      onOpenStart: ({uri, cachedInitialEvent}) => {
        console.log('Branch opening:', uri, 'cached?', cachedInitialEvent);
      },
      onOpenComplete: ({error, params, uri}) => {
        if (error) {
          console.error('Branch open error', error);
          return;
        }
        try {
          const productId = params?.product_id || params?.['product_id'];
          if (productId) {
            // TODO: wire navigation to product screen
            console.log('Branch product_id:', productId, 'from', uri);
          }

          // Track install / open attribution once per session
          const isFirstOpen = params?.['+is_first_session'];
          const clickedBranchLink = params?.['+clicked_branch_link'];
          if (isFirstOpen) {
            try {
              const attribution = {
                channel: params?.['~channel'],
                campaign: params?.['~campaign'],
                feature: params?.['~feature'],
                tags: params?.['~tags'],
                ad_set: params?.ad_set || params?.['$3p'],
                clicked_branch_link: clickedBranchLink,
              };
              new BranchEvent('INSTALL_ATTRIBUTED', attribution).logEvent();
              moEngageService.trackEvent('Install_Attribution', attribution);
            } catch (e) {}
          }
        } catch (e) {
          // no-op
        }
      },
    });
    return () => unsubscribe && unsubscribe();
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
