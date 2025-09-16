import { StyleSheet } from 'react-native';
import Colors from '../../../common/Colors';

const getStyles = theme => {
  return StyleSheet.create({
    wrapper: { flex: 1, margin: 10 },
    flex1: {
      flex: 1,
    },
    container: {
      marginTop: 20,
      justifyContent: 'center',
    },
    paddingTop20: {
      paddingTop: 20,
    },
    iconStyle: {
      width: 50,
      height: 50,
    },
    iconContainer: {
      // borderColor: '#DADADA',
      padding: 10,
      // borderWidth: 1,
      borderRadius: 5,
      width: 40,
      height: 40,
    },
    selectedBackAccountContainer: {
      marginBottom: 10,
      borderColor: '#E14084',
      paddingHorizontal: 10,
      paddingVertical: 15,
      borderWidth: 1,
      borderRadius: 5,
    },

    backAccountContainer: {
      marginBottom: 10,
      borderColor: '#DADADA',
      paddingHorizontal: 10,
      paddingVertical: 15,
      borderWidth: 1,
      borderRadius: 5,
    },

    btnContainer: {
      marginTop: 20,
      justifyContent: 'space-between',
    },
    confirmBtnContainer: {
      marginTop: 20,
      justifyContent: 'space-between',
    },
    submitBtn: { fontWeight: '700' },
    closeContainer: {
      flex: 1,
      marginRight: 20,
    },
    radioIcon: {
      height: 30,
      width: 30,
    },

    marginTop20: {
      marginTop: 20,
    },
    marginInline: {
      marginHorizontal: 15,
    },
    addAccountContainer: {
      marginTop: 10,
      borderColor: '#DADADA',
      backgroundColor: Colors[theme].secondaryBackground,
      paddingHorizontal: 10,
      paddingVertical: 15,
      borderWidth: 1,
      borderRadius: 5,
    },
    input: {
      borderWidth: 1,
      borderColor: Colors[theme].inputBorderColor,
      borderRadius: 12,
      fontSize: 14,
      height: 44,
      color: Colors[theme].white,
      width: '100%',
      paddingHorizontal: 15,
    },
    alignStart: {
      alignSelf: 'flex-start',
    },
    errorColor: {
      color: 'red',
    },
  });
};
export default getStyles;
