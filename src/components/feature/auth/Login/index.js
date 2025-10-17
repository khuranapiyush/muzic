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
import Video from 'react-native-video';

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
        <Video
          source={require('../../../../../assets/animation/loginBanner.mp4')}
          style={styles.videoBackground}
          resizeMode={'cover'}
          repeat={true}
          muted={true}
          playInBackground={false}
          playWhenInactive={false}
        />
        <View style={styles.container}>
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.9)']}
            style={styles.buttonGradientContainer}>
            <View style={styles.buttonAreaContainer}>
              <CView style={styles.labelContainer}>
                <CText style={styles.label}>Continue to your account</CText>
              </CView>
              <CView style={[styles.phoneBtnContainer, {zIndex: 10}]}>
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

              {/* Google Login Button */}
              <CView
                style={{
                  marginTop: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <CView style={[styles.btnContainer, {zIndex: 10}]}>
                  <TouchableOpacity
                    style={styles.googleCreateButton}
                    activeOpacity={0.8}
                    onPress={handleGoogleLogin}>
                    <LinearGradient
                      colors={[
                        'rgba(255, 255, 255, 0.20)',
                        'rgba(255, 255, 255, 0.40)',
                      ]}
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 1}}
                      style={styles.googleButtonGradient}>
                      <Image
                        source={appImages.googleLogoIcon}
                        style={styles.googleLogoIcon}
                      />
                      {Platform.OS === 'android' && (
                        <CText style={styles.googleButtonText}>
                          Login with Google
                        </CText>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </CView>
                {Platform.OS === 'ios' && appleSignInAvailable && (
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
                      or
                    </CText>
                  </CView>
                )}
                {/* Apple Login Button - Only shown on iOS */}
                {Platform.OS === 'ios' && appleSignInAvailable && (
                  <CView style={[styles.btnContainer, {zIndex: 10}]}>
                    <TouchableOpacity
                      style={styles.googleCreateButton}
                      activeOpacity={0.8}
                      onPress={handleAppleLogin}>
                      <LinearGradient
                        colors={[
                          'rgba(255, 255, 255, 0.20)',
                          'rgba(255, 255, 255, 0.40)',
                        ]}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 1}}
                        style={styles.googleButtonGradient}>
                        <Image
                          source={appImages.appleLogoIcon}
                          style={styles.googleLogoIcon}
                        />
                      </LinearGradient>
                    </TouchableOpacity>
                  </CView>
                )}
              </CView>
            </View>
          </LinearGradient>
        </View>
      </GradientBackground>
    </KeyboardAvoidingView>
  );
};

export default Login;
