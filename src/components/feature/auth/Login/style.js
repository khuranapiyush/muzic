import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    height: '100%',
    backgroundColor: '#000',
  },
  logoContainer: {
    marginBottom: 56,
    alignItems: 'center',
  },
  logo: {
    width: 160,
    height: 50,
    resizeMode: 'contain',
  },
  labelContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  label: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Nohemi',
  },
  mobileItemContainer: {
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  mobileTextContainer: {marginBottom: 10},
  mobileContainer: {
    // justifyContent: 'space-between',
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
  btnContainer: {marginVertical: 16},
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
    width: 44,
    height: 44,
  },
  emailIcon: {
    width: 44,
    height: 44,
  },
  validationText: {color: 'red'},
  buttonContainer: {marginHorizontal: 15},
  createButton: {
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#C87D48',
  },
  gradient: {
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
});

export default styles;
