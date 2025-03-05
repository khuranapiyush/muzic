import {useMutation} from '@tanstack/react-query';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useForm} from 'react-hook-form';
import {Image} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {useSelector} from 'react-redux';
import {sellMarketPlaceFanCard} from '../../../../api/trade';
import useToaster from '../../../../hooks/useToaster';
import useTrading from '../../../../hooks/useTrading';
import appImages from '../../../../resource/images';
import {
  dollarToInr,
  dollarToInrWithRupeeSign,
  percentValue,
  round,
} from '../../../../utils/common';
import TextInputFC from '../../../common/FormComponents/TextInputFC';
import CButton from '../../../common/core/Button';
import CheckBox from '../../../common/core/Checkbox';
import Divider from '../../../common/core/Divider';
import CText from '../../../common/core/Text';
import CView from '../../../common/core/View';
import MarketPlaceOrderPopup from '../MarketPlaceOrderPopup';
import getStyles from './style';
import {useTheme} from '@react-navigation/native';

const MarketPlaceSell = ({route}) => {
  const {currentPrice, maxQuantityForSell, lowerLimit, higherLimit} =
    useTrading(route.params.songData);

  const {mode} = useTheme();

  const styles = getStyles(mode);

  const {buyPrice = 0} = currentPrice || {};
  const tierId = route.params.songData.tierId;
  const {control, reset, watch, setValue} = useForm({
    criteriaMode: 'all',
    mode: 'all',
    defaultValues: {
      orderType: 'Instant',
      quantity: '1',
      price: '',
      term: true,
    },
  });
  const {showToaster} = useToaster();

  const {fantigerCoin: fanTvCoin, balance} = useSelector(
    state => state.walletStats,
  );

  const [orderType, setOrderType] = useState('Instant');
  const [orderId, setOrderId] = useState('');

  const [toBePaid, setToBePaid] = useState('');
  const [totalPrice, setTotalPrice] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const [isMarketPlacePopupShow, setIsMarketPlaceBuyPopupShow] =
    useState(false);

  const handleOrderTypeChange = type => {
    setOrderType(type);
  };

  const {term, price, quantity} = watch();

  const isQuantityValid = useMemo(
    () => !!(quantity <= maxQuantityForSell && quantity > 0),
    [maxQuantityForSell, quantity],
  );

  const isLimitPriceValid = useMemo(
    () =>
      parseFloat(price) >= parseFloat(lowerLimit) &&
      parseFloat(price) <= parseFloat(higherLimit),
    [higherLimit, lowerLimit, price],
  );
  const count = useMemo(
    () => (quantity <= maxQuantityForSell && quantity > 0 ? quantity : 1),
    [maxQuantityForSell, quantity],
  );

  const brokerageAmount = useMemo(
    () =>
      orderType == 'Instant'
        ? percentValue(dollarToInr(buyPrice) * count, 0.5)
        : percentValue(price * count, 0.5),
    [buyPrice, orderType, price, count],
  );

  useEffect(() => {
    if (orderType == 'Instant') {
      let temp = dollarToInr(buyPrice) * count - brokerageAmount;
      setToBePaid(round(temp));
      setTotalPrice(dollarToInr(buyPrice) * count);
    } else {
      let temp = price * count - brokerageAmount;
      setTotalPrice(price * count);
      setToBePaid(round(temp));
    }
  }, [brokerageAmount, buyPrice, count, orderType, price]);

  useEffect(() => {
    reset(formValues => ({
      ...formValues,
      price: dollarToInr(buyPrice).toString(),
    }));
  }, [buyPrice, reset]);

  const handlePlaceOrder = useCallback(() => {
    setIsLoading(true);
    let requestBody = {
      tierId: tierId,
      quantity: count,
      deviceInfo: {source: 'ios'},
    };
    if (orderType == 'Limit') {
      requestBody['price'] = round(price / 80, 6);
    }
    ConfirmSellNFT(requestBody);
  }, [ConfirmSellNFT, count, orderType, price, tierId]);

  const handleClosePopup = useCallback(() => {
    setIsMarketPlaceBuyPopupShow(false);
  }, []);

  const {mutate: ConfirmSellNFT} = useMutation(
    requestBody => sellMarketPlaceFanCard(requestBody),
    {
      onSuccess: ({data}) => {
        setOrderId(data?.orderId);
        setIsMarketPlaceBuyPopupShow(true);
        setIsLoading(false);
      },
      onError: err => {
        showToaster({
          type: 'error',
          text1: 'Error',
          text2: err.response.data.message,
        });
        console.log('Error message Print ===', err.response.data.message);
        setIsLoading(false);
      },
    },
  );

  return (
    <CView style={styles.flex}>
      <CView style={styles.wrapper}>
        <ScrollView>
          <CView row centered>
            <Image source={appImages.walletIcon} style={styles.walletIcon} />
            <CText size="normalBold">
              Wallet Balance {dollarToInrWithRupeeSign(balance)}
            </CText>
            <CText style={styles.flex} />
            <Image source={appImages.coin} style={styles.coinIcon} />
            <CText size="normalBold">{fanTvCoin}</CText>
          </CView>
          <Divider customStyle={styles.dividerStyle} />
          <CView row>
            <CText>Current Price</CText>
            <CText style={styles.flex} />
            <CText size="normalBold">
              {dollarToInrWithRupeeSign(buyPrice)}
            </CText>
          </CView>
          <Divider customStyle={styles.dividerStyle} />
          <CView>
            <CText size="mediumBold">Order Type</CText>
            <CView row style={styles.marginTop20}>
              <CView style={styles.marginRight20}>
                <CButton
                  size="small"
                  buttonType={orderType == 'Instant' ? 'primary' : 'secondary'}
                  text="Instant"
                  isGradientButton={orderType == 'Instant' ? true : false}
                  onPress={() => handleOrderTypeChange('Instant')}
                  customStyles={styles.buttonGradient}
                />
              </CView>
              <CView>
                <CButton
                  size="small"
                  buttonType={orderType == 'Limit' ? 'primary' : 'secondary'}
                  text="Limit"
                  isGradientButton={orderType == 'Limit' ? true : false}
                  onPress={() => handleOrderTypeChange('Limit')}
                  customStyles={styles.buttonGradient}
                />
              </CView>
            </CView>
          </CView>
          <CView>
            <CView style={styles.paddingTop20}>
              <CText size="mediumBold">Quantity</CText>
              <TextInputFC
                control={control}
                inputMode="numeric"
                name="quantity"
                autoComplete="off"
                autoCorrect={false}
                rules={{
                  required: 'Name is required',
                }}
                style={isQuantityValid ? styles.input : styles.errorInput}
              />
              <CText size="small">
                Max quantity Allowed: {maxQuantityForSell}
              </CText>
              {!isQuantityValid && (
                <CView row style={styles.errorContainer}>
                  <Image
                    source={appImages.invalidQuantity}
                    style={styles.errorIcon}
                  />
                  <CText style={styles.errorColor}>invalid quantity</CText>
                </CView>
              )}
            </CView>
            {orderType == 'Limit' && (
              <CView style={styles.paddingTop10}>
                <CText size="mediumBold">Price</CText>
                <TextInputFC
                  control={control}
                  name="price"
                  autoFocus={false}
                  style={styles.input}
                />
                {isLimitPriceValid ? (
                  <CText size="small">
                    Order will be executed at ₹{price} or lower
                  </CText>
                ) : (
                  <CText size="small" style={styles.errorColor}>
                    Price limit should be between {lowerLimit} to {higherLimit}
                    rupees
                  </CText>
                )}
              </CView>
            )}
          </CView>
          <Divider customStyle={styles.dividerStyle} />
          <CView>
            <CView row style={styles.paddingBottom8}>
              <CText>Total Price</CText>
              <CText style={styles.flex} />
              <CText size="normalBold">₹{round(totalPrice)}</CText>
            </CView>

            <CView row style={styles.paddingBottom8}>
              <CText>Brokerage Amount</CText>
              <CText style={styles.flex} />
              <CText size="normalBold">-₹{brokerageAmount}</CText>
            </CView>
          </CView>

          <CView>
            <CView row centered style={styles.alignCheckBox}>
              <CView style={styles.flex}>
                <CheckBox
                  customStyles={{
                    containerStyle: {
                      padding: 0,
                      marginLeft: 0,
                      marginRight: 0,
                    },
                  }}
                  checked={term}
                  onPress={() => setValue('term', !term)}
                />
              </CView>
              <CView style={styles.flex10}>
                <CText>
                  I agree to FanTV's Terms of Use. I acknowledge that price of
                  product purchased here is subject to market risk and this
                  transaction cannot be cancelled, recalled or refunded. In no
                  event shall FanTV be held liable for any damages or losses
                  arising in connection with the use of FanTV Platform.
                </CText>
              </CView>
            </CView>
          </CView>

          <CView style={styles.marginTop20}>
            <CButton
              size="large"
              buttonType="primary"
              text="Continue"
              isLoading={isLoading}
              disabled={!isQuantityValid || !isLimitPriceValid}
              isGradientButton
              onPress={handlePlaceOrder}
              customStyles={styles.placeOrderBtn}
            />
          </CView>
          <CText style={styles.toBePaidStyle} centered size="small">
            ₹{round(toBePaid)} will be credited to your wallet which you can
            withdraw any time
          </CText>
        </ScrollView>
      </CView>
      {isMarketPlacePopupShow && (
        <MarketPlaceOrderPopup
          orderId={orderId}
          isVisible={isMarketPlacePopupShow}
          onClose={handleClosePopup}
          type="SELL"
        />
      )}
    </CView>
  );
};

export default MarketPlaceSell;
