import {appleAuth} from '@invertase/react-native-apple-authentication';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {useNavigation, useTheme} from '@react-navigation/native';
import {useMutation} from '@tanstack/react-query';
import React, {useCallback, useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {BackHandler, KeyboardAvoidingView, SafeAreaView} from 'react-native';
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
      const data = {
        mobile,
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

  const handleGoogleLogin = useCallback(async () => {
    try {
      GoogleSignin.configure({
        webClientId:
          '513197452057-mk7k51dvhfi8qrd7hlmlhjgn7u384ha4.apps.googleusercontent.com',
      });

      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      const {idToken} = await GoogleSignin.signIn();

      googleLoginApi({
        id_token: idToken,
        userId,
      });
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the google login', error.code);
      } else {
        showToaster({
          type: 'error',
          text1: 'Error',
          text2: 'Some Error occurred',
        });
      }
    }
  }, [googleLoginApi, showToaster, userId]);

  const handleAppleLogin = async () => {
    try {
      const {identityToken} = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      appleLoginApi({
        id_token: identityToken,
        userId,
      });
    } catch (error) {
      console.log('🚀 ~ file: index.js:349 ~ handleAppleLogin ~ error:', error);
      // showToaster({
      //   type: 'error',
      //   text1: 'Error',
      //   text2: 'Some Error occurred'
      // })
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
