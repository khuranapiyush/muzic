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
      overflow: 'hidden',
      height: 240,
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
      height: 46,
      width: 46,
      shadowColor: '#FFFFFF', // Color of the shadow
      shadowOffset: { width: 0, height: 0 }, // Position of the shadow
      shadowOpacity: 0.25, // Adjust this to match `#FFFFFF40` (40% opacity)
      shadowRadius: 8, // Radius for the shadow spread
      elevation: 8,
    },
    iconContainer: {
      shadowColor: '#FFFFFF', // Color of the shadow
      shadowOffset: { width: 0, height: 0 }, // Position of the shadow
      shadowOpacity: 0.25, // Adjust this to match `#FFFFFF40` (40% opacity)
      shadowRadius: 8, // Radius for the shadow spread
      elevation: 8,
    },
    coinStyle: {
      height: 30,
      width: 30,
    },
    textStyle: {
      alignSelf: 'flex-start',
      paddingHorizontal: 2,
      width: '100%',
      color: Colors[theme].textLightGray,
    },
    walletContent: { paddingLeft: 10, flex: 1 },
    submitBtn: { fontWeight: '700', fontSize: 14 },
    btnContainer: {
      marginTop: 30,
      marginRight: 10,
    },
    width50: {
      width: '50%',
      flex: 1,
    },
    valueTextStyle: {
      alignSelf: 'flex-start',
      paddingHorizontal: 2,
      width: '100%',
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 24,
      color: Colors[theme].white,
    },
  });
};

export default getStyles;
