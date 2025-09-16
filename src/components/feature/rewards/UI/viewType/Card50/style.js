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
    gridBtnWrapper: { justifyContent: 'center', marginTop: 24 },
    gridBtn: {
      borderRadius: 12,
      borderColor: '#E14084',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    btnText: {
      fontWeight: '500',
      color: Colors[theme].white,
      fontSize: 14,
      marginRight: 4,
    },
    btnIcon: { width: 16, height: 16 },
  });
};
export default getStyles;
