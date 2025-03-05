import { StyleSheet } from 'react-native'
import Colors from '../../../common/Colors'

const getStyles = theme => {
  return StyleSheet.create({
    modal: {
      margin: 0,
      justifyContent: 'flex-end'
    },
    modalContainer: {
      backgroundColor: Colors[theme].appBg,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      justifyContent: 'center'
    },
    closeButton: {
      backgroundColor: 'red',
      padding: 10,
      borderRadius: 10,
      marginTop: 20,
      alignItems: 'center'
    },
    closeButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold'
    },
    modalContent: {
      backgroundColor: Colors[theme].appBg,
      padding: 20,
      borderRadius: 10,
      elevation: 5,
      marginHorizontal: 16
    },
    modalLogoContainer: { justifyContent: 'center', marginVertical: 16 },
    modalLogo: {
      marginHorizontal: 15,
      width: 120,
      height: 42,
      resizeMode: 'contain'
    },
    modalHeading: {
      marginBottom: 20,
      color: Colors[theme].white,
      fontWeight: '600',
      fontSize: 16,
      textAlign: 'center'
    },
    modalText: {
      marginBottom: 20,
      color: '#0B091C',
      fontWeight: '400',
      fontSize: 14,
      textAlign: 'center'
    },
    btnContainer: { justifyContent: 'space-around' },
    submitBtn: { fontWeight: '500', fontSize: 16 }
  })
}
export default getStyles
