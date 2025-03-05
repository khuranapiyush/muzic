import {BackHandler} from 'react-native';

// Only add this if you're having issues with third-party libraries
// that you can't directly modify
if (BackHandler && !BackHandler.removeEventListener) {
  // Add a polyfill for the old removeEventListener method
  BackHandler.removeEventListener = (eventName, handler) => {
    console.warn(
      'BackHandler.removeEventListener is deprecated. ' +
        'Please use the remove() method on the event subscription returned by addEventListener.',
    );

    // This is a no-op function since we can't actually remove the listener
    // without the subscription object
    return true;
  };
}
