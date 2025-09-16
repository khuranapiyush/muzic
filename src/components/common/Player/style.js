import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  playerContainer: { flex: 1 },
  playerFullScreenContainer: { flex: 1 },
  videoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  backgroundVideo: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
  },
  fullScreenVideo: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    flex: 1,
  },
  controlsContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    height: '100%',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'pink'
  },
  mainControlsContainer: {
    width: '100%',
    height: '25%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'red',
  },
  durationController: {
    height: '10%',
    width: '100%',
    position: 'absolute',
    bottom: '10%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  progressBar: {
    height: 14,
    flexDirection: 'row',
    borderRadius: 2,
    overflow: 'hidden',
    // position: 'absolute', // Add this line
    bottom: 0, // Add this line
    width: '100%',
    backgroundColor: 'green',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'red',
  },
  bufferFill: {
    height: '100%',
    backgroundColor: 'gray',
  },
  currentPositionMarker: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
    position: 'absolute',
  },
});

export default styles;
