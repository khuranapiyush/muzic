import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  modal: {
    margin: 'auto',
    flex: 1
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
    marginTop: 40,
    flex: 1,
    zIndex: 9999,
    marginRight: 20,
    alignItems: 'center',
    height: 30,
    width: 30
  },
  modalLogo: {
    height: 80,
    width: 80,
    marginVertical: 15
  },
  successIcon: {
    height: 100,
    width: 100,
    marginVertical: 15
  },
  modalContent: {
    backgroundColor: 'white',
    paddingVertical: 20,
    borderRadius: 24,
    flexGrow: 1
  },
  modalHeading: {
    marginBottom: 10,
    marginTop: 20,
    color: '#0B091C',
    fontWeight: '400',
    fontSize: 14
  },

  submitBtn: { fontWeight: '700' },
  btnContainer: {
    paddingTop: 20,
    justifyContent: 'space-around'
  },

  container: {
    flex: 1
  },
  content: {
    flexGrow: 1
  },

  alignContentCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1
  }
})

export default styles
