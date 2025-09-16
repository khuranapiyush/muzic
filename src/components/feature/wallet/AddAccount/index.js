import { useNavigation, useTheme } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Image, SafeAreaView, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { addBankAccounts } from '../../../../api/wallet';
import useToaster from '../../../../hooks/useToaster';
import appImages from '../../../../resource/images';
import TextInputFC from '../../../common/FormComponents/TextInputFC';
import CButton from '../../../common/core/Button';
import CText from '../../../common/core/Text';
import CView from '../../../common/core/View';
import ROUTE_NAME from '../../../../navigator/config/routeName';
import getStyles from './style';
import Colors from '../../../common/Colors';

const AddAccount = () => {
  const { nameOnPancard = '', userId } = useSelector(state => state.user);
  const { showToaster } = useToaster();

  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(false);

  const { control, watch } = useForm({
    criteriaMode: 'all',
    mode: 'all',
    defaultValues: {
      accountNumber: '',
      accountIfsc: '',
      accountHolderName: nameOnPancard,
    },
  });

  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const { accountNumber, accountIfsc, accountHolderName } = watch();

  const { mutate: addAccount } = useMutation(data => addBankAccounts(data), {
    onSuccess: res => {
      setIsLoading(false);
      showToaster({
        type: 'info',
        text1: 'Add Account',
        text2: 'Account added successfully, please verify now',
      });
      navigation.navigate(ROUTE_NAME.Wallet);
    },
    onError: error => {
      setIsLoading(false);
      showToaster({
        type: 'info',
        text1: 'Add Account',
        text2: error.response.data.message,
      });
    },
  });

  const handleAddAccount = useCallback(() => {
    setIsLoading(true);
    let payload = {
      type: 'bank',
      account: accountNumber,
      name: accountHolderName,
      ifsc: accountIfsc,
    };
    addAccount({ userId, payload });
  }, [accountHolderName, accountIfsc, accountNumber, addAccount, userId]);

  const { mode } = useTheme();

  const styles = getStyles(mode);

  return (
    <SafeAreaView style={styles.wrapper}>
      <ScrollView style={styles.wrapper}>
        <CView style={styles.container}>
          <CView>
            <CView style={styles.iconContainer}>
              <CView style={styles.bankIconContainer}>
                <Image
                  source={appImages.bankIcon}
                  style={styles.iconStyleFull}
                />
              </CView>
            </CView>
            <CText style={{ paddingTop: 10 }} size="mediumBold">
              Add Account
            </CText>
            <CText
              style={{ color: Colors[mode].textLightGray, paddingTop: 10 }}>
              Enter details to add your bank account
            </CText>
          </CView>
          <CView style={styles.marginInline}>
            <CView style={styles.marginTop20}>
              <CText size="normal">Account Number</CText>
              <TextInputFC
                customStyles={styles.inputStyles}
                control={control}
                inputMode="numeric"
                name="accountNumber"
                placeholder="Enter your account number"
                autoFocus={false}
                rules={{ required: 'Account number is required' }}
              />
            </CView>
            <CView style={styles.marginTop20}>
              <CText size="normal">Account IFSC</CText>
              <TextInputFC
                customStyles={styles.inputStyles}
                control={control}
                name="accountIfsc"
                placeholder="Enter IFSC Code"
                autoFocus={false}
                rules={{ required: 'Account number is required' }}
              />
            </CView>
            <CView style={styles.marginTop20}>
              <CText size="normal">Account Holder Name</CText>
              <TextInputFC
                customStyles={styles.inputStyles}
                control={control}
                name="accountHolderName"
                placeholder="Enter account holder name"
                autoFocus={false}
                rules={{ required: 'Account number is required' }}
              />
            </CView>
            <CView row style={styles.btnContainer}>
              <CView style={styles.closeContainer}>
                <CButton
                  size="large"
                  buttonType="tertiary"
                  text="Cancel"
                  onPress={handleClose}
                  customStyles={{ buttonTextStyles: styles.submitBtn }}
                />
              </CView>
              <CView style={styles.addAccountContainer}>
                <CButton
                  size="large"
                  buttonType="primary"
                  isLoading={isLoading}
                  disabled={
                    !accountNumber || !accountIfsc || !accountHolderName
                  }
                  text="Add Account"
                  onPress={handleAddAccount}
                  customStyles={{ buttonTextStyles: styles.submitBtn }}
                />
              </CView>
            </CView>
          </CView>
        </CView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddAccount;
