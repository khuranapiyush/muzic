import { StyleSheet } from 'react-native';
import Colors from '../../../../Colors';

const getStyles = theme => {
  return StyleSheet.create({
    miniPlayerContainer: {
      flexDirection: 'row',
      backgroundColor: Colors[theme].appBg,
      height: '100%',
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      borderBottomColor: '#C1C1C1',
      // borderBottomWidth: 1
    },
    videoDetailContainer: {
      width: '60%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    videoDetailBtn: {
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      padding: 8,
    },
    controlsContainer: {
      flexDirection: 'row',
      width: '40%',
      justifyContent: 'space-around',
      align: 'center',
    },
    controlButtonIcon: {
      height: 30,
      width: 30,
      resizeMode: 'contain',
      tintColor: Colors[theme].white,
    },
  });
};
export default getStyles;
