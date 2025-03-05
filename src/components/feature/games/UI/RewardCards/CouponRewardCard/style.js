import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)'
  },
  contentWrapper: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    marginHorizontal: 16,
    alignItems: 'center',
    width: '94%'
  },
  cardRewardLogoSlot: {
    backgroundColor: 'white',
    padding: 10,
    position: 'absolute',
    top: -35,
    borderRadius: 100
  },
  logoIcon: { width: 50, height: 50 },
  closeBtnWrapper: { position: 'absolute', top: 16, right: 16 },
  closeIcon: {
    width: 28,
    height: 28
  },
  headerWrapper: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 30
  },
  partyPopperIcon: { width: 80, height: 80 },
  congratsText: { color: '#0B091C', fontWeight: '600', fontSize: 20 },
  winMessageText: {
    color: '#0B091C',
    fontSize: 14,
    fontWeight: '500'
  },
  bottomWrapper: {
    alignItems: 'center',
    marginTop: 16,
    width: '94%'
  },
  couponInfo: {
    paddingHorizontal: 2,
    fontSize: 16,
    fontWeight: '500'
  },
  couponWrapper: {
    borderRadius: 16,
    borderWidth: 1,
    width: '100%',
    borderStyle: 'dashed',
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 36
  },
  couponText: { color: '#0B091C', fontSize: 16, fontWeight: '700' },
  copyWrapper: { alignItems: 'center', flexDirection: 'row' },
  copyIcon: {
    width: 16,
    height: 16,
    tintColor: '#E14084',
    marginRight: 4
  },
  copyText: { color: '#E14084', fontSize: 12, fontWeight: '500' },
  copyInfoWrapper: {
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16
  },
  copyInfoText: { color: '#0B091C', fontSize: 14, fontWeight: '500' },
  tncText: { color: '#0B091C', fontSize: 12, fontWeight: '500' },
  historyText: {
    color: '#959595',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 24,
    paddingHorizontal: 40
  }
})

export default styles
