import { StyleSheet } from 'react-native';
import Colors from '../../../../../common/Colors';

const getStyles = theme => {
  return StyleSheet.create({
    wrapper: {
      paddingHorizontal: 5,
      marginBottom: 20,
    },

    cardContainer: {
      marginTop: 10,
      width: '33%',
      borderColor: Colors[theme].cardBorderColor,
      borderWidth: 1,
      borderRadius: 10,
      backgroundColor: Colors[theme].cardBg,
    },
    cardContainerWithSpace: {
      marginTop: 10,
      width: '33%',
      borderColor: Colors[theme].cardBorderColor,
      borderWidth: 1,
      borderRadius: 10,
      backgroundColor: Colors[theme].cardBg,
      marginHorizontal: 5,
    },
    contentContainer: {
      padding: 10,
    },

    imageStyle: {
      borderRadius: 10,
      height: 130,
      width: '100%',
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
    marginTop15: {
      marginTop: 15,
    },
    headerContainer: {
      justifyContent: 'space-between',
    },
  });
};

export default getStyles;
