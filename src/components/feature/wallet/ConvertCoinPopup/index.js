import React, { useCallback } from 'react';
import { Image, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import appImages from '../../../../resource/images';
import Toaster from '../../../common/Toaster';
import CText from '../../../common/core/Text';
import CView from '../../../common/core/View';
import styles from './style';
import AutoHeightImage from 'react-native-auto-height-image';
import { screenWidth } from '../../../../utils/common';

const ConvertCoinPopup = ({
  contentUrl,
  isVisible,
  onClose,
  config = { type: 'custom' },
}) => {
  console.log('🚀 ~ contentUrl:', contentUrl);
  const handleSwipeComplete = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <CView>
      <Modal
        isVisible={isVisible}
        swipeDirection={['down']}
        propagateSwipe
        style={{ ...styles.modal }}
        animationIn="slideInUp"
        onBackdropPress={handleSwipeComplete}
        animationOut="slideOutDown"
        backdropOpacity={0.5}
        onSwipeComplete={handleSwipeComplete}
        avoidKeyboard={config.type == 'max' ? false : true}>
        <CView style={styles.container}>
          <CView contentContainerStyle={styles.content}>
            <CView style={styles.modalContainer}>
              <CView style={styles.modalContent}>
                <CView row style={styles.titleContainer}>
                  <TouchableOpacity onPress={handleSwipeComplete}>
                    <Image
                      source={appImages.closeIcon}
                      style={styles.closeButton}
                    />
                  </TouchableOpacity>
                </CView>
                <CView centered style={styles.paddingLeftRight}>
                  <CView>
                    <CText size="large">How It Works</CText>
                  </CView>
                </CView>
                <CView style={styles.configContainer}>
                  <AutoHeightImage
                    source={{ uri: contentUrl }}
                    width={screenWidth - 20}
                  />
                </CView>
              </CView>
              <Toaster />
            </CView>
          </CView>
        </CView>
      </Modal>
    </CView>
  );
};

export default ConvertCoinPopup;
