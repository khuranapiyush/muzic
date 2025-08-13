import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import FirebaseCore
import FirebaseAnalytics
import UserNotifications
import MoEngageSDKPush
import FBSDKCoreKit
import RNBranch
// import RNSplashScreen
// import FacebookCore

@main
class AppDelegate: RCTAppDelegate, UNUserNotificationCenterDelegate {
  override func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
    // Initialize Firebase first
    FirebaseApp.configure()
    
    // Log a test event to verify Firebase Analytics is working
    Analytics.logEvent("app_initialized", parameters: [
      "source": "native_initialization",
      "timestamp": NSDate().timeIntervalSince1970,
      "app_name": "Muzic"
    ])
    
    // MoEngage is initialized by the React Native bridge; we only handle APNs permission here
    
    // Initialize Facebook SDK
    FBSDKCoreKit.ApplicationDelegate.shared.application(
      application,
      didFinishLaunchingWithOptions: launchOptions
    )
    
    // Register for APNs permission
    UNUserNotificationCenter.current().delegate = self
    UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, _ in
      DispatchQueue.main.async {
        UIApplication.shared.registerForRemoteNotifications()
      }
    }

    // Initialize React Native
    self.moduleName = "muzic"
    self.dependencyProvider = RCTAppDependencyProvider()

    // Pass initialization status to React Native
    self.initialProps = [
      "firebaseInitialized": true,
      "facebookInitialized": true,
      "moengageReady": true,
      "appName": "Muzic"
    ]

    // Call super to complete React Native initialization
    let success = super.application(application, didFinishLaunchingWithOptions: launchOptions)
    
    // Initialize Branch session
    // RNBranch.useTestInstance() // Uncomment while testing with Test keys
    RNBranch.initSession(launchOptions: launchOptions, isReferrable: true)

    // Initialize splash screen AFTER React initialization
    // RNSplashScreen.show()
    
    // Log successful initialization
    print("⭐️ Muzic application successfully initialized with Firebase, Facebook, and MoEngage support")
    
    return success
  }

  // Forward APNs token to MoEngage
  override func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    print("📬 APNs token registered: \(deviceToken.map { String(format: "%02.2hhx", $0) }.joined())")
    MoEngageSDKPush.sharedInstance().setPushToken(deviceToken)
  }

  // Handle APNs registration failure (optional)
  override func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
    print("❌ APNs registration failed: \(error.localizedDescription)")
  }

  // Foreground push display handling via MoEngage
  func userNotificationCenter(_ center: UNUserNotificationCenter,
                              willPresent notification: UNNotification,
                              withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
    MoEngageSDKPush.sharedInstance().userNotificationCenter(center,
                                                            willPresent: notification,
                                                            withCompletionHandler: completionHandler)
  }

  // Push click handling via MoEngage
  func userNotificationCenter(_ center: UNUserNotificationCenter,
                              didReceive response: UNNotificationResponse,
                              withCompletionHandler completionHandler: @escaping () -> Void) {
    MoEngageSDKPush.sharedInstance().userNotificationCenter(center,
                                                            didReceive: response,
                                                            withCompletionHandler: completionHandler)
  }

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    return self.bundleURL()
  }

  override func bundleURL() -> URL? {
    #if DEBUG
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
    #else
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
    #endif
  }
  
  // URL handler for Facebook SDK and other deep links
  override func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
    // Give Branch a chance to handle deep link URLs first
    if RNBranch.application(app, open: url, options: options) {
      return true
    }

    // Handle Facebook URL scheme
    let fbHandled = FBSDKCoreKit.ApplicationDelegate.shared.application(
      app,
      open: url,
      sourceApplication: options[UIApplication.OpenURLOptionsKey.sourceApplication] as? String,
      annotation: options[UIApplication.OpenURLOptionsKey.annotation]
    )
    
    if fbHandled {
      return true
    }
    
    // Call super for other URL scheme handlers (like Google Sign-In)
    return super.application(app, open: url, options: options)
  }

  // Handle Universal Links via Branch (pre-iOS 13 or when not using SceneDelegate)
  override func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
    if RNBranch.continue(userActivity) {
      return true
    }
    return false
  }
}