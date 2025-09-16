import { StyleSheet } from 'react-native';
import Colors from '../../../../../common/Colors';

const getStyles = theme => {
  return StyleSheet.create({
    wrapper: {
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Colors[theme].cardBorderColor,
      backgroundColor: Colors[theme].cardBg,
      paddingLeft: 12,
      paddingRight: 16,
      paddingVertical: 14,
      marginRight: 16,
    },
    leftWrapper: {
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '90%',
    },
    leftIconWrapper: {
      alignSelf: 'flex-start',
    },
    leftIcon: {
      width: 24,
      height: 24,
      marginRight: 8,
      tintColor: Colors[theme].white,
    },
    labelText: {
      fontSize: 16,
      fontWeight: '600',
    },
    descriptionText: {
      fontSize: 14,
      fontWeight: '400',
      marginTop: 8,
    },
    valueWrapper: {
      borderRadius: 8,
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    valueText: {
      fontSize: 12,
      fontWeight: '500',
    },
    actionBtnWrapper: {
      marginLeft: 8,
    },
    actionIcon: {
      width: 24,
      height: 24,
      tintColor: Colors[theme].white,
    },
  });
};
export default getStyles;
