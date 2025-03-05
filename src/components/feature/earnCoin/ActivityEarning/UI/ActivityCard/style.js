import { StyleSheet } from 'react-native'
import Colors from '../../../../../common/Colors'

const getStyles = theme => {
  return StyleSheet.create({
    wrapper: {
      backgroundColor: Colors[theme].appBg,
      borderRadius: 12,
      padding: 20,
      marginHorizontal: 10
    },
    contentContainer: {
      justifyContent: 'space-between'
    },
    imageContainer: {
      width: 60,
      height: 60,
      borderRadius: 0,
      overflow: 'hidden',
      backgroundColor: 'transparent',
      borderWidth: 0
    },
    coinLimit: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '600',
      color: Colors[theme].white
    },
    summary: {
      fontSize: 12,
      paddingTop: 5,
      lineHeight: 18,
      fontWeight: '400',
      color: Colors[theme].white
    },
    coinPerActivity: {
      textAlignVertical: 'bottom',
      paddingTop: 10,
      fontSize: 12,
      color: Colors[theme].white
    }
  })
}
export default getStyles
