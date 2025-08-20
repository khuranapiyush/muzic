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
import GradientBackground from '../../../common/GradientBackground';

const Login = ({
  handlePhoneLogin,
  isLoading,
  handleGoogleLogin: propsHandleGoogleLogin,
  handleAppleLogin: propsHandleAppleLogin,
  appleSignInAvailable = true,
}) => {
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
      <GradientBackground>
        <View style={styles.container}>
          <View style={styles.buttonAreaContainer}>
            <CView style={styles.logoContainer}>
              <Image source={appImages.appLogo} style={{...styles.logo}} />
            </CView>
            <CView style={styles.labelContainer}>
              <CText style={styles.label}>Login to your account</CText>
            </CView>
            <CView style={[styles.btnContainer, {zIndex: 10}]}>
              <TouchableOpacity
                style={styles.createButton}
                activeOpacity={0.8}
                onPress={handlePhoneLogin}>
                <LinearGradient
                  colors={[
                    'rgba(255, 255, 255, 0.20)',
                    'rgba(255, 255, 255, 0.40)',
                  ]}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.gradient}>
                  <CText style={[styles.createButtonText, {marginRight: 8}]}>
                    📱
                  </CText>
                  <CText style={styles.createButtonText}>
                    Login with Phone Number
                  </CText>
                </LinearGradient>
              </TouchableOpacity>
            </CView>

            <CView style={styles.btnContainer}>
              <CText
                style={{
                  color: 'white',
                  textAlign: 'center',
                  fontSize: 16,
                  fontFamily: 'Inter',
                  fontWeight: '500',
                  lineHeight: 24,
                }}>
                or continue with
              </CText>
            </CView>

            {/* Google Login Button */}
            <CView style={[styles.btnContainer, {zIndex: 10}]}>
              <TouchableOpacity
                style={styles.createButton}
                activeOpacity={0.8}
                onPress={handleGoogleLogin}>
                <LinearGradient
                  colors={[
                    'rgba(255, 255, 255, 0.20)',
                    'rgba(255, 255, 255, 0.40)',
                  ]}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.gradient}>
                  <Image
                    source={appImages.googleLogoIcon}
                    style={styles.googleLogoIcon}
                  />
                  <CText style={styles.createButtonText}>
                    Login with Google
                  </CText>
                </LinearGradient>
              </TouchableOpacity>
            </CView>
            {/* Apple Login Button - Only shown on iOS */}
            {Platform.OS === 'ios' && appleSignInAvailable && (
              <CView style={[styles.btnContainer, {zIndex: 10}]}>
                <TouchableOpacity
                  style={styles.createButton}
                  activeOpacity={0.8}
                  onPress={handleAppleLogin}>
                  <LinearGradient
                    colors={[
                      'rgba(255, 255, 255, 0.20)',
                      'rgba(255, 255, 255, 0.40)',
                    ]}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={styles.gradient}>
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
        </View>
      </GradientBackground>
    </KeyboardAvoidingView>
  );
};

export default Login;
