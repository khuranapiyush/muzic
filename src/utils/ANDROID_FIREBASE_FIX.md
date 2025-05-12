# Android Firebase Analytics Fix Guide

## Changes Made to Fix Firebase Analytics for Android

We've implemented the following changes to fix the Firebase Analytics issue on Android:

### 1. Native Firebase Initialization

Added direct Firebase initialization in `MainApplication.kt`:

```kotlin
// Initialize Firebase in MainApplication.kt
override fun onCreate() {
  super.onCreate()
  // ...existing code...
  
  // Initialize Firebase
  try {
    // Initialize Firebase if not already initialized
    if (FirebaseApp.getApps(this).isEmpty()) {
      FirebaseApp.initializeApp(this)
      android.util.Log.d("FirebaseInit", "Firebase initialized successfully in Application")
    }
    
    // Get FirebaseAnalytics instance
    firebaseAnalytics = FirebaseAnalytics.getInstance(this)
    
    // Set analytics collection enabled
    firebaseAnalytics.setAnalyticsCollectionEnabled(true)
    
    // Log a test event directly from native code
    val bundle = android.os.Bundle()
    bundle.putString("source", "native_initialization")
    bundle.putLong("timestamp", System.currentTimeMillis())
    firebaseAnalytics.logEvent("app_initialized", bundle)
  } catch (e: Exception) {
    android.util.Log.e("FirebaseInit", "Error initializing Firebase: ${e.message}", e)
  }
}
```

### 2. Manifest Placeholders

Added manifest placeholders in `android/app/build.gradle`:

```gradle
defaultConfig {
    // ...existing config...
    manifestPlaceholders = [
        firebase_analytics_collection_enabled: "true", 
        firebase_analytics_collection_deactivated: "false"
    ]
}
```

### 3. Helper Scripts

Created helper scripts for debugging:

- `enable_firebase_debug.sh`: Enables Firebase Analytics debug mode
- `firebase_verbose_logs.sh`: Enables verbose logging and shows Firebase Analytics logs

### 4. New Testing Component

Created a direct Firebase testing component that bypasses React Native bridge issues:

- `FirebaseDirectTest.js`: Provides direct testing of Firebase initialization and events

## How to Use

1. **Run the app**:
   ```
   npx react-native run-android
   ```

2. **Enable debug mode**:
   ```
   ./enable_firebase_debug.sh
   ```

3. **View verbose logs**:
   ```
   ./firebase_verbose_logs.sh
   ```

4. **Navigate to the test screen**:
   Go to `/FirebaseDirectTest` in your app

5. **Send test events**:
   Use the "Send Test Event Directly" button

6. **Check Firebase Console**:
   Open the DebugView in Firebase Console to see your events

## Common Issues and Solutions

1. **Events still not showing up**:
   - Make sure debug mode is enabled (`./enable_firebase_debug.sh`)
   - Check if your device/emulator has internet connection
   - Verify your app has the internet permission
   - Make sure google-services.json has the correct package name

2. **Device vs. Emulator**:
   - Try on a physical device if emulator isn't showing events
   - Ensure Google Play Services are up to date on the device

3. **Firebase Console Settings**:
   - Check if your Firebase project has Google Analytics enabled
   - Verify the correct Firebase project is selected in the console

4. **Debug vs. Release**:
   - Events from debug builds might be filtered out in some reports
   - Use DebugView specifically to see test events

## Additional Resources

- [Firebase Analytics Debug View Documentation](https://firebase.google.com/docs/analytics/debugview)
- [Firebase React Native Documentation](https://rnfirebase.io/analytics/usage) 