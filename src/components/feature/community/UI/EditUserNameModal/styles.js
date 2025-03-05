import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20
  },
  content: {
    borderRadius: 20
  },
  innerModalItem: {
    padding: 20,
    width: '100%'
  },
  modalContent: {
    // backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    marginHorizontal: 16
  },
  modalLogoContainer: { justifyContent: 'center', marginBottom: 16 },
  modalLogo: {
    marginHorizontal: 15,
    width: 120,
    height: 42,
    resizeMode: 'contain'
  },
  modalHeading: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 24
  },
  modalText: {
    marginBottom: 20,
    color: '#0B091C',
    fontWeight: '400',
    fontSize: 14,
    textAlign: 'center'
  },
  btnContainer: { justifyContent: 'space-around' },
  submitBtn: {
    borderRadius: 5,
    color: '#201E34',
    fontWeight: '600',
    fontSize: 14
  },
  textOpacityLight: {
    opacity: 0.7
  },
  errorText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '400',
    marginTop: 4,
    alignSelf: 'center'
  }
})

export default styles
