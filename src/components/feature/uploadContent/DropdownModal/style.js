import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  titleContainer: {
    justifyContent: 'center',
    paddingBottom: 25,
  },
  closeButton: {
    alignItems: 'center',
    height: 30,
    width: 30,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    marginHorizontal: 16,
    flex: 1,
  },
  modalHeading: {
    marginBottom: 10,
    marginTop: 20,
    color: '#0B091C',
    fontWeight: '400',
    fontSize: 14,
  },
  submitBtn: {
    buttonTextStyles: { fontSize: 16, fontWeight: '600' },
  },
  buttonContainer: {
    marginHorizontal: 20,
  },
  itemContainer: {
    paddingVertical: 1,
    justifyContent: 'space-between',
    alignItem: 'center',
  },
  labelStyle: {
    alignSelf: 'center',
  },
});

export default styles;
