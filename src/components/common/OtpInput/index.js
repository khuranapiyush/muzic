import OTPInputView from '@twotalltotems/react-native-otp-input';
import React, {useEffect, useState} from 'react';
import {Image, Platform, TouchableOpacity} from 'react-native';
import {getHash, startOtpListener} from 'react-native-otp-verify';
import useTimer from '../../../hooks/useTimer';
import CText from '../core/Text';
import CView from '../core/View';
import appImages from '../../../resource/images';
import getStyles from './styles';
import {useTheme} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const OtpInput = ({
  pinCount = 4,
  autoFocusOnLoad = false,
  keyboardAppearance = 'default',
  header = {
    label: 'Otp verification',
    description: 'Enter the otp sent to +91000000000',
  },
  timerCount = 30,
  withAutoOtp = false,
  handleEditMobile,
  handleSubmitOtp,
  handleResendOtp,
  isLoading,
  customStyles = {},
  config = {showEditMobile: true},
  countryCode = '+91',
  phone = '',
}) => {
  const {mode} = useTheme();
  const styles = getStyles(mode);
  const {seconds, resetTimer} = useTimer(timerCount);
  const [otp, setOtp] = useState('');

  useEffect(() => {
    if (withAutoOtp && Platform.OS !== 'ios') {
      getHash().then(hash => {
        startOtpListener(hash, message => {
          const otpCode = /(\d{4})/.exec(message)[1];
          handleCodeFilled(otpCode);
        });
      });
    }
  }, [withAutoOtp]);

  // eslint-disable-next-line no-shadow
  const formatTime = seconds => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return min > 0 ? `${min}:${sec}` : `${sec}`;
  };

  const handleCodeFilled = (code, manual) => {
    if (manual) {
      setOtp(code);
    }
  };

  const handleCodeChanged = code => {
    if (code.length === pinCount) {
      handleCodeFilled(code, true);
    } else {
      setOtp(code);
    }
  };

  const resendOtp = () => {
    setOtp('');
    !!handleResendOtp && handleResendOtp();
    resetTimer();
  };

  return (
    <CView style={styles.container}>
      {!!header.label && <CText style={styles.label}>{header.label}</CText>}
      {!!header.description &&
        (countryCode === '+91' || countryCode === '91') && (
          <CText style={styles.description}>{header.description}</CText>
        )}

      {countryCode !== '+91' && (
        <CView row centered style={styles.description}>
          <CText>Enter the otp sent to WhatsApp </CText>
          <Image
            source={appImages.whatsappIcon}
            style={{
              height: 16,
              width: 16,
              resizeMode: 'contain',
            }}
          />
          <CText>{phone}</CText>
        </CView>
      )}

      <CView
        style={{
          ...styles.otpInputViewWrapper,
          ...customStyles?.otpInputViewWrapper,
        }}>
        <OTPInputView
          code={otp}
          pinCount={pinCount}
          autoFocusOnLoad={autoFocusOnLoad}
          keyboardAppearance={keyboardAppearance}
          codeInputFieldStyle={styles.codeInputFieldStyle}
          codeInputHighlightStyle={styles.codeInputHighlightStyle}
          onCodeFilled={handleCodeFilled}
          onCodeChanged={handleCodeChanged}
        />
      </CView>

      <CView row style={styles.utilityContainer}>
        {seconds > 0 ? (
          <CText style={styles.timerText}>
            Resend OTP in:{' '}
            <CText style={styles.timerDisplayText}>{formatTime(seconds)}</CText>
          </CText>
        ) : (
          <TouchableOpacity style={styles.resendButton} onPress={resendOtp}>
            <CText style={styles.resendButtonText}>Resend OTP</CText>
          </TouchableOpacity>
        )}
        {config.showEditMobile && (
          <TouchableOpacity onPress={handleEditMobile}>
            <CText style={styles.editMobileText}>Edit mobile number?</CText>
          </TouchableOpacity>
        )}
      </CView>

      <CView style={styles.submitBtnContainer}>
        <TouchableOpacity
          style={{
            ...styles.createButton,
            opacity: otp.length !== pinCount ? 0.6 : 1,
          }}
          activeOpacity={0.8}
          onPress={() => handleSubmitOtp(otp)}
          disabled={otp.length !== pinCount}
          isLoading={isLoading}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.20)', 'rgba(255, 255, 255, 0.40)']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.gradient}>
            <CText style={styles.createButtonText}>Submit</CText>
          </LinearGradient>
        </TouchableOpacity>
      </CView>
    </CView>
  );
};

export default OtpInput;
