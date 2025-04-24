import {useNavigation, useTheme} from '@react-navigation/native';
import {useMutation} from '@tanstack/react-query';
import React, {useCallback, useEffect} from 'react';
import {Image, SafeAreaView} from 'react-native';
import Modal from 'react-native-modal';
import {useDispatch, useSelector} from 'react-redux';
import {deleteAccount} from '../../../../api/auth';
import useToaster from '../../../../hooks/useToaster';
import appImages from '../../../../resource/images';
import {resetUser} from '../../../../stores/slices/user';
import {screenHeight} from '../../../../utils/common';
import Toaster from '../../../common/Toaster';
import CButton from '../../../common/core/Button';
import CText from '../../../common/core/Text';
import CView from '../../../common/core/View';
import getStyles from './style';

const DeleteAccount = ({
  isVisible,
  onClose,
  config = {type: 'max'},
  defaultStep = 1,
  customStyles = {},
}) => {
  const navigator = useNavigation();
  const {showToaster} = useToaster();
  const dispatch = useDispatch();
  const {accessToken} = useSelector(state => state.auth);

  // Log when modal visibility changes
  useEffect(() => {
    console.log('Delete Account Modal visibility:', isVisible);
  }, [isVisible]);

  const handleSwipeComplete = () => {
    console.log('Modal swipe complete, closing');
    onClose();
  };

  const {mutate: deleteAccountApi, isLoading} = useMutation(
    () => {
      console.log(
        'Making API call to delete account with token present:',
        !!accessToken,
      );
      return deleteAccount();
    },
    {
      onSuccess: res => {
        console.log('Delete account API success:', res);
        onClose();
        showToaster({
          type: 'success',
          text1: 'Success',
          text2: 'Account Deleted Successfully',
        });
        // Delay logout to allow modal to close and toast to show
        setTimeout(() => {
          dispatch(resetUser());
          navigator.navigate('Home');
        }, 1000);
      },
      onError: err => {
        console.error('Delete account API error:', err);
        // Handle authentication errors specifically
        if (err.message === 'Authentication token is missing') {
          showToaster({
            type: 'error',
            text1: 'Authentication Error',
            text2: 'You need to be logged in to delete your account',
          });
        } else if (err.response?.data?.message) {
          showToaster({
            type: 'error',
            text1: 'Error',
            text2: err.response.data.message,
          });
        } else {
          showToaster({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to delete account. Please try again.',
          });
        }
        onClose();
      },
    },
  );

  const handleDelete = useCallback(() => {
    // Check if we have a token before attempting to delete
    if (!accessToken) {
      showToaster({
        type: 'error',
        text1: 'Authentication Error',
        text2: 'You need to be logged in to delete your account',
      });
      onClose();
      return;
    }

    console.log('Delete button clicked, calling API');
    deleteAccountApi();
  }, [deleteAccountApi, accessToken, showToaster, onClose]);

  const handleCancel = useCallback(() => {
    console.log('Cancel button clicked, closing modal');
    onClose();
  }, [onClose]);

  const {mode} = useTheme();
  const styles = getStyles(mode);

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={handleCancel}
      onBackButtonPress={handleCancel}
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
          height: screenHeight * (config.type == 'max' ? 0.5 : 0.5),
        }}>
        <CView style={styles.modalContent}>
          <CText centered size="large">
            Delete Account
          </CText>
          <CView row style={styles.modalLogoContainer}>
            <Image source={appImages.warningIcon} style={styles.modalLogo} />
          </CView>
          <CText style={styles.modalHeading}>
            Are you sure you want to delete your account?
          </CText>
          <CText style={styles.modalText}>
            This action cannot be undone. Deleting your account will permanently
            remove:
          </CText>
          <CView style={styles.listContainer}>
            <CText style={styles.listItem}>
              • Your profile and personal information
            </CText>
            <CText style={styles.listItem}>
              • All your generated songs and audio files
            </CText>
            <CText style={styles.listItem}>
              • Subscription and credit information
            </CText>
            <CText style={styles.listItem}>
              • All data associated with your account
            </CText>
          </CView>
          <CView row style={styles.btnContainer}>
            <CButton
              size="large"
              buttonType="secondary"
              text="Cancel"
              onPress={handleCancel}
              backgroundColor={'transparent'}
              customStyles={{buttonTextStyles: styles.submitBtn}}
            />
            <CButton
              size="large"
              buttonType="primary"
              text="Delete"
              isGradientButton
              onPress={handleDelete}
              loading={isLoading}
              customStyles={{buttonTextStyles: styles.submitBtn}}
            />
          </CView>
        </CView>
        <Toaster />
      </SafeAreaView>
    </Modal>
  );
};

export default DeleteAccount;
