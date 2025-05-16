import {StyleSheet, Platform, Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 16,
    height: '100%',
    backgroundColor: '#0F0F11',
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
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: height * 0.6,
  },
  // Gradient behind buttons
  buttonGradient: {
    position: 'absolute',
    width: width,
    height: '100%',
    opacity: 0.8,
    borderRadius: 20,
    zIndex: 0,
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: 'center',
    zIndex: 1,
  },
  logo: {
    width: 200,
    height: 50,
    resizeMode: 'contain',
  },
  labelContainer: {
    marginBottom: 20,
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
  btnContainer: {marginVertical: 16, width: '85%'},
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
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  emailIcon: {
    width: 44,
    height: 44,
  },
  validationText: {color: 'red'},
  buttonContainer: {marginHorizontal: 15},
  createButton: {
    height: 56,
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#C87D48',
  },
  gradient: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    borderWidth: 4,
    borderStyle: 'solid',
    borderColor: '#C87D48',
  },
  createButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    paddingHorizontal: 10,
    alignContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    ...(Platform.OS === 'ios' ? {paddingBottom: 3} : {}),
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FD893A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkContainer: {
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkBox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  checkmarkBoxSelected: {
    backgroundColor: '#F4A460',
    borderColor: '#F4A460',
  },
  checkmarkIcon: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default styles;
