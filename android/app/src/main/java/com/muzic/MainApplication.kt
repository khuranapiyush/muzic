package com.muzic

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.facebook.soloader.SoLoader
import com.google.firebase.FirebaseApp
import com.google.firebase.analytics.FirebaseAnalytics
import com.moengage.core.MoEngage
import com.moengage.core.config.LogConfig
import com.moengage.core.LogLevel
import com.moengage.core.DataCenter
import com.moengage.core.config.NotificationConfig
import com.moengage.react.MoEInitializer
import io.branch.rnbranch.RNBranchModule


class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              // Packages that cannot be autolinked yet can be added manually here, for example:
              // add(MyReactNativePackage())
            }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  private lateinit var firebaseAnalytics: FirebaseAnalytics

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, OpenSourceMergedSoMapping)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      load()
    }
    
    // Initialize Branch auto instance
    RNBranchModule.getAutoInstance(this)
    RNBranchModule.enableLogging() // Remove or disable in production
    
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
      
      android.util.Log.d("FirebaseInit", "Firebase Analytics initialized and test event logged")
    } catch (e: Exception) {
      android.util.Log.e("FirebaseInit", "Error initializing Firebase: ${e.message}", e)
    }
    
    // Initialize MoEngage SDK with proper configuration
    try {
      android.util.Log.d("MoEngageInit", "Starting MoEngage initialization...")
      
      val moEngageAppId = "BUP4RKUJZXQL8R2J9N61ZKEL"
      val moEngageBuilder = MoEngage.Builder(this, moEngageAppId, DataCenter.DATA_CENTER_4)
        .configureLogs(LogConfig(LogLevel.VERBOSE, true))
        .configureNotificationMetaData(
          NotificationConfig(
            R.mipmap.icon, // small icon
            R.mipmap.icon, // large icon (optional)
            0, // accent color (0 => default)
            true // allow multiple notifications
          )
        )
      
      MoEInitializer.initializeDefaultInstance(applicationContext, moEngageBuilder)
      
      android.util.Log.d("MoEngageInit", "MoEngage initialized successfully with App ID: $moEngageAppId")
    } catch (e: Exception) {
      android.util.Log.e("MoEngageInit", "Error initializing MoEngage: ${e.message}", e)
    }
  }
}
