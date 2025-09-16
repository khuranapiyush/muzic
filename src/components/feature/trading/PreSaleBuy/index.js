import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Image, TextInput, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { applyPromoCode, buyPreSaleFanCard } from '../../../../api/trade';
import useToaster from '../../../../hooks/useToaster';
import useTrading from '../../../../hooks/useTrading';
import ROUTE_NAME from '../../../../navigator/config/routeName';
import appImages from '../../../../resource/images';
import {
  coinToINR,
  dollarToInr,
  dollarToInrWithRupeeSign,
  round,
} from '../../../../utils/common';
import TextInputFC from '../../../common/FormComponents/TextInputFC';
import CButton from '../../../common/core/Button';
import CheckBox from '../../../common/core/Checkbox';
import Divider from '../../../common/core/Divider';
import CText from '../../../common/core/Text';
import CView from '../../../common/core/View';
import PreSaleOrderPopup from '../PreSaleOrderPopup';
import styles from './style';

const PreSaleBuy = ({ route }) => {
  const { currentPrice, maxQuantityPerUser, lowerLimit, higherLimit } =
    useTrading(route.params.songData);

  const { buyPrice = 0 } = currentPrice || {};
  const { tierId, background, tierName } = route.params.songData;
  const navigation = useNavigation();
  const { control, reset, watch, setValue } = useForm({
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
  const { showToaster } = useToaster();

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

  const [isMarketPlacePopupShow, setIsMarketPlaceBuyPopupShow] = useState(false);

  const {
    redeemCoin,
    term,
    price,
    quantity,
    promo: { promoCode, isPromoApplied, promoValue, promoCoins },
  } = watch();

  const isQuantityValid = useMemo(
    () => !!(quantity <= maxQuantityPerUser && quantity > 0),
    [maxQuantityPerUser, quantity]
  );

  const isLimitPriceValid = useMemo(
    () =>
      parseFloat(price) >= parseFloat(lowerLimit) &&
      parseFloat(price) <= parseFloat(higherLimit),
    [higherLimit, lowerLimit, price]
  );
  const count = useMemo(
    () => (quantity <= maxQuantityPerUser && quantity > 0 ? quantity : 1),
    [maxQuantityPerUser, quantity]
  );

  useEffect(() => {
    let temp =
      dollarToInr(buyPrice) * count -
      (redeemCoin ? coinToINR(redeemableFantigerCoin) : 0) -
      promoValue * 80;

    setToBePaid(round(temp));
    setTotalPrice(dollarToInr(buyPrice) * count);
  }, [buyPrice, count, promoValue, redeemCoin, redeemableFantigerCoin]);

  useEffect(() => {
    reset(formValues => ({
      ...formValues,
      price: dollarToInr(buyPrice).toString(),
    }));
  }, [buyPrice, reset]);

  const { mutate: postApplyPromo } = useMutation(
    requestBody => applyPromoCode(requestBody),
    {
      onSuccess: ({ data }) => {
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
    }
  );

  const handleApplyPromoCode = useCallback(() => {
    let request = { tierId: 20001, quantity: 1, promoCode: promoCode };
    postApplyPromo(request);
  }, [postApplyPromo, promoCode]);

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
      ...(!!redeemCoin && { fantigerCoin: redeemableFantigerCoin }),
      ...(!!promoCode && { promoCode: promoCode }),
      deviceInfo: { source: 'ios' },
    };
    ConfirmNFT(requestBody);
  }, [ConfirmNFT, count, promoCode, redeemCoin, redeemableFantigerCoin, tierId]);

  const handleAddMoney = useCallback(() => {
    navigation.navigate(ROUTE_NAME.AddFund);
  }, [navigation]);

  const handleClosePopup = useCallback(() => {
    setIsMarketPlaceBuyPopupShow(false);
  }, []);

  const { mutate: ConfirmNFT } = useMutation(
    requestBody => buyPreSaleFanCard(requestBody),
    {
      onSuccess: ({ data }) => {
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
    }
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
            <Image source={appImages.coin} style={styles.walletIcon} />
            <CText size="normalBold">{fanTvCoin}</CText>
          </CView>
          <Divider customStyle={styles.dividerStyle} />
          <CView row>
            <Image
              source={{ uri: background?.value }}
              style={styles.thumbIcon}
            />
            <CView style={{ justifyContent: 'space-evenly' }}>
              <CText size="mediumBold">{tierName}</CText>
              {/* <CText size="normal">
                By: <CText size="mediumBold">Mary Ann Alexander</CText>
              </CText> */}
              <CText size="mediumBold">
                {dollarToInrWithRupeeSign(buyPrice)}
              </CText>
            </CView>
          </CView>
          <Divider customStyle={styles.dividerStyle} />
          <CView>
            <CView>
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
                          promoValue
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
                  containerStyle: { padding: 0, marginLeft: 0, marginRight: 0 },
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
              <CText size="normalBold">{totalPrice}</CText>
            </CView>
            <CView row style={styles.paddingBottom8}>
              <CText>Coin used</CText>
              <CText style={styles.flex} />
              <CText size="normalBold">
                {redeemCoin ? coinToINR(redeemableFantigerCoin) : ' 0.00'}
              </CText>
            </CView>
            {promoValue > 0 && (
              <CView row style={styles.paddingBottom8}>
                <CText>Promo Code Value</CText>
                <CText style={styles.flex} />
                <CText size="normalBold">{dollarToInr(promoValue)}</CText>
              </CView>
            )}
            <CView row style={styles.paddingBottom8}>
              <CText>To be paid</CText>
              <CText style={styles.flex} />
              <CText size="normalBold">{toBePaid}</CText>
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
                disabled={!isQuantityValid}
                isGradientButton
                onPress={handlePlaceOrder}
                customStyles={styles.placeOrderBtn}
              />
            )}
          </CView>
        </ScrollView>
      </CView>
      {isMarketPlacePopupShow && (
        <PreSaleOrderPopup
          orderId={orderId}
          isVisible={isMarketPlacePopupShow}
          onClose={handleClosePopup}
          type="BUY"
        />
      )}
    </CView>
  );
};

export default PreSaleBuy;
