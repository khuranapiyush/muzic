import { StyleSheet } from 'react-native';
import Colors from '../../common/Colors';

const getStyles = theme => {
  return StyleSheet.create({
    wrapper: { flex: 1, backgroundColor: Colors[theme].appBg },
    container: {
      flex: 1,
      marginTop: 10,
      marginHorizontal: 10,
      borderRadius: 12,
      borderColor: Colors[theme].cardBorderColor,
      borderWidth: 1,
      backgroundColor: Colors[theme].cardBg,
      padding: 10,
      justifyContent: 'space-between',
    },
    startAlign: { alignItems: 'flex-start' },
    title: {
      paddingVertical: 10,
    },
    icon: {
      width: 24,
      height: 24,
    },
    bankIconContainer: {
      backgroundColor: '#353535',
      shadowColor: '#000', // Shadow color
      shadowOffset: { width: 0, height: 1 }, // 1px vertical offset
      shadowOpacity: 0.2, // Approximately 70% opacity
      shadowRadius: 4, // Blurs the shadow
      elevation: 4,
      borderRadius: 4,
      // padding: 5
    },
    iconStyleFull: {
      width: '100%',
      height: '100%',
    },
    iconContainer: {
      backgroundColor: '#8A8A8A',
      padding: 8,
      borderRadius: 5,
      width: 50,
      height: 50,
    },
    bankAccountContainer: {
      marginBottom: 20,
    },
    rejected: {
      color: 'red',
    },
    paddingTop: { paddingTop: 8 },
    accountContainer: {
      marginTop: 10,
      borderRadius: 12,
      backgroundColor: Colors[theme].iconBg,
      padding: 16,
      justifyContent: 'space-between',
    },

    submitBtn: {
      buttonTextStyles: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors[theme]?.white,
      },
      iconStyles: {
        height: 30,
        width: 30,
        tintColor: Colors[theme]?.white,
        marginRight: 2,
      },
    },
    iconStyle: { height: 60, width: 60 },

    itemSeparator: {
      marginVertical: 20,
      flex: 1,
      borderColor: Colors[theme].cardBorderColor,
      borderWidth: 1,
    },

    successContainer: {
      marginTop: 10,
      padding: 15,
      flex: 1,
      borderRadius: 12,
      backgroundColor: 'rgba(72, 177, 110, 0.20)',
    },
    successContent: {
      paddingLeft: 10,
      flex: 1,
      color: '#48B16E',
      fontSize: 14,
      fontWeight: '500',
    },

    alertContainer: {
      marginTop: 10,
      padding: 15,
      flex: 1,
      borderRadius: 12,
      backgroundColor: 'rgba(220, 160, 72, 0.20)',
    },
    alertContent: {
      paddingLeft: 10,
      flex: 1,
      color: '#DCA048',
      fontSize: 14,
      fontWeight: '500',
    },
    iconFixHeight: {
      width: 15,
      height: 15,
    },

    paddingTop20: {
      paddingTop: 20,
    },
    grayColor: { color: '#959595' },
    codeWrapper: {
      marginTop: 20,
      marginHorizontal: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#0B091C',
      borderStyle: 'dashed',
    },
    linkStyle: {
      padding: 12,
      color: '#E14084',
    },
    smallIconStyle: {
      width: 20,
      height: 20,
    },
    shareIconStyle: {
      marginTop: 20,
      marginHorizontal: 20,
      width: 30,
      height: 30,
    },
    identityContainer: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    kycIconStyle: { width: 24, height: 24, resizeMode: 'contain' },
    statusSuccessStyle: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: 'rgba(72, 177, 110, 0.1)',
    },
    statusFailedStyle: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: 'rgba(251, 56, 54, 0.1)',
    },
    identityWrapper: {
      paddingHorizontal: 10,
      marginTop: 15,
      paddingVertical: 16,
    },
  });
};
export default getStyles;
