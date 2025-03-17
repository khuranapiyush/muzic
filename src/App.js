import './utils/backHandlerPolyfill';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import React, {useEffect, useMemo, useState} from 'react';
import {Appearance, StatusBar} from 'react-native';
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
  const [theme, setTheme] = useState({
    mode: Appearance.getColorScheme(),
  });

  const updateTheme = newTheme => {
    let theme;
    if (!newTheme) {
      theme = Appearance.getColorScheme();
      newTheme = {mode: 'dark'};
    }
    setTheme(newTheme);
  };

  const fetchStoredTheme = async () => {
    try {
      const timer = setTimeout(() => {
        SplashScreen.hide();
      }, 100);
      StatusBar.setBarStyle('dark-content');
      return () => clearTimeout(timer);
    } catch (error) {
      console.error('Error hiding splash screen:', error);
    }
  };

  const appThemeProviderValue = useMemo(() => ({theme, updateTheme}), [theme]);

  useEffect(() => {
    const appearanceListener = ({colorScheme}) => {
      let obj = {mode: colorScheme};
      updateTheme(obj);
    };
    Appearance.addChangeListener(appearanceListener);
  }, []);

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
