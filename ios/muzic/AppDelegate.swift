import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import FirebaseCore
import FirebaseAnalytics
import FBSDKCoreKit
// import RNSplashScreen
// import FacebookCore

@main
class AppDelegate: RCTAppDelegate {
  override func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
    // Initialize Firebase first
    FirebaseApp.configure()
    
    // Log a test event to verify Firebase Analytics is working
    Analytics.logEvent("app_initialized", parameters: [
      "source": "native_initialization",
      "timestamp": NSDate().timeIntervalSince1970
    ])
    
    // Initialize Facebook SDK
    FBSDKCoreKit.ApplicationDelegate.shared.application(
      application,
      didFinishLaunchingWithOptions: launchOptions
    )
    
    // Initialize React Native
    self.moduleName = "muzic"
    self.dependencyProvider = RCTAppDependencyProvider()

    // Pass Firebase and Facebook as initialized to React Native
    self.initialProps = [
      "firebaseInitialized": true,
      "facebookInitialized": true
    ]

    // Call super to complete React Native initialization
    let success = super.application(application, didFinishLaunchingWithOptions: launchOptions)
    
    // Initialize splash screen AFTER React initialization
    // RNSplashScreen.show()
    
    // Log successful initialization
    print("⭐️ Application successfully initialized")
    
    return success
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
}