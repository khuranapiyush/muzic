import React from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  View,
} from 'react-native';
import appImages from '../../../../resource/images';
import CText from '../../../common/core/Text';
import CView from '../../../common/core/View';
import styles from './style';
import LinearGradient from 'react-native-linear-gradient';

const Login = ({
  // handleLogin,
  // control,
  // isValid,
  // errors,
  // handleModeChange: propsHandleModeChange,
  isLoading,
  handleGoogleLogin: propsHandleGoogleLogin,
  handleAppleLogin: propsHandleAppleLogin,
  appleSignInAvailable = true,
}) => {
  // const countryCode = useWatch({control, name: 'phoneCountryCode'});
  // const [isTermsAccepted, setIsTermsAccepted] = useState(true);

  // const handleEmailLogin = () => {
  //   !!propsHandleModeChange && propsHandleModeChange('emailLogin');
  // };

  const handleGoogleLogin = () => {
    !!propsHandleGoogleLogin && propsHandleGoogleLogin();
  };

  const handleAppleLogin = () => {
    if (appleSignInAvailable) {
      !!propsHandleAppleLogin && propsHandleAppleLogin();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidView}>
      <LinearGradient
        colors={['transparent', 'rgba(254, 149, 74, 0.1)', 'transparent']}
        start={{x: 0.5, y: 0}}
        end={{x: 0.5, y: 1}}
        style={styles.container}>
        {/* Gradient behind buttons */}
        <View style={styles.buttonAreaContainer}>
          <CView style={styles.logoContainer}>
            <Image source={appImages.appLogo} style={{...styles.logo}} />
          </CView>
          <CView style={styles.labelContainer}>
            <CText style={styles.label}>Login to your account</CText>
          </CView>
          {/* <CView style={styles.mobileTextContainer}>
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
                {isTermsAccepted && (
                  <CText style={styles.checkmarkIcon}>✓</CText>
                )}
              </CView>
            </TouchableOpacity>
            <CView style={styles.termsTextContainer}>
              <CText size="smallBold" style={{color: 'white'}}>
                By proceeding you agree to the Terms & Conditions and Privacy
                Policy of MakeMySong
              </CText>
            </CView>
          </CView> */}

          {/* Background gradient effect */}
          <LinearGradient
            colors={[
              'transparent',
              'rgba(254, 149, 74, 0.1)',
              'rgba(254, 149, 74, 0.6)',
              'rgba(254, 149, 74, 0.4)',
              'rgba(254, 149, 74, 0.3)',
              'transparent',
            ]}
            start={{x: 0.5, y: 0}}
            end={{x: 0.5, y: 1}}
            style={styles.buttonGradient}
          />

          {/* Google Login Button */}
          <CView style={styles.btnContainer}>
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleGoogleLogin}
              customStyles={styles.submitBtn}
              isLoading={isLoading}>
              <LinearGradient
                colors={['#F4A460', '#DEB887']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={{
                  ...styles.gradient,
                }}>
                <Image
                  source={appImages.googleLogoIcon}
                  style={styles.googleLogoIcon}
                />
                <CText style={styles.createButtonText}>Login with Google</CText>
              </LinearGradient>
            </TouchableOpacity>
          </CView>

          {/* Apple Login Button - Only shown on iOS */}
          {Platform.OS === 'ios' && appleSignInAvailable && (
            <CView style={styles.btnContainer}>
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleAppleLogin}
                customStyles={styles.submitBtn}
                isLoading={isLoading}>
                <LinearGradient
                  colors={['#F4A460', '#DEB887']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={{
                    ...styles.gradient,
                  }}>
                  <Image
                    source={appImages.appleLogoIcon}
                    style={styles.googleLogoIcon}
                  />
                  <CText style={styles.createButtonText}>
                    Login with Apple
                  </CText>
                </LinearGradient>
              </TouchableOpacity>
            </CView>
          )}
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

export default Login;
