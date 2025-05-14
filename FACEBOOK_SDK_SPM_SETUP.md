# Setting Up Facebook SDK - iOS Integration Guide

This guide provides instructions for integrating the Facebook SDK in your iOS app using either Swift Package Manager (SPM) or CocoaPods. Both approaches are valid, and you can choose the one that works best for your project.

## Option 1: Using CocoaPods (Recommended for React Native Projects)

### Prerequisites

- CocoaPods installed on your system

### Steps to Add Facebook SDK via CocoaPods

1. Update your Podfile to include the Facebook SDK dependencies:

```ruby
# Facebook SDK dependencies
pod 'FBSDKCoreKit'
pod 'FBSDKLoginKit'
pod 'FBSDKShareKit'
```

2. Run pod install:

```bash
cd ios && pod install
```

## Option 2: Using Swift Package Manager

### Prerequisites

- Xcode 12 or later
- An iOS project

### Steps to Add Facebook SDK via SPM

1. Open Your Project in Xcode:

```bash
open ios/muzic.xcworkspace
```

2. Add the Package Dependency:
   - In Xcode, click `File > Add Packages...`
   - In the search bar at the top right, enter the Facebook iOS SDK repository URL:
     ```
     https://github.com/facebook/facebook-ios-sdk
     ```
   - Choose the latest stable version by selecting "Up to Next Major" in the Version dropdown.

3. Select the Required Libraries:
   - **FacebookCore** (required)
   - **FacebookLogin** (if you need login functionality)
   - **FacebookShare** (if you need sharing functionality)
   - **FacebookGamingServices** (if you need gaming services)

4. Click "Add Package" to continue.

5. Wait for Xcode to Clone the Repository

## Common Configuration Steps (Regardless of Installation Method)

### Update Your AppDelegate

The AppDelegate.swift file has already been updated with the necessary Facebook SDK initialization code:

```swift
import FBSDKCoreKit

// In application(_:didFinishLaunchingWithOptions:)
FBSDKCoreKit.ApplicationDelegate.shared.application(
  application,
  didFinishLaunchingWithOptions: launchOptions
)

// In application(_:open:options:)
if ApplicationDelegate.shared.application(app, open: url, options: options) {
  return true
}
```

### Update Info.plist

Your Info.plist has already been configured with:

- FacebookAppID
- FacebookDisplayName
- LSApplicationQueriesSchemes for Facebook
- URL scheme (fb{your-app-id})

### Clean and Build

After completing these steps:

1. Clean your build folder (Product > Clean Build Folder)
2. Build and run your app to verify the integration

## Troubleshooting

If you encounter any issues:

1. **Missing Symbols**: Make sure all required Facebook modules are added to your target
2. **Build Errors**: Check that the dependency is correctly configured
3. **Runtime Errors**: Verify your Info.plist has all the required Facebook SDK entries

## Next Steps

Once the Facebook SDK is successfully integrated, you can use the existing JavaScript implementation with `react-native-fbsdk-next` to interact with the native SDK. 