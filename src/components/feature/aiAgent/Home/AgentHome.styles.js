import { StyleSheet } from 'react-native';
import Colors from '../../../common/Colors';

const getStyles = theme => {
  return StyleSheet.create({
    flex: { flex: 1 },
    wrapper: {
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 30,
      width: '100%',
    },
    headingText: {
      color: Colors[theme].textBlack,
      fontSize: 24,
      fontFamily: 'Bricolage Grotesque',
      fontWeight: '700',
      lineHeight: 30,
      letterSpacing: -2,
      textTransform: 'uppercase',
    },
    iconStyles: {
      width: 120,
      height: 120,
      marginVertical: 10,
      borderRadius: 60,
      overflow: 'hidden',
    },
    subHeadingText: {
      color: Colors[theme].textLightGray,
      textAlign: 'center',
      paddingHorizontal: 40,
    },
    cardListContainer: {
      position: 'relative',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 15,
      width: '100%',
    },
    cardWrapper: {
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Colors[theme].brandNewPink,
      backgroundColor: Colors[theme].cardBg,
      paddingHorizontal: 16,
      paddingVertical: 20,
      width: '93%',
    },
    tagContainer: {
      position: 'relative',
      left: -120,
      top: 2,
      paddingVertical: 4,
      paddingHorizontal: 8,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10,
      borderRadius: 4,
      backgroundColor: Colors[theme].buttonBackground,
    },
    tagText: {
      color: '#FFF',
      textAlign: 'center',
      fontStyle: 'normal',
      fontWeight: '400',
      lineHeight: 15,
    },
    leftWrapper: {
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    valueWrapper: {
      borderRadius: 8,
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    leftIconWrapper: {
      alignSelf: 'flex-start',
    },
    leftIcon: {
      width: 50,
      height: 50,
      marginRight: 8,
    },
    descriptionText: {
      fontSize: 12,
      fontWeight: '500',
      marginTop: 8,
      color: Colors[theme].textLightGray,
    },
    labelText: {
      fontSize: 16,
      fontWeight: '600',
      color: Colors[theme].textBlack,
    },
    actionBtnWrapper: {
      marginLeft: 8,
    },
    actionIcon: {
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      tintColor: Colors[theme].textBlack,
    },
    iconContainer: { marginRight: 5, marginTop: 10 },
    iconStyle: { width: 16, height: 16 },
  });
};

export default getStyles;
