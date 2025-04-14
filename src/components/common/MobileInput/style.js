import {StyleSheet} from 'react-native';
import Colors from '../Colors';

const getStyles = theme => {
  return StyleSheet.create({
    input: {
      borderWidth: 1,
      borderColor: Colors[theme].cardBorderColor,
      backgroundColor: Colors[theme].appBg,
      color: Colors[theme].textBlack,
      borderRadius: 12,
      fontSize: 14,
      height: 44,
      width: 215,
      paddingHorizontal: 20,
    },
  });
};
export default getStyles;
