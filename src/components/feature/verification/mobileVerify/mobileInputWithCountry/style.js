import { StyleSheet } from 'react-native'
import Colors from '../../../../common/Colors'

const getStyles = theme => {
  return StyleSheet.create({
    container: {
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      paddingHorizontal: '4%',
      paddingVertical: 30,
      height: '100%',
      backgroundColor: Colors[theme]?.appBg
    },
    labelContainer: {
      marginBottom: 32,
      alignItems: 'center'
    },
    label: {
      color: Colors[theme]?.white,
      fontSize: 20,
      fontWeight: '600'
    },
    mobileTextContainer: { marginBottom: 10 },
    mobileContainer: {
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16
    },
    mobileItemContainer: { marginLeft: 4 },
    btnContainer: { marginVertical: 16 },
    submitBtn: {
      buttonTextStyles: { fontSize: 18, fontWeight: '700' }
    }
  })
}
export default getStyles
