import './utils/backHandlerPolyfill';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import React, {useEffect, useMemo, useState, useCallback} from 'react';
import {StatusBar, Platform} from 'react-native';
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

  const updateTheme = () => {
    setTheme({mode: 'dark'});
  };

  const fetchStoredTheme = async () => {
    try {
      const timer = setTimeout(() => {
        SplashScreen.hide();
      }, 100);
      StatusBar.setBarStyle('light-content');
      return () => clearTimeout(timer);
    } catch (error) {
      console.error('Error hiding splash screen:', error);
    }
  };

  const fetchCreditSettingsData = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const data = await fetchCreditSettings();
      dispatch(setCreditsPerSong(data.creditsPerSong));
    } catch (error) {
      dispatch(setError(error.message));
      console.error('Error fetching credit settings:', error);
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // Initialize Firebase Analytics and Google Tag Manager in a completely non-blocking way
  const initializeTracking = useCallback(() => {
    // Use setTimeout to make sure this runs after app has rendered and not block the UI
    setTimeout(async () => {
      try {
        console.log(
          'Starting Firebase Analytics and Tag Manager initialization...',
        );

        // Initialize analytics with a 5 second timeout
        const analyticsInitialized = await Promise.race([
          analyticsUtils.initializeAnalytics(),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error('Analytics initialization timed out')),
              5000,
            ),
          ),
        ]).catch(error => {
          console.log('Analytics initialization failed:', error.message);
          return false;
        });

        if (analyticsInitialized) {
          console.log('Firebase Analytics initialized successfully');

          // Initialize Tag Manager after Analytics
          try {
            await tagManagerUtils.initializeTagManager();
            console.log('Google Tag Manager initialized successfully');

            // Track app start event via Tag Manager
            await tagManagerUtils.pushEvent('app_started', {
              timestamp: new Date().toISOString(),
            });
            console.log('✅ App start event logged via Tag Manager');
          } catch (tagManagerError) {
            console.log(
              'Tag Manager initialization failed:',
              tagManagerError.message,
            );

            // Fallback to regular analytics if tag manager fails
            await analyticsUtils.trackCustomEvent('app_started', {
              timestamp: new Date().toISOString(),
            });
            console.log('✅ App start event logged via Analytics fallback');
          }
        } else {
          console.log('Analytics will use mock implementation');
        }
      } catch (error) {
        // Completely suppress errors to never block app functionality
        console.log(
          'Analytics setup failed but app will continue:',
          error.message,
        );
      }
    }, 2000); // Delay initialization to prioritize UI rendering
  }, []);

  const appThemeProviderValue = useMemo(() => ({theme, updateTheme}), [theme]);

  useEffect(() => {
    fetchStoredTheme();
    fetchCreditSettingsData();

    // Start analytics initialization as a background task
    initializeTracking();

    return () => {
      // No cleanup needed
    };
  }, [fetchCreditSettingsData, initializeTracking]);

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

export default App;
