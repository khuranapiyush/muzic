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
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 32
  }
})

export default styles
