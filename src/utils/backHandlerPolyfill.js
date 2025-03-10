import {BackHandler} from 'react-native';

// Store the original addEventListener method
const originalAddEventListener = BackHandler.addEventListener;

// Override the addEventListener method to return an object with a remove method
BackHandler.addEventListener = (eventName, handler) => {
  // Call the original method and get the subscription
  const subscription = originalAddEventListener(eventName, handler);

  // Return an object with a remove method that calls subscription.remove()
  return {
    remove: () => {
      if (typeof subscription === 'function') {
        // Handle older versions where addEventListener returns a function
        subscription();
      } else if (subscription && typeof subscription.remove === 'function') {
        // Handle newer versions where addEventListener returns an object with remove method
        subscription.remove();
      }
    },
  };
};

// Define removeEventListener as a no-op function to prevent errors
if (BackHandler.removeEventListener === undefined) {
  BackHandler.removeEventListener = (eventName, handler) => {
    console.warn(
      'BackHandler.removeEventListener is deprecated. Please use the remove() method on the event subscription returned by addEventListener.',
    );
    // This is a no-op function, as the actual cleanup should be done using the remove() method
  };
}

export default BackHandler;
