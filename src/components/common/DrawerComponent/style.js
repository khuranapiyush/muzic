import { StyleSheet } from 'react-native'
import Colors from '../Colors'

const getStyles = theme => {
  return StyleSheet.create({
    dividerStyle: {
      borderWidth: 1,
      borderColor: '#DBDBDE',
      marginTop: 16,
      marginBottom: 8,
      marginHorizontal: -16
    },
    drawerComponentWrapper: {
      backgroundColor: Colors[theme].appBg,
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 16
    }
  })
}

export default getStyles
