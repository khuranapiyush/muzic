import { StyleSheet } from 'react-native';
import Colors from '../Colors';

const getStyles = theme => {
  return StyleSheet.create({
    input: {
      borderWidth: 0,
      // borderColor: '#DADADA',
      backgroundColor: Colors[theme].secondaryBackground,
      borderRadius: 12,
      fontSize: 14,
      height: 44,
      width: '100%',
      paddingHorizontal: 15,
    },
  });
};
export default getStyles;
