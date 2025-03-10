import React from 'react';
import {CountryPicker} from 'react-native-country-codes-picker';
import '../../utils/backHandlerPolyfill'; // Import the polyfill

const CountryPickerWrapper = props => {
  // Simply pass all props to the original component
  return <CountryPicker {...props} />;
};

export default CountryPickerWrapper;
