import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20
  },
  content: {
    position: 'relative',
    borderRadius: 20
  },
  innerModalItem: {
    marginTop: 100,
    padding: 20,
    width: '100%'
  },
  modalContent: {
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
  bgImage: {
    borderRadius: 10,
    width: '100%',
    height: 400,
    position: 'absolute'
  },
  checkInButton: {
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 100
  },
  color: {
    color: '#3C1F75'
  },
  mainTitle: {
    display: 'flex',
    justifyContent: 'center',
    margin: 'auto',
    alignItems: 'center',
    color: '#FFF',
    fontSize: 30,
    fontWeight: '600',
    lineHeight: 34
  }
})

export default styles
