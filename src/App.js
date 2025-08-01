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
import MoEngageService from './services/moengageService';

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

      // Initialize MoEngage using service
      try {
        await MoEngageService.initialize();
        console.log('✅ MoEngage initialized for production');
      } catch (moeError) {
        console.warn('MoEngage initialization failed:', moeError.message);
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

  useEffect(() => {
    // Track app opened event using MoEngage service
    try {
      // This will be called after initialization, so service should be ready
      setTimeout(() => {
        MoEngageService.trackAppOpened('HomeScreen');
      }, 2000); // Small delay to ensure initialization is complete
    } catch (moeError) {
      console.warn('MoEngage event tracking failed:', moeError.message);
    }
  }, []);

  const appThemeProviderValue = useMemo(() => ({theme, updateTheme}), [theme]);

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
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <PersistGate loading={null} persistor={persistor}>
          <AppContent />
        </PersistGate>
      </QueryClientProvider>
    </Provider>
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
