import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import React, {useContext} from 'react';
import AppProvider from '../context/AppContext';
import {ModalProvider} from '../context/ModalContext';
import AppStackNavigator from './AppStackNavigator';
import {ThemeContext} from '../context/ThemeContext';
import Toaster from '../components/common/Toaster';

const AppNavigator = () => {
  // We still get the theme from context for API compatibility
  // but we're not actually using the mode value
  const {theme} = useContext(ThemeContext);

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

  return (
    <NavigationContainer theme={DarkTheme}>
      <ModalProvider>
        <AppProvider>
          <AppStackNavigator />
        </AppProvider>
      </ModalProvider>
      <Toaster />
    </NavigationContainer>
  );
};

export default AppNavigator;
