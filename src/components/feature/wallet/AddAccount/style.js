import { StyleSheet } from 'react-native'
import Colors from '../../../common/Colors'

const getStyles = theme => {
  return StyleSheet.create({
    wrapper: { flex: 1 },
    container: {
      marginTop: 20,
      marginHorizontal: 15,
      justifyContent: 'center',
      backgroundColor: Colors[theme].cardBg,
      borderRadius: 12,
      padding: 15
    },
    paddingTop20: {
      paddingTop: 20
    },
    iconStyle: {
      width: '100%',
      height: '100%'
    },
    bankIconContainer: {
      backgroundColor: '#353535',
      shadowColor: '#000', // Shadow color
      shadowOffset: { width: 0, height: 1 }, // 1px vertical offset
      shadowOpacity: 0.44, // Approximately 70% opacity
      shadowRadius: 4, // Blurs the shadow
      elevation: 4,
      borderRadius: 4
    },
    iconStyleFull: {
      width: '100%',
      height: '100%'
    },
    iconContainer: {
      backgroundColor: '#8A8A8A',
      padding: 8,
      borderRadius: 5,
      width: 50,
      height: 50
    },
    bankAccountContainer: {
      marginBottom: 20
    },
    btnContainer: {
      flex: 1,
      marginTop: 40,
      justifyContent: 'space-around',
      width: '100%'
    },
    submitBtn: { fontWeight: '700', color: Colors[theme].white },
    closeContainer: {
      flex: 1,
      marginRight: 20
    },
    addAccountContainer: {
      flex: 1
    },
    marginTop20: {
      marginTop: 20
    },
    marginInline: {
      // marginHorizontal: 15
    },
    inputStyles: { borderRadius: 12, backgroundColor: Colors[theme].appBg }
  })
}
export default getStyles
