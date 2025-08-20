# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# React Native Hermes
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# React Native Flipper
-keep class com.facebook.flipper.** { *; }
-keep class com.facebook.litho.** { *; }

# React Native Navigation
-keep class com.swmansion.gesturehandler.** { *; }
-keep class com.swmansion.reanimated.** { *; }

# React Native Video
-keep class com.brentvatne.react.** { *; }
-keep class com.yqritc.scalablevideoview.** { *; }

# React Native FS
-keep class com.rnfs.** { *; }

# React Native Config
-keep class com.lugg.ReactNativeConfig.** { *; }

# Keep your application classes
-keep class com.muzic.** { *; }

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep Parcelables
-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# Keep Serializable
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    !static !transient <fields>;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# Keep custom exceptions
-keep public class * extends java.lang.Exception

# Keep annotations
-keepattributes *Annotation*

# Keep source file names and line numbers
-keepattributes SourceFile,LineNumberTable

# Keep JavaScript interface
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Firebase / Protobuf / Google Tag Manager - fix R8 minify crash
-keep class com.google.protobuf.** { *; }
-keep interface com.google.protobuf.** { *; }
-keep class com.google.tagmanager.** { *; }
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.tagmanager.** { *; }

# Preserve service loader metadata (required by protobuf extensions)
-keepattributes *Annotation*,InnerClasses,Signature,EnclosingMethod,Exceptions
-keepnames class com.google.protobuf.GeneratedExtensionRegistryLoader
-keepnames class **.GeneratedExtensionRegistryLite$Loader

# FastServiceLoader workaround
-keep class kotlinx.coroutines.internal.** { *; }

# Add specific rule for the missing Google Protobuf class
-dontwarn com.google.protobuf.java_com_google_android_gmscore_sdk_target_granule__proguard_group_gtm_N1281923064GeneratedExtensionRegistryLite$Loader

# Glide library - required for MoEngage
-keep public class * implements com.bumptech.glide.module.GlideModule
-keep public class * extends com.bumptech.glide.module.AppGlideModule
-keep public enum com.bumptech.glide.load.ImageHeaderParser$** {
    **[] $VALUES;
    public *;
}
-keep class com.bumptech.glide.** { *; }
-keep public class * extends com.bumptech.glide.load.resource.bitmap.BitmapTransformation
-keep public class * extends com.bumptech.glide.load.Transformation
-keep public class * extends com.bumptech.glide.load.ResourceDecoder
-keep public class * extends com.bumptech.glide.load.ResourceEncoder
-keep public class * extends com.bumptech.glide.load.model.ModelLoaderFactory
-keep public class * extends com.bumptech.glide.load.data.DataFetcher
-dontwarn com.bumptech.glide.**

# MoEngage ProGuard rules
-keep class com.moengage.** { *; }
-keep interface com.moengage.** { *; }
-dontwarn com.moengage.**

# MoEngage HMS PushKit (optional - only if you support Huawei)
-keep class com.huawei.hms.** { *; }
-dontwarn com.huawei.hms.**

# Branch.io
-keep class io.branch.** { *; }
-dontwarn io.branch.**
