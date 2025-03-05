import { StyleSheet } from 'react-native'
import Colors from '../../../common/Colors'

const getStyle = theme => {
  return StyleSheet.create({
    container: {
      flex: 1,
      marginTop: 20,
      marginHorizontal: 10,
      borderRadius: 12,
      borderColor: Colors[theme].cardBorderColor,
      borderWidth: 1,
      backgroundColor: Colors[theme].cardBg,
      padding: 10,
      justifyContent: 'space-between'
    },
    textStyle: {
      color: '#FFF',
      alignSelf: 'center',
      width: '70%',
      justifyContent: 'center'
    },
    iconStyle: {
      width: 80,
      height: 80
    },
    paddingTop20: {
      paddingTop: 20
    },
    grayColor: { color: '#959595' },
    codeWrapper: {
      marginTop: 20,
      marginHorizontal: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Colors[theme].cardBg,
      borderStyle: 'dashed'
    },
    linkStyle: {
      padding: 12,
      color: '#FE9BF3'
    },
    smallIconStyle: {
      width: 20,
      height: 20,
      tintColor: '#FFF'
    },
    shareIconStyle: {
      marginTop: 20,
      marginHorizontal: 20,
      width: 30,
      height: 30,
      tintColor: '#FFF'
    }
  })
}
export default getStyle
