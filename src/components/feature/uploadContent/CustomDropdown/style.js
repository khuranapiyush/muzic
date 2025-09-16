import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  wrapper: { paddingTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 12,
    fontSize: 14,
    padding: 15,
    backgroundColor: '#FFF',
  },
  arrowIcon: {
    alignSelf: 'flex-end',
    width: 20,
    height: 20,
    paddingLeft: 20,
  },
  label: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    justifyContent: 'space-between',
  },
});
