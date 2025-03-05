import React from 'react'
import { Image, Linking, Modal } from 'react-native'
import { AppStoreLink } from '../../../../constants/app'
import appImages from '../../../../resource/images'
import CButton from '../../core/Button'
import CText from '../../core/Text'
import CView from '../../core/View'
import styles from './style'

const SoftUpdateModal = ({ isVisible, onClose }) => {
  const handleUpdate = async () => {
    Linking.canOpenURL(AppStoreLink).then(
      supported => {
        supported && Linking.openURL(AppStoreLink)
      },
      err => console.log(err)
    )
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}>
      <CView style={styles.modalContainer}>
        <CView style={styles.modalContent}>
          <CView row style={styles.modalLogoContainer}>
            <Image source={appImages.appLogo} style={styles.modalLogo} />
          </CView>
          <CText style={styles.modalHeading}> Update Available</CText>
          <CText style={styles.modalText}>
            A new version of the app is available. You can update it to enjoy
            the latest features and improvements.
          </CText>
          <CView row style={styles.btnContainer}>
            <CButton
              size="large"
              buttonType="secondary"
              text="Later"
              onPress={onClose}
              customStyles={{ buttonTextStyles: styles.submitBtn }}
            />
            <CButton
              size="large"
              buttonType="primary"
              text="Update Now"
              isGradientButton
              onPress={handleUpdate}
              customStyles={{ buttonTextStyles: styles.submitBtn }}
            />
          </CView>
        </CView>
      </CView>
    </Modal>
  )
}

export default SoftUpdateModal
