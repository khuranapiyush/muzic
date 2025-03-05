import React, { useCallback, useState } from 'react'
import CView from '../../common/core/View'
import CText from '../../common/core/Text'
import { Image, SafeAreaView, ScrollView } from 'react-native'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  getAllAccounts,
  makeAccountActiveDeactive,
  sendOtpToVerifyBank,
  verifyOtpToAddBank
} from '../../../api/wallet'
import { useSelector } from 'react-redux'
import getStyles from './style'
import appImages from '../../../resource/images'
import CButton from '../../common/core/Button'
import { useNavigation, useTheme } from '@react-navigation/native'
import ROUTE_NAME from '../../../navigator/config/routeName'
import MonetizeToggle from '../uploadContent/MonetizeToggle'
import useToaster from '../../../hooks/useToaster'
import OtpVerify from '../verification/otpVerify'
import Colors from '../../common/Colors'
import IdentityCheck from '../verification/identityCheck'

const Settings = () => {
  const [allAccounts, setAllAccounts] = useState([])
  const navigation = useNavigation()
  const { showToaster } = useToaster()
  const { kycStatus } = useSelector(state => state.user)

  const { mode } = useTheme()
  const styles = getStyles(mode)

  const [selectedBank, setSelectedBank] = useState('')

  const [isOtpOpen, setIsOtpOpen] = useState(false)

  const [isOtpLoading, setIsOtpLoading] = useState()

  const { userId } = useSelector(state => state.user)
  useQuery({
    queryKey: ['getAllAccounts'],
    queryFn: getAllAccounts.bind(this, { userId: userId }),
    refetchOnMount: true,
    enabled: !!userId,
    onSuccess: res => {
      const data = res.data.data
      setAllAccounts(data)
    }
  })

  const { refetch } = useQuery({
    queryKey: ['getAllAccounts'],
    queryFn: getAllAccounts.bind(this, { userId: userId }),
    refetchOnMount: true,
    enabled: !!userId,
    onSuccess: res => {
      const data = res.data.data
      setAllAccounts(data)
    }
  })

  const { mutate: updateAccountStatus } = useMutation(
    data => makeAccountActiveDeactive(data),
    {
      onSuccess: res => {
        refetch()
        showToaster({
          type: 'success',
          text1: 'Success',
          text2: 'Account Status updated!'
        })
      },
      onError: error => {
        showToaster({
          type: 'error',
          text1: 'Error',
          text2: error.response.data.message
        })
      }
    }
  )

  const { mutate: sendOTPApi } = useMutation(
    data => sendOtpToVerifyBank(data),
    {
      onSuccess: res => {
        setIsOtpOpen(true)
      },
      onError: err => {
        showToaster({
          type: 'error',
          text1: 'Error',
          text2: err.response.data.message
        })
      }
    }
  )
  const { mutate: verifyOTPApi } = useMutation(
    data => verifyOtpToAddBank(data),
    {
      onSuccess: res => {
        setIsOtpOpen(false)
        refetch()
        showToaster({
          type: 'success',
          text1: 'Success',
          text2: 'Account verified successfully!'
        })
        setIsOtpLoading(false)
      },
      onError: err => {
        setIsOtpLoading(false)
        showToaster({
          type: 'error',
          text1: 'Error',
          text2: err.response.data.message
        })
      }
    }
  )

  const handleAddAccount = () => {
    navigation.navigate(ROUTE_NAME.AddAccount)
  }

  const handleChange = (event, item) => {
    let bankId = item.id
    let isActive = event
    updateAccountStatus({ userId, bankId, isActive })
  }

  const handleVerify = item => {
    let bankId = item.id
    setSelectedBank(bankId)
    sendOTPApi({ userId, bankId })
  }

  const handleVerifyOtp = otp => {
    let bankId = selectedBank
    let data = { otp: otp }
    setIsOtpLoading(true)
    verifyOTPApi({ userId, bankId, data })
  }
  const resendOTP = otp => {
    let bankId = selectedBank
    sendOTPApi({ userId, bankId })
  }

  const onCloseOtpPopup = useCallback(() => {
    setIsOtpOpen(false)
  }, [])

  return (
    <SafeAreaView style={styles.wrapper}>
      <ScrollView style={styles.wrapper}>
        <CView style={styles.container}>
          <CView style={styles.iconContainer}>
            <CView style={styles.bankIconContainer}>
              <Image source={appImages.bankIcon} style={styles.iconStyleFull} />
            </CView>
          </CView>
          <CText style={styles.title} size="mediumBold">
            Bank Account
          </CText>
          {!(allAccounts[0]?.accounts?.length > 0) && (
            <CText size="normal" style={{ color: Colors[mode]?.textLightGray }}>
              Please Add a bank account to continue
            </CText>
          )}
          <CView style={{ marginTop: 20 }}>
            <CButton
              showIcon
              iconImage={appImages.addIcon}
              size="large"
              buttonType="tertiary"
              text="Add Bank Account"
              onPress={handleAddAccount}
              customStyles={styles.submitBtn}
            />
          </CView>

          <CView style={styles.bankAccountContainer}>
            {allAccounts[0]?.accounts?.length > 0 &&
              allAccounts[0]?.accounts.map(item => (
                <CView key={item.account} style={styles.accountContainer}>
                  <CView row style={{ justifyContent: 'space-between' }}>
                    <CView centered style={styles.startAlign}>
                      <CView row>
                        <CText size="normalBold">
                          {item.name}{' '}
                          {item.isVerified &&
                            item.isAccNameMatchedWithPancard &&
                            item.isActive &&
                            !item?.isRejected && (
                              <Image
                                source={appImages.tickCircleIcon}
                                style={styles.icon}
                              />
                            )}{' '}
                          <CText size="mediumBold">
                            {item.isActive &&
                            item.isAccNameMatchedWithPancard &&
                            !!!item?.isRejected
                              ? '(Active)'
                              : item.isActive &&
                                !item.isAccNameMatchedWithPancard &&
                                !item?.isRejected
                              ? 'Under Review'
                              : item?.isRejected
                              ? 'Rejected'
                              : '(InActive)'}
                          </CText>
                        </CText>
                      </CView>
                      <CText size="normalBold" style={styles.paddingTop}>
                        {item.account}
                      </CText>
                    </CView>
                    {item.isVerified && (
                      <CView>
                        <MonetizeToggle
                          backgroundActive={'#32BA7C'}
                          isActive={item.isActive}
                          setToggle={e => handleChange(e, item)}
                        />
                      </CView>
                    )}
                  </CView>
                  {!item.isVerified && (
                    <CView style={{ marginTop: 20 }}>
                      <CButton
                        size="large"
                        buttonType="primary"
                        text="Verify"
                        onPress={() => handleVerify(item)}
                        customStyles={styles.submitBtn}
                      />
                    </CView>
                  )}
                </CView>
              ))}
          </CView>
        </CView>
        <CView style={styles.container}>
          <CView style={styles.iconContainer}>
            <CView style={styles.bankIconContainer}>
              <Image source={appImages.kyc} style={styles.iconStyleFull} />
            </CView>
          </CView>

          <CText style={styles.title} size="mediumBold">
            Update KYC
          </CText>

          <CView>
            {kycStatus == 'auto_approved' ||
            kycStatus == 'manually_approved' ? (
              <CView>
                <CView style={styles.successContainer}>
                  <CView row>
                    <Image
                      source={appImages.tickCircleIcon}
                      style={styles.iconFixHeight}
                    />
                    <CText style={styles.successContent}>
                      Your KYC verification has been successfully completed.
                    </CText>
                  </CView>
                </CView>
              </CView>
            ) : (
              <CView>
                <CText
                  size="normal"
                  style={{ color: Colors[mode]?.textLightGray }}>
                  Please, update your KYC to continue{' '}
                </CText>
                <CView style={styles.alertContainer}>
                  <CView row>
                    <Image
                      source={appImages.cautionIcon}
                      style={styles.iconFixHeight}
                    />
                    <CText style={styles.alertContent}>
                      You have not updated your KYC, please update it
                    </CText>
                  </CView>
                </CView>
                <CView style={styles.identityWrapper}>
                  <CView row style={styles.identityContainer}>
                    <IdentityCheck label="Update KYC" />
                  </CView>
                </CView>
              </CView>
            )}
          </CView>
        </CView>
        <OtpVerify
          isVisible={isOtpOpen}
          onClose={onCloseOtpPopup}
          handleVerifyOtp={handleVerifyOtp}
          resendOTP={resendOTP}
          isLoading={isOtpLoading}
          theme={mode}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

export default Settings
