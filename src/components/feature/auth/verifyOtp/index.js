import React from 'react';
import OtpInput from '../../../common/OtpInput';
import CView from '../../../common/core/View';
import styles from './style';
import GradientBackground from '../../../common/GradientBackground';

const VerifyOtp = ({
  handlePreviousStep,
  resendOtp,
  handleVerifyOtp,
  header,
  isLoading,
  ...rest
}) => {
  const handleEditMobile = () => {
    handlePreviousStep();
  };

  const handleResendOtp = () => {
    resendOtp();
  };

  const handleSubmitOtp = code => {
    handleVerifyOtp(code);
  };

  return (
    <CView style={styles.container}>
      <GradientBackground>
        <OtpInput
          header={header}
          handleEditMobile={handleEditMobile}
          handleResendOtp={handleResendOtp}
          handleSubmitOtp={handleSubmitOtp}
          isLoading={isLoading}
          autoFocusOnLoad={false}
          {...rest}
        />
      </GradientBackground>
    </CView>
  );
};

export default VerifyOtp;
