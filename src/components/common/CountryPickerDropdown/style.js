import {StyleSheet} from 'react-native';
import Colors from '../Colors';

const getStyles = theme => {
  return StyleSheet.create({
    dropdownContainer: {
      alignItems: 'center',
      width: 120,
      height: 44,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Colors[theme]?.cardBorderColor,
      backgroundColor: Colors[theme]?.appBg,
    },
    dropdownHeader: {
      height: 44,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 10,
      borderRadius: 12,
    },
    flag: {
      width: 24,
      height: 24,
      marginRight: 10,
    },
    selectedCountryText: {
      flex: 1,
      fontSize: 16,
    },
    arrowIcon: {
      tintColor: Colors[theme]?.white,
      width: 16,
      height: 16,
    },
    flagIcon: {fontSize: 20, marginHorizontal: 10},
  });
};
export default getStyles;
