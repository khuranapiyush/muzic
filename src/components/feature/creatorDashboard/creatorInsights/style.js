import { StyleSheet } from 'react-native'
import Colors from '../../../common/Colors'

const getStyle = theme => {
  return StyleSheet.create({
    wrapper: {
      paddingTop: 10,
      paddingHorizontal: 10
    },
    levelContainer: {
      marginTop: 10,
      paddingHorizontal: 10,
      paddingVertical: 15,
      borderWidth: 1,
      borderRadius: 8,
      borderColor: Colors[theme].cardBorderColor,
      backgroundColor: Colors[theme].cardBg,

      justifyContent: 'space-between'
    },
    itemLabelStyle: {
      fontWeight: '500',
      fontStyle: 'normal',
      fontSize: 15,
      lineHeight: 22
    },
    iconStyle: {
      marginLeft: 15,
      height: 18,
      width: 18
    },
    increaseIconStyle: {
      height: 8,
      width: 8,
      marginRight: 5
    },
    textColor: {
      // color: '#959595',
      fontWeight: '500',
      fontSize: 12
    },
    increaseStyle: {
      fontSize: 12,
      fontWeight: '500'
      // color: '#54B5BB'
    },
    decreaseStyle: {
      fontSize: 12,
      color: 'red'
    },
    paddingTop15: {
      paddingTop: 15
    }
  })
}

export default getStyle
