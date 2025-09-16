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
  });
};
export default getStyles;
