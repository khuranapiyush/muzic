import {useMutation} from '@tanstack/react-query';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useForm} from 'react-hook-form';
import {Image} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {useSelector} from 'react-redux';
import {salePreSaleFanCard} from '../../../../api/trade';
import useToaster from '../../../../hooks/useToaster';
import useTrading from '../../../../hooks/useTrading';
import appImages from '../../../../resource/images';
import {
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

const PreSale = ({route}) => {
  const {currentPrice, maxQuantityForSell} = useTrading(route.params.songData);
  const {buyPrice = 0} = currentPrice || {};
  const {tierId, background, tierName} = route.params.songData;
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

  const [orderId, setOrderId] = useState('');

  const [toBePaid, setToBePaid] = useState('');
  const [totalPrice, setTotalPrice] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const [isMarketPlacePopupShow, setIsMarketPlaceBuyPopupShow] =
    useState(false);

  const {term, quantity} = watch();

  const isQuantityValid = useMemo(
    () => !!(quantity <= maxQuantityForSell && quantity > 0),
    [maxQuantityForSell, quantity],
  );

  const count = useMemo(
    () => (quantity <= maxQuantityForSell && quantity > 0 ? quantity : 1),
    [maxQuantityForSell, quantity],
  );

  useEffect(() => {
    let temp = dollarToInr(buyPrice) * count;
    setToBePaid(round(temp));
    setTotalPrice(dollarToInr(buyPrice) * count);
  }, [buyPrice, count]);

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
    ConfirmSellNFT(requestBody);
  }, [ConfirmSellNFT, count, tierId]);

  const handleClosePopup = useCallback(() => {
    setIsMarketPlaceBuyPopupShow(false);
  }, []);

  const {mutate: ConfirmSellNFT} = useMutation(
    requestBody => salePreSaleFanCard(requestBody),
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
            <Image source={appImages.coin} style={styles.walletIcon} />
            <CText size="normalBold">{fanTvCoin}</CText>
          </CView>
          <Divider customStyle={styles.dividerStyle} />
          <CView row>
            <Image source={{uri: background?.value}} style={styles.thumbIcon} />
            <CView style={{justifyContent: 'space-evenly'}}>
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
          </CView>
          <Divider customStyle={styles.dividerStyle} />
          <CView>
            <CView row style={styles.paddingBottom8}>
              <CText>Total Price</CText>
              <CText style={styles.flex} />
              <CText size="normalBold">{totalPrice}</CText>
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
              disabled={!isQuantityValid}
              isGradientButton
              onPress={handlePlaceOrder}
              customStyles={styles.placeOrderBtn}
            />
          </CView>
          <CText style={styles.toBePaidStyle} centered size="small">
            ₹{toBePaid} will be credited to your wallet which you can withdraw
            any time
          </CText>
        </ScrollView>
      </CView>
      {isMarketPlacePopupShow && (
        <PreSaleOrderPopup
          orderId={orderId}
          isVisible={isMarketPlacePopupShow}
          onClose={handleClosePopup}
          type="SELL"
        />
      )}
    </CView>
  );
};

export default PreSale;
