import React from 'react'
import CountryPickerDropdownFC from '../../../../common/FormComponents/CountryPickerDropdownFC'
import MobileInputFC from '../../../../common/FormComponents/MobileInputFC'
import CButton from '../../../../common/core/Button'
import CText from '../../../../common/core/Text'
import CView from '../../../../common/core/View'
import getStyles from './style'
import { useTheme } from '@react-navigation/native'

const MobileInputWithCountry = ({
  handleContinue,
  control,
  isValid,
  isLoading
}) => {
  const { mode } = useTheme()

  const styles = getStyles(mode)

  return (
    <CView style={styles.container}>
      <CView style={styles.labelContainer}>
        <CText style={styles.label}>Please Verify Mobile</CText>
      </CView>
      <CView style={styles.mobileTextContainer}>
        <CText size="mediumBold">Mobile number</CText>
      </CView>
      <CView row="row" style={styles.mobileContainer}>
        <CView style={styles.mobileItemContainer}>
          <CountryPickerDropdownFC control={control} name="phoneCountryCode" />
        </CView>
        <CView style={styles.mobileItemContainer}>
          <MobileInputFC
            control={control}
            name="mobile"
            autoFocus={false}
            rules={{ required: 'Mobile number is required' }}
          />
        </CView>
      </CView>

      <CView style={styles.btnContainer}>
        <CButton
          size="large"
          buttonType="primary"
          text="Continue"
          isGradientButton
          onPress={handleContinue}
          customStyles={styles.submitBtn}
          disabled={!isValid}
          isLoading={isLoading}
        />
      </CView>
    </CView>
  )
}

export default MobileInputWithCountry
