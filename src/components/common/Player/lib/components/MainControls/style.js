import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  mainControlsContainer: {
    width: '100%',
    height: '30%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    justifyContent: 'center',
    padding: 10,
    borderRadius: 100,
    marginHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.40)',
  },
  controlButtonIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
});

export default styles;
