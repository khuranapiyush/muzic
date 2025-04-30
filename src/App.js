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

  const appThemeProviderValue = useMemo(() => ({theme, updateTheme}), [theme]);

  useEffect(() => {
    fetchStoredTheme();
    fetchCreditSettingsData();

    return () => {
      // No cleanup needed
    };
  }, [fetchCreditSettingsData]);

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
