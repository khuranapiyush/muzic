import { StyleSheet } from 'react-native';
import Colors from '../../../common/Colors';

const getStyles = theme => {
  return StyleSheet.create({
    dotContainer: {
      paddingTop: 15,
      paddingBottom: 0,
    },
    dotStyle: {
      width: 10,
      height: 10,
      borderRadius: 8,
      marginHorizontal: -7,
      backgroundColor: Colors[theme].activeDotColor,
    },

    inactiveDotStyle: {
      width: 10,
      height: 10,
      borderRadius: 8,
      marginHorizontal: -7,
      backgroundColor: Colors[theme].inActiveDotColor,
    },
  });
};
export default getStyles;
