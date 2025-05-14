import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import React, {useEffect, useState, useCallback, useMemo, useRef} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import AppProvider from '../context/AppContext';
import {ModalProvider} from '../context/ModalContext';
import Toaster from '../components/common/Toaster';
import {useAuthUser} from '../stores/selector';
import {ActivityIndicator, View} from 'react-native';
import {setTokenChecked} from '../stores/slices/app/index';
import analyticsUtils from '../utils/analytics';
import facebookEvents from '../utils/facebookEvents';

// Lazy load navigators
const AppStackNavigator = React.lazy(() => import('./AppStackNavigator'));
const AuthStackNavigator = React.lazy(() => import('./AuthStackNavigator'));

// Loading component
const LoadingComponent = () => (
  <View
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#000',
    }}>
    <ActivityIndicator size="large" color="#FE954A" />
  </View>
);

const AppNavigator = () => {
  const {isLoggedIn} = useSelector(useAuthUser);
  const {tokenChecked} = useSelector(state => state.app);
  const [showFallback, setShowFallback] = useState(false);
  const dispatch = useDispatch();
  const routeNameRef = useRef();
  const navigationRef = useRef();

  const [forceRender, setForceRender] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setForceRender(prev => prev + 1);
    }, 50);

    return () => clearTimeout(timer);
  }, [isLoggedIn]);

  // Memoize theme to prevent unnecessary re-renders
  const DarkTheme = useMemo(
    () => ({
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        background: '#000',
        card: '#1E1E1E',
        text: '#FFFFFF',
        border: 'rgba(255, 255, 255, 0.2)',
        notification: '#E14084',
      },
      mode: 'dark',
      dark: true,
    }),
    [],
  );

  // Memoize the navigator component
  const renderNavigator = useCallback(() => {
    if (!tokenChecked && !showFallback) {
      return <LoadingComponent />;
    }

    const Navigator = isLoggedIn ? AppStackNavigator : AuthStackNavigator;
    return <Navigator />;
  }, [isLoggedIn, tokenChecked, showFallback]);

  // Add fallback timer for loading state
  useEffect(() => {
    let fallbackTimer;

    if (!tokenChecked) {
      fallbackTimer = setTimeout(() => {
        setShowFallback(true);
        dispatch(setTokenChecked(true));
      }, 7000);
    }

    return () => {
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
      }
    };
  }, [tokenChecked, dispatch]);

  // Handle screen tracking for analytics
  const handleNavigationStateChange = useCallback(state => {
    if (!state) return;

    // Get current route name
    const currentRouteName = navigationRef.current?.getCurrentRoute()?.name;

    // Track screen view only when route changes
    if (currentRouteName && routeNameRef.current !== currentRouteName) {
      // Track with Firebase Analytics
      analyticsUtils.trackScreenView(currentRouteName, currentRouteName);

      // Track with Facebook Events
      try {
        facebookEvents.logCustomEvent('screen_view', {
          screen_name: currentRouteName,
        });
      } catch (error) {
        console.error('Error logging Facebook screen view event:', error);
      }

      // Save the route name for later comparison
      routeNameRef.current = currentRouteName;
    }
  }, []);

  return (
    <NavigationContainer
      theme={DarkTheme}
      ref={navigationRef}
      onStateChange={handleNavigationStateChange}
      onReady={() => {
        routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;
      }}>
      <ModalProvider>
        <AppProvider>
          <React.Suspense
            fallback={
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#000',
                }}>
                <ActivityIndicator size="large" color="#FE954A" />
              </View>
            }>
            {renderNavigator()}
          </React.Suspense>
        </AppProvider>
      </ModalProvider>
      <Toaster />
    </NavigationContainer>
  );
};

export default React.memo(AppNavigator);
