import { StyleSheet } from 'react-native';
import Colors from '../../../common/Colors';

const getStyles = theme => {
  return StyleSheet.create({
    modal: {
      margin: 0,
      justifyContent: 'flex-end',
    },
    modalContainer: {
      backgroundColor: 'white',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    modalContent: {
      backgroundColor: Colors[theme].cardBg,
      padding: 20,
      borderRadius: 10,
      elevation: 5,
      marginHorizontal: 16,
    },
    modalIconContainer: { marginVertical: 16 },
    modalIcon: {
      marginRight: 15,
      width: 30,
      height: 30,
      resizeMode: 'contain',
    },
    labelStyle: { alignSelf: 'center' },
    tabBarContainer: {
      height: 40,
      borderRadius: 100,
      // borderWidth: 1,
      // borderColor: '#c1c1c1',
      marginVertical: 8,
      marginHorizontal: 50,
      backgroundColor: '#353535',
    },
    activeTabLabel: {
      flex: 1,
      alignSelf: 'center',
      justifyContent: 'center',
      color: '#1E1E1E',
      fontWeight: '500',
      margin: 'auto',
      lineHeight: 17,
    },
    inactiveTabLabel: {
      flex: 1,
      alignSelf: 'center',
      justifyContent: 'center',
      color: 'white',
      margin: 'auto',
      fontWeight: '500',
      lineHeight: 17,
    },
    activeIndicatorStyle: {
      height: '100%',
      backgroundColor: '#FFF',
      color: '#1E1E1E',
      borderRadius: 100,
    },

    textGray: {
      color: 'gray',
    },
    textHeading: {
      paddingVertical: 10,
    },
    tabViewContainer: {
      position: 'absolute',
      bottom: 20,
      left: 0,
      width: '100%',
      backgroundColor: 'transparent',
      flex: 1,
    },
    container: {
      flex: 1,
    },
    backArrowIcon: {
      tintColor: Colors[theme].white,
      width: 28,
      height: 28,
      marginRight: 14,
    },
    headerContainer: { alignItems: 'center' },
    flex1: {
      flex: 1,
    },
    headerTitle: {
      flex: 1,
      fontWeight: '600',
    },
    dividerStyle: {
      backgroundColor: '#734CC9',
      height: 1,
      marginTop: 16,
    },
  });
};
export default getStyles;
