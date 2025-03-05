import {useIsFocused, useNavigation, useTheme} from '@react-navigation/native';
import {useMutation, useQuery} from '@tanstack/react-query';
import React, {useCallback, useEffect, useState} from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {useSelector} from 'react-redux';
import {
  getAllWithdrawableAccounts,
  withdrawMoney,
} from '../../../../api/wallet';
import useToaster from '../../../../hooks/useToaster';
import ROUTE_NAME from '../../../../navigator/config/routeName';
import appImages from '../../../../resource/images';
import {dollarToInrWithRupeeSign, round} from '../../../../utils/common';
import CButton from '../../../common/core/Button';
import CText from '../../../common/core/Text';
import CView from '../../../common/core/View';
import getStyles from './style';

const MIN_AMOUNT = 300;
const MAX_AMOUNT = 2000;

const WithdrawMoney = () => {
  const navigation = useNavigation();
  const {withdrawableAmount} = useSelector(state => state.walletStats);
  const {mode} = useTheme();
  const styles = getStyles(mode);
  const {showToaster} = useToaster();

  const {userId} = useSelector(state => state.user);
  const [allAccounts, setAllAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [step, setStep] = useState(1);
  const isFocused = useIsFocused();

  const [amount, setAmount] = useState('');
  const [amountErrText, setAmountErrText] = useState('');
  const [amountErr, setAmountErr] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {refetch} = useQuery({
    queryKey: ['getAllAccounts'],
    queryFn: getAllWithdrawableAccounts.bind(this, {userId: userId}),
    refetchOnMount: true,
    enabled: !!userId,
    onSuccess: res => {
      const data = res.data.data;
      setSelectedAccount(data[0]);
      setAllAccounts(data);
    },
  });

  useEffect(() => {
    refetch();
  }, [isFocused, refetch]);

  const handleAddAccount = useCallback(() => {
    navigation.navigate(ROUTE_NAME.AddAccount);
  }, [navigation]);

  const handleChange = item => {
    setSelectedAccount(item);
  };

  const handleContinue = () => {
    setStep(2);
  };

  const handleAmountChange = item => {
    setAmount(item);
  };

  const {mutate: handleWithdrawMoneyApi} = useMutation(
    data => withdrawMoney(data),
    {
      onSuccess: ({data}) => {
        setIsLoading(false);
        if (
          data?.order?.paymentStatus == 'SUCCESS' ||
          data?.order?.paymentStatus == 'MANUAL'
        ) {
          if (data?.order?.gtwPaymentRes?.length == 0) {
            showToaster({
              type: 'success',
              text1: 'Success',
              text2:
                'Your withdrawal request is sent for approval. Please wait for 2-3 business days.',
            });
          } else {
            showToaster({
              type: 'success',
              text1: 'Success',
              text2:
                'If your amount is not credited, please wait for 2-3 business days!',
            });
          }
          setTimeout(() => {
            navigation.navigate(ROUTE_NAME.Wallet);
          }, 6000);
        } else if (
          data?.order?.paymentStatus == 'FAILED' ||
          data?.order?.paymentStatus == 'PENDING'
        ) {
          showToaster({
            type: 'error',
            text1: 'Error',
            text2: 'Amount withdrawal Pending. redirecting...',
          });
          setTimeout(() => {
            navigation.navigate(ROUTE_NAME.Wallet);
          }, 6000);
        }
      },
      onError: error => {
        setIsLoading(false);
        showToaster({
          type: 'error',
          text1: 'Error',
          text2: error?.response?.data?.message,
        });
      },
    },
  );

  const validateAmount = useCallback(
    amt => {
      if (amt < parseFloat(MIN_AMOUNT)) {
        setAmountErrText(`Minimum withdrawal limit is ₹${MIN_AMOUNT}.`);
        return false;
      } else if (amt > parseFloat(MAX_AMOUNT)) {
        setAmountErrText(`Maximum withdrawal limit is ₹${MAX_AMOUNT}.`);
        return false;
      } else if (amt > parseFloat(Math.round(withdrawableAmount * 80))) {
        setAmountErrText(
          'Withdrawal amount should be less than or equal to withdrawable balance.',
        );
        return false;
      } else {
        return true;
      }
    },
    [withdrawableAmount],
  );

  useEffect(() => {
    if (validateAmount(amount)) {
      setAmountErr(false);
    }
  }, [amount, validateAmount]);

  const handleConfirm = () => {
    if (!validateAmount(amount)) {
      setAmountErr(true);
      return;
    }

    if (selectedAccount && validateAmount(amount)) {
      setIsLoading(true);
      let data = {
        currency: 'USD',
        amount: round(amount / 80, 4),
        bankId: selectedAccount.id,
      };
      handleWithdrawMoneyApi(data);
    }
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      {step == 1 ? (
        <CView style={styles.flex1}>
          <CView centered>
            <CView centered style={styles.iconContainer}>
              <Image source={appImages.bankIcon} style={styles.iconStyle} />
            </CView>
          </CView>
          <CText size={'normal'} centered style={styles.paddingTop20}>
            {allAccounts?.length > 0
              ? 'Before withdrawing money please select the bank account you want your money to be added'
              : 'Before withdrawing money please add your Bank Account'}
          </CText>
          <CText size={'normal'} style={styles.paddingTop20}>
            Available withdraw amount:{' '}
            {dollarToInrWithRupeeSign(withdrawableAmount)}
          </CText>
          <ScrollView style={styles.flex1}>
            <CView>
              <CView style={styles.paddingTop20}>
                {allAccounts.map(item => (
                  <Pressable onPress={() => handleChange(item)} key={item.id}>
                    <CView
                      row
                      style={
                        selectedAccount?.id == item?.id
                          ? styles.selectedBackAccountContainer
                          : styles.backAccountContainer
                      }>
                      <CView row centered style={styles.alignStart}>
                        <CView centered style={styles.iconContainer}>
                          <Image
                            source={appImages.bankIcon}
                            style={styles.iconStyle}
                          />
                        </CView>
                        <CView>
                          <CText size="normal"> {'  '}Bank Account</CText>
                          <CText size="normalBold">
                            {'   '}
                            {item?.account}
                          </CText>
                        </CView>
                      </CView>
                      <CView style={styles.flex1} />
                      <CView>
                        <Image
                          source={
                            selectedAccount?.id == item?.id
                              ? appImages.radioIcon
                              : appImages.radioUncheckIcon
                          }
                          style={styles.radioIcon}
                        />
                      </CView>
                    </CView>
                  </Pressable>
                ))}
              </CView>

              <CView style={styles.addAccountContainer}>
                <TouchableOpacity onPress={handleAddAccount}>
                  <CView row centered style={styles.alignStart}>
                    <CView centered style={styles.iconContainer}>
                      <Image
                        source={appImages.addIcon}
                        style={styles.iconStyle}
                      />
                    </CView>
                    <CText size="normalBold">{'  '}Add Account</CText>
                  </CView>
                </TouchableOpacity>
              </CView>
            </CView>
          </ScrollView>
          <CView centered row style={styles.btnContainer}>
            <CButton
              size="large"
              buttonType="secondary"
              text="Cancel"
              onPress={() => navigation.goBack()}
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
              text="Continue"
              isGradientButton
              onPress={handleContinue}
              customStyles={{
                buttonTextStyles: styles.submitBtn,
                buttonStyle: {
                  minWidth: '45%',
                },
              }}
            />
          </CView>
        </CView>
      ) : (
        <CView>
          <CView>
            <CView row centered style={styles.alignStart}>
              <CView centered style={styles.iconContainer}>
                <Image source={appImages.bankIcon} style={styles.iconStyle} />
              </CView>
              <CView>
                <CText size="normal"> {'  '}Bank Account</CText>
                <CText size="normalBold">
                  {'   '}
                  {selectedAccount?.account}
                </CText>
              </CView>
            </CView>
            <CText style={styles.paddingTop20}>
              Available withdraw amount:{' '}
              {dollarToInrWithRupeeSign(withdrawableAmount)}
            </CText>
            <CView style={styles.marginTop20}>
              <CView row>
                <CText size="mediumBold">Enter Amount</CText>
                <CText style={styles.flex1} />
                <CText size="smallBold">
                  Min ₹{MIN_AMOUNT}, Max ₹{MAX_AMOUNT}
                </CText>
              </CView>
              <TextInput
                style={styles.input}
                placeholder="Enter withdrawal amount"
                value={amount}
                onChangeText={handleAmountChange}
              />
              {amountErr && (
                <CText style={styles.errorColor}>{amountErrText}</CText>
              )}
            </CView>
            <CView>
              <CView row style={styles.paddingTop20}>
                <CText size="normal">Service Fee</CText>
                <CText style={styles.flex1} />
                <CText size="normal">0.0</CText>
              </CView>
              <CView row style={styles.paddingTop20}>
                <CText size="normal">Amount Receiving</CText>
                <CText style={styles.flex1} />
                <CText size="normal">₹{amount || 0}</CText>
              </CView>
            </CView>
            <CView centered row style={styles.confirmBtnContainer}>
              <CButton
                size="large"
                buttonType="secondary"
                text="Cancel"
                onPress={() => navigation.goBack()}
                customStyles={{
                  buttonTextStyles: styles.submitBtn,
                  buttonStyle: {
                    minWidth: '48%',
                  },
                }}
              />
              <CButton
                size="large"
                buttonType="primary"
                text="Confirm"
                isGradientButton
                onPress={handleConfirm}
                isLoading={isLoading}
                customStyles={{
                  buttonTextStyles: styles.submitBtn,
                  buttonStyle: {
                    minWidth: '48%',
                  },
                }}
              />
            </CView>
          </CView>
        </CView>
      )}
    </SafeAreaView>
  );
};

export default WithdrawMoney;
