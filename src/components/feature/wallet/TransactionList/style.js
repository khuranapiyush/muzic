import { StyleSheet } from 'react-native';
import Colors from '../../../common/Colors';

const getStyles = theme => {
  return StyleSheet.create({
    textNormal: {
      fontSize: 12,
      lineHeight: 21,
      fontWeight: '400',
    },

    headingText: {
      color: '#FFF',
      fontSize: 18,
      fontWeight: '700',
      lineHeight: 20,
    },
    transactionContainer: {
      paddingVertical: 10,
      // borderColor: Colors[theme].cardBorderColor,
      backgroundColor: Colors[theme].cardBg,
      // borderWidth: 1,
      borderRadius: 12,
      padding: 12,
    },
    itemCenter: {
      flex: 1,
    },
    iconContainer: {
      backgroundColor: 'rgba(72, 177, 110, 0.1)',
      borderRadius: 12,
      padding: 15,
    },
    iconStyle: {
      width: 20,
      height: 20,
    },
    textContainer: {
      flex: 1,
      marginLeft: 8,
    },
    detailContainer: {
      paddingTop: 8,
      paddingLeft: 8,
      justifyContent: 'space-between',
    },
    maxWidthRightItem: {
      maxWidth: '50%',
    },
    arrowIconStyle: {
      width: 20,
      height: 20,
      marginLeft: 4,
      tintColor: Colors[theme].white,
    },
    revArrowIconStyle: {
      width: 20,
      height: 20,
      marginLeft: 4,
      tintColor: Colors[theme].white,
      transform: [{ rotate: '180deg' }],
    },

    rightAlignedItem: {
      justifyContent: 'flex-end',
    },
    coinStyle: {
      marginTop: 3,
      width: 15,
      height: 15,
      marginHorizontal: 4,
    },
    dateColor: {
      color: '#959595',
    },
    labelStyle: {
      overflow: 'hidden',
      flexShrink: 1,
    },
    padding5: {
      paddingTop: 5,
    },
  });
};

export default getStyles;
