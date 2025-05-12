# Firebase Analytics Implementation Guide

This document explains how Firebase Analytics is implemented in the MakeMySong app and how to debug it.

## Implementation Details

Firebase Analytics is implemented using the following components:

1. **Native level initialization**:
   - Firebase is initialized in `MainApplication.kt` for Android to ensure it's available throughout the app.
   - Analytics collection is explicitly enabled at the native level.
   - Test events are sent directly from native code to verify functionality.

2. **JavaScript level integration**:
   - Using the modern modular Firebase API
   - All Firebase interactions go through utility functions in `src/utils/analytics.js`
   - Debug mode can be activated for testing

3. **Build configuration**:
   - `manifestPlaceholders` in `build.gradle` explicitly enable analytics collection
   - Proper versioning for compatibility

## Testing Events

Events may take up to 24 hours to appear in the Firebase console. To see them immediately:

### For Android:

1. Run the debug script to enable debug mode:
   ```bash
   ./scripts/enable_firebase_debug.sh
   ```

2. Or manually enable debug mode:
   ```bash
   adb shell setprop debug.firebase.analytics.app com.muzic
   adb shell setprop log.tag.FA VERBOSE
   adb shell setprop log.tag.FA-SVC VERBOSE
   ```

3. View the logs:
   ```bash
   adb logcat -v time -s FA FA-SVC
   ```

### For iOS:

1. Add the following arguments in your Xcode scheme:
   ```
   -FIRDebugEnabled
   -FIRAnalyticsDebugEnabled
   ```

2. Or run with these arguments from terminal:
   ```
   xcrun simctl launch --console-pty <simulator_id> com.muzic -FIRDebugEnabled -FIRAnalyticsDebugEnabled
   ```

## Debugging Tools

The app includes several debugging tools for Firebase Analytics:

1. **Debug Firebase Screen**:
   - In development mode, accessible via custom trigger
   - Shows analytics status
   - Allows sending test events
   - Displays logs

2. **Direct Event Logging**:
   - Use `logDirectEvent` function from `src/utils/logAnalyticsEvent.js` 
   - Sends events directly to Firebase without abstractions

3. **Firebase Debug Script**:
   - Located at `scripts/enable_firebase_debug.sh`
   - Enables debug mode for Firebase Analytics
   - Logs events to ADB for real-time verification

## Common Issues & Solutions

1. **Events not appearing in console**:
   - Ensure analytics collection is enabled
   - Enable debug mode to see events immediately
   - Check for errors in logs
   - Events can take up to 24 hours to appear in the dashboard

2. **Initialization errors**:
   - Check the implementation in both native and JS code
   - Verify google-services.json is properly configured
   - Look for error messages in logs

3. **Version mismatches**:
   - Firebase SDK versions should be compatible
   - Check for warnings in build logs

## Tracking Custom Events

To track custom events, use the utilities in `src/utils/analytics.js`:

```javascript
import analyticsUtils from './utils/analytics';

// Track a custom event
analyticsUtils.trackCustomEvent('my_custom_event', {
  custom_param: 'value'
});

// Track a screen view
analyticsUtils.trackScreenView('Home');

// Track a button click
analyticsUtils.trackButtonClick('signup_button');
```

For direct events (debugging):

```javascript
import { logDirectEvent } from './utils/logAnalyticsEvent';

// Log an event directly
logDirectEvent('debug_event', { param: 'value' });
``` 