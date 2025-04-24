import {appleAuth} from '@invertase/react-native-apple-authentication';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {useNavigation, useTheme} from '@react-navigation/native';
import {useMutation} from '@tanstack/react-query';
import React, {useCallback, useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {
  BackHandler,
  KeyboardAvoidingView,
  SafeAreaView,
  Platform,
} from 'react-native';
import Modal from 'react-native-modal';
import {useDispatch, useSelector} from 'react-redux';
import {
  authAppleLogin,
  authEmailSignup,
  authGoogleLogin,
  authLogin,
  authLoginSignup,
  authVerifyOtp,
} from '../../../../api/auth';
import {loginSource} from '../../../../constants/event';
import {handleLoginEvent} from '../../../../events/auth';
import useEvent from '../../../../hooks/useEvent';
import useToaster from '../../../../hooks/useToaster';
import {setUser} from '../../../../stores/slices/user';
import {screenHeight} from '../../../../utils/common';
import EmailLogin from '../../../feature/auth/EmailLogin';
import EmailSignUp from '../../../feature/auth/EmailSignUp';
import Login from '../../../feature/auth/Login';
import VerifyOtp from '../../../feature/auth/verifyOtp';
import Toaster from '../../Toaster';
import CView from '../../core/View';
import getStyles from './style';
import ROUTE_NAME from '../../../../navigator/config/routeName';

const getFormSchema = (authMode, formData = {}) => {
  switch (authMode) {
    case 'emailLogin': {
      return {
        email: '',
        password: '',
        terms: true,
        ...formData,
      };
    }
    case 'emailSignUp': {
      return {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        terms: true,
        ...formData,
      };
    }
    case 'mobile': {
      return {
        mobile: '',
        phoneCountryCode: {
          name: 'India',
          cca2: 'IN',
          callingCode: ['91'],
        },
        terms: true,
        isReferralCode: false,
        referralCode: '',
        ...formData,
      };
    }
  }
};

const AuthModal = ({
  isVisible,
  onClose,
  config = {type: 'max'},
  defaultStep = 1,
  customStyles = {},
  navigationData = {redirectToPath: null, formData: {}},
  defaultMode = 'mobile',
}) => {
  const height = screenHeight * (config.type === 'max' ? 1 : 0.2);
  const [authMode, setAuthMode] = useState(defaultMode);

  useEffect(() => {
    const backAction = () => {
      if (isVisible) {
        onClose();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [isVisible, onClose]);

  const {mode} = useTheme();
  const styles = getStyles(mode);

  const [step, setStep] = useState(defaultStep);

  const [isLoading, setIsLoading] = useState({
    login: false,
    optVerification: false,
  });

  const {userId} = useSelector(state => state.user);

  const {defaultEventData} = useEvent();

  const navigator = useNavigation();
  const {showToaster} = useToaster();
  const dispatch = useDispatch();

  const {
    control,
    formState: {isValid, errors},
    getValues,
    watch,
    reset,
  } = useForm({
    criteriaMode: 'all',
    mode: 'all',
    defaultValues: getFormSchema(authMode, navigationData?.formData),
  });

  const handleModeChange = useCallback(
    mode => {
      setAuthMode(mode);
      reset(getFormSchema(mode));
    },
    [reset],
  );

  const {mutate: loginMobileApi} = useMutation(data => authLoginSignup(data), {
    onSuccess: res => {
      if (step !== 2) {
        handleNextStep();
      }
    },
    onError: err => {
      showToaster({
        type: 'error',
        text1: 'Error',
        text2: err.response.data.message,
      });
    },
    onSettled: () => {
      setIsLoading(prev => ({...prev, login: false}));
    },
  });

  const {mutate: loginEmailApi} = useMutation(data => authLogin(data), {
    onSuccess: res => {
      dispatch(setUser({isGuest: false, isLoggedIn: true, ...res.data}));

      // setMoeUser(res.data?.user);

      handleLoginEvent(res?.data?.user, {
        ...defaultEventData,
        CurrentSourceName: loginSource.loginEmailSource,
      });

      onClose();
      // showToaster({
      //   type: 'success',
      //   text1: 'Login Success',
      //   text2: 'Welcome to FanTV!'
      // })
      navigationData?.redirectToPath
        ? navigator.navigate(navigationData?.redirectToPath)
        : navigator.navigate(ROUTE_NAME.Home);
    },
    onError: err => {
      showToaster({
        type: 'error',
        text1: 'Error',
        text2: err.response.data.message,
      });
    },
    onSettled: () => {
      setIsLoading(prev => ({...prev, login: false}));
    },
  });

  const {mutate: emailSignUpApi} = useMutation(data => authEmailSignup(data), {
    onSuccess: res => {
      // // showToaster({
      // //   type: 'success',
      // //   text1: 'Login Success',
      // //   text2: 'Welcome to FanTV!'
      // // })
      reset(getFormSchema('emailLogin'));
      handleModeChange('emailLogin');
    },
    onError: err => {
      showToaster({
        type: 'error',
        text1: 'Error',
        text2: err.response.data.message,
      });
    },
    onSettled: () => {
      setIsLoading(prev => ({...prev, login: false}));
    },
  });

  const {mutate: googleLoginApi} = useMutation(data => authGoogleLogin(data), {
    onSuccess: res => {
      dispatch(setUser({isGuest: false, isLoggedIn: true, ...res.data}));

      // setMoeUser(res.data?.user);

      handleLoginEvent(res?.data?.user, {
        ...defaultEventData,
        CurrentSourceName: loginSource.loginGoogleSource,
      });

      onClose();
      // showToaster({
      //   type: 'success',
      //   text1: 'Login Success',
      //   text2: 'Welcome to FanTV!'
      // })

      navigationData?.redirectToPath
        ? navigator.navigate(navigationData?.redirectToPath)
        : navigator.navigate(ROUTE_NAME.Home);
    },
    onError: err => {
      showToaster({
        type: 'error',
        text1: 'Error',
        text2: err.response.data.message,
      });
    },
    onSettled: () => {
      setIsLoading(prev => ({...prev, login: false}));
    },
  });

  const {mutate: appleLoginApi} = useMutation(data => authAppleLogin(data), {
    onSuccess: res => {
      dispatch(setUser({isGuest: false, isLoggedIn: true, ...res.data}));

      // setMoeUser(res.data?.user);

      handleLoginEvent(res?.data?.user, {
        ...defaultEventData,
        CurrentSourceName: loginSource.loginAppleSource,
      });

      onClose();

      navigationData?.redirectToPath
        ? navigator.navigate(navigationData?.redirectToPath)
        : navigator.navigate(ROUTE_NAME.Home);
    },
    onError: err => {
      console.log('Apple login error:', err);
      showToaster({
        type: 'error',
        text1: 'Error',
        text2:
          err.response?.data?.message || 'Failed to authenticate with Apple',
      });
    },
    onSettled: () => {
      setIsLoading(prev => ({...prev, login: false}));
    },
  });

  const {mutate: verifyOtpApi} = useMutation(data => authVerifyOtp(data), {
    onSuccess: res => {
      dispatch(setUser({isGuest: false, isLoggedIn: true, ...res.data}));

      // setMoeUser(res.data?.user);

      handleLoginEvent(res?.data?.user, {
        ...defaultEventData,
        CurrentSourceName: loginSource.loginPhoneSource,
      });

      onClose();
      // showToaster({
      //   type: 'success',
      //   text1: 'Login Success',
      //   text2: 'Welcome to FanTV!'
      // })

      navigationData?.redirectToPath
        ? navigator.navigate(navigationData?.redirectToPath)
        : navigator.navigate(ROUTE_NAME.Home);
    },
    onError: err => {
      showToaster({
        type: 'error',
        text1: 'Error',
        text2: err.response.data.message,
      });
    },
    onSettled: () => {
      setIsLoading(prev => ({...prev, optVerification: false}));
    },
  });

  const handleLogin = () => {
    setIsLoading(prev => ({...prev, login: true}));

    if (authMode === 'mobile') {
      const {mobile, phoneCountryCode, referralCode, isReferralCode} =
        getValues();
      console.log(mobile, 'mobile');
      const data = {
        phoneNumber: mobile,
        phoneCountryCode:
          `+${phoneCountryCode.callingCode[0]}` ||
          `${phoneCountryCode.dial_code}`,
        userId: userId,
        ...(isReferralCode && {referralCode}),
      };
      loginMobileApi(data);
    } else if (authMode === 'emailLogin') {
      const {email, password} = getValues();
      const data = {
        email: email?.trim(),
        password: password?.trim(),
        userId: userId,
      };
      loginEmailApi(data);
    }
  };

  const handleSignUp = () => {
    setIsLoading(prev => ({...prev, login: true}));
    const {name, email, password} = getValues();

    const data = {
      name: name?.trim(),
      email: email?.trim(),
      password: password?.trim(),
      userId: userId,
      role: 'user',
    };
    emailSignUpApi(data);
  };

  const handleVerifyOtp = otp => {
    setIsLoading(prev => ({...prev, optVerification: true}));

    const {mobile, phoneCountryCode} = getValues();

    const data = {
      mobile,
      phoneCountryCode:
        `+${phoneCountryCode.callingCode[0]}` ||
        `${phoneCountryCode.dial_code}`,
      otp,
    };
    verifyOtpApi(data);
  };

  const [isGoogleSignInInProgress, setIsGoogleSignInInProgress] =
    useState(false);

  const handleGoogleLogin = useCallback(async () => {
    if (isGoogleSignInInProgress) {
      console.log('Google Sign In already in progress, ignoring request');
      return;
    }

    try {
      setIsGoogleSignInInProgress(true);
      console.log('Starting Google Sign In process...');

      // First, ensure we're signed out and clean up any existing state
      try {
        const isSignedIn = await GoogleSignin.isSignedIn();
        if (isSignedIn) {
          console.log('Found existing sign in session, signing out...');
          await GoogleSignin.signOut();
          console.log('Signed out from existing session');
        }
      } catch (signOutError) {
        console.log('No previous session to sign out from');
      }

      // Configure Google Sign In with minimal configuration
      console.log('Configuring Google Sign In with minimal configuration...');
      const config = {
        webClientId:
          '920222123505-1b6147gr46g7bp0bkjvn02i056g2e34d.apps.googleusercontent.com',
        offlineAccess: false,
        forceCodeForRefreshToken: false,
        scopes: ['email'],
      };

      // Log configuration before applying
      console.log('Google Sign In Configuration:', {
        ...config,
        platform: Platform.OS,
        version: Platform.Version,
        packageName: 'com.muzic',
        buildType: __DEV__ ? 'debug' : 'release',
      });

      GoogleSignin.configure(config);

      // Check Play Services
      console.log('Checking Play Services...');
      const hasPlayServices = await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      console.log('Play Services available:', hasPlayServices);

      // Sign in with retry mechanism
      let retryCount = 0;
      const maxRetries = 3;
      let lastError = null;

      while (retryCount < maxRetries) {
        try {
          console.log(
            `Attempting sign in (attempt ${retryCount + 1}/${maxRetries})...`,
          );

          // Start new sign-in attempt
          const userInfo = await GoogleSignin.signIn();

          console.log('Sign in successful, user info:', {
            ...userInfo,
            idToken: userInfo.idToken ? 'Present' : 'Missing',
          });

          if (!userInfo.idToken) {
            throw new Error('No ID token received from Google');
          }

          console.log('Calling backend API with ID token...');
          googleLoginApi({
            id_token: userInfo.idToken,
            userId,
          });
          return; // Success, exit the function
        } catch (error) {
          lastError = error;
          console.error(`Sign in attempt ${retryCount + 1} failed:`, {
            code: error.code,
            message: error.message,
            stack: error.stack,
            platform: Platform.OS,
            version: Platform.Version,
            buildType: __DEV__ ? 'debug' : 'release',
          });

          if (error.code === statusCodes.IN_PROGRESS) {
            // If sign in is in progress, wait and try again
            console.log('Sign in in progress, waiting before retry...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            retryCount++;
            continue;
          } else if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            showToaster({
              type: 'error',
              text1: 'Sign In Cancelled',
              text2: 'You cancelled the sign in process',
            });
            break;
          } else if (error.code === statusCodes.DEVELOPER_ERROR) {
            console.error('Developer Error Details:', {
              message:
                'This error usually occurs due to incorrect configuration in Google Cloud Console',
              possibleCauses: [
                'Incorrect webClientId',
                'Missing SHA-1 fingerprint (Android)',
                'Missing bundle ID (iOS)',
                'OAuth consent screen not configured',
                'API not enabled in Google Cloud Console',
                'Package name mismatch',
                'Incorrect OAuth client type',
                'Using debug keystore instead of production keystore',
              ],
              currentConfig: {
                webClientId:
                  '920222123505-1b6147gr46g7bp0bkjvn02i056g2e34d.apps.googleusercontent.com',
                packageName: 'com.muzic',
                platform: Platform.OS,
                version: Platform.Version,
                buildType: __DEV__ ? 'debug' : 'release',
              },
            });
            showToaster({
              type: 'error',
              text1: 'Configuration Error',
              text2:
                'Please check Google Sign-In configuration in Google Cloud Console',
            });
            break;
          } else {
            // For other errors, throw immediately
            throw error;
          }
        }
      }

      // If we've exhausted all retries
      if (retryCount === maxRetries) {
        showToaster({
          type: 'error',
          text1: 'Sign In Failed',
          text2: 'Please try again in a few moments',
        });
        console.error('Max retries reached, last error:', lastError);
      }
    } catch (error) {
      console.error('Detailed Google Sign In Error:', {
        code: error.code,
        message: error.message,
        stack: error.stack,
        fullError: error,
        platform: Platform.OS,
        appVersion: Platform.Version,
        buildType: __DEV__ ? 'debug' : 'release',
      });

      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        showToaster({
          type: 'error',
          text1: 'Play Services Not Available',
          text2: 'Please update Google Play Services',
        });
      } else if (error.code === statusCodes.DEVELOPER_ERROR) {
        console.error('Developer Error Details:', {
          message:
            'This error usually occurs due to incorrect configuration in Google Cloud Console',
          possibleCauses: [
            'Incorrect webClientId',
            'Missing SHA-1 fingerprint (Android)',
            'Missing bundle ID (iOS)',
            'OAuth consent screen not configured',
            'API not enabled in Google Cloud Console',
            'Package name mismatch',
            'Incorrect OAuth client type',
            'Using debug keystore instead of production keystore',
          ],
          currentConfig: {
            webClientId:
              '920222123505-1b6147gr46g7bp0bkjvn02i056g2e34d.apps.googleusercontent.com',
            packageName: 'com.muzic',
            platform: Platform.OS,
            version: Platform.Version,
            buildType: __DEV__ ? 'debug' : 'release',
          },
        });
        showToaster({
          type: 'error',
          text1: 'Configuration Error',
          text2:
            'Please check Google Sign-In configuration in Google Cloud Console',
        });
      } else {
        showToaster({
          type: 'error',
          text1: 'Error',
          text2: error.message || 'An error occurred during sign in',
        });
      }
    } finally {
      setIsGoogleSignInInProgress(false);
    }
  }, [googleLoginApi, showToaster, userId, isGoogleSignInInProgress]);

  // Add cleanup on unmount
  useEffect(() => {
    return () => {
      if (isGoogleSignInInProgress) {
        GoogleSignin.signOut().catch(() => {
          console.log('Error during cleanup sign out');
        });
      }
    };
  }, [isGoogleSignInInProgress]);

  const handleAppleLogin = async () => {
    try {
      // Request credentials for the user
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      // Get the credentials
      const {
        user,
        email,
        nonce,
        identityToken,
        fullName,
        authorizationCode,
        realUserStatus /* etc */,
      } = appleAuthRequestResponse;

      // Ensure identityToken is available
      if (!identityToken) {
        throw new Error('Apple Sign-In failed - no identity token returned');
      }

      // Send data to API to validate and get user tokens
      appleLoginApi({
        id_token: identityToken,
        userId,
        email: email,
        fullName:
          fullName &&
          `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim(),
        nonce: nonce,
        user: user,
      });
    } catch (error) {
      console.log('🚀 ~ file: index.js ~ handleAppleLogin ~ error:', error);
      showToaster({
        type: 'error',
        text1: 'Apple Sign In Failed',
        text2: error?.message || 'An error occurred during Apple sign in',
      });
    }
  };

  const handleSwipeComplete = () => {
    onClose();
  };

  const handleNextStep = () => {
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setStep(step == 1 ? 1 : step - 1);
  };

  const formRenderer = () => {
    switch (authMode) {
      case 'emailLogin': {
        return (
          <EmailLogin
            control={control}
            isValid={isValid}
            handleLogin={handleLogin}
            handleModeChange={handleModeChange}
            isLoading={isLoading.login}
          />
        );
      }
      case 'emailSignUp': {
        return (
          <EmailSignUp
            control={control}
            isValid={isValid}
            handleSignUp={handleSignUp}
            handleModeChange={handleModeChange}
            isLoading={isLoading.login}
            errors={errors}
          />
        );
      }
      case 'mobile': {
        return (
          <>
            {step === 1 ? (
              <Login
                handleLogin={handleLogin}
                nextStep={handleNextStep}
                control={control}
                isValid={isValid}
                isLoading={isLoading.login}
                handleModeChange={handleModeChange}
                handleGoogleLogin={handleGoogleLogin}
                errors={errors}
                handleAppleLogin={handleAppleLogin}
              />
            ) : (
              <VerifyOtp
                handlePreviousStep={handlePreviousStep}
                resendOtp={handleLogin}
                handleVerifyOtp={handleVerifyOtp}
                header={{
                  label: 'Otp verification',
                  description: `Enter the otp sent to +${
                    `+${watch('phoneCountryCode').callingCode[0]}` ||
                    watch('phoneCountryCode').dial_code
                  }${watch('mobile')}`,
                }}
                countryCode={
                  `+${watch('phoneCountryCode').callingCode[0]}` ||
                  watch('phoneCountryCode').dial_code
                }
                phone={`+${
                  `+${watch('phoneCountryCode').callingCode[0]}` ||
                  watch('phoneCountryCode').dial_code
                }${watch('mobile')}`}
                isLoading={isLoading.optVerification}
              />
            )}
          </>
        );
      }
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      // swipeDirection={['down']}
      propagateSwipe
      style={{...styles.modal}}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
      avoidKeyboard={false}
      coverScreen={true}
      hasBackdrop={true}
      backdropColor="black"
      useNativeDriverForBackdrop
      onSwipeComplete={handleSwipeComplete}>
      <KeyboardAvoidingView behavior={'padding'} style={{flex: 1}}>
        <SafeAreaView
          style={{
            ...styles.modalContainer,
            height: height,
          }}>
          <CView style={styles.modalContent}>{formRenderer()}</CView>
          <Toaster />
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AuthModal;
