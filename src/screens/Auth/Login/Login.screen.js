import React, {useState} from 'react';
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
import {authLoginSignup} from '../../../api/auth';
import {useNavigation} from '@react-navigation/native';
import useToaster from '../../../hooks/useToaster';
import ROUTE_NAME from '../../../navigator/config/routeName';
import Login from '../../../components/feature/auth/Login';

const LoginScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const {showToaster} = useToaster();
  const navigation = useNavigation();

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

  // Remove Google and Apple login methods as per requirements

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
            isLoading={isLoading}
            handleModeChange={() => {}}
            errors={errors}
            // Pass empty functions as we're not implementing Google/Apple login
            handleGoogleLogin={() => {}}
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
