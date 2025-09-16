import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  sliderContainer: {
    position: 'absolute',
    bottom: 0,
    height: 0,
    width: '100%',
    justifyContent: 'center',
  },
  thumb: {
    width: 14,
    height: 14,
    borderRadius: 100,
    backgroundColor: '#6B61FF',
  },
  trackStyle: { height: 2 },
});

export default styles;
