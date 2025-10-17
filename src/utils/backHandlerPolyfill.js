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

// Note: removeEventListener is deprecated in React Native 0.65+
// Components should use the subscription.remove() method instead

// Some libraries still call BackHandler.removeEventListener; provide a safe no-op
if (typeof BackHandler.removeEventListener !== 'function') {
  BackHandler.removeEventListener = () => {
    // no-op for backward compatibility; listeners should call subscription.remove()
  };
}

export default BackHandler;
