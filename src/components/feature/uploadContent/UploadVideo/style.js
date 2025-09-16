import { StyleSheet } from 'react-native';

const getStyles = theme => {
  return StyleSheet.create({
    modalContainer: {
      // backgroundColor: 'red'
      // borderTopLeftRadius: 20,
      // borderTopRightRadius: 20
    },
    modalIcon: {
      marginRight: 15,
      width: 30,
      height: 30,
      resizeMode: 'contain',
    },
    iconContainer: {
      alignSelf: 'center',
      height: 100,
      width: 115,
    },
    submitBtn: {
      buttonTextStyles: { fontSize: 16, fontWeight: '600' },
    },
  });
};
export default getStyles;
