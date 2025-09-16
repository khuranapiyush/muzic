import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  modal: {
    zIndex: 9999,
    margin: 'auto',
    marginHorizontal: 5,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
  },
  titleContainer: {
    position: 'absolute',
    right: -5,
    top: 8,
    flex: 1,
    zIndex: 9999,
    justifyContent: 'flex-end',
  },
  closeButton: {
    flex: 1,
    zIndex: 9999,
    marginRight: 20,
    alignItems: 'center',
    height: 30,
    width: 30,
  },
  modalLogo: {
    height: 60,
    width: 60,
    marginBottom: 10,
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

  listContainer: {
    backgroundColor: '#F8F8F8',
    borderColor: '#E9E9E9',
    borderWidth: 0.5,
    padding: 10,
    margin: 8,
    borderRadius: 12,
    color: '#000',
  },

  listTitle: {
    width: '70%',
    fontWeight: '400',
    textAlign: 'left',
  },
  listValue: {
    width: '30%',
    textAlign: 'left',
    alignSelf: 'center',
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
    zIndex: 9999,
    minHeight: '30%',
    maxHeight: '80%',
  },
  content: {
    flexGrow: 1,
  },
  marginTop20: {
    marginTop: 20,
  },
});

export default styles;
