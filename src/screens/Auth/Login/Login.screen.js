import React, {useState, useEffect} from 'react';
import {StyleSheet, View, KeyboardAvoidingView, Platform} from 'react-native';
import {useMutation} from '@tanstack/react-query';
import {useDispatch} from 'react-redux';
import {authGoogleLogin, authAppleLogin} from '../../../api/auth';
import fetcher, {addAuthInterceptor} from '../../../dataProvider';
import {useNavigation} from '@react-navigation/native';
import useToaster from '../../../hooks/useToaster';
import ROUTE_NAME from '../../../navigator/config/routeName';
import Login from '../../../components/feature/auth/Login';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {appleAuth} from '@invertase/react-native-apple-authentication';
import {setUser} from '../../../stores/slices/user';
import {updateToken, setLoggedIn} from '../../../stores/slices/auth';
import {handleLoginEvent} from '../../../events/auth';
import useEvent from '../../../hooks/useEvent';
import {loginSource} from '../../../constants/event';
import {setTokenChecked} from '../../../stores/slices/app';
import analyticsUtils from '../../../utils/analytics';
import facebookEvents from '../../../utils/facebookEvents';
import {store} from '../../../stores';
import useMoEngageUser from '../../../hooks/useMoEngageUser';

const LoginScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleSignInProgress, setIsGoogleSignInProgress] = useState(false);
  const [isAppleSignInProgress, setIsAppleSignInProgress] = useState(false);
  const {showToaster} = useToaster();
  const navigation = useNavigation();

  // Use the MoEngage hook for automatic user tracking
  const {trackMuzicEvents} = useMoEngageUser();

  // Initialize Google Sign-In when component mounts
  useEffect(() => {
    const initializeGoogleSignIn = async () => {
      try {
        // Platform-specific configuration
        const iosConfig = {
          iosClientId:
            '22319693149-dnbne0s46dolsvnprlrcgafb10072ish.apps.googleusercontent.com',
          scopes: ['email', 'profile'],
          shouldFetchBasicProfile: true,
        };

        const androidConfig = {
          webClientId:
            '22319693149-8u0i7andagg60qu75c98bim53kpv3gkd.apps.googleusercontent.com',
          offlineAccess: true,
          forceCodeForRefreshToken: true,
          scopes: ['email', 'profile'],
        };

        // Configure based on platform - do this only once
        if (Platform.OS === 'ios') {
          GoogleSignin.configure(iosConfig);
        } else {
          GoogleSignin.configure(androidConfig);
        }

        console.log('Google Sign-In configured for platform:', Platform.OS);
      } catch (error) {
        console.error('Google Sign-In configuration error:', error);
      }
    };

    initializeGoogleSignIn();
  }, []);

  // Check Google Sign-In state in a separate effect
  useEffect(() => {
    const checkSignInState = async () => {
      try {
        // Wait for configuration to complete
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check if method exists before calling
        if (GoogleSignin && typeof GoogleSignin.isSignedIn === 'function') {
          await GoogleSignin.isSignedIn();
        }
      } catch (error) {
        // Silently handle errors
      }
    };

    checkSignInState();
  }, []);

  // Check Apple Sign In availability at startup
  useEffect(() => {
    const checkAppleSignInAvailability = async () => {
      try {
        if (Platform.OS !== 'ios') {
          return;
        }

        const iosVersion = parseInt(Platform.Version, 10);
        if (iosVersion < 13) {
          return;
        }

        // Check if Apple Sign In is supported
        if (appleAuth && appleAuth.isSupported !== undefined) {
          // Support confirmed
        }
      } catch (error) {
        // Silent error handling
      }
    };

    checkAppleSignInAvailability();
  }, []);

  const handlePhoneLogin = () => {
    console.log('Phone login button pressed');
    // Navigate to phone input screen
    navigation.navigate(ROUTE_NAME.PhoneInput);
  };

  const dispatch = useDispatch();

  const {defaultEventData} = useEvent();

  // Function to navigate to the app after successful login
  const navigateToApp = () => {
    try {
      console.log('Login successful, updating Redux states');

      // Ensure proper token structure for consistent usage across app
      const state = store.getState();
      const currentToken = state?.auth?.accessToken;
      const currentRefreshToken = state?.auth?.refreshToken;

      console.log('Current token state:', {
        hasAccessToken: !!currentToken,
        hasRefreshToken: !!currentRefreshToken,
        authLoggedIn: state?.auth?.isLoggedIn,
        userLoggedIn: state?.user?.isLoggedIn,
      });

      // First store data in Redux - order matters here!
      // Set both auth and user slices correctly
      dispatch(setUser({isLoggedIn: true}));
      dispatch(setLoggedIn(true));

      // Set token check complete flag last
      dispatch(setTokenChecked(true));

      // Show success message
      showToaster({
        type: 'success',
        text1: 'Success',
        text2: 'Login successful',
      });

      // Add a small delay to ensure state updates are processed
      setTimeout(() => {
        const updatedState = store.getState();
        console.log('Updated token state:', {
          hasAccessToken: !!updatedState?.auth?.accessToken,
          hasRefreshToken: !!updatedState?.auth?.refreshToken,
          authLoggedIn: updatedState?.auth?.isLoggedIn,
          userLoggedIn: updatedState?.user?.isLoggedIn,
        });
      }, 100);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const {mutate: googleLoginApi} = useMutation(data => authGoogleLogin(data), {
    onSuccess: res => {
      try {
        console.log('Google login API successful, processing response');

        // Extract token information for data provider
        const accessToken = res.data?.tokens?.access?.token;
        const refreshToken = res.data?.tokens?.refresh?.token;

        // Set auth token for API calls if available
        if (fetcher && fetcher.setAuthToken && accessToken) {
          // Pass tokens in the correct format expected by Redux
          fetcher.setAuthToken({
            access: accessToken,
            refresh: refreshToken,
          });
          console.log('Auth token set in axios instances');
        }

        // Add token to axios interceptor
        addAuthInterceptor(accessToken);

        // Save token in Redux
        if (accessToken && refreshToken) {
          dispatch(
            updateToken({
              accessToken: accessToken,
              refreshToken: refreshToken,
            }),
          );
          console.log('Tokens saved in Redux');
        }

        // Store user data in Redux - this contains isLoggedIn flag
        if (res.data?.user) {
          dispatch(setUser({...res.data.user, isLoggedIn: true}));
          console.log('User data saved in Redux with isLoggedIn=true');
        } else {
          // If no user data, just set isLoggedIn
          dispatch(setUser({isLoggedIn: true}));
          console.log('No user data, but set isLoggedIn=true');
        }

        // Track login success with Muzic-specific context
        try {
          trackMuzicEvents.socialAction('login', {
            method: 'google',
            user_id: res.data.user?.id || res.data.user?._id,
            email: res.data.user?.email,
          });
        } catch (error) {
          console.warn('MoEngage login tracking failed:', error);
        }

        // Log the login event for analytics
        handleLoginEvent({
          ...defaultEventData,
          loginSource: loginSource.GOOGLE,
        });

        // Track registration/login with analytics
        analyticsUtils.trackCustomEvent('user_registration', {
          method: 'google',
          platform: Platform.OS,
          timestamp: new Date().toISOString(),
        });

        // Track registration/login with Facebook SDK
        facebookEvents.logUserRegistration('google');

        // Use the new navigation function as the final step
        navigateToApp();
      } catch (error) {
        console.error('Error during login success handling:', error);
      } finally {
        // Clear loading states
        setIsGoogleSignInProgress(false);
        setIsLoading(false);
      }
    },
    onError: err => {
      setIsGoogleSignInProgress(false);
      setIsLoading(false);
      console.log('Google login error:', err, err.response?.data?.message);
      showToaster({
        type: 'error',
        text1: 'Error',
        text2: err.response?.data?.message || 'Login failed',
      });
    },
  });

  const {mutate: appleLoginApi} = useMutation(data => authAppleLogin(data), {
    onSuccess: res => {
      try {
        console.log('Apple login API successful, processing response');

        // Extract token information
        const accessToken = res.data?.tokens?.access?.token;
        const refreshToken = res.data?.tokens?.refresh?.token;

        // Set auth token for API calls
        if (fetcher && fetcher.setAuthToken && accessToken) {
          // Pass tokens in the correct format expected by Redux
          fetcher.setAuthToken({
            access: accessToken,
            refresh: refreshToken,
          });
          console.log('Auth token set in axios instances');
        }

        // Add token to axios interceptor
        addAuthInterceptor(accessToken);

        // Save token in Redux
        if (accessToken && refreshToken) {
          dispatch(
            updateToken({
              accessToken: accessToken,
              refreshToken: refreshToken,
            }),
          );
          console.log('Tokens saved in Redux');
        }

        // Store user data in Redux - this contains isLoggedIn flag
        if (res.data?.user) {
          dispatch(setUser({...res.data.user, isLoggedIn: true}));
          console.log('User data saved in Redux with isLoggedIn=true');
        } else {
          // If no user data, just set isLoggedIn
          dispatch(setUser({isLoggedIn: true}));
          console.log('No user data, but set isLoggedIn=true');
        }

        // Track login success with Muzic-specific context
        try {
          trackMuzicEvents.socialAction('login', {
            method: 'apple',
            user_id: res.data.user?.id || res.data.user?._id,
            email: res.data.user?.email,
          });
        } catch (error) {
          console.warn('MoEngage login tracking failed:', error);
        }

        // Log the login event for analytics
        handleLoginEvent({
          ...defaultEventData,
          loginSource: loginSource.APPLE,
        });

        // Track registration/login with analytics
        analyticsUtils.trackCustomEvent('user_registration', {
          method: 'apple',
          platform: Platform.OS,
          timestamp: new Date().toISOString(),
        });

        // Track registration/login with Facebook SDK
        facebookEvents.logUserRegistration('apple');

        // Use the navigation function as the final step
        navigateToApp();
      } catch (error) {
        console.error('Error during Apple login success handling:', error);
      } finally {
        // Clear loading states
        setIsAppleSignInProgress(false);
        setIsLoading(false);
      }
    },
    onError: err => {
      setIsAppleSignInProgress(false);
      setIsLoading(false);
      showToaster({
        type: 'error',
        text1: 'Error',
        text2: err.response?.data?.message || 'Login failed',
      });
    },
  });

  const handleGoogleLogin = async () => {
    if (isGoogleSignInProgress) {
      return;
    }

    try {
      // Track the button click in analytics
      analyticsUtils.trackButtonClick('google_login', {
        screen: 'login',
        platform: Platform.OS,
      });

      // Track Facebook event
      facebookEvents.logCustomEvent('login_button_click', {
        method: 'google',
        platform: Platform.OS,
      });

      setIsGoogleSignInProgress(true);
      setIsLoading(true);

      // First try to check if signed in
      try {
        if (typeof GoogleSignin.isSignedIn === 'function') {
          const isSignedIn = await GoogleSignin.isSignedIn();
          if (isSignedIn) {
            await GoogleSignin.signOut();
          }
        } else {
          // If isSignedIn isn't available, try signOut anyway
          try {
            await GoogleSignin.signOut();
          } catch (e) {
            // Ignore sign-out errors
          }
        }
      } catch (signOutError) {
        // Ignore sign-out errors
      }

      // Check Play Services first
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Attempt to sign in
      const userInfo = await GoogleSignin.signIn();

      // Try to get tokens explicitly if needed
      if (!userInfo.idToken) {
        try {
          const tokens = await GoogleSignin.getTokens();
          if (tokens.idToken) {
            userInfo.idToken = tokens.idToken;
          }
        } catch (tokenError) {
          // Ignore token retrieval errors
        }
      }

      if (!userInfo.idToken) {
        throw new Error('No ID token received from Google');
      }

      // Send the complete user object to the backend
      googleLoginApi({
        idToken: userInfo.idToken,
        id_token: userInfo.idToken, // Include both formats
        serverAuthCode: userInfo.serverAuthCode,
        user: userInfo.user,
      });
    } catch (error) {
      // Reset sign-in progress state
      setIsGoogleSignInProgress(false);
      setIsLoading(false);

      // Handle specific error cases
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        showToaster({
          type: 'info',
          text1: 'Sign In Cancelled',
          text2: 'You cancelled the sign in process',
        });
      } else if (error.code === statusCodes.IN_PROGRESS) {
        showToaster({
          type: 'info',
          text1: 'Please Wait',
          text2: 'Sign in already in progress',
        });
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        showToaster({
          type: 'error',
          text1: 'Play Services Not Available',
          text2: 'Please update Google Play Services',
        });
      } else if (error.code === statusCodes.DEVELOPER_ERROR) {
        // Show developer error for debugging
        console.error('Google Sign-In Developer Error:', error);
        showToaster({
          type: 'error',
          text1: 'Configuration Error',
          text2: 'Google Sign-In configuration issue. Please contact support.',
        });
      } else {
        console.log('Google login error:', error);
        showToaster({
          type: 'error',
          text1: 'Sign In Failed',
          text2: error.message || 'An unexpected error occurred',
        });
      }
    }
  };

  const handleAppleLogin = async () => {
    if (isAppleSignInProgress) {
      return;
    }

    try {
      // Track the button click in analytics
      analyticsUtils.trackButtonClick('apple_login', {
        screen: 'login',
        platform: Platform.OS,
      });

      // Track Facebook event
      facebookEvents.logCustomEvent('login_button_click', {
        method: 'apple',
        platform: Platform.OS,
      });

      // Set in-progress state
      setIsAppleSignInProgress(true);
      setIsLoading(true);

      // Platform check first
      if (Platform.OS !== 'ios') {
        showToaster({
          type: 'error',
          text1: 'Not Supported',
          text2: 'Apple Sign In is only available on iOS devices',
        });
        setIsAppleSignInProgress(false);
        setIsLoading(false);
        return;
      }

      // iOS version check
      const iosVersion = parseInt(Platform.Version, 10);
      if (iosVersion < 13) {
        showToaster({
          type: 'error',
          text1: 'Not Supported',
          text2: 'Apple Sign In requires iOS 13 or later',
        });
        setIsAppleSignInProgress(false);
        setIsLoading(false);
        return;
      }

      // Check if Apple Auth is supported on this device
      if (!appleAuth.isSupported) {
        showToaster({
          type: 'error',
          text1: 'Not Supported',
          text2: 'Apple Sign In is not supported on this device',
        });
        setIsAppleSignInProgress(false);
        setIsLoading(false);
        return;
      }

      // Check if Apple Sign In is available on the device
      if (!appleAuth || typeof appleAuth.performRequest !== 'function') {
        showToaster({
          type: 'error',
          text1: 'Not Supported',
          text2:
            'Apple Sign In is not available on this device. Please use another login method.',
        });
        setIsAppleSignInProgress(false);
        setIsLoading(false);
        return;
      }

      // Request credentials for the user with try/catch to handle plist errors
      let appleAuthRequestResponse;
      try {
        appleAuthRequestResponse = await appleAuth.performRequest({
          requestedOperation: appleAuth.Operation.LOGIN,
          requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
        });
      } catch (requestError) {
        // Check for known errors
        if (
          requestError.message &&
          requestError.message.includes('not supported')
        ) {
          showToaster({
            type: 'error',
            text1: 'Not Supported',
            text2:
              'Apple Sign In is not supported on this device. Please use another login method.',
          });
        } else if (
          requestError.message &&
          (requestError.message.includes('property list') ||
            requestError.message.includes('Info.plist') ||
            requestError.message.includes('PropertyList'))
        ) {
          showToaster({
            type: 'error',
            text1: 'Configuration Error',
            text2:
              'There is an issue with the app configuration for Apple Sign In. Please contact support.',
          });
        } else {
          // Handle other request errors
          showToaster({
            type: 'error',
            text1: 'Sign In Failed',
            text2: requestError.message || 'Failed to initiate Apple Sign In',
          });
        }
        setIsAppleSignInProgress(false);
        setIsLoading(false);
        return;
      }

      // Get the credentials
      const {user, email, nonce, identityToken, fullName} =
        appleAuthRequestResponse;

      // Ensure identityToken is available
      if (!identityToken) {
        throw new Error('Apple Sign-In failed - no identity token returned');
      }

      // Send data to API to validate and get user tokens
      appleLoginApi({
        id_token: identityToken,
        email: email,
        fullName:
          fullName &&
          `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim(),
        nonce: nonce,
        user: user,
      });
    } catch (error) {
      setIsAppleSignInProgress(false);
      setIsLoading(false);

      let errorMessage = 'An error occurred during Apple sign in';

      // Handle specific error cases
      if (error.message && error.message.includes('not supported')) {
        errorMessage = 'Apple Sign In is not supported on this device';
      } else if (error.code === 1000) {
        // User canceled the sign-in
        errorMessage = 'You canceled the sign-in process';
      }

      showToaster({
        type: 'error',
        text1: 'Apple Sign In Failed',
        text2: error?.message || errorMessage,
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidView}>
      <View style={styles.content}>
        <Login
          handlePhoneLogin={handlePhoneLogin}
          isLoading={
            isLoading || isGoogleSignInProgress || isAppleSignInProgress
          }
          handleGoogleLogin={handleGoogleLogin}
          handleAppleLogin={handleAppleLogin}
          appleSignInAvailable={
            Platform.OS === 'ios' &&
            parseInt(Platform.Version, 10) >= 13 &&
            appleAuth &&
            appleAuth.isSupported
          }
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  keyboardAvoidView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default LoginScreen;
