import {useMutation, useQuery} from '@tanstack/react-query';
import React, {useCallback, useState} from 'react';
import {useForm} from 'react-hook-form';
import {SafeAreaView} from 'react-native';
import Modal from 'react-native-modal';
import {useDispatch, useSelector} from 'react-redux';
import {authVerifyEmail} from '../../../../api/auth';
import {
  sendMobileOtp,
  updateUserMobile,
  verifyMobileOtp,
} from '../../../../api/user';
import {loginSource} from '../../../../constants/event';
import {handleLoginEvent} from '../../../../events/auth';
import useEvent from '../../../../hooks/useEvent';
import useToaster from '../../../../hooks/useToaster';
import {setUser, setUserData} from '../../../../stores/slices/user';
import {screenHeight} from '../../../../utils/common';
// import {setMoeUser} from '../../../../utils/moe';
import VerifyOtp from '../../../feature/auth/verifyOtp';
import MobileInputWithCountry from '../../../feature/verification/mobileVerify/mobileInputWithCountry';
import Toaster from '../../Toaster';
import CView from '../../core/View';
import getStyles from './style';
import {useTheme} from '@react-navigation/native';

const MobileVerification = ({
  isVisible,
  onClose,
  config = {type: 'custom'},
  defaultStep = 1,
  navigationData = {redirectToPath: null, useAs: {name: '', params: {}}},
}) => {
  const [step, setStep] = useState(defaultStep);

  const [isLoading, setIsLoading] = useState({
    mobile: false,
    optVerification: false,
  });

  const userData = useSelector(state => state.user);

  const {showToaster} = useToaster();
  const dispatch = useDispatch();

  const {defaultEventData} = useEvent();

  const {
    control,
    formState: {isValid, errors},
    getValues,
    watch,
  } = useForm({
    criteriaMode: 'all',
    mode: 'all',
    defaultValues: {
      mobile: '',
      phoneCountryCode: {
        name: 'India',
        cca2: 'IN',
        callingCode: ['91'],
      },
      terms: true,
    },
  });

  useQuery({
    queryKey: [`authVerifyEmail?token=${navigationData?.useAs?.params?.token}`],
    queryFn: () => authVerifyEmail(navigationData?.useAs?.params?.token),
    enabled: navigationData.useAs.name == 'verifyEmail',
    onSuccess: res => {
      dispatch(setUser({isGuest: false, isLoggedIn: true, ...res.data}));

      // setMoeUser(res.data?.user);

      handleLoginEvent(res?.data?.user, {
        ...defaultEventData,
        CurrentSourceName: loginSource.loginEmailSource,
      });
    },
    onError: err => {
      showToaster({
        type: 'error',
        text1: 'Error',
        text2: err.response.data.message,
      });
    },
  });

  const {mutate: updateUserMobileApi} = useMutation(
    data => updateUserMobile(data),
    {
      onSuccess: res => {
        const {mobile, phoneCountryCode} = getValues();
        const data = {
          mobile,
          phoneCountryCode: `+${phoneCountryCode.callingCode[0]}`,
          userId: userData?.userId,
        };
        sendOTPApi(data);
      },
      onError: err => {
        showToaster({
          type: 'error',
          text1: 'Error',
          text2: err.response.data.message,
        });
      },
      onSettled: () => {
        setIsLoading(prev => ({...prev, mobile: false}));
      },
    },
  );

  const {mutate: sendOTPApi} = useMutation(data => sendMobileOtp(data), {
    onSuccess: res => {
      if (step != 2) {
        handleNextStep();
      }
    },
    onError: err => {
      showToaster({
        type: 'error',
        text1: 'Error',
        text2: err.response.data.message,
      });
    },
    onSettled: () => {
      setIsLoading(prev => ({...prev, mobile: false}));
    },
  });

  const {mutate: verifyOtpApi} = useMutation(data => verifyMobileOtp(data), {
    onSuccess: res => {
      dispatch(setUserData({...userData, isMobileVerified: true}));
      onClose();
      showToaster({
        type: 'success',
        text1: 'Verified',
        text2: 'Mobile verified successfully!',
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
      setIsLoading(prev => ({...prev, optVerification: false}));
    },
  });

  const handleContinue = () => {
    setIsLoading(prev => ({...prev, mobile: true}));
    const {mobile, phoneCountryCode} = getValues();
    updateUserMobileApi({
      userId: userData?.userId,
      data: {
        mobile,
        phoneCountryCode: `+${phoneCountryCode.callingCode[0]}`,
      },
    });
  };

  const handleVerifyOtp = otp => {
    setIsLoading(prev => ({...prev, optVerification: true}));

    verifyOtpApi({
      userId: userData?.userId,
      data: {
        otp: otp,
      },
    });
  };

  const handleSwipeComplete = () => {
    onClose();
  };

  const handleNextStep = () => {
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setStep(step == 1 ? 1 : step - 1);
  };

  const resendOTP = useCallback(() => {
    const {mobile, phoneCountryCode} = getValues();
    const data = {
      mobile,
      phoneCountryCode: `+${phoneCountryCode.callingCode[0]}`,
      userId: userData?.userId,
    };
    sendOTPApi(data);
  }, [getValues, sendOTPApi, userData?.userId]);

  const formRenderer = () => {
    return (
      <>
        {step === 1 ? (
          <MobileInputWithCountry
            handleContinue={handleContinue}
            nextStep={handleNextStep}
            control={control}
            isValid={isValid}
            isLoading={isLoading.mobile}
          />
        ) : (
          <VerifyOtp
            handlePreviousStep={handlePreviousStep}
            resendOtp={resendOTP}
            handleVerifyOtp={handleVerifyOtp}
            header={{
              label: 'Otp verification',
              description: `Enter the otp sent to ${
                `+${watch('phoneCountryCode').callingCode[0]}` ||
                watch('phoneCountryCode').dial_code
              }${watch('mobile')}`,
            }}
            isLoading={isLoading.optVerification}
          />
        )}
      </>
    );
  };

  const {mode} = useTheme();

  const styles = getStyles(mode);

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      swipeDirection={['down']}
      propagateSwipe
      style={{...styles.modal}}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
      avoidKeyboard={config.type == 'max' ? false : true}
      onSwipeComplete={handleSwipeComplete}>
      <SafeAreaView
        style={{
          ...styles.modalContainer,
          height: screenHeight * (config.type == 'max' ? 1 : 0.45),
        }}>
        <CView style={styles.modalContent}>{formRenderer()}</CView>
        <Toaster />
      </SafeAreaView>
    </Modal>
  );
};

export default MobileVerification;
