This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.


How to generate one in 3 steps?
Step 1: Go to the root of the project in the terminal and run the below command:

react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

Step 2: Go to android directory:

cd android

Step 3: Now in this android folder, run this command

./gradlew assembleDebug

There! you’ll find the apk file in the following path:
yourProject/android/app/build/outputs/apk/debug/app-debug.apk


To build both .aab (Android App Bundle) and .apk (Android Package) files for your React Native project, navigate to the android directory in your terminal and run ./gradlew assembleRelease for the .apk and ./gradlew bundleRelease for the .aab. 
Here's a more detailed breakdown:
1. Building the .apk (Android Package) file:
Navigate to the Android directory:
Open your terminal and navigate to the android directory of your React Native project using cd android. 
Run the command:
Execute the following command to generate the .apk file: ./gradlew assembleRelease. 
Locate the file:
The generated .apk file will be located in the android/app/build/outputs/apk/release directory. 
2. Building the .aab (Android App Bundle) file:
Navigate to the Android directory:
As with the .apk, start by navigating to the android directory using cd android. 
Run the command:
Execute the following command to generate the .aab file: ./gradlew bundleRelease. 
Locate the file:
The generated .aab file will be located in the android/app/build/outputs/bundle/release directory. 
Important Notes:
App Signing:
For publishing to Google Play, you'll need to configure App Signing by Google Play, which is recommended for security and stability. 
Google Play Console:
Once you have the .aab file, you can upload it to the Google Play Console, which will then generate the optimized APKs for different devices. 
Alternative for Expo:
If you're using Expo, you can use the eas build command with specific flags to build both .aab and .apk files. 
Using bundletool:
You can also use bundletool to generate APKs from your .aab file locally for testing purposes. 
Build Optimization:
Consider using techniques like ProGuard/R8 (code shrinking and obfuscation) and resource optimization to reduce the size of your APK/AAB files. 
Permissions:
Ensure that you have the necessary permissions to execute the ./gradlew commands. 
Version Control:
Always increase the version and build number of your application when building new APKs/AABs. 

To build both .apk and .aab files for your React Native project, navigate to the android directory, then run .\gradlew assembleRelease for the .apk and .\gradlew bundleRelease for the .aab. 
Here's a more detailed breakdown:
1. Generating an APK File:
Navigate to the Android Directory: Open your terminal and navigate to the android directory within your React Native project: cd android. 
Run the Assemble Release Command: Execute the following command to build the APK: .\gradlew assembleRelease. 
Locate the APK: The generated APK file will be located in android/app/build/outputs/apk/release/app-release.apk. 
2. Generating an AAB File:
Navigate to the Android Directory: Open your terminal and navigate to the android directory within your React Native project: cd android. 
Run the Bundle Release Command: Execute the following command to build the AAB: .\gradlew bundleRelease. 
Locate the AAB: The generated AAB file will be located in android/app/build/outputs/bundle/release/app-release.aab.
