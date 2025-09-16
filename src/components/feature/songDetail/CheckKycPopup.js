import React from 'react';
import { Image, Pressable, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import styles from './style';
import appImages from '../../../resource/images';
import CText from '../../common/core/Text';
import CView from '../../common/core/View';
import CButton from '../../common/core/Button';
const CheckKycPopup = ({
  isOpen,
  title = 'Please Complete your KYC',
  handleClose,
  handlePressBtn,
}) => {
  return (
    <Modal
      isVisible={isOpen}
      swipeDirection={null}
      propagateSwipe
      style={{ ...styles.modal }}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
      avoidKeyboard={true}>
      <CView>
        <CView style={styles.modalContainer}>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeBtnWrapper}>
            <Image source={appImages.closeIcon} style={styles.closeIcon} />
          </TouchableOpacity>
          <CView centered style={styles.marginTop20}>
            <CText centered size="mediumBold">
              {title}
            </CText>
            <Image source={appImages.warningIcon} style={styles.modalLogo} />
          </CView>

          <CView centered row style={styles.btnContainer}>
            <CButton
              size="large"
              buttonType="primary"
              text="Complete Your KYC"
              isGradientButton
              onPress={handlePressBtn}
              customStyles={{
                buttonTextStyles: styles.submitBtn,
              }}
            />
          </CView>
        </CView>
      </CView>
    </Modal>
  );
};

export default CheckKycPopup;
