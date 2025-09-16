import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Platform, SafeAreaView, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { dollarToInrWithRupeeSign } from '../../../../utils/common';
import TextInputFC from '../../../common/FormComponents/TextInputFC';
import CButton from '../../../common/core/Button';
import CText from '../../../common/core/Text';
import CView from '../../../common/core/View';
import styles from './style';
import PaymentWebView from '../Payment';
import Config from 'react-native-config';

export const PAYMENT_CONFIG = {
  STRIPE: {
    MERCHANT_ID: 'your_merchant_id', // For Apple Pay
    MERCHANT_NAME: 'Muzic_App',
    COUNTRY_CODE: 'IN',
    CURRENCY: 'INR',
  },
};

const AddFund = () => {
  const { accessToken } = useSelector(state => state.auth);
  const { balance } = useSelector(state => state.walletStats);

  const [invokeWebView, setInvokeWebView] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');

  const { control, watch } = useForm({
    criteriaMode: 'all',
    mode: 'all',
    defaultValues: {
      countryRegion: 'India',
      paymentMethod: 'Debit card, Credit card, UPI, or NetBanking',
      amount: '',
    },
  });

  const { amount } = watch();

  const handleAddMoney = useCallback(() => {
    let url = `${Config.WEB_URL}/android/payment?country_code=IN&amount=${amount}&token=${accessToken}`;
    setPaymentUrl(url);
    setInvokeWebView(true);
  }, [accessToken, amount]);

  const stripe = useStripe();
  const [loading, setLoading] = useState(false);

  const paymentMethods = [
    { id: 'card', name: 'Debit card, Credit card, UPI, or NetBanking' },
    { id: 'applepay', name: 'Apple Pay', platform: 'ios' },
    { id: 'googlepay', name: 'Google Pay', platform: 'android' },
  ];

  const handleApplePay = async amount => {
    try {
      const { error, paymentMethod } = await stripe.initPaymentSheet({
        paymentIntentClientSecret: 'your_payment_intent',
        applePay: {
          merchantId: 'your_merchant_id',
          merchantCountryCode: 'IN',
        },
        amount: amount * 100, // Convert to cents
        currency: 'INR',
      });

      if (error) {
        console.error('Error:', error);
        return;
      }

      // Handle successful payment
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  const handleGooglePay = async amount => {
    try {
      const { error } = await stripe.initPaymentSheet({
        paymentIntentClientSecret: 'your_payment_intent',
        googlePay: {
          merchantName: 'Your Merchant Name',
          merchantCountryCode: 'IN',
          testEnv: false, // Set to true for testing
        },
        amount: amount * 100,
        currency: 'INR',
      });

      if (error) {
        console.error('Error:', error);
        return;
      }

      // Handle successful payment
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      {invokeWebView ? (
        <PaymentWebView url={paymentUrl} />
      ) : (
        <ScrollView style={styles.wrapper}>
          <CView style={styles.container}>
            <CView style={styles.marginInline}>
              <CView>
                <CText size="normalBold">
                  Wallet balance: {dollarToInrWithRupeeSign(balance)}
                </CText>
              </CView>
              <CView style={styles.marginTop20}>
                <CText size="mediumBold">Country Region</CText>
                <TextInputFC
                  control={control}
                  editable={false}
                  inputMode="numeric"
                  name="countryRegion"
                  autoFocus={false}
                />
              </CView>
              <CView style={styles.marginTop20}>
                <CText size="mediumBold">Payment Method</CText>
                <TextInputFC
                  control={control}
                  editable={false}
                  name="paymentMethod"
                  autoFocus={false}
                />
              </CView>
              <CView style={styles.marginTop20}>
                <CText size="mediumBold">Enter Amount</CText>
                <TextInputFC
                  control={control}
                  inputMode={'numeric'}
                  type={'number'}
                  name="amount"
                  placeholder="Enter amount"
                  autoFocus={false}
                />
              </CView>
              <CView row style={styles.styleServiceFee}>
                <CText size="normalBold">Service fee</CText>
                <CText size="normalBold">0</CText>
              </CView>
              <CView row style={styles.styleServiceFee}>
                <CText size="normalBold">Amount</CText>
                <CText size="normalBold">₹{amount}</CText>
              </CView>
              <CView row style={styles.btnContainer}>
                <CView style={styles.addAccountContainer}>
                  <CButton
                    size="large"
                    buttonType="primary"
                    disabled={amount <= 0}
                    text="Add Money"
                    isGradientButton
                    onPress={handleAddMoney}
                    customStyles={{ buttonTextStyles: styles.submitBtn }}
                  />
                </CView>
              </CView>
            </CView>
          </CView>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default AddFund;
