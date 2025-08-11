import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useMutation} from '@tanstack/react-query';
import {useDispatch} from 'react-redux';
import {authLoginSignup, authVerifyOtp} from '../../../api/auth';
import {useNavigation} from '@react-navigation/native';
import useToaster from '../../../hooks/useToaster';
import useEvent from '../../../hooks/useEvent';
import {loginSource} from '../../../constants/event';
import {handleLoginEvent} from '../../../events/auth';
import ROUTE_NAME from '../../../navigator/config/routeName';
import VerifyOtp from '../../../components/feature/auth/verifyOtp';
import {setUser} from '../../../stores/slices/user';
import analyticsUtils from '../../../utils/analytics';
import facebookEvents from '../../../utils/facebookEvents';

const VerifyOtpScreen = ({route}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isResendLoading, setIsResendLoading] = useState(false);
  const {showToaster} = useToaster();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {defaultEventData} = useEvent();

  // Get parameters from route
  const {phone, countryCode} = route.params || {};

  // Track when OTP verification screen is shown
  useEffect(() => {
    analyticsUtils.trackOtpVerificationShown({
      source: 'signup',
      phone_country_code: countryCode,
    });

    // Track OTP verification screen shown with Facebook Events
    try {
      facebookEvents.logCustomEvent('otp_verification_shown', {
        source: 'signup',
        phone_country_code: countryCode,
      });
    } catch (error) {
      // Silent error handling
    }
  }, [countryCode]);

  const {mutate: loginMobileApi} = useMutation(data => authLoginSignup(data), {
    onSuccess: () => {
      // OTP sent successfully
      showToaster({
        type: 'success',
        text1: 'Success',
        text2: 'OTP sent successfully',
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
      setIsResendLoading(false);
    },
  });

  const {mutate: verifyOtpApi} = useMutation(data => authVerifyOtp(data), {
    onSuccess: res => {
      // Track OTP verification success
      analyticsUtils.trackOtpVerificationSuccess({
        method: 'sms',
        phone_country_code: countryCode,
      });

      // Track OTP verification success with Facebook Events
      try {
        facebookEvents.logCustomEvent('otp_verification_success', {
          method: 'sms',
          phone_country_code: countryCode,
        });
      } catch (error) {
        // Silent error handling
      }

      // Track registration/login with analytics
      analyticsUtils.trackCustomEvent('user_registration', {
        method: 'phone',
        phone_country_code: countryCode,
        timestamp: new Date().toISOString(),
      });

      // Track registration/login with Facebook SDK
      facebookEvents.logUserRegistration('phone');

      // Update user state with isLoggedIn=true, isGuest=false
      dispatch(setUser({isLoggedIn: true, ...res.data}));

      handleLoginEvent(res?.data?.user, {
        ...defaultEventData,
        CurrentSourceName: loginSource.loginPhoneSource,
      });

      // Navigate to home screen
      navigation.reset({
        index: 0,
        routes: [{name: ROUTE_NAME.RootStack}],
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

  const handleVerifyOtp = otp => {
    setIsLoading(true);

    const data = {
      mobile: phone,
      phoneCountryCode: countryCode,
      otp,
    };
    verifyOtpApi(data);
  };

  const handleResendOtp = () => {
    setIsResendLoading(true);

    const data = {
      phoneNumber: phone,
      phoneCountryCode: countryCode,
    };

    loginMobileApi(data);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}>
        <View style={styles.content}>
          <VerifyOtp
            handlePreviousStep={() => navigation.goBack()}
            resendOtp={handleResendOtp}
            handleVerifyOtp={handleVerifyOtp}
            header={{
              label: 'OTP Verification',
              description: `Enter the OTP sent to ${countryCode}${phone}`,
            }}
            countryCode={countryCode}
            phone={`${countryCode}${phone}`}
            isLoading={isLoading}
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
    marginTop: 30,
  },
  content: {
    flex: 1,
    // paddingHorizontal: 16,
  },
});

export default VerifyOtpScreen;
