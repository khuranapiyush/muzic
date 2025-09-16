import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
  },
  titleContainer: {
    position: 'absolute',
    right: 0,
    top: 15,
    flex: 1,
    zIndex: 9,
    justifyContent: 'flex-end',
  },
  closeButton: {
    flex: 1,
    zIndex: 9,
    marginRight: 20,
    alignItems: 'center',
    height: 30,
    width: 30,
  },
  modalContent: {
    backgroundColor: 'white',
    paddingVertical: 20,
    borderRadius: 24,
    flexGrow: 1,
  },
  modalHeading: {
    marginBottom: 10,
    marginTop: 20,
    color: '#0B091C',
    fontWeight: '400',
    fontSize: 14,
  },

  submitBtn: { fontWeight: '700' },
  btnContainer: {
    paddingTop: 20,
    justifyContent: 'space-around',
  },
  dividerStyle: {
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 10,
  },
  paddingLeftRight: {
    paddingTop: 5,
    paddingHorizontal: 15,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 24,
    zIndex: 9,
    minHeight: '30%',
    maxHeight: '80%',
  },
  content: {
    flexGrow: 1,
  },
  marginTop20: {
    marginTop: 20,
  },
  marginBottom15: {
    marginBottom: 15,
  },
  mintingIconStyle: {
    width: 100,
    height: 100,
    marginVertical: 30,
  },
  fontBold: {
    fontWeight: '700',
  },
  successIcon: {
    width: 100,
    height: 100,
  },
});

export default styles;
