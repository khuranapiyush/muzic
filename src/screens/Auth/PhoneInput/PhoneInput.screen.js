import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import {useForm} from 'react-hook-form';
import {useMutation} from '@tanstack/react-query';
import {authLoginSignup} from '../../../api/auth';
import {useNavigation} from '@react-navigation/native';
import useToaster from '../../../hooks/useToaster';
import ROUTE_NAME from '../../../navigator/config/routeName';
import CText from '../../../components/common/core/Text';
import CView from '../../../components/common/core/View';
import CountryPickerDropdownFC from '../../../components/common/FormComponents/CountryPickerDropdownFC';
import LinearGradient from 'react-native-linear-gradient';
import analyticsUtils from '../../../utils/analytics';
import facebookEvents from '../../../utils/facebookEvents';
import {useWatch} from 'react-hook-form';
import GradientBackground from '../../../components/common/GradientBackground';
import appImages from '../../../resource/images';

const PhoneInputScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(true);
  const {showToaster} = useToaster();
  const navigation = useNavigation();

  const {
    control,
    formState: {isValid, errors},
    getValues,
    watch,
    setValue,
  } = useForm({
    criteriaMode: 'all',
    mode: 'onChange',
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

  const countryCode = useWatch({control, name: 'phoneCountryCode'});
  const mobileValue = useWatch({control, name: 'mobile'});

  // Custom validation for button state
  const isFormValid = mobileValue && mobileValue.length >= 6 && isTermsAccepted;

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

    // Track the button click in analytics
    analyticsUtils.trackButtonClick('phone_login', {
      screen: 'phone_input',
      platform: Platform.OS,
    });

    // Track Facebook event
    facebookEvents.logCustomEvent('login_button_click', {
      method: 'phone',
      platform: Platform.OS,
    });

    const {mobile, phoneCountryCode, referralCode, isReferralCode} =
      getValues();

    // Track mobile number entry event
    analyticsUtils.trackMobileNumberEntry({
      country_code: `+${phoneCountryCode.callingCode[0]}`,
    });

    // Track mobile number entry with Facebook Events
    try {
      facebookEvents.logCustomEvent('mobile_number_entry', {
        country_code: `+${phoneCountryCode.callingCode[0]}`,
      });
    } catch (error) {
      // Silent error handling
    }

    const data = {
      phoneNumber: mobile,
      phoneCountryCode: `+${phoneCountryCode.callingCode[0]}`,
      ...(isReferralCode && {referralCode}),
    };

    loginMobileApi(data);
  };

  const toggleTermsAcceptance = () => {
    setIsTermsAccepted(!isTermsAccepted);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidView}>
      <GradientBackground>
        <View style={styles.content}>
          <CView style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Image
                source={appImages.arrowLeftIcon}
                style={{height: 40, width: 40, tintColor: '#FFF'}}
              />
            </TouchableOpacity>
            <CText style={styles.title}>Enter your phone number</CText>
          </CView>

          <CView style={styles.formContainer}>
            <CView style={styles.mobileTextContainer}>
              <CText size="mediumBold" style={styles.label}>
                Mobile number
              </CText>
            </CView>

            <CView style={styles.inputRow}>
              <CView style={styles.countryPickerContainer}>
                <CountryPickerDropdownFC
                  control={control}
                  name="phoneCountryCode"
                />
              </CView>
              <CView style={styles.mobileInputContainer}>
                <TextInput
                  style={styles.mobileInput}
                  placeholder="Enter your mobile number"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={mobileValue || ''}
                  onChangeText={text => {
                    const numericValue = text.replace(/[^0-9]/g, '');
                    setValue('mobile', numericValue);
                  }}
                  maxLength={14}
                  autoFocus={true}
                  editable={true}
                  selectTextOnFocus={true}
                />
              </CView>
            </CView>

            {countryCode?.callingCode[0] !== '91' && (
              <CView style={styles.msgContainer}>
                <CText size="small" style={styles.msgText}>
                  OTP will be sent on your WhatsApp
                </CText>
              </CView>
            )}

            <CView style={styles.termsContainer}>
              <TouchableOpacity
                onPress={toggleTermsAcceptance}
                style={styles.checkmarkContainer}>
                <CView
                  style={[
                    styles.checkmarkBox,
                    isTermsAccepted && styles.checkmarkBoxSelected,
                  ]}>
                  {isTermsAccepted && (
                    <CText style={styles.checkmarkIcon}>✓</CText>
                  )}
                </CView>
              </TouchableOpacity>
              <CView style={styles.termsTextContainer}>
                <CText size="small" style={styles.termsText}>
                  By proceeding you agree to the Terms & Conditions and Privacy
                  Policy of MakeMySong
                </CText>
              </CView>
            </CView>

            <CView style={styles.btnContainer}>
              <TouchableOpacity
                style={[
                  styles.createButton,
                  !isFormValid && styles.disabledButton,
                ]}
                activeOpacity={0.8}
                onPress={handleLogin}
                disabled={!isFormValid || isLoading}>
                <LinearGradient
                  colors={[
                    'rgba(255, 255, 255, 0.20)',
                    'rgba(255, 255, 255, 0.40)',
                  ]}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.buttonGradient}>
                  <CText style={[styles.continueButtonText]}>Continue</CText>
                </LinearGradient>
              </TouchableOpacity>
            </CView>
          </CView>
        </View>
      </GradientBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    color: '#F2F2F2',
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: 600,
    lineHeight: 30,
  },
  formContainer: {
    flex: 1,
    paddingTop: 40,
  },
  mobileTextContainer: {
    marginBottom: 15,
  },
  label: {
    color: '#fff',
    fontSize: 16,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  countryPickerContainer: {
    marginRight: 10,
    justifyContent: 'center',
  },
  mobileInputContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  mobileInput: {
    color: '#fff',
    fontSize: 16,
    height: 50,
    paddingHorizontal: 15,
    fontWeight: '400',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#403F3F',
    backgroundColor: '#1E1E1E',
  },
  msgContainer: {
    marginBottom: 20,
    backgroundColor: 'rgba(222, 184, 135, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  msgText: {
    color: '#DEB887',
    textAlign: 'center',
  },
  termsContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    alignItems: 'flex-start',
  },
  checkmarkContainer: {
    marginRight: 12,
    paddingTop: 2,
  },
  checkmarkBox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  checkmarkBoxSelected: {
    backgroundColor: '#F4A460',
    borderColor: '#F4A460',
  },
  checkmarkIcon: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    color: '#fff',
    lineHeight: 20,
  },
  btnContainer: {
    paddingBottom: 30,
  },
  continueButton: {
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
  },
  continueButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  createButton: {
    width: '100%',
    height: 56,
    overflow: 'hidden',
    borderRadius: 100,
    borderWidth: 4,
    borderColor: '#A84D0C',
    backgroundColor: '#FC6C14',
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#FFF',
    borderStyle: 'solid',
    backgroundColor: '#FC6C14',
    boxShadow: '0 0 14px 0 #FFDBC5 inset',
  },
});

export default PhoneInputScreen;
