import {StyleSheet, Platform} from 'react-native';
import Colors from '../../../common/Colors';

const getStyles = theme => {
  return StyleSheet.create({
    modal: {
      margin: 0,
      justifyContent: 'flex-end',
    },
    modalContainer: {
      backgroundColor: Colors[theme].appBg,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      justifyContent: 'center',
    },
    closeButton: {
      backgroundColor: 'red',
      padding: 10,
      borderRadius: 10,
      marginTop: 20,
      alignItems: 'center',
    },
    closeButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    modalContent: {
      // backgroundColor: Colors[theme].appBg,
      padding: 20,
      borderRadius: 10,
      // elevation: 5,
      marginHorizontal: 16,
    },
    modalLogoContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 16,
    },
    modalLogo: {
      width: 60,
      height: 60,
      resizeMode: 'contain',
      tintColor: '#FF3B30',
    },
    modalHeading: {
      marginBottom: 10,
      color: Colors[theme].white,
      fontWeight: '600',
      fontSize: 18,
      textAlign: 'center',
    },
    modalText: {
      marginBottom: 10,
      color: Colors[theme].white,
      fontWeight: '400',
      fontSize: 14,
      textAlign: 'left',
    },
    listContainer: {
      marginBottom: 20,
      paddingHorizontal: 10,
    },
    listItem: {
      color: Colors[theme].white,
      opacity: 0.8,
      marginBottom: 5,
      fontSize: 13,
    },
    btnContainer: {
      justifyContent: 'space-around',
      marginTop: 10,
    },
    submitBtn: {
      fontWeight: '500',
      fontSize: 16,
    },
    submitButton: {
      color: Colors[theme].commonWhite,
      textAlign: 'center',
      fontFamily: 'Nohemi',
      fontSize: 14,
      fontStyle: 'normal',
      fontWeight: '600',
      lineHeight: 16.8,
      letterSpacing: 0.28,
      textTransform: 'none',
    },
    buttonContainer: {
      alignItems: 'center',
      zIndex: 999,
    },
    createButton: {
      width: '100%',
      height: 50,
      borderRadius: 32,
      overflow: 'hidden',
    },
    gradient: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 100,
      borderWidth: 2,
      borderStyle: 'solid',
      borderColor: '#C87D48',
    },
    createButtonText: {
      color: '#000',
      fontSize: 18,
      fontWeight: '600',
      paddingHorizontal: 16,
      alignContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      ...(Platform.OS === 'ios' ? {paddingBottom: 3} : {}),
    },
  });
};
export default getStyles;
