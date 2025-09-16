import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  modal: {
    margin: 'auto',
    bottom: 0,
    zIndex: 9,
    justifyContent: 'flex-end',
  },
  modalContainer: {
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
    paddingVertical: 20,
    borderRadius: 24,
    flexGrow: 1,
  },
  submitBtn: { fontWeight: '700' },
  btnContainer: {
    paddingTop: 20,
    justifyContent: 'space-around',
  },
  dividerStyle: {
    borderWidth: 1,
    marginTop: 12,
    marginHorizontal: -15,
    marginBottom: 12,
  },
  paddingLeftRight: {
    paddingTop: 5,
    paddingHorizontal: 15,
  },
  container: {
    backgroundColor: '#F4F6FA',
    borderRadius: 24,
    zIndex: 9,
    minHeight: '35%',
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
  itemContainer: {
    width: '100%',
    marginVertical: 20,
    padding: 16,
    borderColor: '#DADADA',
    borderWidth: 1,
    borderRadius: 15,
    backgroundColor: '#FFF',
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    fontSize: 16,
    fontWeight: '700',
    height: 50,
    width: '100%',
    paddingHorizontal: 15,
  },
  earnedInput: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    backgroundColor: '#8BD98E',
    fontSize: 16,
    fontWeight: '700',
    height: 50,
    width: '100%',
    paddingHorizontal: 15,
  },
  smallFont: { fontSize: 8 },
  styleFromToContainer: {
    backgroundColor: '#DADADA',
    alignItems: 'center',
    height: 22,
    width: 22,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 100,
    position: 'absolute',
    zIndex: 999,
    left: -10,
    top: 15,
  },
  configImage: {
    // height: '100%',
    width: '100%',
  },
  configContainer: {
    padding: 10,
  },
  width40: { width: '40%' },
  flex1: {
    flex: 1,
  },
});

export default styles;
