import React, {useState} from 'react';
import {Image, TouchableOpacity, Platform} from 'react-native';
import appImages from '../../../resource/images';
import CText from '../core/Text';
import CView from '../core/View';
import getStyles from './style';
import {useTheme} from '@react-navigation/native';
import CountryPickerWrapper from '../CountryPickerWrapper';
import {Colors} from '../core/colors';

const DEFAULT_COUNTRY = {
  name: 'INDIA',
  dial_code: '+91',
  code: 'IN',
  flag: '🇮🇳',
};

const CountryPickerDropdown = ({
  country,
  setSelectedCountry,
  initialCountryCode,
  ...rest
}) => {
  const [show, setShow] = useState(false);
  const [countryDetail, setCountryDetail] = useState(DEFAULT_COUNTRY);
  const [hasError, setHasError] = useState(false);

  const {mode} = useTheme();
  const styles = getStyles(mode);

  const getThemeColors = () => {
    return {
      backgroundColor: mode === 'dark' ? '#121212' : '#FFFFFF',
      textColor: mode === 'dark' ? '#FFFFFF' : '#000000',
      inputBgColor: mode === 'dark' ? '#2A2A2A' : '#F5F5F5',
      borderColor: mode === 'dark' ? '#444444' : '#CCCCCC',
      placeholderColor: mode === 'dark' ? '#888888' : '#999999',
      primaryColor:
        mode === 'dark'
          ? Colors.Theme.dark.core.primary
          : Colors.Theme.light.core.primary,
      surfaceColor:
        mode === 'dark'
          ? Colors.Theme.dark.surface.primary
          : Colors.Theme.light.surface.primary,
    };
  };

  const themeColors = getThemeColors();

  // useEffect(() => {
  //   if (country) {
  //     setCountryDetail(country);
  //   }
  //   if (setSelectedCountry && !country) {
  //     setSelectedCountry(DEFAULT_COUNTRY);
  //   }
  // }, [country, initialCountryCode, setSelectedCountry]);

  const handlePicker = () => {
    try {
      setShow(true);
    } catch (error) {
      setHasError(true);
    }
  };

  const handleClose = () => {
    try {
      setShow(false);
    } catch (error) {}
  };

  const handleSelectCountry = item => {
    try {
      setCountryDetail(item);
      if (setSelectedCountry) {
        setSelectedCountry(item);
      }
      setShow(false);
    } catch (error) {
      setShow(false);
    }
  };

  if (hasError) {
    return (
      <CView style={styles.dropdownContainer}>
        <TouchableOpacity
          style={[
            styles.dropdownHeader,
            {backgroundColor: themeColors.surfaceColor},
          ]}>
          <CText
            style={[
              styles.selectedCountryText,
              {color: themeColors.textColor},
            ]}>
            {countryDetail?.dial_code || DEFAULT_COUNTRY.dial_code}
          </CText>
          <CText style={styles.flagIcon}>
            {countryDetail?.flag || DEFAULT_COUNTRY.flag}
          </CText>
          <Image
            style={[styles.arrowIcon, {tintColor: themeColors.textColor}]}
            source={appImages.arrowDownIcon}
          />
        </TouchableOpacity>
      </CView>
    );
  }

  return (
    <CView style={styles.dropdownContainer}>
      <TouchableOpacity
        style={[
          styles.dropdownHeader,
          {
            backgroundColor: Colors[mode]?.appBg,
            borderColor: themeColors.borderColor,
          },
        ]}
        onPress={handlePicker}>
        <CText
          style={[styles.selectedCountryText, {color: themeColors.textColor}]}>
          {countryDetail?.dial_code || DEFAULT_COUNTRY.dial_code}
        </CText>
        <CText style={styles.flagIcon}>
          {countryDetail?.flag || DEFAULT_COUNTRY.flag}
        </CText>
        <Image
          style={[styles.arrowIcon, {tintColor: themeColors.textColor}]}
          source={appImages.arrowDownIcon}
        />
      </TouchableOpacity>

      {Platform.OS === 'ios' ? (
        <CountryPickerWrapper
          show={show}
          onBackdropPress={handleClose}
          pickerButtonOnPress={handleSelectCountry}
          defaultCountryCode="IN"
          style={{
            modal: {
              height: 500,
              width: '100%',
              backgroundColor: themeColors.backgroundColor,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: themeColors.borderColor,
            },
            backdrop: {
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
            },
            textInput: {
              height: 40,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: themeColors.borderColor,
              backgroundColor: themeColors.inputBgColor,
              color: themeColors.textColor,
              paddingHorizontal: 10,
            },
            countryButtonStyles: {
              height: 50,
              backgroundColor: themeColors.backgroundColor,
              borderBottomWidth: 1,
              borderBottomColor: themeColors.borderColor,
            },
            flag: {
              fontSize: 24,
            },
            dialCode: {
              fontSize: 14,
              color: themeColors.textColor,
            },
            countryName: {
              fontSize: 14,
              color: themeColors.textColor,
            },
            searchMessageText: {
              color: themeColors.textColor,
            },
            countryMessageContainer: {
              backgroundColor: themeColors.backgroundColor,
            },
          }}
          {...rest}
        />
      ) : (
        show && (
          <CountryPickerWrapper
            show={true}
            onBackdropPress={handleClose}
            pickerButtonOnPress={handleSelectCountry}
            defaultCountryCode="IN"
            style={{
              modal: {
                height: 500,
                width: '100%',
                backgroundColor: themeColors.backgroundColor,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: themeColors.borderColor,
              },
              backdrop: {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              },
              textInput: {
                height: 40,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: themeColors.borderColor,
                backgroundColor: themeColors.inputBgColor,
                color: themeColors.textColor,
                paddingHorizontal: 10,
              },
              countryButtonStyles: {
                height: 50,
                backgroundColor: themeColors.backgroundColor,
                borderBottomWidth: 1,
                borderBottomColor: themeColors.borderColor,
              },
              flag: {
                fontSize: 24,
              },
              dialCode: {
                fontSize: 14,
                color: themeColors.textColor,
              },
              countryName: {
                fontSize: 14,
                color: themeColors.textColor,
              },
              searchMessageText: {
                color: themeColors.textColor,
              },
              countryMessageContainer: {
                backgroundColor: themeColors.backgroundColor,
              },
              line: {
                backgroundColor: themeColors.borderColor,
              },
              itemsList: {
                backgroundColor: themeColors.backgroundColor,
              },
            }}
            {...rest}
          />
        )
      )}
    </CView>
  );
};

export default CountryPickerDropdown;
