import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  wrapper: {
    padding: 10
  },
  containerSpacing: {
    paddingTop: 20
  },
  toggleSpacing: {
    paddingTop: 20,
    justifyContent: 'space-between'
  },
  container: {
    backgroundColor: 'white',
    padding: 16
  },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8
  },
  icon: {
    marginRight: 5
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14
  },
  placeholderStyle: {
    fontSize: 16
  },
  selectedTextStyle: {
    fontSize: 16
  },
  iconStyle: {
    width: 20,
    height: 20
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16
  },
  submitBtnContainer: {
    paddingTop: 20,
    flex: 1,
    justifyContent: 'flex-end',
    alignSelf: 'flex-end'

    // maxWidth: '40%'
  },
  backContainer: {
    marginRight: 20
  },
  submitBtn: {
    marginRight: 10,
    buttonTextStyles: {
      fontSize: 16,
      fontWeight: '600'
    }
  }
})

export default styles
