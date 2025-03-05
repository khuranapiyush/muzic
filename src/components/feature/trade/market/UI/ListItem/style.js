import { StyleSheet } from 'react-native'
import Colors from '../../../../../common/Colors'

const getStyles = mode => {
  return StyleSheet.create({
    wrapper: {
      marginHorizontal: 5,
      marginBottom: '12%'
    },
    container: {
      marginBottom: 10,
      paddingVertical: 10,
      borderColor: Colors[mode].cardBorderColor,
      borderWidth: 1,
      borderRadius: 8,
      backgroundColor: Colors[mode].cardBg
    },

    portfolioContainer: {
      paddingTop: 20,
      justifyContent: 'space-around'
    },
    itemContainer: {
      marginTop: 2
    },
    profit: {
      color: '#3FBB5A'
    },
    loss: {
      color: 'red'
    },
    width50: {
      width: '50%'
    },
    width25: {
      width: '25%'
    },
    imageStyle: {
      marginHorizontal: 10,
      borderRadius: 5,
      height: 40,
      width: 40
    }
  })
}
export default getStyles
