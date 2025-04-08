import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import AppProvider from '../context/AppContext';
import {ModalProvider} from '../context/ModalContext';
import {ThemeContext} from '../context/ThemeContext';
import Toaster from '../components/common/Toaster';
import {useAuthUser} from '../stores/selector';
import {ActivityIndicator, View} from 'react-native';
import {setTokenChecked} from '../stores/slices/app/index';

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
  const {theme} = useContext(ThemeContext);
  const {isLoggedIn} = useSelector(useAuthUser);
  const {tokenChecked} = useSelector(state => state.app);
  const [showFallback, setShowFallback] = useState(false);
  const dispatch = useDispatch();

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

  return (
    <NavigationContainer theme={DarkTheme}>
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
