import { StyleSheet } from 'react-native'
import Colors from '../../../common/Colors'

const getStyles = them => {
  return StyleSheet.create({
    modal: {
      margin: 'auto',
      // marginHorizontal: 5,
      bottom: 0,
      zIndex: 9,
      justifyContent: 'flex-end'
    },
    modalContainer: {
      backgroundColor: Colors[them].commonWhite,
      borderRadius: 20
      // flex: 1,
      // minHeight: '30%',
      // maxHeight: '80%'
    },
    titleContainer: {
      position: 'absolute',
      right: 0,
      top: 15,
      flex: 1,
      zIndex: 9,
      justifyContent: 'flex-end'
    },
    closeButton: {
      flex: 1,
      zIndex: 9,
      marginRight: 20,
      alignItems: 'center',
      height: 30,
      width: 30
    },
    modalContent: {
      backgroundColor: Colors[them].commonWhite,
      paddingVertical: 20,
      borderRadius: 24,
      flexGrow: 1
    },
    modalHeading: {
      marginBottom: 10,
      marginTop: 20,
      color: '#0B091C',
      fontWeight: '400',
      fontSize: 14
    },

    listContainer: {
      backgroundColor: '#F8F8F8',
      borderColor: '#E9E9E9',
      borderWidth: 0.5,
      padding: 10,
      margin: 8,
      borderRadius: 12,
      color: '#000'
    },

    listTitle: {
      width: '70%',
      fontWeight: '400',
      textAlign: 'left',
      color: Colors[them].commonBlack
    },
    listValue: {
      width: '30%',
      textAlign: 'left',
      alignSelf: 'center',
      color: Colors[them].commonBlack
    },
    submitBtn: { fontWeight: '700' },
    btnContainer: {
      paddingTop: 20,
      justifyContent: 'space-around'
    },
    dividerStyle: {
      borderWidth: 1,
      marginTop: 10,
      marginBottom: 10
    },
    paddingLeftRight: {
      paddingTop: 5,
      paddingHorizontal: 15
    },
    container: {
      // flex: 1,
      // justifyContent: 'flex-end',
      backgroundColor: 'white',
      borderRadius: 24,
      zIndex: 9,
      minHeight: '30%',
      maxHeight: '80%'
    },
    content: {
      flexGrow: 1
    },
    marginTop20: {
      marginTop: 20
    },
    marginBottom15: {
      marginBottom: 15
    },
    mintingIconStyle: {
      width: 100,
      height: 100,
      marginVertical: 30
    },
    fontBold: {
      fontWeight: '700'
    },
    successIcon: {
      width: 100,
      height: 100
    }
  })
}
export default getStyles
