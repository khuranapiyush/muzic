import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useForm} from 'react-hook-form';
import {useMutation} from '@tanstack/react-query';
import {useDispatch} from 'react-redux';
import {
  authGoogleLogin,
  authLoginSignup,
  authAppleLogin,
} from '../../../api/auth';
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

const LoginScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleSignInProgress, setIsGoogleSignInProgress] = useState(false);
  const [isAppleSignInProgress, setIsAppleSignInProgress] = useState(false);
  const {showToaster} = useToaster();
  const navigation = useNavigation();

  // Initialize Google Sign-In when component mounts
  useEffect(() => {
    const initializeGoogleSignIn = async () => {
      try {
        // Configure inside the component to ensure it runs in the correct context
        GoogleSignin.configure({
          webClientId:
            '920222123505-65nrsldp05gghkqhgkp1arm5su8op64j.apps.googleusercontent.com',
          offlineAccess: true,
          forceCodeForRefreshToken: true,
          scopes: ['email', 'profile'],
          // Add iOS-specific configuration only
          ...(Platform.OS === 'ios' && {
            iosClientId:
              '920222123505-65nrsldp05gghkqhgkp1arm5su8op64j.apps.googleusercontent.com',
          }),
        });
      } catch (error) {
        // Silently handle configuration errors
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

  // Check Apple Sign In availability at startup for debugging
  useEffect(() => {
    const checkAppleSignInAvailability = async () => {
      try {
        if (Platform.OS !== 'ios') {
          console.log('Apple Sign In not available - not an iOS device');
          return;
        }

        const iosVersion = parseInt(Platform.Version, 10);
        if (iosVersion < 13) {
          console.log(
            'Apple Sign In not available - iOS version too low:',
            iosVersion,
          );
          return;
        }

        // Log whether Apple Sign In is supported
        if (appleAuth && appleAuth.isSupported !== undefined) {
          console.log('Apple Sign In supported:', appleAuth.isSupported);
        } else {
          console.log('Apple Sign In support status unknown');
        }
      } catch (error) {
        console.log('Error checking Apple Sign In availability:', error);
      }
    };

    checkAppleSignInAvailability();
  }, []);

  const {
    control,
    formState: {isValid, errors},
    getValues,
    watch,
  } = useForm({
    criteriaMode: 'all',
    mode: 'all',
    defaultValues: {
      mobile: '',
      phoneCountryCode: {
        name: 'India',
        cca2: 'IN',
        callingCode: ['91'],
      },
      terms: true,
      isReferralCode: false,
      referralCode: '',
    },
  });

  const {mutate: loginMobileApi} = useMutation(data => authLoginSignup(data), {
    onSuccess: () => {
      navigation.navigate(ROUTE_NAME.VerifyOtp, {
        phone: watch('mobile'),
        countryCode: `+${watch('phoneCountryCode').callingCode[0]}`,
        referralCode: watch('isReferralCode') ? watch('referralCode') : null,
      });
    },
    onError: err => {
      showToaster({
        type: 'error',
        text1: 'Error',
        text2: err.response.data.message,
      });
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const handleLogin = () => {
    setIsLoading(true);
    const {mobile, phoneCountryCode, referralCode, isReferralCode} =
      getValues();

    const data = {
      phoneNumber: mobile,
      phoneCountryCode: `+${phoneCountryCode.callingCode[0]}`,
      ...(isReferralCode && {referralCode}),
    };

    loginMobileApi(data);
  };

  const dispatch = useDispatch();

  const {defaultEventData} = useEvent();

  // const {userId} = useSelector(state => state.user);

  const {mutate: googleLoginApi} = useMutation(data => authGoogleLogin(data), {
    onSuccess: res => {
      // Log the complete response for debugging
      console.log('Google login success response:', JSON.stringify(res.data));

      try {
        // Extract token information for data provider
        const accessToken = res.data?.tokens?.access?.token;
        const refreshToken = res.data?.tokens?.refresh?.token;

        console.log('Extracted tokens:', {accessToken, refreshToken});

        // Set auth token for API calls if available
        if (fetcher && fetcher.setAuthToken) {
          fetcher.setAuthToken(accessToken);
        }

        // Update tokens in Redux store
        if (updateToken) {
          dispatch(
            updateToken({
              access: accessToken,
              refresh: refreshToken,
            }),
          );
        }

        // IMPORTANT: Update Redux state with isLoggedIn=true
        dispatch(setUser({isLoggedIn: true, ...res.data}));

        // Force isLoggedIn to true in auth slice as well
        dispatch(setLoggedIn(true));

        // Make sure tokenChecked is true
        dispatch(setTokenChecked(true));

        // Force the app to re-evaluate login state immediately
        console.log(
          'Google login successful, forcing AppNavigator to re-evaluate login state',
        );

        // Initialize auth interceptor to handle token refresh
        if (typeof addAuthInterceptor === 'function') {
          addAuthInterceptor();
        }

        // Track login event
        handleLoginEvent(res?.data?.user, {
          ...defaultEventData,
          CurrentSourceName: loginSource.loginGoogleSource,
        });

        // DON'T USE NAVIGATION HERE - let AppNavigator handle the switch based on Redux state

        setIsGoogleSignInProgress(false);
      } catch (error) {
        console.error('Error during login process:', error);
        setIsGoogleSignInProgress(false);
      }
    },
    onError: err => {
      showToaster({
        type: 'error',
        text1: 'Error',
        text2: err.response?.data?.message || 'Failed to login with Google',
      });
      setIsGoogleSignInProgress(false);
    },
    onSettled: () => {
      setIsLoading(prev => ({...prev, login: false}));
    },
  });

  const handleGoogleLogin = async () => {
    if (isGoogleSignInProgress) {
      return;
    }

    try {
      setIsGoogleSignInProgress(true);

      GoogleSignin.configure({
        webClientId:
          '920222123505-65nrsldp05gghkqhgkp1arm5su8op64j.apps.googleusercontent.com',
        offlineAccess: true,
        forceCodeForRefreshToken: true,
        scopes: [
          'email',
          'profile',
          'openid',
          'https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/userinfo.email',
        ],
      });

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
        serverAuthCode: userInfo.serverAuthCode,
        user: userInfo.user,
      });
    } catch (error) {
      // Reset sign-in progress state
      setIsGoogleSignInProgress(false);

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
        // Show detailed error message with debug-specific instructions
      } else {
        showToaster({
          type: 'error',
          text1: 'Sign In Failed',
          text2: error.message || 'An unexpected error occurred',
        });
      }
    }
  };

  const {mutate: appleLoginApi} = useMutation(data => authAppleLogin(data), {
    onSuccess: res => {
      // Log the complete response for debugging
      console.log('Apple login success response:', JSON.stringify(res.data));

      try {
        // Extract token information for data provider
        const accessToken = res.data?.tokens?.access?.token;
        const refreshToken = res.data?.tokens?.refresh?.token;

        console.log('Extracted tokens:', {accessToken, refreshToken});

        // Set auth token for API calls if available
        if (fetcher && fetcher.setAuthToken) {
          fetcher.setAuthToken(accessToken);
        }

        // Update tokens in Redux store
        if (updateToken) {
          dispatch(
            updateToken({
              access: accessToken,
              refresh: refreshToken,
            }),
          );
        }

        // IMPORTANT: Update Redux state with isLoggedIn=true
        dispatch(setUser({isLoggedIn: true, ...res.data}));

        // Force isLoggedIn to true in auth slice as well
        dispatch(setLoggedIn(true));

        // Make sure tokenChecked is true
        dispatch(setTokenChecked(true));

        // Force the app to re-evaluate login state immediately
        console.log(
          'Apple login successful, forcing AppNavigator to re-evaluate login state',
        );

        // Initialize auth interceptor to handle token refresh
        if (typeof addAuthInterceptor === 'function') {
          addAuthInterceptor();
        }

        // Track login event
        handleLoginEvent(res?.data?.user, {
          ...defaultEventData,
          CurrentSourceName: loginSource.loginAppleSource,
        });

        // DON'T USE NAVIGATION HERE - let AppNavigator handle the switch based on Redux state

        setIsAppleSignInProgress(false);
      } catch (error) {
        console.error('Error during Apple login process:', error);
        setIsAppleSignInProgress(false);
      }
    },
    onError: err => {
      showToaster({
        type: 'error',
        text1: 'Error',
        text2: err.response?.data?.message || 'Failed to login with Apple',
      });
      setIsAppleSignInProgress(false);
    },
    onSettled: () => {
      setIsLoading(prev => ({...prev, login: false}));
    },
  });

  const handleAppleLogin = async () => {
    if (isAppleSignInProgress) {
      return;
    }

    try {
      // Set in-progress state
      setIsAppleSignInProgress(true);

      // Platform check first
      if (Platform.OS !== 'ios') {
        showToaster({
          type: 'error',
          text1: 'Not Supported',
          text2: 'Apple Sign In is only available on iOS devices',
        });
        setIsAppleSignInProgress(false);
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
        console.log('Apple Sign In request error:', requestError);

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
        return;
      }

      // Get the credentials
      const {
        user,
        email,
        nonce,
        identityToken,
        fullName,
        authorizationCode,
        realUserStatus,
      } = appleAuthRequestResponse;

      // Ensure identityToken is available
      if (!identityToken) {
        throw new Error('Apple Sign-In failed - no identity token returned');
      }

      console.log('Apple Sign In successful, sending data to API');

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
      console.log('Apple Sign In Error:', error);
      setIsAppleSignInProgress(false);

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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}>
        <View style={styles.content}>
          <Login
            handleLogin={handleLogin}
            nextStep={() => {}}
            control={control}
            isValid={isValid}
            isLoading={
              isLoading || isGoogleSignInProgress || isAppleSignInProgress
            }
            handleModeChange={() => {}}
            errors={errors}
            handleGoogleLogin={handleGoogleLogin}
            handleAppleLogin={handleAppleLogin}
            appleSignInAvailable={true}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  keyboardAvoidView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
});

export default LoginScreen;
