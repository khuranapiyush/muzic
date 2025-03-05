import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: '4%',
    paddingVertical: 16,
    height: '100%'
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24
  },
  backBtnIcon: { tintColor: '#000', height: 30, width: 30 },
  labelContainer: {
    marginBottom: 32,
    alignItems: 'center'
  },
  headerTextContainer: { flex: 1 },
  headerText: { fontSize: 20, fontWeight: '600' },
  formContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  topContainer: { width: '100%', marginBottom: 24 },
  formLabel: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  bottomContainer: { width: '100%' },
  validationText: { color: 'red', marginLeft: 2 },
  btnContainer: { marginVertical: 16 },
  submitBtn: {
    buttonTextStyles: { fontSize: 18, fontWeight: '700' }
  },
  termsContainer: {
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  termsCheckBoxContainer: {
    justifyContent: 'flex-start',
    marginRight: 4
  },
  termsTextContainer: { flex: 1 }
})

export default styles
