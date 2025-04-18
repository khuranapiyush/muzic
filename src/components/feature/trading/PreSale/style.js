import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    margin: 10,
    paddingHorizontal: 10,
    paddingVertical: 16,
    borderColor: '#DADADA',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#FFF'
  },
  walletIcon: {
    height: 24,
    width: 24,
    marginRight: 10
  },
  flex: {
    flex: 1
  },
  dividerStyle: {
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 1
  },
  buttonNormal: {
    justifyContent: 'center',
    width: 120,
    height: 32,
    borderRadius: 4,
    borderColor: '#979797',
    borderWidth: 1
  },
  buttonGradient: {
    buttonStyle: {
      borderRadius: 4,
      height: 33,
      minWidth: 132,
      fontSize: 10,
      color: '#FFFF'
    }
  },
  marginTop20: {
    marginTop: 10
  },
  marginRight20: {
    marginRight: 10
  },
  paddingBottom8: {
    paddingBottom: 8
  },
  paddingTop10: {
    paddingTop: 10
  },
  paddingTop20: {
    paddingTop: 20
  },
  alignCheckBox: {
    alignSelf: 'flex-start'
  },
  flex4: {
    flex: 4
  },
  flex10: {
    flex: 10
  },
  input: {
    height: 40,
    marginTop: 10,
    padding: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#DADADA',
    backgroundColor: '#F3F3F3',
    borderRadius: 12
  },
  errorInput: {
    height: 40,
    marginTop: 10,
    padding: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'red',
    backgroundColor: '#F3F3F3',
    borderRadius: 12
  },
  errorContainer: {
    padding: 10,
    backgroundColor: 'rgba(229, 57, 46, 0.20)',
    borderRadius: 12,
    color: '#E5392E'
  },
  errorIcon: {
    height: 20,
    width: 20,
    marginRight: 8
  },
  errorColor: {
    color: '#E5392E'
  },
  promoContainer: {
    flexDirection: 'row',
    marginVertical: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 12,
    backgroundColor: '#F3F3F3'
  },
  promoAppliedContainer: {
    flexDirection: 'row',
    marginVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    paddingVertical: 10,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#4C9599',
    borderRadius: 12,
    backgroundColor: '#F3F3F3'
  },
  applyBtn: {
    textAlign: 'right',
    fontWeight: '600',
    fontSize: 14,
    color: '#54B5BB'
  },
  removeBtn: {
    textAlign: 'right',
    fontWeight: '600',
    fontSize: 14,
    color: '#E14084'
  },
  placeOrderBtn: {
    buttonTextStyles: { fontSize: 16, fontWeight: '600' }
  },
  colorGreen: {
    color: '#4C9599',
    fontWeight: '500'
  },
  toBePaidStyle: {
    marginVertical: 15,
    marginHorizontal: 30
  },
  thumbIcon: {
    marginRight: 10,
    height: 100,
    width: 100,
    borderRadius: 10
  }
})

export default styles
