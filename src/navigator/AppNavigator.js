import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import React, {useContext} from 'react';
import AppProvider from '../context/AppContext';
import {ModalProvider} from '../context/ModalContext';
import AppStackNavigator from './AppStackNavigator';
import {ThemeContext} from '../context/ThemeContext';
import Toaster from '../components/common/Toaster';

const AppNavigator = () => {
  const {
    theme: {mode},
  } = useContext(ThemeContext);

  const MyTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: '#000',
    },
    mode: 'dark',
  };

  return (
    <NavigationContainer theme={MyTheme}>
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
