import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  streakLock: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#808080',
    borderWidth: 1,
    borderColor: '#D8D8D8',
    borderRadius: 100,
    height: 40,
    width: 40
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
