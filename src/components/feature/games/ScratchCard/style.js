import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  wrapper: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  rewardCardWrapper: {
    width: 300,
    height: 300,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center'
  },
  scratchCard: { width: 300, height: 300, backgroundColor: 'transparent' },
  cardRewardLogoSlot: {
    backgroundColor: 'white',
    padding: 10,
    position: 'absolute',
    top: -35,
    borderRadius: 100
  },
  logoIcon: { width: 50, height: 50 }
})

export default styles
