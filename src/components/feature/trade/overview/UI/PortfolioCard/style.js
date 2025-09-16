import { StyleSheet } from 'react-native';
import Colors from '../../../../../common/Colors';

const getStyles = theme => {
  return StyleSheet.create({
    wrapper: {
      padding: 15,
      borderColor: Colors[theme].cardBorderColor,
      borderWidth: 1,
      borderRadius: 8,
      backgroundColor: Colors[theme].cardBg,
    },
    container: {
      paddingTop: 20,
      justifyContent: 'space-between',
    },
    returnContainer: {
      paddingTop: 20,
      justifyContent: 'space-around',
    },
    contentContainer: {
      padding: 10,
    },
    btnContainer: {
      alignSelf: 'center',
      height: 30,
      paddingHorizontal: 10,
      borderRadius: 4,
      backgroundColor: '#6B61FF',
    },

    imageStyle: {
      borderRadius: 4,
      height: 50,
      width: 50,
      marginRight: 5,
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
    titleContainer: {
      justifyContent: 'space-between',
    },
    title: { alignSelf: 'flex-start', width: '70%' },
    nameStyle: { flex: 1 },
  });
};

export default getStyles;
