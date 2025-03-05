import React from 'react';
import {useWatch} from 'react-hook-form';
import {Image, TouchableOpacity} from 'react-native';
import appImages from '../../../../resource/images';
import CheckBoxFC from '../../../common/FormComponents/CheckBoxFC';
import CountryPickerDropdownFC from '../../../common/FormComponents/CountryPickerDropdownFC';
import MobileInputFC from '../../../common/FormComponents/MobileInputFC';
import CButton from '../../../common/core/Button';
import CText from '../../../common/core/Text';
import CView from '../../../common/core/View';
import styles from './style';

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

  const handleEmailLogin = () => {
    !!propsHandleModeChange && propsHandleModeChange('emailLogin');
  };

  const handleGoogleLogin = () => {
    !!propsHandleGoogleLogin && propsHandleGoogleLogin();
  };

  const handleAppleLogin = () => {
    !!propsHandleAppleLogin && propsHandleAppleLogin();
  };

  return (
    <CView style={styles.container}>
      <CView style={styles.logoContainer}>
        <Image source={appImages.appLogo} style={{...styles.logo}} />
      </CView>
      <CView style={styles.labelContainer}>
        <CText style={styles.label}>LOG IN / SIGN UP</CText>
      </CView>

      <CView style={styles.mobileTextContainer}>
        <CText size="mediumBold">Mobile number</CText>
      </CView>

      <CView row="row" style={styles.mobileContainer}>
        <CView style={styles.mobileItemContainer}>
          <CountryPickerDropdownFC control={control} name="phoneCountryCode" />
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

      {countryCode?.name != 'India' && (
        <CView style={styles.msgContainer}>
          <CText size="normalBold" color="commonWhite">
            OTP will be sent on your WhatsApp
          </CText>
        </CView>
      )}

      <CView style={styles.btnContainer}>
        <CButton
          size="large"
          buttonType="primary"
          text="Continue"
          // isGradientButton
          onPress={handleLogin}
          customStyles={styles.submitBtn}
          disabled={!isValid}
          isLoading={isLoading}
        />
      </CView>

      <CView row style={styles.termsContainer}>
        <CheckBoxFC
          control={control}
          name="terms"
          rules={{required: 'Please agree to terms and conditions'}}
          customStyles={{
            containerStyle: {padding: 0, marginLeft: 0, marginRight: 4},
          }}
        />
        <CView style={styles.termsTextContainer}>
          <CText size="smallBold">
            By proceeding you agree to the Terms & Conditions and Privacy Policy
            of Muzic
          </CText>
        </CView>
      </CView>

      <CView style={styles.socialAuthContainer}>
        <CView row style={styles.signInContainer}>
          <CText style={styles.signInText}>or signin with</CText>
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
          <TouchableOpacity
            onPress={handleEmailLogin}
            style={styles.socialBtnWrapper}>
            <Image source={appImages.emailIcon} style={styles.emailIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleAppleLogin}>
            <Image source={appImages.appleLogoIcon} style={styles.emailIcon} />
          </TouchableOpacity>
        </CView>
      </CView>
    </CView>
  );
};

export default Login;
