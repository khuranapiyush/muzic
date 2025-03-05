import { StyleSheet } from 'react-native'
import Colors from '../../../common/Colors'

const getStyles = theme => {
  return StyleSheet.create({
    wrapper: {
      paddingTop: 20,
      justifyContent: 'space-between'
    },

    coinContainer: {
      backgroundColor: Colors[theme].iconBg,
      padding: 8,
      marginRight: 8,
      borderRadius: 8
    },
    coinStyle: {
      height: 32,
      width: 32
      // alignSelf: 'center'
    },
    textStyle: {
      alignSelf: 'center',
      paddingHorizontal: 2
    },
    streakContainer: {
      borderWidth: 0.5,
      borderColor: '#FE964A',
      padding: 11,
      backgroundColor: Colors[theme].dailyStreakBg,
      marginTop: 10,
      borderRadius: 12,
      justifyContent: 'space-between'
    },
    streakCountContainer: {
      backgroundColor: Colors[theme].cardBg,
      paddingVertical: 15,
      marginHorizontal: 5,
      marginTop: 15,
      borderRadius: 8
    },
    streakCountStyle: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center'
    },
    itemStyle: {
      padding: 8,
      marginHorizontal: 5,
      alignItems: 'center',
      justifyContent: 'flex-end'
    },

    moreDetails: {
      alignSelf: 'flex-end',
      paddingTop: 10,
      paddingRight: 20
    }
  })
}
export default getStyles
