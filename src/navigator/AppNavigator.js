import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import AppProvider from '../context/AppContext';
import {ModalProvider} from '../context/ModalContext';
import AppStackNavigator from './AppStackNavigator';
import {ThemeContext} from '../context/ThemeContext';
import Toaster from '../components/common/Toaster';
import AuthStackNavigator from './AuthStackNavigator';
import {useAuthUser} from '../stores/selector';
import {ActivityIndicator, View, Text} from 'react-native';
import {setTokenChecked} from '../stores/slices/app/index';

const AppNavigator = () => {
  // We still get the theme from context for API compatibility
  // but we're not actually using the mode value
  const {theme} = useContext(ThemeContext);
  const {isLoggedIn} = useSelector(useAuthUser);
  const {tokenChecked} = useSelector(state => state.app);
  const [showFallback, setShowFallback] = useState(false);
  const dispatch = useDispatch();

  // Add fallback timer for loading state
  useEffect(() => {
    console.log('AppNavigator - tokenChecked state:', tokenChecked);

    if (!tokenChecked) {
      console.log('Starting fallback timer for loading state');
      const fallbackTimer = setTimeout(() => {
        console.log('Loading timeout - forcing to continue...');
        setShowFallback(true);
        dispatch(setTokenChecked(true));
      }, 7000); // 7 second timeout

      return () => clearTimeout(fallbackTimer);
    }
  }, [tokenChecked, dispatch]);

  // Define a fixed dark theme for the navigation
  const DarkTheme = {
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
    dark: true, // Ensure dark mode is always true
  };

  // Show loading state while checking authentication

  // Determine which navigator to show based on auth state
  const renderNavigator = () => {
    if (isLoggedIn) {
      return <AppStackNavigator />;
    } else {
      return <AuthStackNavigator />;
    }
  };

  return (
    <NavigationContainer theme={DarkTheme}>
      <ModalProvider>
        <AppProvider>{renderNavigator()}</AppProvider>
      </ModalProvider>
      <Toaster />
    </NavigationContainer>
  );
};

export default AppNavigator;
