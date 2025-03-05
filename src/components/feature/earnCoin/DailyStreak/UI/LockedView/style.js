import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  textStyle: {
    paddingHorizontal: 8
  },
  streakStats: {
    alignItems: 'center',
    position: 'relative',
    height: 'auto',
    width: 'auto',
    alignSelf: 'flex-start'
  },
  streakLock: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12
  },
  overflowStreak: {
    position: 'absolute',
    right: -8,
    top: -8,
    borderRadius: 50,
    height: 25,
    width: 25,
    backgroundColor: '#139BA4',
    borderColor: '#FFF',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  textColor: {
    color: '#FFF'
  }
})

export default styles
