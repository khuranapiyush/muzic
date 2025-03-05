import { StyleSheet } from 'react-native'
import Colors from '../../../../common/Colors'

const getStyle = theme => {
  return StyleSheet.create({
    textNormal: {
      fontSize: 12,
      lineHeight: 21,
      fontWeight: '400'
    },

    headingText: {
      color: '#FFF',
      fontSize: 18,
      fontWeight: '700',
      lineHeight: 20
    },
    transactionContainer: {
      paddingVertical: 10,
      borderColor: Colors[theme].cardBorderColor,
      backgroundColor: Colors[theme].cardBg,
      borderWidth: 1,
      borderRadius: 12,
      padding: 12
    },
    itemCenter: {
      maxWidth: '60%',
      alignItems: 'center'
    },
    iconStyle: {
      width: 40,
      height: 40
    },
    textContainer: {
      marginLeft: 8
    },
    detailContainer: {
      paddingTop: 8,
      paddingLeft: 8,
      justifyContent: 'space-between'
    },
    maxWidthRightItem: {
      maxWidth: '50%'
    },
    arrowIconStyle: {
      width: 24,
      height: 24,
      marginLeft: 8,
      tintColor: Colors[theme].white
    },
    revArrowIconStyle: {
      width: 24,
      height: 24,
      marginLeft: 8,
      tintColor: Colors[theme].white,
      transform: [{ rotate: '180deg' }]
    },

    rightAlignedItem: {
      flex: 1,
      justifyContent: 'flex-end'
    },
    coinStyle: {
      width: 24,
      height: 24,
      marginHorizontal: 4
    },
    dateColor: {
      color: '#959595'
    },
    textColor: {
      color: '#959595',
      fontWeight: '500',
      fontSize: 14
    },
    levelTitleStyle: {
      fontWeight: '500'
    }
  })
}

export default getStyle
