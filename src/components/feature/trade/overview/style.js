import { StyleSheet } from 'react-native'
import Colors from '../../../common/Colors'

const getStyles = theme => {
  return StyleSheet.create({
    container: {
      flex: 1
    },
    activeTabLabel: {
      color: Colors[theme].white,
      fontFamily: 'Nohemi',
      fontSize: 14,
      fontStyle: 'normal',
      fontWeight: '400',
      lineHeight: 16.8,
      letterSpacing: 0.28
    },
    inactiveTabLabel: {
      color: Colors[theme].textLightGray,
      fontFamily: 'Nohemi',
      fontSize: 14,
      fontStyle: 'normal',
      fontWeight: '400',
      lineHeight: 16.8,
      letterSpacing: 0.28
    },
    tabContainer: {
      marginHorizontal: 40,
      borderBottomColor: 'gray',
      borderBottomWidth: 1,
      backgroundColor: 'transparent'
    },
    activeIndicatorStyle: {
      backgroundColor: Colors[theme].white,
      height: 2
    }
  })
}
export default getStyles
