import {StyleSheet, Platform, Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  videoBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    height: '100%',
  },
  gradientContainer: {
    flex: 1,
  },
  innerContainer: {
    paddingVertical: 16,
    height: '100%',
  },
  keyboardAvoidView: {
    flex: 1,
  },
  // Button area container
  buttonAreaContainer: {
    position: 'absolute',
    top: '32%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: height,
  },
  buttonGradientContainer: {
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },
  buttonGradient: {
    position: 'absolute',
    width: width,
    height: '100%',
    opacity: 0.8,
    borderRadius: 20,
    zIndex: 0,
  },
  logoContainer: {
    marginBottom: 20,
    alignItems: 'center',
    zIndex: 1,
  },
  logo: {
    width: 200,
    height: 50,
    resizeMode: 'contain',
  },
  labelContainer: {
    marginBottom: 10,
    alignItems: 'center',
    zIndex: 1,
  },
  label: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    lineHeight: 28,
    fontFamily: 'Nohemi',
  },
  // Google login button styles
  googleBtnContainer: {
    marginBottom: 16,
    width: '80%',
  },
  googleButton: {
    borderRadius: 28,
    height: 56,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  // Apple login button styles
  appleBtnContainer: {
    width: '80%',
  },
  appleButton: {
    borderRadius: 28,
    height: 56,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#fff',
    borderWidth: 1,
  },
  appleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },

  // Existing styles below - may be used for commented-out code
  mobileItemContainer: {
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  mobileTextContainer: {marginBottom: 10},
  mobileContainer: {
    alignItems: 'center',
  },
  msgContainer: {
    marginTop: 15,
    backgroundColor: '#DEB887',
    paddingHorizontal: 15,
    paddingVertical: 5,
    color: '#FFF',
    borderRadius: 100,
  },
  referralCheckTextContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  referralCheckContainer: {
    justifyContent: 'flex-start',
    marginRight: 4,
  },
  referralTextContainer: {marginRight: 5},
  tickIcon: {width: 16, height: 16},
  referralInputContainer: {marginVertical: 16},
  phoneBtnContainer: {marginVertical: 10, width: '90%'},
  btnContainer: {
    width: Platform.OS === 'android' ? '90%' : '14%',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  submitBtn: {
    buttonTextStyles: {fontSize: 18, fontWeight: '700'},
  },
  termsContainer: {
    marginVertical: 16,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginHorizontal: 10,
  },
  termsTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  socialAuthContainer: {
    position: 'absolute',
    bottom: '5%',
    left: '25%',
    width: '50%',
    margin: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInContainer: {
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInText: {fontWeight: '500'},
  socialBtnWrapper: {
    marginRight: 16,
  },
  googleLogoIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    resizeMode: 'contain',
  },
  emailIcon: {
    width: 44,
    height: 44,
  },
  createButton: {
    width: '100%',
    height: Platform.OS === 'ios' ? 56 : 63,
    overflow: 'hidden',
    borderWidth: 4,
    borderRadius: 100,
    borderColor: '#A84D0C',
    backgroundColor: Platform.OS === 'ios' ? '#FFF' : '#FC6C14',
  },
  googleCreateButton: {
    width: '100%',
    height: Platform.OS === 'ios' ? 56 : 63,
    overflow: 'hidden',
    borderWidth: Platform.OS === 'ios' ? 0 : 4,
    borderRadius: 100,
    borderColor: Platform.OS === 'ios' ? '#FFF' : '#A84D0C',
    backgroundColor: Platform.OS === 'ios' ? '#FFF' : '#FC6C14',
  },
  gradient: {
    width: '100%',
    height: '100%',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#FFF',
    borderStyle: 'solid',
    backgroundColor: '#FC6C14',
    elevation: 10,
  },
  googleButtonGradient: {
    width: '100%',
    height: '100%',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#FFF',
    borderStyle: 'solid',
    backgroundColor: Platform.OS === 'ios' ? '#FFF' : '#FC6C14',
    elevation: 10,
  },
  createButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  disabledButtonText: {
    opacity: 0.5,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default styles;
