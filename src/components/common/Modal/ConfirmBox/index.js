import { Image, TouchableOpacity } from 'react-native';
import React from 'react';
import Modal from 'react-native-modal';
import styles from './style';
import CView from '../../core/View';
import CText from '../../core/Text';
import CButton from '../../core/Button';
import appImages from '../../../../resource/images';
const ConfirmDialogBox = ({
  isOpen,
  labelNo = 'NO',
  labelYes = 'Yes, Cancel',
  handleYes,
  handleNo,
  title = 'Are you sure you want to cancel?',
  handleClose,
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
      <CView style={styles.container}>
        <CView style={styles.modalContainer}>
          <CView row style={styles.titleContainer}>
            <TouchableOpacity onPress={handleClose}>
              <Image source={appImages.closeIcon} style={styles.closeButton} />
            </TouchableOpacity>
          </CView>
          <CView centered>
            <Image source={appImages.warningIcon} style={styles.modalLogo} />
            <CText centered size="mediumBold" color="commonBlack">
              {title}
            </CText>
          </CView>

          <CView centered row style={styles.btnContainer}>
            <CButton
              size="large"
              buttonType="secondary"
              text={labelNo}
              onPress={handleNo}
              customStyles={{
                buttonTextStyles: styles.submitBtn,
                buttonStyle: {
                  minWidth: '45%',
                },
              }}
            />
            <CButton
              size="large"
              buttonType="primary"
              text={labelYes}
              isGradientButton
              onPress={handleYes}
              customStyles={{
                buttonTextStyles: styles.submitBtn,
                buttonStyle: {
                  minWidth: '45%',
                },
              }}
            />
          </CView>
        </CView>
      </CView>
    </Modal>
  );
};

export default ConfirmDialogBox;
