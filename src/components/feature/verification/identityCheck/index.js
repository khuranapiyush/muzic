import { useMutation } from '@tanstack/react-query'
import React, { useCallback, useEffect, useState } from 'react'
import { NativeModules } from 'react-native'
import Config from 'react-native-config'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchUserDetail,
  verifyKycStatusAuthbridge
} from '../../../../api/user'
import useToaster from '../../../../hooks/useToaster'
import { setUserData } from '../../../../stores/slices/user'
import CButton from '../../../common/core/Button'
import CView from '../../../common/core/View'
import useModal from '../../../../hooks/useModal'
import styles from './style'
import ROUTE_NAME from '../../../../navigator/config/routeName'
import { useNavigation, useTheme } from '@react-navigation/native'
import Colors from '../../../common/Colors'

const { Hyperkyc } = NativeModules

const IdentityCheck = ({ label = 'Identity Check' }) => {
  const user = useSelector(state => state.user)
  const navigation = useNavigation()
  const { showModal, hideModal } = useModal()
  const userId = user?.id
  const configDictionary = {}
  const [kycStatus, setKycStatus] = useState('')
  configDictionary['appId'] = Config.HYPERVERGE_APPID
  configDictionary['appKey'] = Config.HYPERVERGE_APPKEY
  configDictionary['workflowId'] = Config.HYPERVERGE_WORKFLOWID
  configDictionary['transactionId'] = userId
  const { mode } = useTheme()

  const { accessToken } = useSelector(state => state.auth)

  const { showToaster } = useToaster()

  const dispatch = useDispatch()

  useEffect(() => {
    if (user != null) {
      let ckStatus = user?.kycStatus
      setKycStatus(ckStatus)
    }
  }, [user])

  const { mutate: verifyUserKyc } = useMutation(
    () => verifyKycStatusAuthbridge(),
    {
      onSuccess: res => {
        dispatch(
          setUserData({
            ...user,
            ...res?.data?.kyc
          })
        )
        if (res?.data?.kyc?.kycStatus != 'auto_approved') {
          showToaster({
            type: 'error',
            text1: 'Error',
            text2: res?.data?.kyc?.kycDeclineReason
          })
        } else {
          showToaster({
            type: 'success',
            text1: 'Success',
            text2: 'KYC completed!'
          })
        }
        navigation.goBack()
      },
      onError: error => {
        navigation.goBack()
      }
    }
  )

  const { mutate: getStatusBeforeIdentityCheck } = useMutation(
    data => fetchUserDetail(data),
    {
      onSuccess: res => {
        if (
          !['auto_approved', 'needs_review', 'manual_approved'].includes(
            res?.data?.result?.kycStatus
          )
        ) {
          if (
            res?.data?.result?.mobile &&
            res?.data?.result?.isMobileVerified
          ) {
            launchHyperVerge()
          } else {
            showModal('mobileVerification', {
              isVisible: true,
              config: { type: 'custom' },
              onClose: () => hideModal('mobileVerification')
            })
          }
        }
      },
      onError: error => {}
    }
  )

  const showKycStatus = (type, text1, text2) => {
    showToaster({
      type: type,
      text1: text1,
      text2: text2
    })
  }

  const verifyKyc = () => {
    setTimeout(() => {
      verifyUserKyc()
    }, 200)
  }

  let kycUrl = `${Config.WEB_URL}/mobile/kyc?token=${accessToken}`

  const launchHyperVerge = () => {
    navigation.navigate(ROUTE_NAME.CWebView, {
      url: kycUrl,
      onUidReceived: uid => {
        verifyKyc()
      }
    })
  }

  const handleIdentityCheckPress = useCallback(() => {
    if (user?.isMobileVerified) {
      getStatusBeforeIdentityCheck({
        userId
      })
    } else {
      showModal('mobileVerification', {
        isVisible: true,
        config: { type: 'custom' },
        onClose: () => hideModal('mobileVerification')
      })
    }
  }, [
    getStatusBeforeIdentityCheck,
    hideModal,
    showModal,
    user.isMobileVerified,
    userId
  ])

  return (
    <CView style={{ width: '100%' }}>
      <CButton
        size="large"
        buttonType="tertiary"
        text={label}
        disabled={
          kycStatus === 'auto_approved' ||
          kycStatus === 'needs_review' ||
          kycStatus === 'manually_approved'
        }
        onPress={handleIdentityCheckPress}
        customStyles={{
          buttonTextStyles: {
            ...styles.submitBtn,
            color: Colors[mode]?.white
          }
        }}
        borderColor={Colors[mode]?.white}
      />
    </CView>
  )
}

export default IdentityCheck
