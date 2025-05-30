/**
 * @format
 */

import {AppRegistry, LogBox} from 'react-native';
import 'react-native-get-random-values';
import {registerGlobals} from 'react-native-webrtc';
import App from './src/App';
import {name as appName} from './app.json';

// Register WebRTC globals
registerGlobals();

// Silence common warnings that are not actionable
LogBox.ignoreLogs([
  'RCTBridge required dispatch_sync to load RCTDevLoadingView',
  'EventEmitter.removeListener',
  'new NativeEventEmitter',
  '[react-native-gesture-handler]',
  'RCTView was not found in the UIManager',
]);

// Set up global error handler
if (!global.ErrorUtils) {
  global.ErrorUtils = {
    setGlobalHandler: callback => {
      ErrorUtils.setGlobalHandler(callback);
    },
  };
}

// Global error handler to prevent app crashes
const errorHandler = (error, isFatal) => {
  // Log the error
  console.error(`Global Error: ${isFatal ? 'FATAL:' : ''}`, error);

  // For now, just log to console, but this could be extended to report to a crash reporting service
};

// Register error handler
global.ErrorUtils.setGlobalHandler(errorHandler);

// Register the main component
AppRegistry.registerComponent(appName, () => App);
