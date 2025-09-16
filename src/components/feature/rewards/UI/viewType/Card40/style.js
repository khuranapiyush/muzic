import { StyleSheet } from 'react-native';
import Colors from '../../../../../common/Colors';

const getStyles = theme => {
  return StyleSheet.create({
    wrapper: { marginBottom: 30 },
    feedHeaderText: {
      color: Colors[theme].white,
      fontWeight: '600',
      fontSize: 16,
    },
    feedDescriptionWrapper: { marginTop: 8 },
    feedDescriptionText: {
      color: Colors[theme].textLightGray,
      fontWeight: '500',
      fontSize: 12,
    },
    itemWrapper: {
      marginTop: 16,
    },

    modal: {
      margin: 'auto',
      bottom: 0,
      zIndex: 0,
      justifyContent: 'flex-end',
    },

    modalContainer: {
      backgroundColor: Colors[theme].appBg,
      borderRadius: 20,
      padding: 15,
      paddingTop: 20,
      flex: 1,
    },
    titleContainer: {
      position: 'absolute',
      right: -5,
      top: 10,
      flex: 1,
      zIndex: 9999,
      justifyContent: 'flex-end',
    },
    closeButton: {
      flex: 1,
      zIndex: 9999,
      marginRight: 20,
      alignItems: 'center',
      height: 30,
      width: 30,
      tintColor: Colors[theme].white,
    },
    modalLogo: {
      height: 40,
      width: 40,
      // marginTop: 30
    },
    itemContainer: {
      justifyContent: 'space-between',
      marginTop: 25,
      height: 50,
      borderRadius: 20,
    },
    flex1: { flex: 1 },

    iconContainer: {
      backgroundColor: '#FFFFFF',
      borderRadius: 100,
      padding: 5,
      shadowColor: '#00000033',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 1,
      shadowRadius: 3,
    },

    radioIcon: {
      marginTop: 5,
      height: 30,
      width: 30,
    },

    selectedItemContainer: {
      borderRadius: 20,
    },

    modalContent: {
      backgroundColor: 'white',
      paddingVertical: 20,
      borderRadius: 24,
      flexGrow: 1,
      flex: 1,
    },
    submitBtn: { fontWeight: '700' },
    btnContainer: {
      paddingTop: 30,
      justifyContent: 'space-around',
      paddingBottom: 20,
    },
    dividerStyle: {
      borderWidth: 1,
      marginTop: 10,
      marginBottom: 10,
    },
    paddingLeftRight: {
      paddingTop: 5,
      paddingHorizontal: 15,
    },
    container: {
      backgroundColor: Colors[theme].appBg,
      borderRadius: 24,
      zIndex: 9,
      minHeight: '40%',
      maxHeight: '80%',
    },
    content: {
      flexGrow: 1,
    },
    marginTop20: {
      marginTop: 20,
    },
    successLottie: {
      flex: 1,
      position: 'absolute',
      top: 0,
      width: '100%',
      height: '100%',
    },
    pendingLottie: {
      position: 'relative',
      top: 0,
      width: '100%',
      height: '100%',
    },
    margin30: {
      marginBottom: 30,
    },
  });
};
export default getStyles;
