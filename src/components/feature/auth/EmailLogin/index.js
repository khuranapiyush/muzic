import React from 'react';
import { Image, TouchableOpacity } from 'react-native';
import appImages from '../../../../resource/images';
import CheckBoxFC from '../../../common/FormComponents/CheckBoxFC';
import TextInputFC from '../../../common/FormComponents/TextInputFC';
import CButton from '../../../common/core/Button';
import CText from '../../../common/core/Text';
import CView from '../../../common/core/View';
import styles from './style';

const EmailLogin = ({
  handleLogin,
  control,
  isValid,
  isLoading,
  handleModeChange: propsHandleModeChange,
}) => {
  const handleBackBtn = () => {
    !!propsHandleModeChange && propsHandleModeChange('mobile');
  };

  const handleSignUpBtn = () => {
    !!propsHandleModeChange && propsHandleModeChange('emailSignUp');
  };

  return (
    <CView style={styles.container}>
      <CView row style={styles.headerContainer}>
        <TouchableOpacity onPress={handleBackBtn}>
          <Image source={appImages.arrowLeftIcon} style={styles.backBtnIcon} />
        </TouchableOpacity>
        <CView centered style={styles.headerTextContainer}>
          <CText style={styles.headerText}>Login with Email</CText>
        </CView>
      </CView>

      <CView style={styles.formContainer}>
        <CView style={styles.emailContainer}>
          <CText style={styles.formLabel}>Email</CText>
          <TextInputFC
            control={control}
            autoComplete="off"
            autoCorrect={false}
            autoCapitalize="none"
            keyboardType="email-address"
            name="email"
            placeholder="Enter your email"
            rules={{
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            }}
          />
        </CView>

        <CView style={styles.passwordContainer}>
          <CText style={styles.formLabel}>Password</CText>
          <TextInputFC
            control={control}
            autoComplete="off"
            autoCorrect={false}
            autoCapitalize="none"
            name="password"
            placeholder="Enter your password"
            secureTextEntry={true}
            rules={{ required: 'Password is required' }}
          />
        </CView>
      </CView>

      <CView row style={styles.termsContainer}>
        <CView row style={styles.termsCheckBoxContainer}>
          <CheckBoxFC
            control={control}
            name="terms"
            customStyles={{
              containerStyle: { padding: 0, marginLeft: 0, marginRight: 0 },
            }}
            rules={{
              required: 'Please agree to terms and conditions',
            }}
          />
        </CView>
        <CView style={styles.termsTextContainer}>
          <CText size="smallBold">
            By proceeding you agree to the Terms & Conditions and Privacy Policy
            of FanTV
          </CText>
        </CView>
      </CView>

      <CView style={styles.btnContainer}>
        <CButton
          size="large"
          buttonType="primary"
          text="Login"
          isGradientButton
          onPress={handleLogin}
          customStyles={styles.submitBtn}
          disabled={!isValid}
          isLoading={isLoading}
        />
      </CView>

      <CView row style={styles.signUpInfoContainer}>
        <CText style={styles.signUpInfoText}>Don't have an account </CText>
        <TouchableOpacity onPress={handleSignUpBtn}>
          <CText style={styles.signUpText}>Sign Up</CText>
        </TouchableOpacity>
      </CView>
    </CView>
  );
};

export default EmailLogin;
