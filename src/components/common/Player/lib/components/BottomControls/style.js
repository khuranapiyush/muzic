import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  bottomControlsContainer: {
    position: 'absolute',
    bottom: '6%',
    width: '96%',
    height: '10%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  liveStreamContainer: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: '100%'
  },
  durationContainer: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: '100%'
  },
  controlsContainer: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  controlButton: {
    justifyContent: 'center',
    padding: 8,
    borderRadius: 100,
    marginHorizontal: 2
  },
  controlButtonIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    padding: 10
  }
})

export default styles
