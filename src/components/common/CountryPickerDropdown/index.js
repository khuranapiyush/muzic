import React, {useState} from 'react';
import {Image, TouchableOpacity} from 'react-native';
// import CountryPicker from 'react-native-country-picker-modal';
import appImages from '../../../resource/images';
import CText from '../core/Text';
import CView from '../core/View';
import getStyles from './style';
import {useTheme} from '@react-navigation/native';

const CountryPickerDropdown = ({country, setSelectedCountry, ...rest}) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleSelect = item => {
    setSelectedCountry(item);
    setShowPicker(false);
  };

  const handlePicker = () => {
    setShowPicker(true);
  };

  const handleClose = () => {
    setShowPicker(false);
  };

  const {mode} = useTheme();

  const styles = getStyles(mode);

  return (
    <CView style={styles.dropdownContainer}>
      <TouchableOpacity style={styles.dropdownHeader} onPress={handlePicker}>
        {/* <CountryPicker
          withFilter
          withCallingCode={true}
          countryCode={country.cca2}
          onSelect={handleSelect}
          visible={showPicker}
          withFlag={true}
          onClose={handleClose}
          {...rest}
        /> */}
        <CText style={styles.selectedCountryText}>
          +{country.callingCode[0]}
        </CText>
        <Image style={styles.arrowIcon} source={appImages.arrowDownIcon} />
      </TouchableOpacity>
    </CView>
  );
};

export default CountryPickerDropdown;
