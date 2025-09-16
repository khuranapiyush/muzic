import { useNavigation, useTheme } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import { useDispatch } from 'react-redux';
import { cancelOrder, getFanCardBuySellStatus } from '../../../../api/trade';
import useToaster from '../../../../hooks/useToaster';
import ROUTE_NAME from '../../../../navigator/config/routeName';
import appImages from '../../../../resource/images';
import { setChildTabIndex } from '../../../../stores/slices/trade';
import { dollarToInrWithRupeeSign } from '../../../../utils/common';
import ConfirmDialogBox from '../../../common/Modal/ConfirmBox';
import Toaster from '../../../common/Toaster';
import CButton from '../../../common/core/Button';
import Divider from '../../../common/core/Divider';
import CText from '../../../common/core/Text';
import CView from '../../../common/core/View';
import getStyles from './style';

const MarketPlaceOrderPopup = ({
  isVisible,
  onClose,
  config = { type: 'custom' },
  orderId = '',
  type = 'BUY',
}) => {
  const handleSwipeComplete = useCallback(() => {
    onClose();
  }, [onClose]);

  const { showToaster } = useToaster();

  const { mode } = useTheme();
  const styles = getStyles(mode);

  const navigation = useNavigation();
  const [orderResult, setOrderResult] = useState({});
  const [orderStatus, setOrderStatus] = useState();

  const [isConfirmBoxOpen, setIsConfirmBoxOpen] = useState(false);

  const { mutate: getStatus } = useMutation(
    () => getFanCardBuySellStatus({ orderId: orderId }),
    {
      onSuccess: ({ data }) => {
        setOrderStatus(data?.results?.[0]?.status);
        setOrderResult(data?.results?.[0]);
      },
      onError: error => {
        alert(error?.response?.data?.message);
      },
    }
  );

  useEffect(() => {
    let timer;
    timer = setTimeout(() => getStatus(), 2000);
    return () => {
      clearTimeout(timer);
      setOrderResult({});
      setOrderStatus('');
    };
  }, [getStatus]);

  const handleCancelOrder = () => {
    handleCancelOrderApi();
  };
  const handleNo = () => {
    setIsConfirmBoxOpen(false);
  };

  const PartialSuccessList = () => (
    <CView style={styles.listContainer}>
      <CView centered row>
        <CText style={styles.listTitle}>Requested Quantity</CText>
        <CText size="mediumBold" style={styles.listValue}>
          {orderResult.quantity}
        </CText>
      </CView>
      <Divider customStyle={styles.dividerStyle} />
      <CView row>
        <CText style={styles.listTitle}>
          {type == 'BUY' ? 'Quantity Bought' : 'Quantity Sold'}
        </CText>
        <CText size="mediumBold" style={styles.listValue}>
          {orderResult.executedQuantity}
        </CText>
      </CView>
      <Divider customStyle={styles.dividerStyle} />
      <CView row>
        <CText style={styles.listTitle}>Pending Quantity</CText>
        <CText size="mediumBold" style={styles.listValue}>
          {orderResult.quantity - orderResult.executedQuantity}
        </CText>
      </CView>
      <Divider customStyle={styles.dividerStyle} />
      <CView row>
        <CText style={styles.listTitle}>
          {type == 'BUY' ? 'Buy Price' : 'Sell Price'}
        </CText>
        <CText size="mediumBold" style={styles.listValue}>
          {dollarToInrWithRupeeSign(
            orderResult?.orderInfo?.totalTokenAmount /
              orderResult.executedQuantity
          )}
        </CText>
      </CView>
      <Divider customStyle={styles.dividerStyle} />
      <CView row>
        <CText style={styles.listTitle}>Amount</CText>
        <CText size="mediumBold" style={styles.listValue}>
          {dollarToInrWithRupeeSign(orderResult?.orderInfo?.totalTokenAmount)}
        </CText>
      </CView>
      <Divider customStyle={styles.dividerStyle} />
      <CView row>
        <CText style={styles.listTitle}>Fees</CText>
        <CText size="mediumBold" style={styles.listValue}>
          0
        </CText>
      </CView>
    </CView>
  );

  const SuccessList = () => (
    <CView style={styles.listContainer}>
      <CView centered row>
        <CText style={styles.listTitle}>Quantity</CText>
        <CText size="mediumBold" style={styles.listValue}>
          {orderResult?.quantity}
        </CText>
      </CView>
      <Divider customStyle={styles.dividerStyle} />
      <CView row>
        <CText style={styles.listTitle}>Buy Price</CText>
        <CText size="mediumBold" style={styles.listValue}>
          {dollarToInrWithRupeeSign(
            orderResult?.orderInfo?.totalTokenAmount / orderResult?.quantity
          )}
        </CText>
      </CView>
      <Divider customStyle={styles.dividerStyle} />
      <CView row>
        <CText style={styles.listTitle}>Amount</CText>
        <CText size="mediumBold" style={styles.listValue}>
          {dollarToInrWithRupeeSign(orderResult?.orderInfo?.totalTokenAmount)}
        </CText>
      </CView>
      <Divider customStyle={styles.dividerStyle} />
      <CView row>
        <CText style={styles.listTitle}>Fees</CText>
        <CText size="mediumBold" style={styles.listValue}>
          0.0
        </CText>
      </CView>
    </CView>
  );

  const handleCheckPortfolio = useCallback(() => {
    onClose();
    navigation.navigate(ROUTE_NAME.Trade, { parentIdx: 0, childIdx: 1 });
  }, [navigation, onClose]);

  const handleOrderHistory = useCallback(() => {
    onClose();
    navigation.navigate(ROUTE_NAME.Trade, { parentIdx: 0, childIdx: 2 });
  }, [navigation, onClose]);

  const handleCheckOrder = useCallback(() => {
    onClose();
    navigation.navigate(ROUTE_NAME.Trade, { parentIdx: 0, childIdx: 2 });
  }, [navigation, onClose]);

  const handleCancelOrderBtn = useCallback(() => {
    setIsConfirmBoxOpen(true);
  }, []);

  const { mutate: handleCancelOrderApi } = useMutation(
    () => cancelOrder(orderId),
    {
      onSuccess: ({ data }) => {
        showToaster({
          type: 'success',
          text1: 'Success',
          text2: 'Order Canceled Successfully!',
        });
        setIsConfirmBoxOpen(false);
      },
      onError: error => {
        showToaster({
          type: 'error',
          text1: 'Error',
          text2: error?.response?.data?.message,
        });
        setIsConfirmBoxOpen(false);
      },
    }
  );

  const handleClosePopup = useCallback(() => {
    setIsConfirmBoxOpen(false);
  }, []);

  return (
    <CView>
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
                  {orderStatus == 'SUCCESS' ||
                  orderStatus == 'PARTIAL_SUCCESS' ? (
                    <CView style={styles.marginBottom15}>
                      <CText size="large" color="commonBlack">
                        Congratulation
                      </CText>
                    </CView>
                  ) : orderStatus == 'PENDING' ? (
                    <CView>
                      <CText size="large" color="commonBlack">
                        Order Pending
                      </CText>
                    </CView>
                  ) : (
                    <CView centered>
                      <CText centered size="large" color="commonBlack">
                        {type == 'BUY'
                          ? 'We are Minting your FanCard'
                          : 'Order Place in progress '}
                      </CText>
                      <Image
                        source={appImages.mintingFanCard}
                        style={styles.mintingIconStyle}
                      />
                      <CText centered size="normal" color="commonBlack">
                        Please wait
                      </CText>
                    </CView>
                  )}

                  {orderStatus == 'PENDING' && (
                    <CView>
                      <CText color="commonBlack" style={styles.marginTop20}>
                        Your order cannot be executed at the moment. Your order
                        is in pending state and will be executed as soon as
                        there will be availability.
                      </CText>
                    </CView>
                  )}
                  {orderStatus == 'SUCCESS' && (
                    <CView>
                      <CText color="commonBlack">
                        You have successfully
                        {type == 'BUY' ? ' bought ' : ' sold '}
                      </CText>
                      <CText
                        centered
                        style={styles.fontBold}
                        color="commonBlack">
                        {orderResult?.quantity}{' '}
                        {orderResult?.tierDetails?.tierName} Cards
                      </CText>
                    </CView>
                  )}
                  {orderStatus == 'PARTIAL_SUCCESS' && (
                    <CView>
                      <CText centered color="commonBlack">
                        Your order is partially executed. You have successfully
                        {type == 'BUY' ? ' bought ' : ' sold '}
                        <CText style={styles.fontBold} color="commonBlack">
                          {orderResult?.executedQuantity}{' '}
                          {orderResult?.tierDetails?.tierName} Cards.{' '}
                        </CText>
                        Pending quantity will be executed as soon as there is
                        availability.
                      </CText>
                    </CView>
                  )}
                  {(orderStatus == 'SUCCESS' ||
                    orderStatus == 'PARTIAL_SUCCESS') && (
                    <Image
                      source={appImages.fanCardSuccess}
                      style={styles.successIcon}
                    />
                  )}
                </CView>

                {orderStatus == 'SUCCESS' ? (
                  <SuccessList />
                ) : orderStatus == 'PARTIAL_SUCCESS' ? (
                  <PartialSuccessList />
                ) : null}

                {orderStatus && (
                  <CView centered row style={styles.btnContainer}>
                    {orderStatus == 'PENDING' ? (
                      <CButton
                        size="large"
                        buttonType="secondary"
                        text="Cancel Order"
                        onPress={handleCancelOrderBtn}
                        customStyles={{
                          buttonTextStyles: styles.submitBtn,
                          buttonStyle: {
                            minWidth: '45%',
                          },
                        }}
                      />
                    ) : (
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
                    )}
                    {orderStatus == 'PENDING' ? (
                      <CButton
                        size="large"
                        buttonType="primary"
                        text="Order History"
                        isGradientButton
                        onPress={handleOrderHistory}
                        customStyles={{
                          buttonTextStyles: styles.submitBtn,
                          buttonStyle: {
                            minWidth: '45%',
                          },
                        }}
                      />
                    ) : (
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
                    )}
                  </CView>
                )}
              </CView>
              <Toaster />
            </CView>
          </ScrollView>
        </CView>
        {isConfirmBoxOpen && (
          <ConfirmDialogBox
            isOpen={isConfirmBoxOpen}
            labelNo="NO"
            labelYes="Yes, Cancel"
            handleYes={handleCancelOrder}
            handleNo={handleNo}
            title="Are you sure you want to cancel your order ?"
            handleClose={handleClosePopup}
          />
        )}
      </Modal>
    </CView>
  );
};

export default MarketPlaceOrderPopup;
