import React, {useState} from 'react';
import {useWatch} from 'react-hook-form';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import appImages from '../../../../resource/images';
// import CheckBoxFC from '../../../common/FormComponents/CheckBoxFC';
import CountryPickerDropdownFC from '../../../common/FormComponents/CountryPickerDropdownFC';
import MobileInputFC from '../../../common/FormComponents/MobileInputFC';
import CText from '../../../common/core/Text';
import CView from '../../../common/core/View';
import styles from './style';
import LinearGradient from 'react-native-linear-gradient';

const Login = ({
  handleLogin,
  control,
  isValid,
  isLoading,
  errors,
  handleModeChange: propsHandleModeChange,
  handleGoogleLogin: propsHandleGoogleLogin,
  handleAppleLogin: propsHandleAppleLogin,
}) => {
  const countryCode = useWatch({control, name: 'phoneCountryCode'});
  const [isTermsAccepted, setIsTermsAccepted] = useState(true);

  // const handleEmailLogin = () => {
  //   !!propsHandleModeChange && propsHandleModeChange('emailLogin');
  // };

  const handleGoogleLogin = () => {
    !!propsHandleGoogleLogin && propsHandleGoogleLogin();
  };

  // const handleAppleLogin = () => {
  //   !!propsHandleAppleLogin && propsHandleAppleLogin();
  // };

  const toggleTermsAcceptance = () => {
    setIsTermsAccepted(!isTermsAccepted);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidView}>
      <CView style={styles.container}>
        <CView style={styles.logoContainer}>
          <Image source={appImages.appLogo} style={{...styles.logo}} />
        </CView>
        <CView style={styles.labelContainer}>
          <CText style={styles.label}>LOG IN / SIGN UP</CText>
        </CView>

        <CView style={styles.mobileTextContainer}>
          <CText size="mediumBold" style={{color: 'white'}}>
            Mobile number
          </CText>
        </CView>

        <CView row="row" style={styles.mobileContainer}>
          <CView style={styles.mobileItemContainer}>
            <CountryPickerDropdownFC
              control={control}
              name="phoneCountryCode"
            />
          </CView>
          <CView style={styles.mobileItemContainer}>
            <MobileInputFC
              control={control}
              name="mobile"
              autoFocus={false}
              rules={{required: 'Mobile number is required'}}
            />
          </CView>
        </CView>

        {countryCode?.callingCode[0] !== '+91' ||
          (countryCode?.dial_code !== '91' && (
            <CView style={styles.msgContainer}>
              <CText size="normalBold" color="commonWhite">
                OTP will be sent on your WhatsApp
              </CText>
            </CView>
          ))}

        <CView style={styles.btnContainer}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleLogin}
            customStyles={styles.submitBtn}
            disabled={!isValid || !isTermsAccepted}
            isLoading={isLoading}>
            <LinearGradient
              colors={['#F4A460', '#DEB887']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={{
                ...styles.gradient,
                opacity: !isValid || !isTermsAccepted ? 0.6 : 1,
              }}>
              <CText style={styles.createButtonText}>Continue</CText>
            </LinearGradient>
          </TouchableOpacity>
        </CView>

        <CView row style={styles.termsContainer}>
          <TouchableOpacity
            onPress={toggleTermsAcceptance}
            style={styles.checkmarkContainer}>
            <CView
              style={[
                styles.checkmarkBox,
                isTermsAccepted && styles.checkmarkBoxSelected,
              ]}>
              {isTermsAccepted && <CText style={styles.checkmarkIcon}>✓</CText>}
            </CView>
          </TouchableOpacity>
          <CView style={styles.termsTextContainer}>
            <CText size="smallBold" style={{color: 'white'}}>
              By proceeding you agree to the Terms & Conditions and Privacy
              Policy of MakeMySong
            </CText>
          </CView>
        </CView>

        <CView style={styles.socialAuthContainer}>
          <CView row style={styles.signInContainer}>
            <CText style={styles.signInText}>Or Sign-in With</CText>
          </CView>
          <CView row>
            <TouchableOpacity
              onPress={handleGoogleLogin}
              style={styles.socialBtnWrapper}>
              <Image
                source={appImages.googleLogoIcon}
                style={styles.googleLogoIcon}
              />
            </TouchableOpacity>
            {/* <TouchableOpacity
            onPress={handleEmailLogin}
            style={styles.socialBtnWrapper}>
            <Image source={appImages.emailIcon} style={styles.emailIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleAppleLogin}>
            <Image source={appImages.appleLogoIcon} style={styles.emailIcon} />
          </TouchableOpacity> */}
          </CView>
        </CView>
      </CView>
    </KeyboardAvoidingView>
  );
};

export default Login;
