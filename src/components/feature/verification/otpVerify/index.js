import React from 'react'
import { SafeAreaView } from 'react-native'
import Modal from 'react-native-modal'
import { screenHeight } from '../../../../utils/common'
import Toaster from '../../../common/Toaster'
import CView from '../../../common/core/View'
import VerifyOtp from '../../../feature/auth/verifyOtp'
import getStyles from './styles'

const OtpVerify = ({
  isVisible,
  onClose,
  config = { type: 'custom' },
  navigationData = { redirectToPath: null },
  handleVerifyOtp,
  resendOTP,
  isLoading,
  theme = 'light'
}) => {
  const styles = getStyles(theme)
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
      onSwipeComplete={onClose}>
      <SafeAreaView
        style={{
          ...styles.modalContainer,
          height: screenHeight * (config.type == 'max' ? 1 : 0.45)
        }}>
        <CView style={styles.modalContent}>
          <VerifyOtp
            resendOtp={resendOTP}
            handleVerifyOtp={handleVerifyOtp}
            header={{
              label: 'Otp verification',
              description: 'Enter the otp sent to your mobile or email'
            }}
            config={{ showEditMobile: false }}
            isLoading={isLoading}
          />
        </CView>
        <Toaster />
      </SafeAreaView>
    </Modal>
  )
}

export default OtpVerify
