import React from 'react'
import { CheckBox as RNCheckbox } from 'react-native-elements'

const CheckBox = ({
  checked,
  setIsChecked,
  title,
  customStyles = {},
  ...rest
}) => {
  return (
    <RNCheckbox
      title={title}
      checked={checked}
      onPress={setIsChecked}
      checkedColor="#6B61FF"
      uncheckedColor="#6B61FF"
      containerStyle={customStyles.containerStyle}
      {...rest}
    />
  )
}

export default CheckBox
