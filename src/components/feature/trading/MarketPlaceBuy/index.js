import {useNavigation, useTheme} from '@react-navigation/native';
import {useMutation} from '@tanstack/react-query';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useForm} from 'react-hook-form';
import {Image, TextInput, TouchableOpacity} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {useSelector} from 'react-redux';
import useToaster from '../../../../hooks/useToaster';
import useTrading from '../../../../hooks/useTrading';
import ROUTE_NAME from '../../../../navigator/config/routeName';
import {applyPromoCode, buyMarketPlaceFanCard} from '../../../../api/trade';
import TextInputFC from '../../../common/FormComponents/TextInputFC';
import CButton from '../../../common/core/Button';
import CheckBox from '../../../common/core/Checkbox';
import Divider from '../../../common/core/Divider';
import CText from '../../../common/core/Text';
import CView from '../../../common/core/View';
import appImages from '../../../../resource/images';
import {
  coinToINR,
  dollarToInr,
  dollarToInrWithRupeeSign,
  percentValue,
  round,
} from '../../../../utils/common';
import getStyles from './style';
import MarketPlaceOrderPopup from '../MarketPlaceOrderPopup';
import Colors from '../../../common/Colors';

const MarketPlaceBuy = ({route}) => {
  const {currentPrice, maxQuantityPerUser, lowerLimit, higherLimit} =
    useTrading(route.params.songData);

  const {mode} = useTheme();
  const styles = getStyles(mode);
  const {buyPrice = 0} = currentPrice || {};
  const tierId = route.params.songData.tierId;
  const navigation = useNavigation();
  const {
    getValues,
    formState: {isValid},
    control,
    reset,
    watch,
    setValue,
  } = useForm({
    criteriaMode: 'all',
    mode: 'all',
    defaultValues: {
      orderType: 'Instant',
      quantity: '1',
      price: '',
      redeemCoin: false,
      term: true,
      promo: {
        promoCode: '',
        isPromoApplied: false,
        promoValue: 0,
        promoCoins: 0,
      },
    },
  });
  const {showToaster} = useToaster();

  const {
    fantigerCoin: fanTvCoin,
    balance,
    redeemableFantigerCoin,
  } = useSelector(state => state.walletStats);

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

  const {
    redeemCoin,
    term,
    price,
    quantity,
    promo: {promoCode, isPromoApplied, promoValue, promoCoins},
  } = watch();

  const isQuantityValid = useMemo(
    () => !!(quantity <= maxQuantityPerUser && quantity > 0),
    [maxQuantityPerUser, quantity],
  );

  const isLimitPriceValid = useMemo(
    () =>
      parseFloat(price) >= parseFloat(lowerLimit) &&
      parseFloat(price) <= parseFloat(higherLimit),
    [higherLimit, lowerLimit, price],
  );
  const count = useMemo(
    () => (quantity <= maxQuantityPerUser && quantity > 0 ? quantity : 1),
    [maxQuantityPerUser, quantity],
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
      let temp =
        dollarToInr(buyPrice) * count -
        (redeemCoin ? coinToINR(redeemableFantigerCoin) : 0) -
        promoValue * 80 +
        brokerageAmount;

      setToBePaid(round(temp));
      setTotalPrice(dollarToInr(buyPrice) * count);
    } else {
      let temp =
        price * count -
        (redeemCoin ? coinToINR(redeemableFantigerCoin) : 0) -
        promoValue * 80 +
        brokerageAmount;

      setTotalPrice(price * count);
      setToBePaid(temp);
    }
  }, [
    brokerageAmount,
    buyPrice,
    count,
    orderType,
    price,
    promoValue,
    redeemCoin,
    redeemableFantigerCoin,
  ]);

  useEffect(() => {
    reset(formValues => ({
      ...formValues,
      price: dollarToInr(buyPrice).toString(),
    }));
  }, [buyPrice, reset]);

  const {mutate: postApplyPromo} = useMutation(
    requestBody => applyPromoCode(requestBody),
    {
      onSuccess: ({data}) => {
        if (data?.data?.discountType == 'cashback') {
          setValue('promo.promoValue', 0);
          setValue('promo.promoCoins', data?.data?.cashbackCoin);
          setValue('promo.isPromoApplied', true);
        } else {
          setValue('promo.promoValue', data?.data?.discountValue);
          setValue('promo.promoCoins', 0);
          setValue('promo.isPromoApplied', true);
        }
        showToaster({
          type: 'success',
          text1: 'Success',
          text2: 'Promo Code applied successfully!',
        });
      },
      onError: error => {
        showToaster({
          type: 'error',
          text1: 'Error',
          text2: error.response.data.message,
        });
      },
    },
  );

  const handleApplyPromoCode = useCallback(() => {
    let request = {tierId: tierId, quantity: count, promoCode: promoCode};
    postApplyPromo(request);
  }, [count, postApplyPromo, promoCode, tierId]);

  const handleRemovePromo = useCallback(() => {
    setValue('promo.promoValue', 0);
    setValue('promo.promoCoins', 0);
    setValue('promo.isPromoApplied', false);
  }, [setValue]);

  const handlePlaceOrder = useCallback(() => {
    setIsLoading(true);
    let requestBody = {
      tierId: tierId,
      quantity: count,
      ...(!!redeemCoin && {fantigerCoin: redeemableFantigerCoin}),
      ...(!!promoCode && {promoCode: promoCode}),
      deviceInfo: {source: 'ios'},
    };

    if (orderType == 'Limit') {
      requestBody.price = round(price / 80, 6);
    }
    ConfirmNFT(requestBody);
  }, [
    ConfirmNFT,
    count,
    orderType,
    price,
    promoCode,
    redeemCoin,
    redeemableFantigerCoin,
    tierId,
  ]);

  const handleAddMoney = useCallback(() => {
    navigation.navigate(ROUTE_NAME.AddFund);
  }, [navigation]);

  const handleClosePopup = useCallback(() => {
    setIsMarketPlaceBuyPopupShow(false);
  }, []);

  const {mutate: ConfirmNFT} = useMutation(
    requestBody => buyMarketPlaceFanCard(requestBody),
    {
      onSuccess: ({data}) => {
        setIsLoading(false);
        setOrderId(data?.orderId);
        setIsMarketPlaceBuyPopupShow(true);
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
                Max quantity Allowed: {maxQuantityPerUser}
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
            <CView style={styles.paddingTop10}>
              <CText size="mediumBold">Promo Code</CText>
              <CView
                style={
                  isPromoApplied
                    ? styles.promoAppliedContainer
                    : styles.promoContainer
                }>
                <CView style={styles.flex4}>
                  {!isPromoApplied ? (
                    <TextInput
                      onChangeText={textEntry => {
                        setValue('promo.promoCode', textEntry);
                      }}
                      editable={!isPromoApplied}
                      style={{color: Colors[mode].white}}
                    />
                  ) : promoCoins > 0 ? (
                    <CView>
                      <CText style={styles.colorGreen}>
                        {promoCoins} coins cashback
                      </CText>
                      <CText style={styles.colorGreen}>
                        with {promoCode} coupon
                      </CText>
                    </CView>
                  ) : (
                    <CView>
                      <CText style={styles.colorGreen}>
                        {` ${dollarToInrWithRupeeSign(
                          promoValue,
                        )} total savings`}
                      </CText>
                      <CText style={styles.colorGreen}>
                        with {promoCode} coupon
                      </CText>
                    </CView>
                  )}
                </CView>
                {promoCode && (
                  <CView style={styles.flex}>
                    {isPromoApplied ? (
                      <TouchableOpacity
                        title="Remove"
                        onPress={handleRemovePromo}>
                        <CText style={styles.removeBtn}>Remove</CText>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        title="Apply"
                        onPress={handleApplyPromoCode}>
                        <CText style={styles.applyBtn}>Apply</CText>
                      </TouchableOpacity>
                    )}
                  </CView>
                )}
              </CView>
            </CView>
          </CView>
          <CView style={styles.paddingTop10}>
            <CText size="mediumBold">Redeemable Coins</CText>
            <CView row centered style={styles.alignCheckBox}>
              <CheckBox
                customStyles={{
                  containerStyle: {padding: 0, marginLeft: 0, marginRight: 0},
                }}
                checked={redeemCoin}
                onPress={() => setValue('redeemCoin', !redeemCoin)}
              />
              <CText centered>
                Maximum upto {redeemableFantigerCoin} coins can be redeemed
              </CText>
            </CView>
          </CView>
          <Divider customStyle={styles.dividerStyle} />
          <CView>
            <CView row style={styles.paddingBottom8}>
              <CText>Total Price</CText>
              <CText style={styles.flex} />
              <CText size="normalBold">₹{round(totalPrice)}</CText>
            </CView>
            <CView row style={styles.paddingBottom8}>
              <CText>Coin used</CText>
              <CText style={styles.flex} />
              <CText size="normalBold">
                ₹{redeemCoin ? coinToINR(redeemableFantigerCoin) : '0.00'}
              </CText>
            </CView>
            {promoValue > 0 && (
              <CView row style={styles.paddingBottom8}>
                <CText>Promo Code Value</CText>
                <CText style={styles.flex} />
                <CText size="normalBold">₹{dollarToInr(promoValue)}</CText>
              </CView>
            )}
            <CView row style={styles.paddingBottom8}>
              <CText>Brokerage Amount</CText>
              <CText style={styles.flex} />
              <CText size="normalBold">₹{brokerageAmount}</CText>
            </CView>
            <CView row style={styles.paddingBottom8}>
              <CText>To be paid</CText>
              <CText style={styles.flex} />
              <CText size="normalBold">₹{round(toBePaid)}</CText>
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
          {/* <CView row style={styles.errorContainer}>
          <Image source={appImages.invalidQuantity} style={styles.errorIcon} />
          <CText style={styles.errorColor}>
            You don't have enough balance in your wallet. add amount and try
            again
          </CText>
        </CView> */}

          <CView style={styles.marginTop20}>
            {toBePaid > dollarToInr(balance) ? (
              <CButton
                size="large"
                buttonType="primary"
                text="Add Money"
                isGradientButton
                onPress={handleAddMoney}
                customStyles={styles.placeOrderBtn}
              />
            ) : (
              <CButton
                size="large"
                buttonType="primary"
                text="Place order"
                isLoading={isLoading}
                disabled={!isQuantityValid || !isLimitPriceValid || !term}
                isGradientButton
                onPress={handlePlaceOrder}
                customStyles={styles.placeOrderBtn}
              />
            )}
          </CView>
        </ScrollView>
      </CView>
      {isMarketPlacePopupShow && (
        <MarketPlaceOrderPopup
          orderId={orderId}
          isVisible={isMarketPlacePopupShow}
          onClose={handleClosePopup}
          type="BUY"
        />
      )}
    </CView>
  );
};

export default MarketPlaceBuy;
