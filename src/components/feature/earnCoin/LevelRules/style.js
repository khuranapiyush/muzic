import { StyleSheet } from 'react-native'
import Colors from '../../../common/Colors'

const getStyles = theme => {
  return StyleSheet.create({
    wrapper: {
      marginTop: 20
    },
    levelContainer: {
      marginTop: 10,
      paddingVertical: 16,
      borderColor: Colors[theme].cardBorderColor,

      borderWidth: 1,
      width: '100%',
      borderRadius: 8,
      backgroundColor: Colors[theme].cardBg,

      alignItems: 'center',
      justifyContent: 'space-around'
    },
    itemContainer: {
      flex: 1,
      paddingHorizontal: 1
    },
    image: {
      height: 45,
      width: 45,
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
    headingStyle: {
      justifyContent: 'space-around',
      marginVertical: 10
    },
    width20: { width: '20%' },
    width10: { width: '10%' }
  })
}
export default getStyles
