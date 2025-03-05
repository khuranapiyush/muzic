import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  modal: {
    margin: 'auto',
    bottom: 0,
    // zIndex: 0,
    justifyContent: 'flex-end'
  },

  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    flex: 1
  },
  titleContainer: {
    position: 'absolute',
    right: -5,
    top: 8,
    flex: 1,
    zIndex: 9999,
    justifyContent: 'flex-end'
  },
  closeButton: {
    flex: 1,
    zIndex: 9999,
    marginRight: 20,
    alignItems: 'center',
    height: 30,
    width: 30
  },
  modalLogo: {
    height: 100,
    width: 100,
    marginTop: 30
  },
  modalContent: {
    backgroundColor: 'white',
    paddingVertical: 20,
    borderRadius: 24,
    flexGrow: 1,
    flex: 1
  },
  submitBtn: { fontWeight: '700' },
  btnContainer: {
    paddingTop: 40,
    justifyContent: 'space-around'
  },
  dividerStyle: {
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 10
  },
  paddingLeftRight: {
    paddingTop: 5,
    paddingHorizontal: 15
  },
  container: {
    backgroundColor: '#F4F6FA',
    borderRadius: 24,
    zIndex: 9,
    minHeight: '40%',
    maxHeight: '80%'
  },
  content: {
    flexGrow: 1
  },
  marginTop20: {
    marginTop: 20
  },
  successLottie: {
    flex: 1,
    position: 'absolute',
    top: 0,
    width: '100%',
    height: '100%'
  },
  pendingLottie: {
    position: 'relative',
    top: 0,
    width: '100%',
    height: '100%'
  },
  margin30: {
    marginBottom: 30
  }
})

export default styles
