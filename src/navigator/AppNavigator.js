import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import React, {useEffect, useState, useCallback, useMemo, useRef} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import AppProvider from '../context/AppContext';
import {ModalProvider} from '../context/ModalContext';
import Toaster from '../components/common/Toaster';
import {useAuthUser} from '../stores/selector';
import {ActivityIndicator, View, Platform, Text} from 'react-native';
import {setTokenChecked} from '../stores/slices/app/index';
import analyticsUtils from '../utils/analytics';
import facebookEvents from '../utils/facebookEvents';

// Import directly for iOS to prevent lazy loading issues
import AppStackNavigatorDirect from './AppStackNavigator';
import AuthStackNavigatorDirect from './AuthStackNavigator';
import GlobalPlayer from '../components/common/GlobalPlayer';
import NavigationService from '../utils/NavigationService';

// Keep lazy loading for Android which works fine
const AppStackNavigator =
  Platform.OS === 'ios'
    ? AppStackNavigatorDirect
    : React.lazy(() => import('./AppStackNavigator'));
const AuthStackNavigator =
  Platform.OS === 'ios'
    ? AuthStackNavigatorDirect
    : React.lazy(() => import('./AuthStackNavigator'));

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

// iOS Fallback UI if navigation fails
const IOSFallbackUI = () => (
  <View
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#FE954A',
      padding: 20,
    }}>
    <Text
      style={{
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 10,
        textAlign: 'center',
      }}>
      Welcome to MakeMySong
    </Text>
    <Text
      style={{
        fontSize: 16,
        color: 'white',
        marginBottom: 20,
        textAlign: 'center',
      }}>
      Loading app...
    </Text>
    <ActivityIndicator size="large" color="white" />
  </View>
);

const AppNavigator = () => {
  const {isLoggedIn} = useSelector(useAuthUser);
  const {tokenChecked} = useSelector(state => state.app);
  const [showFallback, setShowFallback] = useState(false);
  const [renderFailed, setRenderFailed] = useState(false);
  const dispatch = useDispatch();
  const routeNameRef = useRef();
  const navigationRef = NavigationService.navigationRef;

  // Force navigation token check earlier on iOS
  useEffect(() => {
    if (Platform.OS === 'ios') {
      const timer = setTimeout(() => {
        dispatch(setTokenChecked(true));
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [dispatch]);

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

  // Enhanced navigator rendering with better error handling for iOS
  const renderNavigator = useCallback(() => {
    // If rendering failed (iOS only), show fallback UI
    if (renderFailed && Platform.OS === 'ios') {
      return <IOSFallbackUI />;
    }

    // Show loading component if token check not complete
    if (!tokenChecked && !showFallback) {
      return <LoadingComponent />;
    }

    try {
      // Different approach based on platform
      if (Platform.OS === 'ios') {
        // On iOS, directly return the navigator without any wrapper
        return isLoggedIn ? (
          <AppStackNavigatorDirect />
        ) : (
          <AuthStackNavigatorDirect />
        );
      } else {
        // For Android, use lazy loading via Navigator variable
        const Navigator = isLoggedIn ? AppStackNavigator : AuthStackNavigator;
        return <Navigator />;
      }
    } catch (error) {
      return Platform.OS === 'ios' ? <IOSFallbackUI /> : <LoadingComponent />;
    }
  }, [isLoggedIn, tokenChecked, showFallback, renderFailed]);

  // Add fallback timer for loading state - shorter for iOS
  useEffect(() => {
    let fallbackTimer;

    if (!tokenChecked) {
      fallbackTimer = setTimeout(
        () => {
          setShowFallback(true);
          dispatch(setTokenChecked(true));
        },
        Platform.OS === 'ios' ? 3000 : 7000,
      ); // Shorter timeout for iOS
    }

    return () => {
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
      }
    };
  }, [tokenChecked, dispatch]);

  // Handle screen tracking for analytics and Redux store
  const handleNavigationStateChange = useCallback(state => {
    if (!state) {
      return;
    }

    // Track navigation state in Redux store
    try {
      const navigationTracker = require('../utils/navigationTracker').default;
      if (navigationTracker && navigationTracker.handleNavigationStateChange) {
        navigationTracker.handleNavigationStateChange(state);
      }
    } catch (error) {
      console.warn(
        'Failed to track navigation in Redux:',
        error?.message || error,
      );
      // Don't re-throw the error to prevent app crashes
    }

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
        // Silent error handling
      }

      // Save the route name for later comparison
      routeNameRef.current = currentRouteName;
    }
  }, []);

  // Use platform-specific wrapping for the navigator
  const renderPlatformSpecificNavigator = () => {
    if (Platform.OS === 'ios') {
      // iOS: Direct rendering without Suspense
      try {
        return renderNavigator();
      } catch (error) {
        return <IOSFallbackUI />;
      }
    } else {
      // Android: Use Suspense as it works fine
      return (
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
      );
    }
  };

  return (
    <NavigationContainer
      theme={DarkTheme}
      ref={navigationRef}
      onStateChange={handleNavigationStateChange}
      onReady={() => {
        routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;
      }}>
      <ModalProvider>
        <AppProvider>{renderPlatformSpecificNavigator()}</AppProvider>
      </ModalProvider>
      <Toaster />
    </NavigationContainer>
  );
};

export default React.memo(AppNavigator);
