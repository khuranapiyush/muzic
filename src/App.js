import './utils/backHandlerPolyfill';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import React, {useEffect, useMemo, useState} from 'react';
import {StatusBar} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import SplashScreen from 'react-native-splash-screen';
import {Provider} from 'react-redux';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {ThemeContext} from './context/ThemeContext';
import AppNavigator from './navigator/AppNavigator';
import {persistor, store} from './stores';
import {PersistGate} from 'redux-persist/integration/react';
import GlobalPlayer from './components/common/GlobalPlayer';

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

const App = () => {
  // Always use dark mode, no need to check device appearance
  const [theme, setTheme] = useState({
    mode: 'dark',
  });

  // Update function still needed for context API compatibility
  const updateTheme = () => {
    // No-op - we always stay in dark mode
    // This prevents any accidental theme changes
    setTheme({mode: 'dark'});
  };

  const fetchStoredTheme = async () => {
    try {
      const timer = setTimeout(() => {
        SplashScreen.hide();
      }, 100);
      // Always use light-content for dark mode
      StatusBar.setBarStyle('light-content');
      return () => clearTimeout(timer);
    } catch (error) {
      console.error('Error hiding splash screen:', error);
    }
  };

  const appThemeProviderValue = useMemo(() => ({theme, updateTheme}), [theme]);

  // No more appearance listener - we don't want to respond to system theme changes

  useEffect(() => {
    fetchStoredTheme();
  }, []);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <PersistGate loading={null} persistor={persistor}>
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
        </PersistGate>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
