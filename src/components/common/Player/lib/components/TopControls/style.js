import { StyleSheet } from 'react-native';
import Colors from '../../../../Colors';

const getStyles = theme => {
  return StyleSheet.create({
    topControlsContainer: {
      position: 'absolute',
      top: 0,
      height: '20%',
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      zIndex: 1,
      justifyContent: 'space-between',
    },
    controlButton: {
      justifyContent: 'center',
      padding: 8,
      borderRadius: 100,
      marginHorizontal: 2,
    },
    controlButtonIcon: {
      height: 30,
      width: 30,
      resizeMode: 'contain',
    },
    coinWrapper: {
      backgroundColor: Colors[theme].categoryBg,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 100,
      marginRight: 10,
      padding: 0.5,
      borderColor: Colors[theme].categoryBg,
      borderWidth: 1,
    },
    coinIcon: { height: 20, width: 20, marginRight: 3 },
    coinValue: {
      fontWeight: '500',
      fontSize: 14,
      paddingRight: 2,
    },
  });
};
export default getStyles;
