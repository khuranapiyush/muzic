# Permission Management in Muzic App

This document explains how permissions are managed in the Muzic app.

## Microphone Permission

The Muzic app only requests microphone permission for voice recording functionality. No tracking permissions are used in the app.

### Implementation Details

1. **Info.plist Configuration**
   - `NSMicrophoneUsageDescription` includes a clear explanation of why we request microphone permission
   - The purpose string explains we use microphone access to allow voice recording in the app

2. **Permission Request Flow**
   - Microphone permission is only requested when needed for recording functionality
   - When the user attempts to record audio, the permission prompt will appear
   - The app provides clear context for why the permission is needed

3. **Permission Manager**
   - `src/utils/PermissionsManager.js` handles all permission-related functionality
   - Provides methods for checking and requesting microphone permission
   - Handles platform-specific differences between iOS and Android

## No Tracking Used

The Muzic app does NOT use tracking functionality and DOES NOT track users across apps and websites owned by other companies. The app does not:

1. Track users across apps and websites
2. Use device identifiers for advertising purposes
3. Share user data with data brokers
4. Collect device information for tracking purposes

## Privacy Considerations

1. The app only collects data necessary for its core functionality
2. All data collection is transparent to the user
3. No unnecessary permissions are requested

## App Store Privacy Information

In App Store Connect, the app's privacy information has been updated to indicate that it does NOT track users across apps and websites owned by other companies. 