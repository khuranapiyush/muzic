import { StyleSheet } from 'react-native'
import Colors from '../../Colors'

const getStyles = theme => {
  return StyleSheet.create({
    drawerItem: {
      alignItems: 'center',
      paddingVertical: 16
    },
    logo: {
      width: 24,
      height: 24,
      marginRight: 10,
      tintColor: Colors[theme].white
    },
    drawerLabel: {
      flex: 1,
      fontSize: 16,
      fontWeight: 'normal'
    },
    icon: {
      width: 18,
      height: 18,
      tintColor: Colors[theme].white
    }
  })
}

export default getStyles
