import { StyleSheet } from 'react-native'
import Colors from '../../../common/Colors'

const getStyles = theme => {
  return StyleSheet.create({
    wrapper: {
      paddingTop: 10,
      justifyContent: 'space-between'
    },

    coinContainer: {
      backgroundColor: '#DADADA',
      padding: 8,
      borderRadius: 8
    },
    coinStyle: {
      alignSelf: 'center'
    },
    textStyle: {
      alignSelf: 'center',
      paddingHorizontal: 2
    },
    streakContainer: {
      borderWidth: 0.5,
      borderColor: '#CDFF4D',
      padding: 16,
      borderRadius: 12
      // backgroundColor: Colors[theme].activeEarningBg
    },
    streakCountContainer: {
      backgroundColor: Colors[theme].cardBg,
      paddingVertical: 15,
      marginTop: 15,
      marginHorizontal: 5,
      borderRadius: 8
    },
    streakCountStyle: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start'
    },
    itemStyle: {
      padding: 8
    },

    moreDetails: {
      alignSelf: 'center',
      paddingTop: 10,
      paddingRight: 20
    }
  })
}

export default getStyles
