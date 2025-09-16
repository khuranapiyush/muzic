import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: '4%',
    paddingVertical: 16,
    height: '100%',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  backBtnIcon: { tintColor: '#000', height: 30, width: 30 },
  labelContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  headerTextContainer: { flex: 1 },
  headerText: { fontSize: 20, fontWeight: '600' },
  formContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emailContainer: { width: '100%', marginBottom: 24 },
  formLabel: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  passwordContainer: { width: '100%' },
  btnContainer: { marginVertical: 16 },
  submitBtn: {
    buttonTextStyles: { fontSize: 18, fontWeight: '700' },
  },
  termsContainer: {
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  termsCheckBoxContainer: {
    justifyContent: 'flex-start',
    marginRight: 4,
  },
  termsTextContainer: { flex: 1 },
  signUpInfoContainer: {
    position: 'absolute',
    bottom: '7%',
    left: '29%',
    margin: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInContainer: { marginBottom: 17 },
  signUpInfoText: { fontWeight: '500' },
  signUpText: { fontWeight: '500', color: '#E94278' },
});

export default styles;
