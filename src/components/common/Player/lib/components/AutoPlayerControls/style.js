import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  controlsContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 2
  },
  controlMuteButton: {
    justifyContent: 'center',
    padding: 8,
    borderRadius: 100,
    position: 'absolute',
    top: 0,
    right: 0
  },
  controlRemainingButton: {
    justifyContent: 'center',
    paddingHorizontal: 3,
    paddingVertical: 4,
    borderRadius: 4,
    marginHorizontal: 10,
    marginBottom: 4,
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#000000cc'
  },
  controlRemainingBtnText: {
    fontWeight: '500',
    color: '#fff'
  },
  controlButtonIcon: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
    padding: 10
  }
})

export default styles
