import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  wrapper: {paddingTop: 5},
  container: {alignItems: 'center'},
  contentContainer: {justifyContent: 'center', marginLeft: 10},
  submitBtn: {
    buttonTextStyles: {fontSize: 16, fontWeight: '600'},
  },
  userStyle: {marginBottom: 5, color: 'white'},
  closeButtonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  closeButtonStyle: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  badgeStyle: {
    height: 70,
    width: 190,
    resizeMode: 'contain',
  },
});

export default styles;
