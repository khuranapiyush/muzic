import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    marginHorizontal: 16,
  },
  modalLogoContainer: { justifyContent: 'center', marginBottom: 16 },
  modalLogo: {
    marginHorizontal: 15,
    width: 150,
    height: 100,
    resizeMode: 'contain',
  },
  modalHeading: {
    marginBottom: 20,
    color: '#0B091C',
    fontWeight: '600',
    fontSize: 22,
    lineHeight: 25,
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 20,
    color: '#0B091C',
    fontWeight: '400',
    fontSize: 14,
    textAlign: 'center',
  },
  btnContainer: { justifyContent: 'space-around' },
  submitBtn: { fontWeight: '700' },
});

export default styles;
