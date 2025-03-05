import { useNavigation, useTheme } from '@react-navigation/native'
import { useMutation } from '@tanstack/react-query'
import React, { useCallback } from 'react'
import { Image, SafeAreaView } from 'react-native'
import Modal from 'react-native-modal'
import { useDispatch, useSelector } from 'react-redux'
import { deleteAccount } from '../../../../api/auth'
import useToaster from '../../../../hooks/useToaster'
import appImages from '../../../../resource/images'
import { resetUser } from '../../../../stores/slices/user'
import { screenHeight } from '../../../../utils/common'
import Toaster from '../../../common/Toaster'
import CButton from '../../../common/core/Button'
import CText from '../../../common/core/Text'
import CView from '../../../common/core/View'
import getStyles from './style'

const DeleteAccount = ({
  isVisible,
  onClose,
  config = { type: 'max' },
  defaultStep = 1,
  customStyles = {}
}) => {
  const { userId } = useSelector(state => state.user)

  const navigator = useNavigation()
  const { showToaster } = useToaster()
  const dispatch = useDispatch()

  const handleSwipeComplete = () => {
    onClose()
  }
  const { mutate: deleteAccountApi } = useMutation(
    data => deleteAccount(data),
    {
      onSuccess: res => {
        dispatch(resetUser())
        onClose()
        showToaster({
          type: 'success',
          text1: 'Success',
          text2: 'Account Deleted'
        })
        navigator.navigate('Home')
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

  const handleUpdate = useCallback(() => {
    deleteAccountApi(userId)
  }, [])

  const { mode } = useTheme()
  const styles = getStyles(mode)

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      swipeDirection={['down']}
      propagateSwipe
      style={{ ...styles.modal }}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
      avoidKeyboard={config.type == 'max' ? false : true}
      onSwipeComplete={handleSwipeComplete}>
      <SafeAreaView
        style={{
          ...styles.modalContainer,
          height: screenHeight * (config.type == 'max' ? 1 : 0.35)
        }}>
        <CView style={styles.modalContent}>
          <CText centered size="large">
            Delete Account
          </CText>
          <CView row style={styles.modalLogoContainer}>
            <Image source={appImages.warningIcon} style={styles.modalLogo} />
          </CView>
          <CText style={styles.modalHeading}>
            {' '}
            Are You Sure you want to delete your account ?{' '}
          </CText>
          <CText style={styles.modalText}></CText>
          <CView row style={styles.btnContainer}>
            <CButton
              size="large"
              buttonType="secondary"
              text="Cancel"
              onPress={onClose}
              backgroundColor={'transparent'}
              customStyles={{ buttonTextStyles: styles.submitBtn }}
            />
            <CButton
              size="large"
              buttonType="primary"
              text="Delete"
              isGradientButton
              onPress={handleUpdate}
              customStyles={{ buttonTextStyles: styles.submitBtn }}
            />
          </CView>
        </CView>
        <Toaster />
      </SafeAreaView>
    </Modal>
  )
}

export default DeleteAccount
