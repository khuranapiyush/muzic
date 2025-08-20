import {StyleSheet} from 'react-native';
import Colors from '../../../common/Colors';

const getStyles = theme => {
  return StyleSheet.create({
    modal: {
      margin: 0,
      justifyContent: 'flex-end',
    },
    modalContainer: {
      backgroundColor: Colors[theme].appBg,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      justifyContent: 'center',
    },
    modalContent: {},
    closeButton: {
      backgroundColor: 'red',
      padding: 10,
      borderRadius: 10,
      marginTop: 20,
      alignItems: 'center',
    },
    closeButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
};

export default getStyles;
