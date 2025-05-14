# Firebase Setup for MakeMySong App

## Setup Complete
- ✅ Added Google Services plugin to Android project
- ✅ Added Firebase dependencies to iOS project
- ✅ Created analytics utility helper
- ✅ Created example analytics implementation

## Steps To Complete

### Android Configuration
1. Download the `google-services.json` file from your Firebase console
2. Place it in the `android/app/` directory

### iOS Configuration
1. Download the `GoogleService-Info.plist` file from your Firebase console
2. Add it to your Xcode project:
   - Open your project in Xcode
   - Right-click on your project in the Project Navigator
   - Select "Add Files to [YourProjectName]"
   - Choose the downloaded `GoogleService-Info.plist` file
   - Make sure "Copy items if needed" is checked

3. Install CocoaPods dependencies:
   ```bash
   cd ios && pod install && cd ..
   ```

## Usage Examples

The Firebase analytics integration is ready to use. Check these files for examples:
- `src/utils/analytics.js` - Utility functions for tracking events
- `src/examples/AnalyticsExample.js` - Example implementation

### Basic Usage

```javascript
// Import the analytics module
import analytics from '@react-native-firebase/analytics';

// Log a screen view
await analytics().logEvent('screen_view', {
  screen_name: 'Home'
});

// Log a button click
await analytics().logEvent('button_click', {
  button_name: 'Subscribe'
});

// Log a purchase
await analytics().logPurchase({
  value: 29.99,
  currency: 'USD',
});
```

You can also use the helper functions in `src/utils/analytics.js`:

```javascript
import analyticsUtils from '../utils/analytics';

// Track screen view
await analyticsUtils.trackScreenView('Home');

// Track button click
await analyticsUtils.trackButtonClick('Subscribe', {
  source: 'home_screen'
});

// Track purchase
await analyticsUtils.trackPurchase(29.99, 'USD', {
  item_id: 'premium_subscription'
});
```

## Troubleshooting

If you encounter any issues with the Firebase integration:

1. Ensure that the `google-services.json` and `GoogleService-Info.plist` files are correctly placed
2. Verify that the application ID in your Firebase project matches your app's bundle ID/package name
3. For iOS, make sure you've run `pod install` after adding the Firebase pods
4. Check that your app has the necessary network permissions to communicate with Firebase servers 