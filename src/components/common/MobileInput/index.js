import React from 'react';
import {TextInput} from 'react-native';
import {useTheme} from '@react-navigation/native';
import getStyles from './style';

const MobileInput = ({
  mobileNumber,
  setMobileNumber,
  customStyles = {},
  ...rest
}) => {
  const handleMobileNumberChange = text => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setMobileNumber(numericValue);
  };
  const {mode} = useTheme();

  const styles = getStyles(mode);

  return (
    <TextInput
      style={{
        ...styles.input,
        ...customStyles,
      }}
      keyboardType="numeric"
      placeholder="Enter your mobile number"
      placeholderTextColor={'white'}
      value={mobileNumber}
      onChangeText={handleMobileNumberChange}
      maxLength={14}
      {...rest}
    />
  );
};

export default MobileInput;
