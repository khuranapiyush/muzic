import { StyleSheet } from 'react-native'
import Colors from '../../../../common/Colors'

const getStyles = theme => {
  return StyleSheet.create({
    wrapper: {
      paddingTop: 10,
      paddingHorizontal: 10
    },
    levelContainer: {
      marginTop: 10,
      paddingHorizontal: 10,
      paddingVertical: 15,
      borderColor: Colors[theme].cardBorderColor,
      backgroundColor: Colors[theme].cardBg,
      borderWidth: 1,
      borderRadius: 8,
      justifyContent: 'space-between'
    },
    itemLabelStyle: {
      fontWeight: '500',
      fontStyle: 'normal',
      fontSize: 14,
      lineHeight: 22
    },
    iconStyle: {
      marginLeft: 15,
      height: 18,
      width: 18
    }
  })
}

export default getStyles
