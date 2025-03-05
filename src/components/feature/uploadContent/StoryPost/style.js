import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },
  modalIcon: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'contain'
  },
  labelStyle: { alignSelf: 'center' },
  input: {
    textAlign: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '500',
    color: '#FFF',
    width: '100%',
    paddingHorizontal: 15,
    paddingBottom: 15,
    paddingTop: 15,
    alignItems: 'center'
  },
  submitBtn: {
    buttonTextStyles: { fontSize: 16, fontWeight: '600' }
  },
  outSideInput: {
    backgroundColor: 'rgba(11, 9, 28, 0.20)',
    justifyContent: 'center',
    height: '100%',
    paddingHorizontal: 10
  },
  bottomSectionContainer: {
    width: '100%',
    marginRight: 10,
    marginTop: 10,
    justifyContent: 'space-between'
  },
  bottomLeftItemContainer: {
    width: '65%',
    alignSelf: 'flex-end',
    marginRight: 10,
    marginTop: 10,
    backgroundColor: '#242334',
    borderColor: '#2F2C3C',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 12
  },
  bottomRightContainer: {
    width: '30%',
    alignSelf: 'flex-end',
    marginRight: 10,
    marginTop: 10
  },

  modal: {
    margin: 0,
    justifyContent: 'flex-end'
  },
  modalContainer: {
    backgroundColor: '#181626',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    paddingTop: 20
  },
  titleContainer: {
    justifyContent: 'space-between',
    paddingBottom: 25
  },
  closeButton: {
    alignItems: 'center',
    height: 30,
    width: 30
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    marginHorizontal: 16,
    flex: 1
  },
  modalHeading: {
    marginBottom: 10,
    marginTop: 20,
    color: '#0B091C',
    fontWeight: '400',
    fontSize: 14
  },
  modalLogo: {
    height: 30,
    marginRight: 10,
    width: 30
  },
  btnContainer: {
    marginTop: 20
  }
})

export default styles
