import {BackHandler} from 'react-native';

/**
 * A utility wrapper for BackHandler to ensure consistent usage across the app
 * and compatibility with React Native 0.78.0+
 */
export const addBackButtonListener = callback => {
  // In React Native 0.78.0+, addEventListener returns an event subscription
  // with a remove() method
  const subscription = BackHandler.addEventListener(
    'hardwareBackPress',
    callback,
  );

  // Return a cleanup function that uses the correct method to remove the listener
  return () => {
    if (subscription && typeof subscription.remove === 'function') {
      subscription.remove();
    }
  };
};
