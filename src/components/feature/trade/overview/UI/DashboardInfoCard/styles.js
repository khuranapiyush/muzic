import { StyleSheet } from 'react-native';
import Colors from '../../../../../common/Colors';

const getStyles = theme => {
  return StyleSheet.create({
    wrapper: {
      paddingVertical: 15,
      borderColor: Colors[theme].cardBorderColor,
      borderWidth: 1,
      borderRadius: 8,
      backgroundColor: Colors[theme].cardBg,
    },
    container: {
      justifyContent: 'space-around',
    },

    portfolioContainer: {
      paddingTop: 20,
      justifyContent: 'space-around',
    },
    itemContainer: {
      marginTop: 2,
    },
    profit: {
      color: '#3FBB5A',
    },
    loss: {
      color: 'red',
    },
  });
};
export default getStyles;
