import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import { useDispatch } from 'react-redux';
import { getFanCardBuySellStatus } from '../../../../api/trade';
import ROUTE_NAME from '../../../../navigator/config/routeName';
import appImages from '../../../../resource/images';
import { setChildTabIndex } from '../../../../stores/slices/trade';
import Toaster from '../../../common/Toaster';
import CButton from '../../../common/core/Button';
import CText from '../../../common/core/Text';
import CView from '../../../common/core/View';
import styles from './style';

const PreSaleOrderPopup = ({
  isVisible,
  onClose,
  config = { type: 'custom' },
  orderId = '',
  isOpen = '',
  handleClose = '',
  type = 'BUY',
  setSnackbar = '',
}) => {
  const handleSwipeComplete = () => {
    onClose();
  };
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [orderResult, setOrderResult] = useState({});
  const [orderStatus, setOrderStatus] = useState();

  const [isMinted, setIsMinted] = useState(false);

  const [nftInterval, setNftInterval] = useState(false);

  const { mutate: getStatus } = useMutation(
    () => getFanCardBuySellStatus(orderId),
    {
      onSuccess: ({ data }) => {
        if (data.results[0].status == 'SUCCESS') {
          clearInterval(nftInterval);
          setIsMinted(true);
        }
        setOrderStatus(data?.results?.[0]?.status);
        setOrderResult(data?.results?.[0]);
      },
      onError: error => {
        alert(error?.response?.data?.message);
      },
    }
  );

  useEffect(() => {
    if (orderId && !isMinted) {
      getStatus();
      var interval = setInterval(() => {
        getStatus();
      }, 2000);
      setNftInterval(interval);
      if (isMinted) {
        clearInterval(interval);
      }
      return () => {
        clearInterval(interval);
      };
    }
  }, [getStatus, isMinted, orderId]);

  const handleCheckPortfolio = () => {
    onClose();
    dispatch(setChildTabIndex(1));
    navigation.navigate(ROUTE_NAME.Trade, { parentIdx: 0 });
  };

  const handleCheckOrder = () => {
    onClose();
    dispatch(setChildTabIndex(2));
    navigation.navigate(ROUTE_NAME.Trade, { parentIdx: 0 });
  };

  return (
    <Modal
      isVisible={isVisible}
      swipeDirection={null}
      propagateSwipe
      style={{ ...styles.modal }}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
      avoidKeyboard={config.type == 'max' ? false : true}>
      <CView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
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
                {orderStatus == 'SUCCESS' ? (
                  <CView centered>
                    <CView style={styles.marginBottom15}>
                      <CText size="large">Congratulation</CText>
                    </CView>
                    <CView centered>
                      <CText>
                        You have successfully
                        {type == 'BUY' ? ' bought ' : ' sold '}
                      </CText>
                      <CText centered style={styles.fontBold}>
                        {orderResult?.quantity}{' '}
                        {orderResult?.tierDetails?.tierName} Card
                      </CText>
                      <Image
                        source={appImages.fanCardSuccess}
                        style={styles.successIcon}
                      />
                    </CView>
                  </CView>
                ) : orderStatus == 'PENDING' ? (
                  <CView centered>
                    <CText centered size="large">
                      We are Minting your FanCard
                    </CText>
                    <Image
                      source={appImages.mintingFanCard}
                      style={styles.mintingIconStyle}
                    />
                    <CText centered size="normal">
                      Please wait
                    </CText>
                  </CView>
                ) : (
                  <CView centered>
                    <CText centered size="normal">
                      Please wait
                    </CText>
                  </CView>
                )}
              </CView>

              {orderStatus == 'SUCCESS' && (
                <CView centered row style={styles.btnContainer}>
                  <CButton
                    size="large"
                    buttonType="secondary"
                    text="Check Order"
                    onPress={handleCheckOrder}
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
                    text="Check Portfolio"
                    isGradientButton
                    onPress={handleCheckPortfolio}
                    customStyles={{
                      buttonTextStyles: styles.submitBtn,
                      buttonStyle: {
                        minWidth: '45%',
                      },
                    }}
                  />
                </CView>
              )}
            </CView>
            <Toaster />
          </CView>
        </ScrollView>
      </CView>
    </Modal>
  );
};

export default PreSaleOrderPopup;
