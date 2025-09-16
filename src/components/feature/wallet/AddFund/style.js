import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: {
    marginTop: 20,
    justifyContent: 'center',
  },
  paddingTop20: {
    paddingTop: 20,
  },
  iconStyle: {
    width: '100%',
    height: '100%',
  },
  iconContainer: {
    borderColor: '#DADADA',
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    width: 50,
    height: 50,
  },
  bankAccountContainer: {
    marginVertical: 20,
  },
  btnContainer: {
    flex: 1,
    marginTop: 40,
    justifyContent: 'space-around',
    width: '100%',
  },
  submitBtn: { fontWeight: '700' },
  closeContainer: {
    flex: 1,
    marginRight: 20,
  },
  addAccountContainer: {
    flex: 1,
  },
  marginTop20: {
    marginTop: 20,
  },
  marginInline: {
    marginHorizontal: 15,
  },
  styleServiceFee: {
    marginTop: 10,
    justifyContent: 'space-between',
  },
});
export default styles;
