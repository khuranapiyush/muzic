import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  wrapper: {
    width: 300,
    height: 300
  },
  topWrapper: {
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  bottomWrapper: { alignItems: 'center', marginTop: 2 },
  partyPopIcon: { width: 70, height: 70 },
  partyText: { color: '#0B091C', fontWeight: '600', fontSize: 20 },
  couponInfo: { paddingHorizontal: 8, fontSize: 16, fontWeight: '500' },
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
    marginTop: 2,
    paddingHorizontal: 40
  }
})

export default styles
