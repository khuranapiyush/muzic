import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createContext, useEffect, useState} from 'react';
export const ThemeContext = createContext();

export const ThemeProvider = ({children}) => {
  // Always use dark mode
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Always save as dark mode
    saveDarkMode();
  }, []);

  const loadTheme = async () => {
    try {
      // No need to load theme - we're always in dark mode
      // This is just to maintain compatibility with existing code
      setIsDarkMode(true);
    } catch (error) {
      console.error('Error loading theme:', error);
      // Default to dark mode on error
      setIsDarkMode(true);
    }
  };

  // Save dark mode to storage
  const saveDarkMode = async () => {
    try {
      await AsyncStorage.setItem('theme', 'dark');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  // Toggle function kept for API compatibility but doesn't actually toggle
  const toggleTheme = async () => {
    // No-op - we always stay in dark mode
    console.log('Theme toggling is disabled - app is locked to dark mode');
    setIsDarkMode(true);
    await saveDarkMode();
  };

  return (
    <ThemeContext.Provider value={{isDarkMode, toggleTheme}}>
      {children}
    </ThemeContext.Provider>
  );
};
