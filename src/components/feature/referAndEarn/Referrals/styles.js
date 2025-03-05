import { StyleSheet } from 'react-native'
import Colors from '../../../common/Colors'

const getStyle = theme => {
  return StyleSheet.create({
    wrapper: {
      marginVertical: 10,
      flex: 1
    },
    container: {
      justifyContent: 'space-between',
      marginHorizontal: 10,
      marginBottom: 15,
      borderColor: Colors[theme].cardBorderColor,
      backgroundColor: Colors[theme].cardBg,
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 20,
      paddingVertical: 15
    },
    titleContainer: {
      marginHorizontal: 10,
      marginBottom: 15
    },
    itemContainer: {
      justifyContent: 'space-between',
      marginHorizontal: 10,
      borderColor: Colors[theme].cardBorderColor,
      backgroundColor: Colors[theme].cardBg,
      borderWidth: 1,
      borderRadius: 5,
      paddingHorizontal: 20,
      paddingVertical: 15
    },
    coloredText: {
      fontSize: 18,
      fontWeight: '600',
      color: '#E14084',
      lineHeight: 20
    },
    subText: {
      fontSize: 12,
      fontWeight: '500',
      color: '#959595'
    },
    amountStyle: {
      color: '#56B5BB'
    },
    profilePicStyle: {
      borderRadius: 100,
      width: 30,
      height: 30,
      marginRight: 15,
      borderWidth: 1,
      borderColor: '#DADADA'
    }
  })
}
export default getStyle
