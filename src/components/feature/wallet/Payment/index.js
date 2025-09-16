import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Modal from 'react-native-modal';
import styles from './style';
import { Colors } from '../../../common/core/colors';
import CButton from '../../../common/core/Button';
import { useNavigation } from '@react-navigation/native';
import useToaster from '../../../../hooks/useToaster';
import CView from '../../../common/core/View';
import CText from '../../../common/core/Text';
import { validatePayment } from '../../../../api/trade';
import appImages from '../../../../resource/images';

const PaymentWebView = ({ url }) => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [isStatusModal, setIsStatusModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  const { showToaster } = useToaster();

  const handleMessage = event => {
    const message = JSON.parse(event.nativeEvent.data);
    if (message.status === 'userCancelled') {
      navigation.goBack();
      return;
    }
    setIsLoading(true);
    setIsStatusModal(true);
    handleValidatePayment(message.txnid);
  };

  const { mutate: handleValidatePayment } = useMutation(
    orderId => validatePayment(orderId),
    {
      onSuccess: ({ data }) => {
        setPaymentStatus(data.paymentStatus);
        setIsLoading(false);
      },
      onError: error => {
        showToaster({
          type: 'error',
          text1: 'Error',
          text2: error?.response?.data?.message,
        });
      },
    }
  );

  const handleClose = () => {
    setIsStatusModal(false);
    navigation.goBack();
  };
  return (
    <>
      <SafeAreaView style={styles.container}>
        {url && (
          <WebView
            source={{
              uri: url,
            }}
            onMessage={handleMessage}
            onError={error => console.log('WebView Error:', error)}
            style={styles.container}
          />
        )}
        <Modal
          isVisible={isStatusModal}
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
                  <Image
                    source={appImages.closeIcon}
                    style={styles.closeButton}
                  />
                </TouchableOpacity>
              </CView>
              <CView centered style={styles.alignContentCenter}>
                {isLoading ? (
                  <CView>
                    <CText centered size="large">
                      Verifying
                    </CText>
                    <ActivityIndicator
                      color={Colors.Palette.brandPink}
                      size="large"
                    />
                  </CView>
                ) : (
                  <CView centered>
                    <CText centered size="large">
                      Payment Verification {paymentStatus}
                    </CText>
                    {paymentStatus == 'SUCCESS' ? (
                      <Image
                        source={appImages.fanCardSuccess}
                        style={styles.successIcon}
                      />
                    ) : (
                      <Image
                        source={appImages.warningIcon}
                        style={styles.modalLogo}
                      />
                    )}
                  </CView>
                )}

                <CView centered row style={styles.btnContainer}>
                  <CButton
                    size="large"
                    buttonType="primary"
                    text="Done"
                    isGradientButton
                    onPress={handleClose}
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
          </CView>
        </Modal>
      </SafeAreaView>
    </>
  );
};

export default PaymentWebView;
