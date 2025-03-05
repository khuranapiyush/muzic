import React from 'react';
import {useWatch} from 'react-hook-form';
import {Image, TouchableOpacity} from 'react-native';
import appImages from '../../../../resource/images';
import CheckBoxFC from '../../../common/FormComponents/CheckBoxFC';
import TextInputFC from '../../../common/FormComponents/TextInputFC';
import CButton from '../../../common/core/Button';
import CText from '../../../common/core/Text';
import CView from '../../../common/core/View';
import styles from './style';

const EmailSignUp = ({
  handleSignUp,
  control,
  isValid,
  isLoading,
  handleModeChange: propsHandleModeChange,
  errors,
}) => {
  const passwordValue = useWatch({control, name: 'password'});

  const handleBackBtn = () => {
    !!propsHandleModeChange && propsHandleModeChange('emailLogin');
  };

  return (
    <CView style={styles.container}>
      <CView row style={styles.headerContainer}>
        <TouchableOpacity onPress={handleBackBtn}>
          <Image source={appImages.arrowLeftIcon} style={styles.backBtnIcon} />
        </TouchableOpacity>
        <CView centered style={styles.headerTextContainer}>
          <CText style={styles.headerText}>Sign up with Email</CText>
        </CView>
      </CView>
      <CView style={styles.formContainer}>
        <CView style={styles.topContainer}>
          <CText style={styles.formLabel}>Name</CText>
          <TextInputFC
            control={control}
            autoComplete="off"
            autoCorrect={false}
            name="name"
            placeholder="Enter your name"
            rules={{
              required: 'Name is required',
            }}
          />
        </CView>

        <CView style={styles.topContainer}>
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
          {errors?.email ? (
            <CText style={styles.validationText}>
              {errors?.email?.message}
            </CText>
          ) : null}
        </CView>

        <CView style={styles.topContainer}>
          <CText style={styles.formLabel}>Password</CText>
          <TextInputFC
            control={control}
            autoComplete="off"
            autoCorrect={false}
            autoCapitalize="none"
            secureTextEntry={true}
            name="password"
            placeholder="Enter password"
            rules={{
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters',
              },
              pattern: {
                value: /^(?=.*\d)(?=.*[a-zA-Z]).+$/,
                message:
                  'Password must contain at least 1 number and 1 alphabet',
              },
            }}
          />
          {errors?.password ? (
            <CText style={styles.validationText}>
              {errors?.password?.message}
            </CText>
          ) : null}
        </CView>

        <CView style={styles.bottomContainer}>
          <CText style={styles.formLabel}>Confirm Password</CText>
          <TextInputFC
            control={control}
            autoComplete="off"
            autoCorrect={false}
            autoCapitalize="none"
            name="confirmPassword"
            placeholder="Confirm your password"
            secureTextEntry={true}
            rules={{
              required: 'Confirm Password is required',
              validate: value =>
                value === passwordValue || 'Passwords do not match',
            }}
          />
          {errors?.confirmPassword ? (
            <CText style={styles.validationText}>
              {errors?.confirmPassword?.message}
            </CText>
          ) : null}
        </CView>
      </CView>

      <CView row style={styles.termsContainer}>
        <CView row style={styles.termsCheckBoxContainer}>
          <CheckBoxFC
            control={control}
            name="terms"
            customStyles={{
              containerStyle: {padding: 0, marginLeft: 0, marginRight: 0},
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
          text="Sign Up"
          isGradientButton
          onPress={handleSignUp}
          customStyles={styles.submitBtn}
          disabled={!isValid}
          isLoading={isLoading}
        />
      </CView>
    </CView>
  );
};

export default EmailSignUp;
