# Facebook SDK Integration for Event Tracking

This document outlines how the Facebook SDK has been integrated into the app for event tracking and how to monitor these events.

## 📋 Integration Overview

The Facebook SDK is integrated to track various user events and interactions within the app, providing valuable insights for analytics and marketing purposes.

### ✅ SDK Installation

The SDK has been installed using:

```bash
npm install react-native-fbsdk-next --save
```

### ✅ Platform-Specific Configuration

#### 🔹 iOS

1. `Info.plist` has been updated with the required Facebook SDK configurations:
   ```xml
   <key>FacebookAppID</key>
   <string>YOUR_FACEBOOK_APP_ID</string>
   <key>FacebookDisplayName</key>
   <string>MakeMySong</string>
   <key>LSApplicationQueriesSchemes</key>
   <array>
     <string>fbapi</string>
     <string>fb-messenger-api</string>
     <string>fbauth2</string>
     <string>fbshareextension</string>
   </array>
   ```

#### 🔹 Android

1. `AndroidManifest.xml` has been updated with:
   ```xml
   <meta-data android:name="com.facebook.sdk.ApplicationId" 
              android:value="@string/facebook_app_id"/>
   ```

2. Added string resources in `strings.xml`:
   ```xml
   <string name="facebook_app_id">YOUR_FACEBOOK_APP_ID</string>
   <string name="fb_login_protocol_scheme">fbYOUR_FACEBOOK_APP_ID</string>
   ```

3. The `MainApplication.kt` has been updated to initialize Facebook SDK:
   ```kotlin
   // Initialize Facebook SDK
   FacebookSdk.sdkInitialize(applicationContext)
   AppEventsLogger.activateApp(this)
   ```

## 📊 Event Tracking Implementation

A dedicated utility file has been created at `src/utils/facebookEvents.js` to manage all Facebook SDK events.

### 🔄 Currently Tracked Events

1. **App Open**
   - Tracked when the app starts in `src/App.js`
   - Event name: `fb_mobile_app_open`

2. **User Registration**
   - Tracked when users complete registration/login via Google, Apple, or other methods
   - Event name: `fb_mobile_complete_registration`
   - Parameters: `registration_method` (e.g., 'google', 'apple', 'email')

3. **Song Play**
   - Tracked when users play a song
   - Event name: `song_played`
   - Parameters: `song_id`, `song_name`

4. **In-App Purchases**
   - Tracked when users make a purchase
   - Event name: Custom purchase event
   - Parameters: Amount, currency, product ID

### 📝 Adding New Events

To track additional events:

1. Add a new tracking function in `src/utils/facebookEvents.js`
2. Import and call the function where the event occurs

Example:
```javascript
// In facebookEvents.js
export const logNewFeatureUse = (featureId, featureName) => {
  try {
    AppEventsLogger.logEvent('feature_used', {
      feature_id: featureId,
      feature_name: featureName,
    });
    console.log(`Facebook feature use event logged: ${featureName}`);
  } catch (error) {
    console.error('Error logging Facebook feature use event:', error);
  }
};

// In your component
import facebookEvents from '../../utils/facebookEvents';

// When feature is used
facebookEvents.logNewFeatureUse('feature-123', 'Voice Recognition');
```

## 🔍 Monitoring Events

### Facebook Events Manager

To monitor events in Facebook Events Manager:

1. Go to [Facebook Events Manager](https://www.facebook.com/events_manager2)
2. Select your app from the list of data sources
3. Navigate to the "Data Sources" → "App Events" tab
4. View real-time and historical event data

### Debugging Events

For local testing and debugging:

1. **iOS**: Use the Facebook Analytics Debug Mode in Xcode
2. **Android**: Use Facebook's Logcat debug output

## ⚠️ Important Notes

1. **Facebook App ID**: Replace `YOUR_FACEBOOK_APP_ID` with your actual Facebook App ID
2. **App Tracking Transparency (iOS)**: Ensure compliance with Apple's App Tracking Transparency requirements
3. **Privacy Policy**: Update your privacy policy to disclose Facebook data collection

## 📌 Resources

- [Facebook Analytics Documentation](https://developers.facebook.com/docs/analytics/)
- [FBSDK for React Native](https://github.com/thebergamo/react-native-fbsdk-next)
- [App Events Guide](https://developers.facebook.com/docs/app-events) 