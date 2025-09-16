import { StyleSheet } from 'react-native';
import Colors from '../../../common/Colors';

const getStyles = theme => {
  return StyleSheet.create({
    levelContainer: {
      marginTop: 10,
      paddingVertical: 16,
      borderColor: Colors[theme].cardBorderColor,
      borderWidth: 1,
      borderRadius: 8,
      backgroundColor: Colors[theme].cardBg,
      justifyContent: 'space-around',
    },
    walletCoinContainer: {
      marginTop: 10,
      padding: 16,
      // borderColor: Colors[theme].cardBorderColor,
      // borderWidth: 1,
      borderRadius: 8,
      backgroundColor: Colors[theme].cardBg,
    },
    itemContainer: {
      flex: 1,
      paddingHorizontal: 2,
    },
    image: {
      alignSelf: 'center',
    },
    greenTickImage: {
      position: 'absolute',
      right: 16,
      height: 16,
      width: 16,
    },
    textAlign: {
      paddingVertical: 5,
    },
    coinContainer: {
      marginTop: 8,
    },
    walletCoinIcon: {
      backgroundColor: Colors[theme].iconBg,
      padding: 8,
      borderRadius: 8,
    },
    coinStyle: {
      height: 30,
      width: 30,
      tintColor: Colors[theme].white,
      alignSel0: 'center',
    },
    iconStyle: {
      height: 25,
      width: 25,
      objectFit: 'cover',
    },
    textStyle: {
      alignSelf: 'flex-start',
      color: Colors[theme].textLightGray,
    },
    walletContent: { paddingLeft: 10 },
    walletWrapper: {
      display: 'flex',
      justifyContent: 'space-between',
      paddingTop: 20,
    },
    paddingLeft10: {
      paddingTop: 5,
      paddingLeft: 5,
    },
  });
};

export default getStyles;
