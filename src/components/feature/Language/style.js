import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: 20,
    paddingHorizontal: 5,
    justifyContent: 'space-between',
    height: '100%',
    position: 'relative'
  },
  headingContainer: {
    marginTop: 20,
    justifyContent: 'space-between'
  },
  languageBox: {
    marginTop: 10,
    flexBasis: '48%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    margin: 3
  },
  selectedLanguageBox: {
    marginTop: 10,
    flexBasis: '48%',
    borderWidth: 1,
    borderRadius: 12,
    margin: 3
  },
  imageContainer: {
    width: 60,
    height: 80,
    borderRadius: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
    resizeMode: 'stretch',
    marginTop: 10
  },
  itemContainer: {
    alignItems: 'center',
    justifyContent: 'space-around',
    marginHorizontal: 10
  },
  tickStyle: {
    position: 'absolute',
    top: 10,
    right: 10
  },
  buttonContainer: {
    position: 'absolute',
    width: '100%',
    alignContent: 'center',
    alignSelf: 'center',
    bottom: 0
  },
  submitBtn: {
    width: '100%',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16
  },
  loadingStyle: {
    height: '80%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonStyle: {
    width: '100%',
    textAlign: 'center'
  }
})

export default styles
