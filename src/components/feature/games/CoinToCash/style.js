import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  wrapper: {
    height: '100%',
    width: '100%'
  },
  contentWrapper: {
    marginTop: 24,
    marginBottom: 24,
    alignItems: 'center'
  },
  coinToCashText: { fontSize: 18, fontWeight: '700', color: '#0B091C' },
  coinLogoWrapper: { marginTop: 21 },
  coinLogo: { width: 44, height: 44 },
  descriptionWrapper: {
    paddingHorizontal: 20,
    marginTop: 32
  },
  descriptionTextWrapper: { fontWeight: '500', fontSize: 15 },
  amountText: { fontWeight: '700' },
  btnWrapper: {
    backgroundColor: '#a15b1a',
    borderRadius: 100,
    paddingVertical: 12,
    paddingHorizontal: 25,
    marginTop: 32
  },
  btnText: {
    fontWeight: '600',
    color: '#fff',
    fontSize: 13
  },
  assistText: { marginTop: 32, paddingHorizontal: 16 }
  // thumbsUpIcon: { width: 100, height: 100 },
  // wohooText: {
  //   color: '#E94278',
  //   fontWeight: '600',
  //   fontSize: 18,
  //   marginTop: 10
  // },
  // titleText: {
  //   color: '#0B091C',
  //   fontWeight: '500',
  //   fontSize: 14,
  //   marginTop: 16,
  //   paddingHorizontal: 30
  // },
  // descriptionText: {
  //   color: '#959595',
  //   fontWeight: '500',
  //   fontSize: 14,
  //   marginTop: 15,
  //   marginBottom: 15,
  //   paddingHorizontal: 30
  // }
})
export default styles
