import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingContainer: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(53, 53, 53, 0.4)',
    zIndex: 1
  },
  loadingText: {
    position: 'relative',
    bottom: 10,
    width: '100%',
    paddingVertical: 10
  }
})

export default styles
