import { StyleSheet } from 'react-native';
import Colors from '../../../../../common/Colors';

const getStyles = mode => {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    activeTabLabel: {
      color: Colors[mode].white,
      fontFamily: 'Nohemi',
      fontSize: 14,
      fontStyle: 'normal',
      fontWeight: '400',
      lineHeight: 16.8,
      letterSpacing: 0.28,
    },
    inactiveTabLabel: {
      color: Colors[mode].textLightGray,
      fontFamily: 'Nohemi',
      fontSize: 14,
      fontStyle: 'normal',
      fontWeight: '400',
      lineHeight: 16.8,
      letterSpacing: 0.28,
    },
    tabContainer: {
      backgroundColor: 'transparent',
      borderBottomWidth: 1,
      borderBottomColor: '#c1c1c1',
    },
    activeIndicatorStyle: {
      backgroundColor: Colors[mode].white,
      height: 2,
    },
    headingContainer: {
      paddingHorizontal: 8,
      paddingTop: 8,
      paddingBottom: 5,
    },
    width50: {
      width: '50%',
    },
    width25: {
      width: '25%',
    },
    colorPink: {
      color: '#6B61FF',
    },
    wrapper: {
      marginHorizontal: 5,
      marginBottom: '15%',
      paddingBottom: '24%',
    },
  });
};
export default getStyles;
