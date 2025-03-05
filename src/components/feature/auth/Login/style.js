import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: '4%',
    paddingVertical: 16,
    height: '100%',
    backgroundColor: '#000'
  },
  logoContainer: {
    marginBottom: 56,
    alignItems: 'center'
  },
  logo: {
    width: 160,
    height: 50,
    resizeMode: 'contain'
  },
  labelContainer: {
    marginBottom: 32,
    alignItems: 'center'
  },
  label: {
    fontSize: 20,
    fontWeight: '600'
  },
  mobileTextContainer: { marginBottom: 10 },
  mobileContainer: {
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  msgContainer: {
    marginTop: 15,
    backgroundColor: '#E14084',
    paddingHorizontal: 15,
    paddingVertical: 5,
    color: '#FFF',
    borderRadius: 100
  },
  referralCheckTextContainer: {
    marginTop: 16,
    alignItems: 'center'
  },
  referralCheckContainer: {
    justifyContent: 'flex-start',
    marginRight: 4
  },
  referralTextContainer: { marginRight: 5 },
  tickIcon: { width: 16, height: 16 },
  referralInputContainer: { marginVertical: 16 },
  btnContainer: { marginVertical: 16 },
  submitBtn: {
    buttonTextStyles: { fontSize: 18, fontWeight: '700' }
  },
  termsContainer: {
    marginVertical: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  termsTextContainer: { flex: 1 },
  socialAuthContainer: {
    position: 'absolute',
    bottom: '4%',
    left: '29%',
    width: '50%',
    margin: 'auto',
    justifyContent: 'center',
    alignItems: 'center'
  },
  signInContainer: { marginBottom: 17 },
  signInText: { fontWeight: '500' },
  socialBtnWrapper: {
    marginRight: 16
  },
  googleLogoIcon: {
    width: 44,
    height: 44
  },
  emailIcon: {
    width: 44,
    height: 44
  },
  validationText: { color: 'red' }
})

export default styles
