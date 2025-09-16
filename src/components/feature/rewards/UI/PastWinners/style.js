import { StyleSheet } from 'react-native';
import Colors from '../../../../common/Colors';

const getStyles = theme => {
  return StyleSheet.create({
    label: {
      fontWeight: '600',
      fontSize: 16,
      color: Colors[theme].white,
      marginBottom: 8,
    },
    description: {
      fontWeight: '500',
      fontSize: 12,
      color: Colors[theme].textLightGray,
      marginBottom: 16,
    },
    pastWinnersWrapper: { marginHorizontal: 16, marginBottom: 20 },
  });
};
export default getStyles;
