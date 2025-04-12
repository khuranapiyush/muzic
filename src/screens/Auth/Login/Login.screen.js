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
import {useDispatch, useSelector} from 'react-redux';
import {authGoogleLogin, authLoginSignup} from '../../../api/auth';
import fetcher, {addAuthInterceptor} from '../../../dataProvider';
import {useNavigation} from '@react-navigation/native';
import useToaster from '../../../hooks/useToaster';
import ROUTE_NAME from '../../../navigator/config/routeName';
import Login from '../../../components/feature/auth/Login';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {setUser} from '../../../stores/slices/user';
import {updateToken} from '../../../stores/slices/auth';
import {handleLoginEvent} from '../../../events/auth';
import useEvent from '../../../hooks/useEvent';
import {loginSource} from '../../../constants/event';

const LoginScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleSignInProgress, setIsGoogleSignInProgress] = useState(false);
  const {showToaster} = useToaster();
  const navigation = useNavigation();

  // Initialize Google Sign-In when component mounts
  useEffect(() => {
    if (__DEV__) {
      GoogleSignin.DEBUG_MODE = true;
    }

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
      // Extract token information
      const accessToken = res.data?.tokens?.access?.token;
      const refreshToken = res.data?.tokens?.refresh?.token;

      // Prepare user data for the store - matching your actual API response structure
      const userData = {
        isGuest: false,
        isLoggedIn: true,
        user: res.data?.user,
        accessToken: accessToken,
        refreshToken: refreshToken,
      };

      // Save auth data to Redux store
      dispatch(setUser(userData));

      // Store token in your data provider for API calls
      try {
        if (fetcher && fetcher.setAuthToken) {
          fetcher.setAuthToken(accessToken);

          // Also update in your auth store if needed
          if (updateToken) {
            dispatch(
              updateToken({
                access: accessToken,
                refresh: refreshToken,
              }),
            );
          }
        }

        // Initialize auth interceptor to handle token refresh
        if (typeof addAuthInterceptor === 'function') {
          addAuthInterceptor();
        }
      } catch (tokenError) {
        // Silently handle token errors
      }

      // Track login event
      handleLoginEvent(res?.data?.user, {
        ...defaultEventData,
        CurrentSourceName: loginSource.loginGoogleSource,
      });

      // Navigate to home or redirect path
      const destination = navigation?.redirectToPath || ROUTE_NAME.Home;
      navigation?.redirectToPath
        ? navigation.navigate(navigation?.redirectToPath)
        : navigation.navigate(ROUTE_NAME.Home);

      setIsGoogleSignInProgress(false);
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
    // Prevent multiple sign-in attempts
    if (isGoogleSignInProgress) {
      return;
    }

    try {
      // Set flag to prevent multiple sign-in attempts
      setIsGoogleSignInProgress(true);

      // Re-configure before using to ensure proper initialization
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
            isLoading={isLoading || isGoogleSignInProgress}
            handleModeChange={() => {}}
            errors={errors}
            handleGoogleLogin={handleGoogleLogin}
            handleAppleLogin={() => {}}
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
