import { StyleSheet } from 'react-native'
import Colors from '../../common/Colors'

const styles = theme => {
  return StyleSheet.create({
    container: {
      flex: 1
    },
    activeTabLabel: {
      color: '#FE9BF3',
      margin: 8
    },
    inactiveTabLabel: {
      color: Colors[theme].white,
      margin: 8
    },
    tabContainer: {
      backgroundColor: Colors[theme].appBg
    },
    activeIndicatorStyle: {
      backgroundColor: '#FE9BF3',
      height: 2
    }
  })
}
export default styles
