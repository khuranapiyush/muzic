import { StyleSheet } from 'react-native'
import Colors from '../../../common/Colors'

const getStyles = theme => {
  return StyleSheet.create({
    levelContainer: {
      marginTop: 10,
      paddingVertical: 16,
      borderColor: Colors[theme].cardBorderColor,
      borderWidth: 1,
      borderRadius: 8,
      backgroundColor: Colors[theme].cardBg,
      justifyContent: 'space-around'
    },
    walletCoinContainer: {
      marginTop: 10,
      padding: 16,
      borderColor: '#DADADA',
      borderWidth: 1,
      borderRadius: 8,
      backgroundColor: '#FFF'
    },
    itemContainer: {
      flex: 1,
      paddingHorizontal: 2
    },
    image: {
      alignSelf: 'center'
    },
    greenTickImage: {
      position: 'absolute',
      right: 16,
      height: 16,
      width: 16
    },
    textAlign: {
      paddingVertical: 5
    },
    coinContainer: {
      marginTop: 8
    },
    walletCoinIcon: {
      backgroundColor: '#DADADA',
      padding: 8,
      borderRadius: 8
    },
    coinStyle: {
      alignSelf: 'center'
    },
    textStyle: {
      alignSelf: 'flex-start',
      paddingHorizontal: 2
    },
    walletContent: { paddingLeft: 10 }
  })
}

export default getStyles
