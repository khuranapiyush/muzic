import { StyleSheet } from 'react-native';
import Colors from '../../../../../common/Colors';

const getStyles = theme => {
  return StyleSheet.create({
    wrapper: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Colors[theme].cardBorderColor,
      backgroundColor: Colors[theme].cardBg,
      paddingVertical: 14,
      marginRight: 16,
    },
    leftIcon: {
      width: 24,
      height: 24,
      marginRight: 8,
      tintColor: Colors[theme].white,
    },
    labelText: {
      fontSize: 16,
      fontWeight: '600',
    },
  });
};
export default getStyles;
