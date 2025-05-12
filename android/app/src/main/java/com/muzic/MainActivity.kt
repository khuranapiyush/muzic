package com.muzic

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import org.devio.rn.splashscreen.SplashScreen
import android.view.View
import com.google.firebase.analytics.FirebaseAnalytics

class MainActivity : ReactActivity() {
    private lateinit var firebaseAnalytics: FirebaseAnalytics

    /**
     * Returns the name of the main component registered from JavaScript. This is used to schedule
     * rendering of the component.
     */
    override fun getMainComponentName(): String = "muzic"

    override fun onCreate(savedInstanceState: Bundle?) {
        // Set the theme to AppTheme BEFORE onCreate to support 
        // coloring the background, status bar, and navigation bar
        setTheme(R.style.AppTheme)
        
        // Keep the splash screen visible while we fetch data
        SplashScreen.show(this, R.style.SplashTheme, true)
        
        // Hide the status bar
        window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_FULLSCREEN
        
        super.onCreate(savedInstanceState)
        
        // Initialize Firebase Analytics
        try {
            firebaseAnalytics = FirebaseAnalytics.getInstance(this)
            
            // Log main activity creation
            val bundle = Bundle()
            bundle.putString("launch_source", "direct_main_activity")
            bundle.putLong("timestamp", System.currentTimeMillis())
            firebaseAnalytics.logEvent("main_activity_created", bundle)
        } catch (e: Exception) {
            android.util.Log.e("MainActivity", "Error with Firebase Analytics: ${e.message}", e)
        }
    }

    /**
     * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
     * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
     */
    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}