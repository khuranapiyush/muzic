import LottieView from 'lottie-react-native';
import React, { useEffect, useState } from 'react';
import { Image, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import appImages from '../../../../resource/images';
import CButton from '../../../common/core/Button';
import CText from '../../../common/core/Text';
import CView from '../../../common/core/View';
import styles from './style';
import appAnimations from '../../../../resource/animation';
import RenderHTML from 'react-native-render-html';
import AutoHeightImage from 'react-native-auto-height-image';
import Toaster from '../../../common/Toaster';

const ConvertCoinSuccessPopup = ({
  isOpen,
  handleRedeem,
  handleClose,
  data,
}) => {
  return (
    <Modal
      isVisible={isOpen}
      swipeDirection={['down']}
      propagateSwipe
      style={{ ...styles.modal }}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
      onBackdropPress={handleClose}
      onSwipeComplete={handleClose}
      avoidKeyboard={true}>
      <CView style={styles.container}>
        <CView style={styles.modalContainer}>
          <CView row style={styles.titleContainer}>
            <TouchableOpacity onPress={handleClose}>
              <Image source={appImages.closeIcon} style={styles.closeButton} />
            </TouchableOpacity>
          </CView>

          <CView centered>
            <CText centered size="mediumBold">
              {data?.title}
            </CText>
            <Image source={{ uri: data?.url }} style={styles.modalLogo} />

            <CView row style={{ marginTop: 20 }}>
              {data?.subtitle?.map((item, i) => (
                <CView key={i} row>
                  {item.isHtml ? (
                    <RenderHTML
                      contentWidth={screenWidth}
                      source={{
                        html: item.text,
                      }}
                      tagsStyles={tagsStyles}
                    />
                  ) : item.isUrl ? (
                    <Image
                      style={{ height: 18, width: 18 }}
                      source={{ uri: item.url }}
                    />
                  ) : (
                    <CText style={{ fontSize: 14, lineHeight: 18 }}>
                      {item.text}
                    </CText>
                  )}
                </CView>
              ))}
            </CView>
          </CView>

          <CView centered row style={styles.btnContainer}>
            <CButton
              size="large"
              buttonType="primary"
              text={data?.button?.title}
              isGradientButton
              onPress={handleRedeem}
              customStyles={{
                buttonTextStyles: styles.submitBtn,
                buttonStyle: {
                  minWidth: '100%',
                },
              }}
            />
          </CView>
        </CView>
      </CView>
    </Modal>
  );
};

export default ConvertCoinSuccessPopup;
