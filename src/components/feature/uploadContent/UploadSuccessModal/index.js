import React from 'react';
import { Image, Modal } from 'react-native';

import styles from './style';
import appImages from '../../../../resource/images';
import CButton from '../../../common/core/Button';
import CView from '../../../common/core/View';
import CText from '../../../common/core/Text';

const UploadSuccessModal = ({ isVisible, onClose }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}>
      <CView style={styles.modalContainer}>
        <CView style={styles.modalContent}>
          <CView row style={styles.modalLogoContainer}>
            <Image
              source={appImages.successTickIcon}
              style={styles.modalLogo}
            />
          </CView>
          <CText style={styles.modalHeading}> Congratulations </CText>
          <CText style={styles.modalText}>
            Your video has been uploaded successfully.
          </CText>
          <CView row style={styles.btnContainer}>
            <CButton
              size="large"
              buttonType="primary"
              text="Close"
              isGradientButton
              onPress={onClose}
              customStyles={{ buttonTextStyles: styles.submitBtn }}
            />
          </CView>
        </CView>
      </CView>
    </Modal>
  );
};

export default UploadSuccessModal;
