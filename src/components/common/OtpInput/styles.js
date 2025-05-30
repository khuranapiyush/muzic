import {StyleSheet, Platform} from 'react-native';
import Colors from '../Colors';

const getStyles = theme => {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      color: '#0C091B',
    },
    label: {
      fontSize: 20,
      fontWeight: '700',
      textTransform: 'uppercase',
      fontFamily: 'Bricolage Grotesque',
      lineHeight: 30,
    },
    description: {
      fontSize: 14,
      fontWeight: '400',
      marginVertical: 12,
      lineHeight: 21,
      display: 'flex',
      color: Colors[theme].textLightGray,
    },
    otpInputViewWrapper: {width: '80%', height: 100, marginVertical: 12},
    codeInputFieldStyle: {
      width: 54,
      height: 54,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#DADADA',
      backgroundColor: Colors[theme].cardBg,
      color: Colors[theme].white,
      fontSize: 20,
      fontWeight: '400',
    },
    codeInputHighlightStyle: {
      borderColor: '#E14084',
    },
    utilityContainer: {
      width: '80%',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: 12,
      fontWeight: '500',
      marginVertical: 10,
    },
    timerText: {
      color: Colors[theme].textLightGray,
      textAlign: 'center',
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 18,
    },
    timerDisplayText: {
      color: '#E14084',
      textAlign: 'center',
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 18,
    },
    resendButtonText: {
      color: Colors[theme].textLightGray,
      textAlign: 'center',
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 18,
    },
    editMobileText: {
      marginTop: 10,
      color: Colors[theme].textLightGray,
      textAlign: 'center',
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 18,
    },
    submitBtnContainer: {marginVertical: 12, width: '100%'},
    submitBtn: {
      buttonTextStyles: {fontSize: 18, fontWeight: '500'},
    },
    buttonContainer: {marginHorizontal: 15},
    createButton: {
      height: 56,
      borderRadius: 28,
      overflow: 'hidden',
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: '#C87D48',
    },
    gradient: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 100,
      borderWidth: 4,
      borderStyle: 'solid',
      borderColor: '#C87D48',
    },
    createButtonText: {
      color: '#000',
      fontSize: 18,
      fontWeight: '600',
      ...(Platform.OS === 'ios' ? {paddingBottom: 3} : {}),
    },
  });
};
export default getStyles;
