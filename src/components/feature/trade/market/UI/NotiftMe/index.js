import React, { useCallback } from 'react'
import CView from '../../../../../common/core/View'
import CText from '../../../../../common/core/Text'
import styles from './style'
import CButton from '../../../../../common/core/Button'
import useToaster from '../../../../../../hooks/useToaster'

const NotifyMe = () => {
  const { showToaster } = useToaster()

  const handleNotify = useCallback(() => {
    showToaster({
      type: 'success',
      text1: 'Success',
      text2: 'You’re on the List!'
    })
  }, [showToaster])

  return (
    <CView centered style={styles.wrapper}>
      <CText size="mediumBold">Stay Tuned!</CText>
      <CView style={styles.btnContainer}>
        <CButton
          size="large"
          buttonType="primary"
          text="Notify Me"
          isGradientButton
          onPress={handleNotify}
          customStyles={{ buttonTextStyles: styles.submitBtn }}
        />
      </CView>
      <CText centered size="small">
        No presales open now. Watch for our latest drops and be first to grab
        your FanCard in the next presale
      </CText>

      <CText centered size="small" style={styles.happyTradingStyle}>
        Happy Trading!
      </CText>
    </CView>
  )
}

export default NotifyMe
